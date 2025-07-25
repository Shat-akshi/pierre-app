import requests
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import re
from dataclasses import dataclass
import time
from urllib.parse import urljoin, urlparse
import logging
import hashlib
from bs4 import BeautifulSoup

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Watson/Granite Configuration
GRANITE_API_KEY = "Y5U2-8CprdNj8M-k5_7z5qCEqR0hWvKD0ow06qFAopVN"
PROJECT_ID = "7765053a-6228-4fff-970d-31f06b7ca3df"
WATSONX_URL = "https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29"

@dataclass
class NewsArticle:
    title: str
    url: str
    published_date: str
    source: str
    content: str
    summary: str = ""
    sentiment: str = "neutral"
    hash: str = ""

class GraniteAPI:
    """Watson Granite API handler"""
    
    def __init__(self, api_key: str, project_id: str):
        self.api_key = api_key
        self.project_id = project_id
        self._token = None
        self._token_expiry = 0
    
    def get_access_token(self):
        """Get or refresh IBM Cloud access token"""
        if self._token and time.time() < self._token_expiry:
            return self._token
            
        url = "https://iam.cloud.ibm.com/identity/token"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        }
        data = {
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": self.api_key
        }
        
        response = requests.post(url, headers=headers, data=data)
        response.raise_for_status()
        
        token_data = response.json()
        self._token = token_data["access_token"]
        # Set expiry to 10 minutes before actual expiry for safety
        self._token_expiry = time.time() + token_data.get("expires_in", 3600) - 600
        
        return self._token
    
    def call_granite(self, prompt: str, max_tokens: int = 500, temperature: float = 0.3):
        """Make a call to Granite model"""
        token = self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        body = {
            "model_id": "ibm/granite-3-8b-instruct",
            "project_id": self.project_id,
            "messages": [{"role": "user", "content": prompt}],
            "parameters": {
                "max_tokens": max_tokens,
                "temperature": temperature
            }
        }
        
        response = requests.post(WATSONX_URL, headers=headers, json=body)
        if response.status_code != 200:
            raise Exception(f"Granite API Error: {response.status_code} - {response.text}")
        
        return response.json()["choices"][0]["message"]["content"].strip()

# class NewsAPIScraper:
#     """Scraper using NewsAPI for getting company news"""
    
#     def __init__(self, api_key: str):
#         self.api_key = api_key
#         self.base_url = "https://newsapi.org/v2"
        
#     def search_company_news(self, company_name: str, days_back: int = 7) -> List[Dict]:
#         """Search for news articles about a specific company"""
        
#         # Calculate date range
#         end_date = datetime.now()
#         start_date = end_date - timedelta(days=days_back)
        
#         # Prepare search query with variations
#         query = f'"{company_name}" OR "{company_name} Inc" OR "{company_name} Corp" OR "{company_name} Ltd"'
        
#         params = {
#             'q': query,
#             'from': start_date.strftime('%Y-%m-%d'),
#             'to': end_date.strftime('%Y-%m-%d'),
#             'sortBy': 'publishedAt',
#             'language': 'en',
#             'pageSize': 50,
#             'apiKey': self.api_key
#         }
        
#         try:
#             response = requests.get(f"{self.base_url}/everything", params=params)
#             response.raise_for_status()
#             data = response.json()
            
#             if data['status'] == 'ok':
#                 return data['articles']
#             else:
#                 logger.error(f"NewsAPI error: {data.get('message', 'Unknown error')}")
#                 return []
                
#         except requests.exceptions.RequestException as e:
#             logger.error(f"Request failed: {e}")
#             return []
class NewsAPIScraper:
    """ScrapingBee-powered NewsAPI scraper for getting company news"""
    
    def __init__(self, api_key: str):
        # 🔥 HARDCODED API KEYS (consistent with your approach)
        self.api_key = '1df6a64fa0384add8a60c14ff7f941a0'
        self.scrapingbee_api_key = 'CNG1OKXEMD0H2XF5N3WRTEOS9Z323G86GEW2UPYL7Y33TYGCVBQUOPMIX5K5TQU1WSW8SZT9P6LYF94S'
        self.scrapingbee_base_url = 'https://app.scrapingbee.com/api/v1/'
        self.news_base_url = "https://newsapi.org/v2"
        
        print(f"✅ NewsAPIScraper (companynews) initialized with ScrapingBee")

    def create_scrapingbee_proxy_url(self, news_api_url):
        """Create ScrapingBee proxy URL for NewsAPI calls"""
        from urllib.parse import urlencode
        
        scrapingbee_params = {
            'api_key': self.scrapingbee_api_key,
            'url': news_api_url,
            'render_js': 'false',
            'premium_proxy': 'false'
        }
        
        return f"{self.scrapingbee_base_url}?{urlencode(scrapingbee_params)}"

    def search_company_news(self, company_name: str, days_back: int = 7) -> List[Dict]:
        """Search for news articles about a specific company via ScrapingBee"""
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)

        # Prepare search query with variations
        query = f'"{company_name}" OR "{company_name} Inc" OR "{company_name} Corp" OR "{company_name} Ltd"'
        
        params = {
            'q': query,
            'from': start_date.strftime('%Y-%m-%d'),
            'to': end_date.strftime('%Y-%m-%d'),
            'sortBy': 'publishedAt',
            'language': 'en',
            'pageSize': 50,
            'apiKey': self.api_key
        }

        try:
            # 🔄 BUILD COMPLETE NEWSAPI URL
            from urllib.parse import urlencode
            full_news_api_url = f"{self.news_base_url}/everything?{urlencode(params)}"
            
            # 🆕 CREATE SCRAPINGBEE PROXY URL
            proxy_url = self.create_scrapingbee_proxy_url(full_news_api_url)
            
            print(f"📡 Using ScrapingBee proxy for company news search (companynews)")
            
            # 🔄 MAKE REQUEST VIA SCRAPINGBEE INSTEAD OF DIRECT
            response = requests.get(proxy_url, timeout=15)
            response.raise_for_status()
            data = response.json()
            
            if data['status'] == 'ok':
                logger.info(f"✅ Retrieved {len(data['articles'])} articles for {company_name} via ScrapingBee")
                return data['articles']
            else:
                logger.error(f"NewsAPI error: {data.get('message', 'Unknown error')}")
                return []
                
        except requests.exceptions.RequestException as e:
            logger.error(f"ScrapingBee + NewsAPI request failed: {e}")
            return []


class WebScraper:
    """Advanced web scraper using BeautifulSoup"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def extract_article_content(self, url: str) -> str:
        """Extract main content from article URL using BeautifulSoup"""
        try:
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove unwanted elements
            for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'iframe']):
                element.decompose()
            
            # Try multiple content selectors (common article containers)
            content_selectors = [
                'article',
                '.article-content',
                '.post-content',
                '.entry-content',
                '.content',
                '.story-body',
                '.article-body',
                '[data-module="ArticleBody"]',
                '.post-body'
            ]
            
            content_text = ""
            
            for selector in content_selectors:
                elements = soup.select(selector)
                if elements:
                    # Get text from paragraphs within the content area
                    paragraphs = elements[0].find_all(['p', 'div'], string=True)
                    content_text = ' '.join([p.get_text().strip() for p in paragraphs if len(p.get_text().strip()) > 50])
                    break
            
            # Fallback: extract all paragraphs if no content area found
            if not content_text:
                paragraphs = soup.find_all('p')
                content_text = ' '.join([p.get_text().strip() for p in paragraphs if len(p.get_text().strip()) > 50])
            
            # Clean up text
            content_text = re.sub(r'\s+', ' ', content_text).strip()
            
            # Return first 2000 characters for processing
            return content_text[:2000] if content_text else ""
            
        except Exception as e:
            logger.warning(f"Failed to scrape {url}: {e}")
            return ""

class GraniteSentimentAnalyzer:
    """Sentiment analysis using Granite model"""
    
    def __init__(self, granite_api: GraniteAPI):
        self.granite_api = granite_api
    
    def analyze_sentiment(self, title: str, content: str, company_name: str) -> str:
        """Analyze sentiment of news article using Granite"""
        
        text_to_analyze = f"Title: {title}\nContent: {content[:1000]}"
        
        prompt = f"""
Analyze the sentiment of this news article about {company_name}. 

Consider the business impact and implications for the company. Classify as:
- "positive" if the news suggests good developments, growth, success, or positive market reception
- "negative" if the news suggests challenges, problems, losses, or negative market reception  
- "neutral" if the news is informational without clear positive or negative business implications

Article to analyze:
{text_to_analyze}

Respond with only one word: positive, negative, or neutral.
"""
        
        try:
            result = self.granite_api.call_granite(prompt, max_tokens=10, temperature=0.1)
            sentiment = result.lower().strip()
            
            if sentiment in ['positive', 'negative', 'neutral']:
                return sentiment
            else:
                return 'neutral'  # Default fallback
                
        except Exception as e:
            logger.warning(f"Sentiment analysis failed: {e}")
            return 'neutral'

class GraniteNewsSummarizer:
    """Summarize news articles using Granite model"""
    
    def __init__(self, granite_api: GraniteAPI):
        self.granite_api = granite_api
    
    def generate_article_hash(self, article: Dict) -> str:
        """Generate unique hash for article to avoid duplicates"""
        content = f"{article.get('title', '')}{article.get('url', '')}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def summarize_article(self, article: NewsArticle, company_name: str) -> str:
        """Generate business-focused summary of article"""
        
        prompt = f"""
You are an AI assistant helping sales professionals understand recent developments about {company_name}.

Summarize this news article focusing on:
- Key business developments or strategic moves
- Market implications and opportunities
- Financial performance indicators
- Technology or product developments
- Partnership and expansion activities
- Challenges or risks mentioned

Provide a concise 3-4 bullet point summary that would be valuable for a sales conversation.

Article Title: {article.title}
Article Content: {article.content}

Keep the summary professional and factual.
"""
        
        try:
            summary = self.granite_api.call_granite(prompt, max_tokens=400, temperature=0.4)
            return summary
        except Exception as e:
            logger.error(f"Article summarization failed: {e}")
            return f"• Recent news about {company_name}: {article.title}"
    
    def generate_company_intelligence(self, articles: List[NewsArticle], company_name: str) -> Dict:
        """Generate comprehensive company intelligence report"""
        
        if not articles:
            return {
                'company': company_name,
                'summary': f"No recent news found for {company_name}",
                'total_articles': 0,
                'key_insights': [],
                'positive_developments': [],
                'challenges_opportunities': [],
                'neutral_updates': []
            }
        
        # Group articles by sentiment for diplomatic presentation
        positive_articles = [a for a in articles if a.sentiment == 'positive']
        negative_articles = [a for a in articles if a.sentiment == 'negative']
        neutral_articles = [a for a in articles if a.sentiment == 'neutral']
        
        # Generate aggregate insights
        all_summaries = '\n\n'.join([f"Article: {a.title}\nSummary: {a.summary}" for a in articles[:10]])
        
        insights_prompt = f"""
Based on recent news analysis for {company_name}, provide strategic insights for sales professionals:

1. Key Market Position: What does this news tell us about {company_name}'s current market position?
2. Business Opportunities: What opportunities or growth areas are evident?
3. Potential Challenges: What challenges or areas of focus are mentioned?
4. Sales Conversation Starters: What topics from this news could be valuable in sales discussions?

Be diplomatic and professional. Present challenges as potential areas where solutions could add value.

Recent news summaries:
{all_summaries[:3000]}

Provide 4-6 key insights in bullet points.
"""
        
        try:
            key_insights = self.granite_api.call_granite(insights_prompt, max_tokens=600, temperature=0.5)
        except Exception as e:
            logger.error(f"Insights generation failed: {e}")
            key_insights = f"Recent activity analysis for {company_name} based on {len(articles)} news articles."
        
        return {
            'company': company_name,
            'total_articles': len(articles),
            'analysis_period': '7 days',
            'key_insights': key_insights,
            'positive_developments': [
                {
                    'title': a.title,
                    'summary': a.summary,
                    'url': a.url,
                    'date': a.published_date,
                    'source': a.source
                } for a in positive_articles[:3]
            ],
            'challenges_opportunities': [
                {
                    'title': a.title,
                    'summary': a.summary,
                    'url': a.url,
                    'date': a.published_date,
                    'source': a.source
                } for a in negative_articles[:3]
            ],
            'neutral_updates': [
                {
                    'title': a.title,
                    'summary': a.summary,
                    'url': a.url,
                    'date': a.published_date,
                    'source': a.source
                } for a in neutral_articles[:3]
            ],
            'sentiment_distribution': {
                'positive': len(positive_articles),
                'challenges': len(negative_articles),  # Diplomatic naming
                'neutral': len(neutral_articles)
            }
        }

class CompanyNewsIntelligence:
    """Main pipeline class using Granite AI"""
    
    def __init__(self, news_api_key: str, granite_api_key: str, project_id: str):
        self.news_scraper = NewsAPIScraper(news_api_key)
        self.web_scraper = WebScraper()
        self.granite_api = GraniteAPI(granite_api_key, project_id)
        self.sentiment_analyzer = GraniteSentimentAnalyzer(self.granite_api)
        self.summarizer = GraniteNewsSummarizer(self.granite_api)
    
    def analyze_company(self, company_name: str, days_back: int = 7) -> Dict[str, any]:
        """Complete analysis pipeline for a company"""
        
        logger.info(f"Starting intelligence gathering for {company_name}")
        
        # Step 1: Get news articles
        raw_articles = self.news_scraper.search_company_news(company_name, days_back)
        logger.info(f"Found {len(raw_articles)} raw articles")
        
        if not raw_articles:
            return self.summarizer.generate_company_intelligence([], company_name)
        
        # Step 2: Process and analyze articles
        processed_articles = []
        seen_hashes = set()
        
        for article_data in raw_articles[:15]:  # Limit to avoid API costs
            try:
                # Generate hash to avoid duplicates
                article_hash = self.summarizer.generate_article_hash(article_data)
                if article_hash in seen_hashes:
                    continue
                seen_hashes.add(article_hash)
                
                # Extract content
                content = article_data.get('description', '') or article_data.get('content', '')
                
                # If content is limited, try scraping
                if len(content) < 200 and article_data.get('url'):
                    scraped_content = self.web_scraper.extract_article_content(article_data['url'])
                    if scraped_content:
                        content = scraped_content
                
                if not content:
                    continue
                
                # Create article object
                article = NewsArticle(
                    title=article_data.get('title', 'No title'),
                    url=article_data.get('url', ''),
                    published_date=article_data.get('publishedAt', ''),
                    source=article_data.get('source', {}).get('name', 'Unknown'),
                    content=content,
                    hash=article_hash
                )
                
                # Analyze sentiment
                article.sentiment = self.sentiment_analyzer.analyze_sentiment(
                    article.title, article.content, company_name
                )
                
                # Generate summary
                article.summary = self.summarizer.summarize_article(article, company_name)
                
                processed_articles.append(article)
                
                # Rate limiting for API calls
                time.sleep(1)
                
            except Exception as e:
                logger.warning(f"Failed to process article: {e}")
                continue
        
        logger.info(f"Successfully processed {len(processed_articles)} articles")
        
        # Step 3: Generate comprehensive intelligence report
        intelligence_report = self.summarizer.generate_company_intelligence(processed_articles, company_name)
        
        return intelligence_report

def main():
    """Example usage"""
    
    # API Keys - Replace with your actual keys
    NEWS_API_KEY = "068af313e99f41a58c7291904f8a13e5"
    GRANITE_API_KEY = "Y5U2-8CprdNj8M-k5_7z5qCEqR0hWvKD0ow06qFAopVN"  
    PROJECT_ID = "7765053a-6228-4fff-970d-31f06b7ca3df"
    
    # Initialize the intelligence pipeline
    intelligence = CompanyNewsIntelligence(NEWS_API_KEY, GRANITE_API_KEY, PROJECT_ID)
    
    # Analyze a target company
    company_name = "Infosys"  # Change to your prospect company
    
    print(f"🔍 Gathering intelligence on {company_name}...")
    result = intelligence.analyze_company(company_name, days_back=7)
    
    # Display results in a sales-friendly format
    print("\n" + "="*60)
    print(f"📊 COMPANY INTELLIGENCE BRIEF: {result['company']}")
    print("="*60)
    
    print(f"\n📈 Analysis Summary:")
    print(f"   • Total articles analyzed: {result['total_articles']}")
    print(f"   • Analysis period: {result['analysis_period']}")
    
    if result['total_articles'] > 0:
        sentiment = result['sentiment_distribution']
        print(f"   • Positive developments: {sentiment['positive']} articles")
        print(f"   • Areas of focus: {sentiment['challenges']} articles")
        print(f"   • General updates: {sentiment['neutral']} articles")
        
        print(f"\n🎯 Key Strategic Insights:")
        print(result['key_insights'])
        
        if result['positive_developments']:
            print(f"\n✅ Recent Positive Developments:")
            for i, news in enumerate(result['positive_developments'], 1):
                print(f"\n   {i}. {news['title']}")
                print(f"      {news['summary']}")
                print(f"      Source: {news['source']} | URL: {news['url']}")
        
        if result['challenges_opportunities']:
            print(f"\n🎪 Areas of Focus & Opportunities:")
            for i, news in enumerate(result['challenges_opportunities'], 1):
                print(f"\n   {i}. {news['title']}")
                print(f"      {news['summary']}")
                print(f"      Source: {news['source']} | URL: {news['url']}")
        
        if result['neutral_updates']:
            print(f"\n📰 General Business Updates:")
            for i, news in enumerate(result['neutral_updates'], 1):
                print(f"\n   {i}. {news['title']}")
                print(f"      {news['summary']}")
                print(f"      Source: {news['source']} | URL: {news['url']}")
    
    # Save comprehensive report
    filename = f"{company_name.lower().replace(' ', '_')}_intelligence_report.json"
    with open(filename, 'w') as f:
        json.dump(result, f, indent=2)
    
    print(f"\n💾 Full intelligence report saved to: {filename}")
    print(f"🚀 Ready for your sales conversation with {company_name}!")

if __name__ == "__main__":
    main()