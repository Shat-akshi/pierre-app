











import requests
import hashlib
import time
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('WATSONX_API_KEY', "Y5U2-8CprdNj8M-k5_7z5qCEqR0hWvKD0ow06qFAopVN")
PROJECT_ID = os.getenv('WATSONX_PROJECT_ID', "7765053a-6228-4fff-970d-31f06b7ca3df")
WATSONX_URL = "https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29"

watsonx_cache = {}

def get_granite_access_token(api_key):
    """Get IBM WatsonX access token"""
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
    return response.json()["access_token"]

def generate_article_hash(article):
    """Generate a unique hash for an article to avoid duplicates"""
    content = f"{article['title']}{article.get('link', '')}"
    return hashlib.md5(content.encode()).hexdigest()

def smart_summarize_article(article, industry="Financial services", use_case="AI & Machine Learning", region="Asia"):
    """OPTIMIZED: Combined relevance check + 6-point summarization in ONE API call"""
    
    text = "\n".join(article["cleaned_text"])[:6000]
    article_hash = generate_article_hash(article)
    cache_key = f"{article_hash}_{industry}_{use_case}_{region}"
    
    # Check cache first
    if cache_key in watsonx_cache:
        print(f"✅ Using cached summary for {article['title']}")
        return watsonx_cache[cache_key]
    
    # COMBINED prompt for relevance + summarization
    prompt = f"""
You are an AI assistant helping IBM salespeople. 

FIRST: Silently check if this article is relevant to at least 2 of these 3 criteria:
- Industry: '{industry}' (or closely related)
- Use case: '{use_case}' (or similar applications)
- Region: '{region}' (or broader regional context)

DO NOT mention relevance, determination in your response.


SECOND: If relevant to at least 2 of these 3 criteria, provide a 3-4 bullet summary, maximum 6 points, don't go beyond 6 points at all.


Focus on insights connecting to the criteria:
- Direct relevance to specified criteria
- Adjacent markets and related industries
- Technology trends impacting the use case
- Regional market dynamics and opportunities

Each bullet should:
Maximum 10 words per bullet
- Start with key action word or company name
- Include specific metrics when available
- Use **bold** for key terms
- Connect to IBM's value proposition where possible
- Connect atleast 2 criteria. 
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
                "max_tokens": 700,
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

# Legacy functions for backward compatibility
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

def generate_aggregate_insights(summaries, industry, use_case, region):
    """Generate aggregate insights from all relevant summaries with extremely concise bullet points"""
    if not summaries:
        return None
    
    # Combine all summaries into one text
    combined_text = "\n\n".join([f"Article: {s['title']}\n{s['summary']}" for s in summaries])
    
    prompt = f"""
You are an AI assistant helping IBM salespeople create compelling sales pitches.

Based on the following market research summaries, identify key insights for '{industry}' organizations implementing '{use_case}' in '{region}'.

For each section below, provide EXTREMELY BRIEF bullet points (maximum 8-10 words each):

1. EXECUTIVE SUMMARY
- A 1-sentence overview
- 2 bullet points minimum, 3 maximum

2. TOP PAIN POINTS (3 bullet points only)
- Focus on specific challenges
- Each bullet must be 8-10 words MAXIMUM
- Start each point with a key term or action word
- 2 bullet points minimum, 3 maximum

3. KEY OPPORTUNITIES (3 bullet points only)
- Highlight market opportunities
- Each bullet must be 8-10 words MAXIMUM
- Start each point with a key term or action word
- 2 bullet points minimum, 3 maximum

4. EMERGING TRENDS (3 bullet points only)
- Identify emerging trends
- Each bullet must be 8-10 words MAXIMUM
- Start each point with a key term or action word
- 2 bullet points minimum, 3 maximum

Format: Keep all bullet points EXTREMELY concise (no more than 8-10 words each).
IMPORTANT : Maximum 3 bullet points per section. DO NOT EXCEED 3 BULLET POINTS PER SECTION.
Use **bold** for any key metrics or critical terms.

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
                "max_tokens": 1000,
                "temperature": 0.4
            }
        }
        
        response = requests.post(WATSONX_URL, headers=headers, json=body)
        
        if response.status_code != 200:
            raise Exception(f"Granite API Error: {response.status_code} - {response.text}")
        
        insights = response.json()["choices"][0]["message"]["content"]
        
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

def generate_competitor_landscape(summaries, industry, use_case, region):
    """Generate insights about competitors based on the article summaries with extremely concise points"""
    if not summaries or len(summaries) < 2:
        return None
    
    # Combine all summaries into one text
    combined_text = "\n\n".join([f"Article: {s['title']}\n{s['summary']}" for s in summaries])
    
    prompt = f"""
You are a competitive intelligence analyst helping IBM salespeople understand the competitor landscape.

Based on the following market research summaries, identify key competitors in **{industry}**
implementing **{use_case}** solutions in **{region}**.

Create a competitive landscape with EXTREMELY BRIEF bullet points (8-10 words maximum per point):

1. KEY PLAYERS (3-4 total)
- For each competitor: name + 1 key offering/strength
- Format: "**Company Name**: Brief 5-8 word description"


2. COMPETITIVE STRATEGIES (3 points only)
- Each strategy in 8-10 words maximum
- Focus on most impactful competitor approaches

3. IBM POSITIONING OPPORTUNITIES (3-4)
- Suggest specific ways IBM can position against these competitors
- Identify gaps in competitor offerings that IBM can leverage
- Focus on unique IBM strengths relevant to {industry} and {use_case}

IMPORTANT: All bullet points MUST be 8-10 words MAXIMUM. IN ANY SECTION, DO NOT EXCEED 5 BULLET POINTS. DO NOT REPEAT ANY LINES.


Use **bold** for company names and key terms.

Research summaries:
{combined_text[:7500]}
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
                "max_tokens": 1000,
                "temperature": 0.4
            }
        }
        
        response = requests.post(WATSONX_URL, headers=headers, json=body)
        
        if response.status_code != 200:
            raise Exception(f"Granite API Error: {response.status_code} - {response.text}")
        
        landscape = response.json()["choices"][0]["message"]["content"]
        
        return {
            "industry": industry,
            "use_case": use_case,
            "region": region,
            "landscape": landscape,
            "based_on_articles": len(summaries)
        }
        
    except Exception as e:
        print(f"❌ Error generating competitor landscape: {e}")
        return None

