import requests
import json
import re
import logging
from datetime import datetime, timedelta
import yfinance as yf
from bs4 import BeautifulSoup
import pandas as pd

logger = logging.getLogger(__name__)

class MarketDataCollector:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
    def fetch_market_data_from_web(self, industry, companies, use_case, region):
        """Fetch real market data from multiple sources"""
        market_data = {
            'companies': [],
            'market_shares': [],
            'growth_rates': [],
            'revenue_data': [],
            'years': list(range(2020, 2028)),
            'market_size': None,
            'growth_rate': None
        }
        
        try:
            # 1. Get stock data for public companies
            stock_data = self.get_stock_data(companies)
            
            # 2. Scrape market research sites
            market_research = self.scrape_market_research(industry, use_case)
            
            # 3. Get financial data from Yahoo Finance
            financial_data = self.get_financial_data(companies)
            
            # 4. Search for market size and growth data
            market_stats = self.search_market_statistics(industry, use_case, region)
            
            # Combine all data sources
            market_data = self.combine_data_sources(stock_data, market_research, financial_data, market_stats)
            
            logger.info(f"Successfully collected market data for {len(market_data['companies'])} companies")
            return market_data
            
        except Exception as e:
            logger.error(f"Error fetching market data: {str(e)}")
            return market_data
    
    def get_stock_data(self, companies):
        """Get stock performance data for companies"""
        stock_data = {}
        
        # Map company names to stock symbols
        company_symbols = {
            'Microsoft': 'MSFT',
            'Google': 'GOOGL',
            'Amazon': 'AMZN',
            'Apple': 'AAPL',
            'Meta': 'META',
            'JPMorgan Chase': 'JPM',
            'Bank of America': 'BAC',
            'Johnson & Johnson': 'JNJ',
            'Pfizer': 'PFE'
        }
        
        for company in companies:
            try:
                symbol = company_symbols.get(company)
                if symbol:
                    ticker = yf.Ticker(symbol)
                    info = ticker.info
                    hist = ticker.history(period="2y")
                    
                    stock_data[company] = {
                        'market_cap': info.get('marketCap', 0),
                        'revenue': info.get('totalRevenue', 0),
                        'growth_rate': self.calculate_growth_rate(hist),
                        'price_performance': hist['Close'].pct_change().mean() * 100
                    }
                    
            except Exception as e:
                logger.warning(f"Could not fetch stock data for {company}: {str(e)}")
                
        return stock_data
    
    def scrape_market_research(self, industry, use_case):
        """Scrape market research from various sources"""
        market_research = {}
        
        # Search queries for different data sources
        searches = [
            f"{industry} market size 2024",
            f"{use_case} market growth rate",
            f"{industry} {use_case} market share leaders",
            f"{industry} market forecast 2025"
        ]
        
        for search in searches:
            try:
                # Use Google search to find market research
                url = f"https://www.google.com/search?q={search.replace(' ', '+')}"
                response = requests.get(url, headers=self.headers)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Extract numbers from search results
                    text = soup.get_text()
                    
                    # Look for market size figures
                    market_size_matches = re.findall(r'\$(\d+(?:\.\d+)?)\s*(?:billion|trillion|B|T)', text, re.IGNORECASE)
                    growth_matches = re.findall(r'(\d+(?:\.\d+)?)%\s*(?:CAGR|growth|annually)', text, re.IGNORECASE)
                    
                    if market_size_matches:
                        market_research['market_size'] = float(market_size_matches[0])
                    
                    if growth_matches:
                        market_research['growth_rate'] = float(growth_matches[0])
                        
            except Exception as e:
                logger.warning(f"Error scraping market research for {search}: {str(e)}")
                
        return market_research
    
    def get_financial_data(self, companies):
        """Get financial data from Yahoo Finance"""
        financial_data = {}
        
        for company in companies:
            try:
                # Search for company financial data
                search_url = f"https://finance.yahoo.com/quote/{company}/financials"
                response = requests.get(search_url, headers=self.headers)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Extract revenue figures
                    revenue_elements = soup.find_all(text=re.compile(r'\$[\d,]+(?:\.\d+)?[BM]'))
                    
                    if revenue_elements:
                        financial_data[company] = {
                            'revenue': revenue_elements[0] if revenue_elements else None
                        }
                        
            except Exception as e:
                logger.warning(f"Error getting financial data for {company}: {str(e)}")
                
        return financial_data
    
    def search_market_statistics(self, industry, use_case, region):
        """Search for specific market statistics"""
        stats = {}
        
        # API sources you can use
        sources = [
            self.search_news_api(industry, use_case, region),
            self.search_moneycontrol(industry, use_case),
            self.search_business_sources(industry, use_case, region)
        ]
        
        for source_data in sources:
            if source_data:
                stats.update(source_data)
                
        return stats
    
    def search_news_api(self, industry, use_case, region):
        """Search News API for market statistics"""
        # You'll need to add your News API key
        NEWS_API_KEY = "your_news_api_key"
        
        try:
            url = f"https://newsapi.org/v2/everything"
            params = {
                'q': f"{industry} {use_case} market size growth rate",
                'apiKey': NEWS_API_KEY,
                'sortBy': 'publishedAt',
                'pageSize': 20
            }
            
            response = requests.get(url, params=params)
            
            if response.status_code == 200:
                articles = response.json()['articles']
                
                # Extract statistics from article content
                stats = {}
                for article in articles:
                    content = article.get('content', '') + ' ' + article.get('description', '')
                    
                    # Extract market size
                    market_sizes = re.findall(r'\$(\d+(?:\.\d+)?)\s*(?:billion|B)', content, re.IGNORECASE)
                    if market_sizes:
                        stats['market_size'] = float(market_sizes[0])
                    
                    # Extract growth rates
                    growth_rates = re.findall(r'(\d+(?:\.\d+)?)%\s*(?:CAGR|growth)', content, re.IGNORECASE)
                    if growth_rates:
                        stats['growth_rate'] = float(growth_rates[0])
                
                return stats
                
        except Exception as e:
            logger.warning(f"Error searching News API: {str(e)}")
            
        return {}
    def search_news_api(self, industry, use_case, region):
        # """Search News API for market statistics with fallback options"""
        
        # # Try direct NewsAPI first
        # stats = self._try_direct_news_api(industry, use_case, region)
        
        # if stats:
        #     return stats
            
        # Fallback to ScrapingBee
        """Search News API for market statistics via ScrapingBee ONLY"""
        print("📡 Using ScrapingBee ONLY for NewsAPI market statistics...")
        return self._try_scrapingbee_news_api(industry, use_case, region)

    def _try_direct_news_api(self, industry, use_case, region):
        """Try direct NewsAPI call"""
        try:
            NEWS_API_KEY = "f1eba614de4842ffa2e1fb0c31d859e5"
            query = f"{industry} {use_case} market size growth rate"
            
            params = {
                'q': query,
                'apiKey': NEWS_API_KEY,
                'sortBy': 'publishedAt',
                'pageSize': 20,
                'language': 'en'
            }
            
            print(f"🔍 Direct NewsAPI market query: {query}")
            
            response = requests.get("https://newsapi.org/v2/everything", params=params, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('status') == 'ok':
                articles = data.get('articles', [])
                stats = self._extract_market_stats_from_articles(articles)
                print(f"✅ Direct NewsAPI market data: {len(articles)} articles processed")
                return stats
            else:
                print(f"❌ NewsAPI error: {data.get('message', 'Unknown error')}")
                return {}
                
        except Exception as e:
            print(f"❌ Direct NewsAPI market search error: {e}")
            return {}

    def _try_scrapingbee_news_api(self, industry, use_case, region):
        """Try ScrapingBee fallback with proper encoding"""
        try:
            NEWS_API_KEY = "f1eba614de4842ffa2e1fb0c31d859e5"
            SCRAPINGBEE_API_KEY = "CNG1OKXEMD0H2XF5N3WRTEOS9Z323G86GEW2UPYL7Y33TYGCVBQUOPMIX5K5TQU1WSW8SZT9P6LYF94S"
            
            from urllib.parse import urlencode
            
            query = f"{industry} {use_case} market size growth rate"
            
            # Build NewsAPI URL
            params = {
                'q': query,
                'apiKey': NEWS_API_KEY,
                'sortBy': 'publishedAt',
                'pageSize': 20,
                'language': 'en'
            }
            
            news_api_url = f"https://newsapi.org/v2/everything?{urlencode(params)}"
            
            # Create ScrapingBee proxy URL with proper encoding
            scrapingbee_params = {
                'api_key': SCRAPINGBEE_API_KEY,
                'url': news_api_url,
                'render_js': 'false',
                'premium_proxy': 'false',
                'country_code': 'us'
            }
            
            proxy_url = f"https://app.scrapingbee.com/api/v1/?{urlencode(scrapingbee_params)}"
            
            print(f"📡 Using ScrapingBee proxy for market statistics")
            
            # Add proper headers
            headers = {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            # Make request via ScrapingBee
            response = requests.get(proxy_url, headers=headers, timeout=20)
            
            print(f"📊 ScrapingBee response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('status') == 'ok':
                    articles = data.get('articles', [])
                    stats = self._extract_market_stats_from_articles(articles)
                    print(f"✅ ScrapingBee market data success: {len(articles)} articles processed")
                    return stats
                else:
                    print(f"❌ NewsAPI via ScrapingBee error: {data.get('message', 'Unknown error')}")
            else:
                print(f"❌ ScrapingBee request failed with status: {response.status_code}")
                
            return {}
                
        except Exception as e:
            print(f"❌ Error searching News API via ScrapingBee: {str(e)}")
            return {}

    def _extract_market_stats_from_articles(self, articles):
        """Extract market statistics from articles"""
        stats = {}
        for article in articles:
            content = article.get('content', '') + ' ' + article.get('description', '')
            
            # Extract market size
            import re
            market_sizes = re.findall(r'\$(\d+(?:\.\d+)?)\s*(?:billion|B)', content, re.IGNORECASE)
            if market_sizes:
                stats['market_size'] = float(market_sizes[0])

            # Extract growth rates
            growth_rates = re.findall(r'(\d+(?:\.\d+)?)%\s*(?:CAGR|growth)', content, re.IGNORECASE)
            if growth_rates:
                stats['growth_rate'] = float(growth_rates[0])
        
        return stats

    
    def search_moneycontrol(self, industry, use_case):
        """Search MoneyControl for market data"""
        try:
            search_query = f"{industry} {use_case} market"
            url = f"https://www.moneycontrol.com/news/search/?search={search_query.replace(' ', '+')}"
            
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Extract market data from news articles
                articles = soup.find_all('div', class_='news_title')
                
                stats = {}
                for article in articles[:5]:  # Check first 5 articles
                    text = article.get_text()
                    
                    # Look for market size and growth data
                    market_sizes = re.findall(r'₹(\d+(?:,\d+)*)\s*(?:crore|lakh crore)', text, re.IGNORECASE)
                    growth_rates = re.findall(r'(\d+(?:\.\d+)?)%\s*growth', text, re.IGNORECASE)
                    
                    if market_sizes:
                        # Convert crores to billions USD (approximately)
                        crores = float(market_sizes[0].replace(',', ''))
                        stats['market_size'] = crores / 750  # Rough conversion
                    
                    if growth_rates:
                        stats['growth_rate'] = float(growth_rates[0])
                
                return stats
                
        except Exception as e:
            logger.warning(f"Error searching MoneyControl: {str(e)}")
            
        return {}
    
    def search_business_sources(self, industry, use_case, region):
        """Search business news sources for market data"""
        sources = [
            "https://www.business-standard.com",
            "https://economictimes.indiatimes.com",
            "https://www.livemint.com"
        ]
        
        stats = {}
        
        for source in sources:
            try:
                search_url = f"{source}/search?q={industry}+{use_case}+market"
                response = requests.get(search_url, headers=self.headers)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    text = soup.get_text()
                    
                    # Extract market statistics
                    market_sizes = re.findall(r'\$(\d+(?:\.\d+)?)\s*(?:billion|B)', text, re.IGNORECASE)
                    growth_rates = re.findall(r'(\d+(?:\.\d+)?)%\s*(?:CAGR|growth)', text, re.IGNORECASE)
                    
                    if market_sizes and 'market_size' not in stats:
                        stats['market_size'] = float(market_sizes[0])
                    
                    if growth_rates and 'growth_rate' not in stats:
                        stats['growth_rate'] = float(growth_rates[0])
                        
            except Exception as e:
                logger.warning(f"Error searching {source}: {str(e)}")
                
        return stats
    
    def combine_data_sources(self, stock_data, market_research, financial_data, market_stats):
        """Combine data from all sources into unified format"""
        combined_data = {
            'companies': [],
            'market_shares': [],
            'growth_rates': [],
            'revenue_data': [],
            'years': list(range(2020, 2028)),
            'market_size': None,
            'growth_rate': None
        }
        
        # Process stock data
        for company, data in stock_data.items():
            combined_data['companies'].append(company)
            combined_data['growth_rates'].append(data.get('growth_rate', 5.0))
            
            # Calculate market share based on market cap
            market_cap = data.get('market_cap', 0)
            if market_cap > 0:
                # Rough market share calculation
                market_share = min(25, max(5, (market_cap / 1e12) * 10))  # Scale to percentage
                combined_data['market_shares'].append(market_share)
            else:
                combined_data['market_shares'].append(10)  # Default
        
        # Use market research data
        combined_data['market_size'] = market_research.get('market_size') or market_stats.get('market_size', 2500)
        combined_data['growth_rate'] = market_research.get('growth_rate') or market_stats.get('growth_rate', 8.5)
        
        # Generate revenue projections
        base_revenue = combined_data['market_size'] * 0.8  # Start from 80% of current market size
        for i, year in enumerate(combined_data['years']):
            if year <= 2024:
                revenue = base_revenue * (1 + combined_data['growth_rate']/100) ** (year - 2020)
            else:
                revenue = base_revenue * (1 + combined_data['growth_rate']/100) ** (year - 2020)
            combined_data['revenue_data'].append(round(revenue, 1))
        
        return combined_data
    
    def calculate_growth_rate(self, hist_data):
        """Calculate growth rate from historical data"""
        if len(hist_data) < 2:
            return 5.0
            
        start_price = hist_data['Close'].iloc[0]
        end_price = hist_data['Close'].iloc[-1]
        
        if start_price > 0:
            growth_rate = ((end_price / start_price) - 1) * 100
            return max(-50, min(50, growth_rate))  # Cap between -50% and 50%
        
        return 5.0
