



import requests
from bs4 import BeautifulSoup
import re

def scrape_article(url, fallback_content=None):
    """Scrape article or use fallback content from News API"""
    
    # If we have fallback content from News API, use it
    if fallback_content:
        return {
            "title": fallback_content.get('title', 'Untitled'),
            "link": url,
            "cleaned_text": [fallback_content.get('content', '')]
        }
    
    # Original scraping logic for non-News API sources
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove unwanted tags
        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()
            
        main_content = soup.find('main') or soup.find('body') or soup
        text_lines = []
        
        for element in main_content.find_all(text=True):
            text = element.strip()
            if text and len(text) > 1:
                text_lines.append(text)
        
        # Clean text
        cleaned = []
        exclude_phrases = [
            "learn more", "view more", "produced in united states",
            "©", "™", "®", "trademark", "copyright"
        ]
        
        for line in text_lines:
            if any(p in line.lower() for p in exclude_phrases):
                continue
            line = re.sub(r'\[\d+\]', '', line)
            line = re.sub(r'[®™©■¹²³]', '', line)
            line = line.strip()
            if line:
                cleaned.append(line)
        
        title_tag = soup.select_one('h1, title')
        title = title_tag.text.strip() if title_tag else "Untitled Article"
        
        return {
            "title": title,
            "link": url,
            "cleaned_text": cleaned
        }
        
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return None
