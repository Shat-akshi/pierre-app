// Updated NewsService class for NewsAPI
class NewsService {
  constructor() {
    this.cache = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (longer due to rate limits)
    this.API_KEY = import.meta.env.VITE_NEWS_API_KEY;
    this.BASE_URL = 'https://newsapi.org/v2';
    
    if (!this.API_KEY) {
      console.warn('NewsAPI key not found. Using fallback news.');
    }
  }

  async fetchWithCache(endpoint, params = {}) {
    const cacheKey = `${endpoint}-${JSON.stringify(params)}`;
    const now = Date.now();
    const cached = this.cache.get(cacheKey);
    
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      if (!this.API_KEY) {
        throw new Error('API key not configured');
      }

      const urlParams = new URLSearchParams({
        apiKey: this.API_KEY,
        ...params
      });

      const response = await fetch(`${this.BASE_URL}${endpoint}?${urlParams}`);
      
      if (!response.ok) {
        throw new Error(`NewsAPI Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(`NewsAPI Error: ${data.message || 'Unknown error'}`);
      }
      
      this.cache.set(cacheKey, { data: data.articles, timestamp: now });
      return data.articles;
    } catch (error) {
      console.error('NewsAPI fetch failed:', error);
      return cached?.data || [];
    }
  }

  async getTopHeadlines(limit = 3) {
    const articles = await this.fetchWithCache('/top-headlines', {
      country: 'in', // India
      category: 'business',
      pageSize: limit
    });
    return this.formatArticles(articles);
  }

  async getBusinessNews(limit = 3) {
    const articles = await this.fetchWithCache('/everything', {
      q: 'business OR economy OR markets OR finance',
      language: 'en',
      domains: 'moneycontrol.com,economictimes.indiatimes.com,business-standard.com',
      sortBy: 'publishedAt',
      pageSize: limit
    });
    return this.formatArticles(articles);
  }

  async getTechNews(limit = 3) {
    const articles = await this.fetchWithCache('/everything', {
      q: 'technology OR tech OR startup OR "artificial intelligence"',
      language: 'en',
      domains: 'techcrunch.com,theverge.com,wired.com',
      sortBy: 'publishedAt',
      pageSize: limit
    });
    return this.formatArticles(articles);
  }

  async getMixedNews(limit = 3) {
    try {
      // Try to get a mix of business and tech news
      const [headlines, business, tech] = await Promise.allSettled([
        this.getTopHeadlines(2),
        this.getBusinessNews(2),
        this.getTechNews(1)
      ]);

      const allArticles = [
        ...(headlines.value || []),
        ...(business.value || []),
        ...(tech.value || [])
      ];

      const uniqueArticles = this.removeDuplicates(allArticles);
      return uniqueArticles.slice(0, limit);
    } catch (error) {
      console.error('Mixed news fetch failed:', error);
      return this.getFallbackNews(limit);
    }
  }

  formatArticles(articles) {
  if (!Array.isArray(articles)) return [];

  const seen = new Set();

  return articles
    .filter(article => article.title && article.title !== '[Removed]')
    .map((article, index) => {
        // const url = article.url?.trim();
        const urlHash = article.url ? 
        article.url.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) & 0xffffffff, 0) : 
        0;
        const id = `article-${Math.abs(urlHash)}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const title = article.title?.trim();

        // Generate truly unique ID using multiple factors
        let id;
        if (url && url !== '#' && url.length > 10) {
            // Use full hash of URL + title for uniqueness
            const uniqueString = `${url}-${title}-${article.publishedAt || Date.now()}`;
            // Create a simple hash function result
            let hash = 0;
            for (let i = 0; i < uniqueString.length; i++) {
                const char = uniqueString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            id = `article-${Math.abs(hash).toString(36)}`;
        } else {
            // Fallback: use title + timestamp + index hash
            id = `fallback-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        }

        // Ensure absolutely no duplicates by checking against seen set
        let finalId = id;
        let counter = 1;
        while (seen.has(finalId)) {
            finalId = `${id}-${counter}`;
            counter++;
        }
        seen.add(finalId);

        return {
            id: finalId,
            title: this.truncateText(title, 80),
            summary: this.truncateText(
                article.description || article.content || 'Latest news update.',
                150
            ),
            url: url || '',
            source: article.source?.name || 'NewsAPI',
            publishedAt: article.publishedAt || new Date().toISOString(),
            category: this.categorizeArticle(article),
            sentiment: this.detectSentiment(article.title + ' ' + (article.description || '')),
            timestamp: new Date().toISOString(),
            imageUrl: article.urlToImage
        };
    });
}


  categorizeArticle(article) {
    const title = article.title?.toLowerCase() || '';
    const description = article.description?.toLowerCase() || '';
    const content = title + ' ' + description;

    if (content.includes('market') || content.includes('stock') || content.includes('finance')) {
      return 'Markets';
    }
    if (content.includes('tech') || content.includes('startup') || content.includes('ai')) {
      return 'Technology';
    }
    if (content.includes('economy') || content.includes('inflation') || content.includes('gdp')) {
      return 'Economy';
    }
    return 'Business';
  }

//   removeDuplicates(articles) {
//     const seen = new Set();
//     return articles.filter(article => {
//         // Use multiple factors to detect duplicates more reliably
//         const titleKey = article.title?.toLowerCase().trim() || '';
//         const urlKey = article.url?.toLowerCase().trim() || '';
        
//         // Create a composite key using both title and URL
//         const compositeKey = `${titleKey}|${urlKey}`;
        
//         if (seen.has(compositeKey)) return false;
//         seen.add(compositeKey);
//         return true;
//     });
// }
removeDuplicates(articles) {
  const seen = new Set();
  return articles.filter(article => {
    // Use normalized title + domain for better deduplication
    const titleKey = article.title?.toLowerCase().replace(/[^\w\s]/g, '').trim() || '';
    const domain = article.url ? new URL(article.url).hostname : '';
    const compositeKey = `${titleKey}::${domain}`;
    
    if (seen.has(compositeKey)) {
      console.log('Duplicate removed:', titleKey);
      return false;
    }
    seen.add(compositeKey);
    return true;
  });
}


  truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  detectSentiment(text) {
    const positiveWords = ['growth', 'profit', 'gain', 'rise', 'up', 'success', 'positive', 'boost', 'surge', 'rally'];
    const negativeWords = ['fall', 'drop', 'loss', 'decline', 'down', 'negative', 'crash', 'plunge', 'slump'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  getFallbackNews(limit) {
    const fallbackArticles = [
      {
        id: 'fallback-1',
        title: 'Market Update: Indices Show Steady Growth',
        summary: 'Indian stock markets maintain positive momentum with balanced trading across sectors.',
        url: '#',
        source: 'Market Intelligence',
        publishedAt: new Date().toISOString(),
        category: 'Markets',
        sentiment: 'positive',
        timestamp: new Date().toISOString()
      },
      {
        id: 'fallback-2',
        title: 'Technology Sector Continues Innovation Drive',
        summary: 'Leading tech companies announce new product developments and strategic partnerships.',
        url: '#',
        source: 'Tech News',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: 'Technology',
        sentiment: 'positive',
        timestamp: new Date().toISOString()
      },
      {
        id: 'fallback-3',
        title: 'Economic Indicators Show Stability',
        summary: 'Latest economic data suggests steady growth patterns across key performance metrics.',
        url: '#',
        source: 'Economic Times',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        category: 'Economy',
        sentiment: 'neutral',
        timestamp: new Date().toISOString()
      }
    ];

    return fallbackArticles.slice(0, limit);
  }

  // Rate limit checker
  async checkRateLimit() {
    try {
      const response = await fetch(`${this.BASE_URL}/top-headlines?country=us&pageSize=1&apiKey=${this.API_KEY}`);
      return {
        remaining: response.headers.get('X-RateLimit-Remaining'),
        limit: response.headers.get('X-RateLimit-Limit'),
        reset: response.headers.get('X-RateLimit-Reset')
      };
    } catch (error) {
      return null;
    }
  }
}
