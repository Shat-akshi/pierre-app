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
import concurrent.futures
import threading

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Watson/Granite Configuration
GRANITE_API_KEY = "gtUEfNtO2hpt9zxy7r-WF1P4Zk9rArQeIhlenEvfxKSQ"
PROJECT_ID = "8ddd7558-5a5c-4ae2-b4e1-1434085a8e94"
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
    """Watson Granite API handler with token management"""
    
    def __init__(self, api_key: str, project_id: str):
        self.api_key = api_key
        self.project_id = project_id
        self._token = None
        self._token_expiry = 0
        self._lock = threading.Lock()
    
    def get_access_token(self):
        """Get or refresh IBM Cloud access token"""
        with self._lock:
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

class NewsAPIScraper:
    """Scraper using NewsAPI for getting company news"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://newsapi.org/v2"
        
    def search_company_news(self, company_name: str, days_back: int = 7) -> List[Dict]:
        """Search for news articles about a specific company"""
        
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
            response = requests.get(f"{self.base_url}/everything", params=params)
            response.raise_for_status()
            data = response.json()
            
            if data['status'] == 'ok':
                return data['articles']
            else:
                logger.error(f"NewsAPI error: {data.get('message', 'Unknown error')}")
                return []
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
            return []

class WebScraper:
    """Lightweight web scraper"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def extract_article_content(self, url: str) -> str:
        """Extract main content from article URL"""
        try:
            response = self.session.get(url, timeout=8)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove unwanted elements
            for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside']):
                element.decompose()
            
            # Get all paragraphs
            paragraphs = soup.find_all('p')
            content_text = ' '.join([p.get_text().strip() for p in paragraphs if len(p.get_text().strip()) > 50])
            
            # Clean up text
            content_text = re.sub(r'\s+', ' ', content_text).strip()
            
            return content_text[:1200] if content_text else ""
            
        except Exception as e:
            logger.warning(f"Failed to scrape {url}: {e}")
            return ""

class UltraBatchProcessor:
    """Ultra-optimized processor that handles everything in 2 API calls maximum"""
    
    def __init__(self, granite_api: GraniteAPI, web_scraper: WebScraper):
        self.granite_api = granite_api
        self.web_scraper = web_scraper
    
    def process_all_articles(self, raw_articles: List[Dict], company_name: str) -> List[NewsArticle]:
        """Process ALL articles in one giant batch - maximum 2 API calls total"""
        
        if not raw_articles:
            return []
        
        logger.info("Ultra-batch processing: Preparing articles...")
        
        # Step 1: Quick parallel content extraction (no API calls)
        processed_articles = []
        seen_hashes = set()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            futures = []
            for article_data in raw_articles[:12]:  # Limit to 12 best articles
                futures.append(
                    executor.submit(self._prepare_article, article_data, company_name)
                )
            
            for future in concurrent.futures.as_completed(futures):
                try:
                    article = future.result()
                    if article and article.hash not in seen_hashes and len(article.content) > 100:
                        processed_articles.append(article)
                        seen_hashes.add(article.hash)
                        if len(processed_articles) >= 10:  # Stop at 10 good articles
                            break
                except Exception as e:
                    logger.warning(f"Article preparation failed: {e}")
                    continue
        
        logger.info(f"Prepared {len(processed_articles)} articles for analysis")
        
        if not processed_articles:
            return []
        
        # Step 2: ONE MASSIVE API CALL for all sentiment + summary
        logger.info("Ultra-batch processing: Analyzing all articles in single API call...")
        
        try:
            mega_prompt = self._create_mega_analysis_prompt(processed_articles, company_name)
            result = self.granite_api.call_granite(mega_prompt, max_tokens=3000, temperature=0.3)
            
            # Parse the mega result
            final_articles = self._parse_mega_results(result, processed_articles)
            logger.info(f"Successfully processed {len(final_articles)} articles in mega-batch")
            
            return final_articles
            
        except Exception as e:
            logger.error(f"Mega-batch processing failed: {e}")
            # Emergency fallback: process in smaller batches
            return self._fallback_batch_processing(processed_articles, company_name)
    
    def _prepare_article(self, article_data: Dict, company_name: str) -> Optional[NewsArticle]:
        """Prepare a single article (no API calls)"""
        try:
            article_hash = hashlib.md5(f"{article_data.get('title', '')}{article_data.get('url', '')}".encode()).hexdigest()
            
            # Get content
            content = article_data.get('description', '') or article_data.get('content', '')
            
            # Quick scraping if needed
            if len(content) < 150 and article_data.get('url'):
                scraped_content = self.web_scraper.extract_article_content(article_data['url'])
                if scraped_content:
                    content = scraped_content
            
            if not content or len(content) < 80:
                return None
            
            return NewsArticle(
                title=article_data.get('title', 'No title'),
                url=article_data.get('url', ''),
                published_date=article_data.get('publishedAt', ''),
                source=article_data.get('source', {}).get('name', 'Unknown'),
                content=content,
                hash=article_hash
            )
            
        except Exception as e:
            logger.warning(f"Article preparation failed: {e}")
            return None
    
    def _create_mega_analysis_prompt(self, articles: List[NewsArticle], company_name: str) -> str:
        """Create ONE MASSIVE prompt for all articles"""
        
        articles_section = ""
        for i, article in enumerate(articles):
            articles_section += f"""
=== ARTICLE {i+1} ===
TITLE: {article.title}
CONTENT: {article.content[:600]}
"""
        
        prompt = f"""You are an AI assistant analyzing news about {company_name} for sales intelligence.

For EACH article below, provide sentiment + summary in this EXACT format:

ARTICLE X ANALYSIS:
SENTIMENT: [positive/negative/neutral]
SUMMARY:
**Business Impact**: [2-3 sentences about business implications and market impact]
**Key Developments**: [2-3 sentences about specific developments and strategic moves]
**Strategic Relevance**: [2-3 sentences about relevance for sales conversations]

Analyze ALL articles about {company_name}:
{articles_section}

IMPORTANT: Provide analysis for ALL {len(articles)} articles in the exact format shown above."""
        
        return prompt
    
    def _parse_mega_results(self, result: str, articles: List[NewsArticle]) -> List[NewsArticle]:
        """Parse the mega analysis result"""
        try:
            # Split by article analysis sections
            sections = re.split(r'ARTICLE \d+ ANALYSIS:', result)
            
            for i, section in enumerate(sections[1:]):  # Skip first empty section
                if i >= len(articles):
                    break
                
                article = articles[i]
                
                # Extract sentiment
                sentiment_match = re.search(r'SENTIMENT:\s*(\w+)', section)
                if sentiment_match:
                    sentiment = sentiment_match.group(1).lower()
                    article.sentiment = sentiment if sentiment in ['positive', 'negative', 'neutral'] else 'neutral'
                else:
                    article.sentiment = 'neutral'
                
                # Extract summary
                summary_match = re.search(r'SUMMARY:\s*(.*?)(?=ARTICLE|\Z)', section, re.DOTALL)
                if summary_match:
                    article.summary = summary_match.group(1).strip()
                else:
                    article.summary = f"**Business Impact**: Recent news about {company_name}: {article.title}. **Key Developments**: Analysis pending. **Strategic Relevance**: Relevant for sales discussions."
            
            return articles
            
        except Exception as e:
            logger.error(f"Failed to parse mega results: {e}")
            # Set default values
            for article in articles:
                if not article.sentiment:
                    article.sentiment = 'neutral'
                if not article.summary:
                    article.summary = f"**Business Impact**: Recent development regarding {article.title}. **Key Developments**: Strategic news for {company_name}. **Strategic Relevance**: Important for sales conversations."
            
            return articles
    
    def _fallback_batch_processing(self, articles: List[NewsArticle], company_name: str) -> List[NewsArticle]:
        """Emergency fallback processing"""
        logger.info("Using fallback batch processing...")
        
        # Process in smaller batches of 3
        for i in range(0, len(articles), 3):
            batch = articles[i:i+3]
            try:
                batch_prompt = f"""Analyze these {len(batch)} articles about {company_name}:

{chr(10).join([f"Article {j+1}: {a.title} - {a.content[:300]}" for j, a in enumerate(batch)])}

For each article, respond with:
ARTICLE X: [positive/negative/neutral] | **Business Impact**: [brief impact] **Key Developments**: [brief developments] **Strategic Relevance**: [brief relevance]"""
                
                result = self.granite_api.call_granite(batch_prompt, max_tokens=800, temperature=0.3)
                
                # Parse simple format
                lines = result.split('\n')
                for j, line in enumerate(lines):
                    if f"ARTICLE {j+1}:" in line and j < len(batch):
                        parts = line.split('|')
                        if len(parts) >= 2:
                            batch[j].sentiment = parts[0].split(':')[1].strip()
                            batch[j].summary = parts[1].strip()
                
            except Exception as e:
                logger.warning(f"Fallback batch failed: {e}")
                # Set defaults
                for article in batch:
                    if not article.sentiment:
                        article.sentiment = 'neutral'
                    if not article.summary:
                        article.summary = f"**Business Impact**: {article.title}. **Key Developments**: Strategic update. **Strategic Relevance**: Sales relevant."
        
        return articles

class OptimizedNewsSummarizer:
    """Generate final intelligence report with structured executive summary"""
    
    def __init__(self, granite_api: GraniteAPI):
        self.granite_api = granite_api
    
    def generate_company_intelligence(self, articles: List[NewsArticle], company_name: str) -> Dict:
        """Generate intelligence report with properly extracted executive summary"""
        
        if not articles:
            return {
                'company': company_name,
                'executive_summary': [],
                'total_articles': 0,
                'key_insights': "No recent intelligence available for analysis.",
                'positive_developments': [],
                'challenges_opportunities': [],
                'neutral_updates': []
            }
        
        # Group articles by sentiment
        positive_articles = [a for a in articles if a.sentiment == 'positive']
        negative_articles = [a for a in articles if a.sentiment == 'negative']
        neutral_articles = [a for a in articles if a.sentiment == 'neutral']
        
        # Generate insights with proper executive summary
        all_summaries = '\n\n'.join([f"Title: {a.title}\nSummary: {a.summary}" for a in articles])
        
        insights_prompt = f"""You are an AI assistant creating sales intelligence for {company_name}.

Based on the company news analysis, provide insights in this EXACT format:

EXECUTIVE_SUMMARY_START
• [Strategic insight about {company_name}'s market position - 1-2 sentences]
• [Business opportunity or recent development - 1-2 sentences]  
• [Technology focus or competitive advantage - 1-2 sentences]
EXECUTIVE_SUMMARY_END

SALES_CONVERSATION_STARTERS
**Market Leadership**: [3-4 sentences about their market position and competitive advantages]
**Innovation Focus**: [3-4 sentences about technology initiatives and R&D investments]
**Growth Strategy**: [3-4 sentences about expansion plans and business development]

BUSINESS_OPPORTUNITIES
**Digital Transformation**: [3-4 sentences about their digital initiatives and technology adoption]
**Partnership Potential**: [3-4 sentences about collaboration opportunities and strategic alliances]
**Market Expansion**: [3-4 sentences about new markets and geographical expansion]

STRATEGIC_CHALLENGES
**Competitive Pressure**: [3-4 sentences about market competition and positioning challenges]
**Operational Efficiency**: [3-4 sentences about cost management and operational improvements]
**Technology Evolution**: [3-4 sentences about technology adaptation and modernization needs]

Company analysis data:
{all_summaries[:6000]}"""
        
        try:
            logger.info("Generating final intelligence report...")
            insights_raw = self.granite_api.call_granite(insights_prompt, max_tokens=1500, temperature=0.4)
            
            # Extract executive summary
            executive_summary = self._extract_executive_summary(insights_raw)
            
            # Clean up insights (remove executive summary section)
            clean_insights = re.sub(r'EXECUTIVE_SUMMARY_START.*?EXECUTIVE_SUMMARY_END\s*', '', insights_raw, flags=re.DOTALL)
            
            logger.info("✅ Executive summary extracted from company insights")
            
        except Exception as e:
            logger.error(f"Insights generation failed: {e}")
            executive_summary = [
                f"Recent strategic developments show {company_name} maintaining strong market position",
                f"Business opportunities emerging in technology and market expansion areas",
                f"Competitive advantages evident in innovation and operational efficiency"
            ]
            clean_insights = f"Analysis of {len(articles)} recent news articles about {company_name}."
        
        return {
            'company': company_name,
            'executive_summary': executive_summary,
            'total_articles': len(articles),
            'analysis_period': '7 days',
            'key_insights': clean_insights,
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
                'challenges': len(negative_articles),
                'neutral': len(neutral_articles)
            }
        }
    
    def _extract_executive_summary(self, insights_text: str) -> List[str]:
        """Extract executive summary points from insights"""
        try:
            # Look for the executive summary section
            summary_match = re.search(
                r'EXECUTIVE_SUMMARY_START(.*?)EXECUTIVE_SUMMARY_END', 
                insights_text, 
                re.DOTALL
            )
            
            if summary_match:
                summary_section = summary_match.group(1).strip()
                # Extract bullet points
                bullet_points = re.findall(r'•\s*([^•]+)', summary_section)
                if bullet_points:
                    return [point.strip() for point in bullet_points[:3]]
            
            # Fallback: look for any bullet points at the start
            lines = insights_text.split('\n')
            bullets = []
            for line in lines:
                if line.strip().startswith('•') and len(bullets) < 3:
                    bullets.append(line.strip()[1:].strip())
            
            if bullets:
                return bullets
            
            # Last resort: create generic summary
            return [
                "Strategic positioning shows recent business developments",
                "Market opportunities identified in key growth areas", 
                "Competitive advantages evident in technology and operations"
            ]
            
        except Exception as e:
            logger.error(f"Executive summary extraction failed: {e}")
            return [
                "Recent strategic developments identified",
                "Business opportunities emerging in market",
                "Competitive positioning shows strong potential"
            ]

class CompanyNewsIntelligence:
    """Ultra-optimized pipeline - maximum 2 API calls total"""
    
    def __init__(self, news_api_key: str, granite_api_key: str, project_id: str):
        self.news_scraper = NewsAPIScraper(news_api_key)
        self.web_scraper = WebScraper()
        self.granite_api = GraniteAPI(granite_api_key, project_id)
        self.ultra_processor = UltraBatchProcessor(self.granite_api, self.web_scraper)
        self.summarizer = OptimizedNewsSummarizer(self.granite_api)
    
    def analyze_company(self, company_name: str, days_back: int = 7) -> Dict[str, any]:
        """Ultra-fast analysis - should complete in under 90 seconds"""
        
        logger.info(f"🔍 Starting ULTRA-FAST intelligence gathering for {company_name}")
        start_time = time.time()
        
        # Step 1: Get news articles (15-30 seconds)
        raw_articles = self.news_scraper.search_company_news(company_name, days_back)
        logger.info(f"Found {len(raw_articles)} raw articles")
        
        if not raw_articles:
            return self.summarizer.generate_company_intelligence([], company_name)
        
        # Step 2: Ultra-batch process ALL articles (30-45 seconds max)
        processed_articles = self.ultra_processor.process_all_articles(raw_articles, company_name)
        
        # Step 3: Generate final intelligence report (15-30 seconds)
        intelligence_report = self.summarizer.generate_company_intelligence(processed_articles, company_name)
        
        total_time = time.time() - start_time
        logger.info(f"🚀 ULTRA-FAST analysis completed in {total_time:.1f} seconds")
        
        return intelligence_report

def main():
    """Example usage"""
    
    # API Keys
    NEWS_API_KEY = "16e215735be943eea3dbf8d8c0bf3977"
    GRANITE_API_KEY = "gtUEfNtO2hpt9zxy7r-WF1P4Zk9rArQeIhlenEvfxKSQ"
    PROJECT_ID = "8ddd7558-5a5c-4ae2-b4e1-1434085a8e94"
    
    # Initialize ultra-fast pipeline
    intelligence = CompanyNewsIntelligence(NEWS_API_KEY, GRANITE_API_KEY, PROJECT_ID)
    
    # Analyze company
    company_name = "Infosys"
    
    print(f"🚀 Ultra-fast intelligence gathering for {company_name}...")
    result = intelligence.analyze_company(company_name, days_back=7)
    
    print(f"\n📊 EXECUTIVE SUMMARY:")
    for i, point in enumerate(result['executive_summary'], 1):
        print(f"   {i}. {point}")
    
    print(f"\n📈 Analysis completed - {result['total_articles']} articles processed")

if __name__ == "__main__":
    main()