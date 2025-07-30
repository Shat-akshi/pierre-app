
import os
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

class NewsAPICollector:
    """Optimized News API collector"""
    def __init__(self):
        self.api_key = os.getenv('NEWS_API_KEY')
        self.base_url = "https://newsapi.org/v2/everything"
        
    def get_targeted_articles(self, industry, use_case, region, limit=12, company=None):
        """Get articles using News API with smart filtering, optionally focused on a specific company"""
        
        # Build targeted query based on your filters
        query_parts = []
        
        # Add company name if provided (with highest priority)
        if company:
            # Clean company name and add quotes for exact matching
            clean_company = company.strip().replace('"', '')
            query_parts.append(f'"{clean_company}"')
        
        # Industry keywords
        if "Financial" in industry or "Finance" in industry:
            query_parts.append("(fintech OR banking OR finance OR investment OR payment)")
        elif "Technology" in industry:
            query_parts.append("(technology OR software OR digital OR startup OR tech)")
        elif "Healthcare" in industry:
            query_parts.append("(healthcare OR medical OR pharma OR health)")
            
        # Use case keywords  
        if "AI" in use_case or "Machine Learning" in use_case:
            query_parts.append("(AI OR \"artificial intelligence\" OR \"machine learning\" OR automation)")
        elif "Automation" in use_case:
            query_parts.append("(automation OR RPA OR workflow OR \"business process\")")
            
        # Region keywords
        if "Asia" in region:
            query_parts.append("(Asia OR India OR China OR Singapore OR Japan OR \"South Asia\")")
        elif "Europe" in region:
            query_parts.append("(Europe OR UK OR Germany OR France OR \"European Union\")")
            
        # Combine with AND logic
        query = " AND ".join(query_parts)
        
        # API parameters
        params = {
            'q': query,
            'language': 'en',
            'sortBy': 'publishedAt',
            'from': (datetime.now() - timedelta(days=30 if company else 7)).strftime('%Y-%m-%d'),  # Look back further for company searches
            'pageSize': limit,
            'apiKey': self.api_key
        }
        
        try:
            print(f"🔍 Fetching articles with query: {query}")
            response = requests.get(self.base_url, params=params, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            articles = data.get('articles', [])
            
            # Transform to your existing format
            transformed_articles = []
            for article in articles:
                # Filter out articles with limited content
                if (article.get('content') and 
                    article.get('content') != '[Removed]' and 
                    len(article.get('content', '')) > 200):
                    
                    transformed_articles.append({
                        'title': article.get('title', 'Untitled'),
                        'link': article.get('url', ''),
                        'description': article.get('description', ''),
                        'content': article.get('content', ''),
                        'published_at': article.get('publishedAt', ''),
                        'source': article.get('source', {}).get('name', 'Unknown'),
                        'cleaned_text': [article.get('content', '')]  # For compatibility
                    })
            
            print(f"✅ Retrieved {len(transformed_articles)} quality articles from News API")
            return transformed_articles
            
        except Exception as e:
            print(f"❌ News API Error: {e}")
            return []



