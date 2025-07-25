import requests
import hashlib
import time
import os
from dotenv import load_dotenv
import concurrent.futures
import threading
from typing import List, Dict, Optional

load_dotenv()

API_KEY = os.getenv('GRANITE_API_KEY', "Y5U2-8CprdNj8M-k5_7z5qCEqR0hWvKD0ow06qFAopVN")
PROJECT_ID = os.getenv('PROJECT_ID', "7765053a-6228-4fff-970d-31f06b7ca3df")
WATSONX_URL = "https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29"

watsonx_cache = {}
_token_cache = {}
_token_lock = threading.Lock()

def get_granite_access_token(api_key):
    """Get IBM WatsonX access token with caching"""
    with _token_lock:
        current_time = time.time()
        
        # Check if we have a valid cached token
        if api_key in _token_cache:
            token_data = _token_cache[api_key]
            if current_time < token_data['expiry']:
                return token_data['token']
        
        # Get new token
        url = "https://iam.cloud.ibm.com/identity/token"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        }
        data = {
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": api_key
        }
        
        response = requests.post(url, headers=headers, data=data)
        response.raise_for_status()
        
        token_info = response.json()
        token = token_info["access_token"]
        
        # Cache token with expiry (10 minutes before actual expiry)
        _token_cache[api_key] = {
            'token': token,
            'expiry': current_time + token_info.get("expires_in", 3600) - 600
        }
        
        return token

def generate_article_hash(article):
    """Generate a unique hash for an article to avoid duplicates"""
    content = f"{article['title']}{article.get('link', '')}"
    return hashlib.md5(content.encode()).hexdigest()

def smart_summarize_article(article, industry="Financial services", use_case="AI & Machine Learning", region="Asia"):
    """OPTIMIZED: Combined relevance check + summarization in ONE API call"""
    
    text = "\n".join(article["cleaned_text"])[:4000]
    article_hash = generate_article_hash(article)
    cache_key = f"{article_hash}_{industry}_{use_case}_{region}"
    
    # Check cache first
    if cache_key in watsonx_cache:
        print(f"✅ Using cached summary for {article['title']}")
        return watsonx_cache[cache_key]
    
    # Combined prompt for relevance + summarization
    prompt = f"""
You are an AI assistant helping IBM salespeople analyze market intelligence.

First, determine if this article is relevant to at least 2 of these 3 criteria:
- Industry: '{industry}' (or closely related)
- Use case: '{use_case}' (or similar applications)
- Region: '{region}' (or broader regional context)

If NOT relevant to at least 2 criteria, respond with "NOT_RELEVANT".

If relevant, provide a summary in this EXACT format:

**Market Impact**: [3-4 sentences about market implications and business impact for {industry} companies]
**Technology Trends**: [3-4 sentences about technology developments and innovations relevant to {use_case}]  
**Strategic Opportunities**: [3-4 sentences about opportunities for IBM solutions in {region}]

Use **bold** for key metrics and company names.

Article: {text}
"""

    try:
        token = get_granite_access_token(API_KEY)
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        body = {
            "model_id": "ibm/granite-3-8b-instruct",
            "project_id": PROJECT_ID,
            "messages": [{"role": "user", "content": prompt}],
            "parameters": {
                "max_tokens": 600,
                "temperature": 0.4
            }
        }
        
        response = requests.post(WATSONX_URL, headers=headers, json=body)
        
        if response.status_code != 200:
            raise Exception(f"WatsonX API Error: {response.status_code}")
        
        summary_content = response.json()["choices"][0]["message"]["content"]
        
        # Check if article was deemed relevant
        if "NOT_RELEVANT" in summary_content.upper():
            print(f"⏭️ Article not relevant: {article['title']}")
            return None
        
        result = {
            "title": article["title"],
            "link": article.get("link", ""),
            "summary": summary_content,
            "hash": article_hash
        }
        
        # Cache result
        watsonx_cache[cache_key] = result
        return result
        
    except Exception as e:
        print(f"❌ WatsonX API Error: {e}")
        return None

def generate_aggregate_insights(summaries, industry, use_case, region):
    """Generate aggregate insights from all relevant summaries with structured format"""
    if not summaries:
        return None
    
    # Combine all summaries into one text
    combined_text = "\n\n".join([f"Article: {s['title']}\n{s['summary']}" for s in summaries])
    
    prompt = f"""
You are an AI assistant helping IBM salespeople create compelling sales intelligence.

Based on the market research summaries below, provide insights for '{industry}' organizations implementing '{use_case}' in '{region}'.

Provide insights in the EXACT format below:

EXECUTIVE_SUMMARY_START
• [Strategic insight about market trends in {industry} - 1-2 sentences with specific metrics or data points]
• [Business opportunity or challenge - 1-2 sentences highlighting actionable opportunities]
• [Technology or competitive advantage - 1-2 sentences about emerging technologies or market positioning]
EXECUTIVE_SUMMARY_END

2. KEY MARKET INSIGHTS
**Digital Transformation**: [3-4 sentences about digital initiatives and technology adoption patterns in the market]
**Competitive Landscape**: [3-4 sentences about competitive dynamics and market positioning trends]
**Investment Priorities**: [3-4 sentences about where companies are investing and technology priorities]

3. BUSINESS OPPORTUNITIES  
**Solution Opportunities**: [3-4 sentences about specific opportunities for IBM solutions and services]
**Partnership Potential**: [3-4 sentences about collaboration opportunities and strategic partnerships]
**Market Entry Points**: [3-4 sentences about how to approach prospects and entry strategies]

4. STRATEGIC CHALLENGES
**Technology Barriers**: [3-4 sentences about technology adoption challenges and implementation hurdles]
**Market Competition**: [3-4 sentences about competitive pressures and differentiation needs]
**Regulatory Environment**: [3-4 sentences about compliance requirements and regulatory considerations]

IMPORTANT: 
- Make sure to include EXACTLY 3 bullet points in the executive summary section
- Each bullet point should be specific and actionable
- Use **bold** for key metrics, company names, and critical terms
- Base insights on the actual research data provided

Research summaries:
{combined_text[:8000]}
"""

    try:
        token = get_granite_access_token(API_KEY)
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        body = {
            "model_id": "ibm/granite-3-8b-instruct",
            "project_id": PROJECT_ID,
            "messages": [{"role": "user", "content": prompt}],
            "parameters": {
                "max_tokens": 1500,  # Increased for better coverage
                "temperature": 0.3   # Reduced for more consistent formatting
            }
        }
        
        response = requests.post(WATSONX_URL, headers=headers, json=body)
        
        if response.status_code != 200:
            raise Exception(f"Granite API Error: {response.status_code} - {response.text}")
        
        insights = response.json()["choices"][0]["message"]["content"]
        
        # Debug print to see what we're getting
        print(f"DEBUG: Generated insights preview: {insights[:500]}...")
        
        return {
            "industry": industry,
            "use_case": use_case,
            "region": region,
            "insights": insights,
            "based_on_articles": len(summaries)
        }
        
    except Exception as e:
        print(f"❌ Error generating insights: {e}")
        return None

def batch_process_articles(articles: List[Dict], industry: str, use_case: str, region: str, batch_size: int = 5) -> List[Dict]:
    """Process multiple articles in batches for better performance"""
    if not articles:
        return []
    
    # Group articles into batches
    batches = [articles[i:i+batch_size] for i in range(0, len(articles), batch_size)]
    processed_articles = []
    
    for batch in batches:
        try:
            # Create batch prompt
            batch_prompt = create_batch_analysis_prompt(batch, industry, use_case, region)
            
            # Make single API call for the batch
            token = get_granite_access_token(API_KEY)
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            body = {
                "model_id": "ibm/granite-3-8b-instruct",
                "project_id": PROJECT_ID,
                "messages": [{"role": "user", "content": batch_prompt}],
                "parameters": {
                    "max_tokens": 1500,
                    "temperature": 0.4
                }
            }
            
            response = requests.post(WATSONX_URL, headers=headers, json=body)
            
            if response.status_code == 200:
                batch_result = response.json()["choices"][0]["message"]["content"]
                parsed_results = parse_batch_results(batch_result, batch, industry, use_case, region)
                processed_articles.extend(parsed_results)
            else:
                # Fallback to individual processing
                print(f"⚠️ Batch processing failed, using individual processing")
                for article in batch:
                    individual_result = smart_summarize_article(article, industry, use_case, region)
                    if individual_result:
                        processed_articles.append(individual_result)
                        
        except Exception as e:
            print(f"❌ Batch processing error: {e}")
            # Fallback to individual processing
            for article in batch:
                try:
                    individual_result = smart_summarize_article(article, industry, use_case, region)
                    if individual_result:
                        processed_articles.append(individual_result)
                except Exception as inner_e:
                    print(f"❌ Individual processing error: {inner_e}")
                    continue
    
    return processed_articles

def create_batch_analysis_prompt(articles: List[Dict], industry: str, use_case: str, region: str) -> str:
    """Create a batch prompt for analyzing multiple articles"""
    
    articles_text = ""
    for i, article in enumerate(articles):
        text = "\n".join(article["cleaned_text"])[:3000]
        articles_text += f"\n--- ARTICLE {i+1} ---\n"
        articles_text += f"Title: {article['title']}\n"
        articles_text += f"Content: {text}\n"
    
    prompt = f"""
You are an AI assistant helping IBM salespeople analyze market intelligence.

For each article below, first determine if it's relevant to at least 2 of these 3 criteria:
- Industry: '{industry}' (or closely related)
- Use case: '{use_case}' (or similar applications)  
- Region: '{region}' (or broader regional context)

If relevant, provide a summary in the EXACT format specified. If not relevant, respond with "NOT_RELEVANT".

REQUIRED FORMAT for relevant articles:
ARTICLE X:
RELEVANCE: RELEVANT
SUMMARY:
**Market Impact**: [3-4 sentences about market implications and business impact]
**Technology Trends**: [3-4 sentences about technology developments and innovations]
**Strategic Opportunities**: [3-4 sentences about opportunities for IBM solutions]

Analyze these articles:
{articles_text}
"""
    
    return prompt

def parse_batch_results(batch_result: str, articles: List[Dict], industry: str, use_case: str, region: str) -> List[Dict]:
    """Parse batch processing results"""
    results = []
    
    try:
        # Split results by article
        article_sections = batch_result.split("ARTICLE")
        
        for i, section in enumerate(article_sections[1:]):  # Skip first empty section
            if i >= len(articles):
                break
                
            article = articles[i]
            
            # Check if article was deemed relevant
            if "NOT_RELEVANT" in section:
                continue
                
            # Extract summary content
            summary_match = section.split("SUMMARY:")
            if len(summary_match) > 1:
                summary_content = summary_match[1].strip()
                
                # Create result object
                result = {
                    "title": article["title"],
                    "link": article.get("link", ""),
                    "summary": summary_content,
                    "hash": generate_article_hash(article)
                }
                
                # Cache result
                cache_key = f"{result['hash']}_{industry}_{use_case}_{region}"
                watsonx_cache[cache_key] = result
                
                results.append(result)
                
    except Exception as e:
        print(f"❌ Error parsing batch results: {e}")
        
    return results

def process_articles_optimized(articles: List[Dict], industry: str, use_case: str, region: str) -> tuple:
    """
    Optimized processing function that uses batch processing when possible
    Returns (processed_summaries, aggregate_insights)
    """
    print(f"🚀 Processing {len(articles)} articles for {industry} - {use_case} - {region}")
    
    # Use batch processing for better performance
    relevant_summaries = batch_process_articles(articles, industry, use_case, region)
    
    print(f"✅ Found {len(relevant_summaries)} relevant articles")
    
    if not relevant_summaries:
        return [], None
    
    # Generate aggregate insights
    print("📊 Generating aggregate insights...")
    insights = generate_aggregate_insights(relevant_summaries, industry, use_case, region)
    
    return relevant_summaries, insights
def is_relevant_to_criteria(text, industry, use_case, region):
    """Legacy function - now uses optimized version"""
    # Create a mock article for the smart function
    mock_article = {
        "title": "Legacy Article",
        "link": "",
        "cleaned_text": [text[:3000]]
    }
    result = smart_summarize_article(mock_article, industry, use_case, region)
    return result is not None

def summarize_article(article, industry="Financial services", use_case="AI & Machine Learning", region="Asia"):
    """Legacy function - now uses optimized version"""
    return smart_summarize_article(article, industry, use_case, region)

# Main execution function for testing
def main():
    """Test function to demonstrate the optimized processing"""
    
    # Sample test articles
    test_articles = [
        {
            "title": "AI adoption in financial services accelerates",
            "link": "https://example.com/ai-finance",
            "cleaned_text": ["Financial institutions are rapidly adopting AI technologies to improve customer service and operational efficiency. Banks are implementing machine learning algorithms for fraud detection and risk assessment."]
        },
        {
            "title": "Cloud computing trends in Asia Pacific",
            "link": "https://example.com/cloud-asia",
            "cleaned_text": ["Asian companies are migrating to cloud platforms at unprecedented rates. The adoption of hybrid cloud solutions is particularly strong in the financial services sector."]
        }
    ]
    
    # Test the optimized processing
    summaries, insights = process_articles_optimized(
        test_articles, 
        "Financial services", 
        "AI & Machine Learning", 
        "Asia"
    )
    
    print(f"\n📊 PROCESSING RESULTS:")
    print(f"Relevant articles found: {len(summaries)}")
    
    if insights:
        print(f"\n🎯 INSIGHTS GENERATED:")
        print(insights['insights'])
    
    return summaries, insights

if __name__ == "__main__":
    main