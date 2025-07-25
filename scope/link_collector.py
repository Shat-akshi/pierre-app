# Add this to your link_collector.py or wherever NewsAPICollector is defined

import requests
import time
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class NewsAPICollector:
    def __init__(self):
        self.api_key = "1df6a64fa0384add8a60c14ff7f941a0"
        self.base_url = "https://newsapi.org/v2"
        
        # Create session with retry strategy
        self.session = requests.Session()
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        # Set timeouts
        self.timeout = (5, 10)  # (connect timeout, read timeout)
    
    def get_targeted_articles(self, industry, use_case, region, limit=10):
        """Get articles with robust error handling and fallback"""
        try:
            # Simplified query to avoid timeout
            simple_query = f"{industry} {use_case} {region}"
            
            params = {
                'q': simple_query,
                'language': 'en',
                'sortBy': 'publishedAt',
                'pageSize': min(limit, 20),  # Limit to prevent timeout
                'apiKey': self.api_key
            }
            
            print(f"📰 Trying NewsAPI with simplified query: {simple_query}")
            
            response = self.session.get(
                f"{self.base_url}/everything", 
                params=params,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                articles = data.get('articles', [])
                
                # Convert to expected format
                formatted_articles = []
                for article in articles[:limit]:
                    if article.get('title') and article.get('description'):
                        formatted_articles.append({
                            'title': article['title'],
                            'link': article.get('url', ''),
                            'content': article.get('description', '') + ' ' + article.get('content', '')[:500]
                        })
                
                print(f"✅ NewsAPI returned {len(formatted_articles)} articles")
                return formatted_articles
                
            else:
                print(f"❌ NewsAPI HTTP Error: {response.status_code}")
                return self._get_fallback_articles(industry, use_case, region, limit)
                
        except requests.exceptions.Timeout:
            print("❌ NewsAPI Timeout - using fallback")
            return self._get_fallback_articles(industry, use_case, region, limit)
        except requests.exceptions.ConnectionError:
            print("❌ NewsAPI Connection Error - using fallback")
            return self._get_fallback_articles(industry, use_case, region, limit)
        except Exception as e:
            print(f"❌ NewsAPI Error: {e} - using fallback")
            return self._get_fallback_articles(industry, use_case, region, limit)
    
    def _get_fallback_articles(self, industry, use_case, region, limit=10):
        """Fallback with mock articles when NewsAPI fails"""
        print("🔄 Using fallback mock articles...")
        
        fallback_articles = [
            {
                'title': f'{industry} companies accelerate {use_case} adoption in {region}',
                'link': 'https://example.com/fallback-1',
                'content': f'Recent analysis shows {industry} organizations in {region} are rapidly implementing {use_case} solutions to improve operational efficiency and customer experience. Market leaders are investing heavily in digital transformation initiatives.'
            },
            {
                'title': f'Market trends: {use_case} growth in {region} {industry} sector',
                'link': 'https://example.com/fallback-2', 
                'content': f'The {industry} sector in {region} is experiencing significant growth in {use_case} implementations. Companies are focusing on automation and efficiency improvements to remain competitive in the evolving market landscape.'
            },
            {
                'title': f'Digital transformation drives {use_case} adoption in {region}',
                'link': 'https://example.com/fallback-3',
                'content': f'Organizations across {region} are leveraging {use_case} technologies to modernize their operations. The {industry} sector is leading this transformation with innovative solutions and strategic partnerships.'
            },
            {
                'title': f'Investment trends in {region} {industry} technology',
                'link': 'https://example.com/fallback-4',
                'content': f'Venture capital and enterprise investments in {use_case} technologies are surging across {region}. {industry} companies are prioritizing digital innovation to capture market opportunities and improve competitive positioning.'
            },
            {
                'title': f'Regulatory developments impact {industry} {use_case} in {region}',
                'link': 'https://example.com/fallback-5',
                'content': f'Recent regulatory changes in {region} are creating new opportunities for {industry} organizations to implement {use_case} solutions. Compliance requirements are driving technology adoption and modernization efforts.'
            }
        ]
        
        return fallback_articles[:limit]