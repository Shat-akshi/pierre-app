

// import { useState, useEffect, useRef } from 'react';
// import { Menu, X, Mail, LogOut, Sparkles, Calendar, Clock, User, Settings, Sun, Moon, ChevronRight, Star, TrendingUp, Award, Shield, ExternalLink, BarChart3, Activity, Minus } from 'lucide-react';
// import { Link, useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useUser, useClerk } from '@clerk/clerk-react';
// import TechBackground from '../components/TechBackground';
// import GlassCard from '../components/GlassCard';
// import TechButton from '../components/TechButton';
// import OutlookCalendar from '../components/OutlookCalendar';
// //import { mockOutlookEvents, premiumFeatures } from '../data/mockData';


// // class NewsService {
// //   constructor() {
// //     this.cache = new Map();
// //     this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (longer due to rate limits)
// //     this.API_KEY = import.meta.env.VITE_NEWS_API_KEY;
// //     this.BASE_URL = 'https://newsapi.org/v2';
// //     this.idCounter = 0; // Add a counter to ensure uniqueness
    
// //     if (!this.API_KEY) {
// //       console.warn('NewsAPI key not found. Using fallback news.');
// //     }
// //   }

// //   async fetchWithCache(endpoint, params = {}) {
// //     const cacheKey = `${endpoint}-${JSON.stringify(params)}`;
// //     const now = Date.now();
// //     const cached = this.cache.get(cacheKey);
    
// //     if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
// //       return cached.data;
// //     }

// //     try {
// //       if (!this.API_KEY) {
// //         throw new Error('API key not configured');
// //       }

// //       const urlParams = new URLSearchParams({
// //         apiKey: this.API_KEY,
// //         ...params
// //       });

// //       const response = await fetch(`${this.BASE_URL}${endpoint}?${urlParams}`);
      

      
// //       if (!response.ok) {
// //         throw new Error(`NewsAPI Error: ${response.status} - ${response.statusText}`);
// //       }
      
// //       const data = await response.json();
      
// //       if (data.status !== 'ok') {
// //         throw new Error(`NewsAPI Error: ${data.message || 'Unknown error'}`);
// //       }
      
// //       this.cache.set(cacheKey, { data: data.articles, timestamp: now });
// //       return data.articles;
// //     } catch (error) {
// //       console.error('NewsAPI fetch failed:', error);
// //       return cached?.data || [];
// //     }
// //   }

// //   async getTopHeadlines(limit = 3) {
// //     const articles = await this.fetchWithCache('/top-headlines', {
// //       country: 'in', // India
// //       category: 'business',
// //       pageSize: limit
// //     });
// //     return this.formatArticles(articles);
// //   }

// //   async getBusinessNews(limit = 3) {
// //     const articles = await this.fetchWithCache('/everything', {
// //       q: 'business OR economy OR markets OR finance',
// //       language: 'en',
// //       domains: 'moneycontrol.com,economictimes.indiatimes.com,business-standard.com',
// //       sortBy: 'publishedAt',
// //       pageSize: limit
// //     });
// //     return this.formatArticles(articles);
// //   }

// //   async getTechNews(limit = 3) {
// //     const articles = await this.fetchWithCache('/everything', {
// //       q: 'technology OR tech OR startup OR "artificial intelligence"',
// //       language: 'en',
// //       domains: 'techcrunch.com,theverge.com,wired.com',
// //       sortBy: 'publishedAt',
// //       pageSize: limit
// //     });
// //     return this.formatArticles(articles);
// //   }

// //   async getMixedNews(limit = 3) {
// //     try {
// //       // Try to get a mix of business and tech news
// //       const [headlines, business, tech] = await Promise.allSettled([
// //         this.getTopHeadlines(2),
// //         this.getBusinessNews(2),
// //         this.getTechNews(1)
// //       ]);

// //       const allArticles = [
// //         ...(headlines.value || []),
// //         ...(business.value || []),
// //         ...(tech.value || [])
// //       ];

// //       // Remove duplicates BEFORE slicing
// //       const uniqueArticles = this.removeDuplicates(allArticles);
// //       const finalArticles = uniqueArticles.slice(0, limit);
      
// //       // Debug logging
// //       console.log('Final article IDs:', finalArticles.map(a => a.id));
      
// //       return finalArticles;
// //     } catch (error) {
// //       console.error('Mixed news fetch failed:', error);
// //       return this.getFallbackNews(limit);
// //     }
// //   }

// //   formatArticles(articles) {
// //     if (!Array.isArray(articles)) return [];

// //     return articles
// //       .filter(article => article.title && article.title !== '[Removed]')
// //       .map((article, index) => {
// //         const url = article.url?.trim();
// //         const title = article.title?.trim();
        
// //         // Generate GUARANTEED unique ID
// //         this.idCounter++;
// //         const timestamp = Date.now();
// //         const randomSuffix = Math.random().toString(36).substring(2, 8);
        
// //         // Create a unique ID that combines multiple factors
// //         const id = `article-${this.idCounter}-${timestamp}-${randomSuffix}`;
        
// //         return {
// //           id,
// //           title: this.truncateText(title, 80),
// //           summary: this.truncateText(
// //             article.description || article.content || 'Latest news update.',
// //             150
// //           ),
// //           url: url || '',
// //           source: article.source?.name || 'NewsAPI',
// //           publishedAt: article.publishedAt || new Date().toISOString(),
// //           category: this.categorizeArticle(article),
// //           sentiment: this.detectSentiment(article.title + ' ' + (article.description || '')),
// //           timestamp: new Date().toISOString(),
// //           imageUrl: article.urlToImage
// //         };
// //       });
// //   }

// //   categorizeArticle(article) {
// //     const title = article.title?.toLowerCase() || '';
// //     const description = article.description?.toLowerCase() || '';
// //     const content = title + ' ' + description;

// //     if (content.includes('market') || content.includes('stock') || content.includes('finance')) {
// //       return 'Markets';
// //     }
// //     if (content.includes('tech') || content.includes('startup') || content.includes('ai')) {
// //       return 'Technology';
// //     }
// //     if (content.includes('economy') || content.includes('inflation') || content.includes('gdp')) {
// //       return 'Economy';
// //     }
// //     return 'Business';
// //   }

// //   removeDuplicates(articles) {
// //     const seen = new Set();
// //     return articles.filter(article => {
// //       // Use title as the primary deduplication key
// //       const titleKey = article.title?.toLowerCase().trim() || '';
// //       const urlKey = article.url?.toLowerCase().trim() || '';
      
// //       // Create a composite key using both title and URL
// //       const compositeKey = `${titleKey}|||${urlKey}`;
      
// //       if (seen.has(compositeKey)) {
// //         console.log('Duplicate found:', titleKey);
// //         return false;
// //       }
// //       seen.add(compositeKey);
// //       return true;
// //     });
// //   }

// //   truncateText(text, maxLength) {
// //     if (!text) return '';
// //     return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
// //   }

// //   detectSentiment(text) {
// //     const positiveWords = ['growth', 'profit', 'gain', 'rise', 'up', 'success', 'positive', 'boost', 'surge', 'rally'];
// //     const negativeWords = ['fall', 'drop', 'loss', 'decline', 'down', 'negative', 'crash', 'plunge', 'slump'];
    
// //     const lowerText = text.toLowerCase();
// //     const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
// //     const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
// //     if (positiveCount > negativeCount) return 'positive';
// //     if (negativeCount > positiveCount) return 'negative';
// //     return 'neutral';
// //   }

// //   getFallbackNews(limit) {
// //     const fallbackArticles = [
// //       {
// //         id: `fallback-1-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
// //         title: 'Market Update: Indices Show Steady Growth',
// //         summary: 'Indian stock markets maintain positive momentum with balanced trading across sectors.',
// //         url: '#',
// //         source: 'Market Intelligence',
// //         publishedAt: new Date().toISOString(),
// //         category: 'Markets',
// //         sentiment: 'positive',
// //         timestamp: new Date().toISOString()
// //       },
// //       {
// //         id: `fallback-2-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
// //         title: 'Technology Sector Continues Innovation Drive',
// //         summary: 'Leading tech companies announce new product developments and strategic partnerships.',
// //         url: '#',
// //         source: 'Tech News',
// //         publishedAt: new Date(Date.now() - 3600000).toISOString(),
// //         category: 'Technology',
// //         sentiment: 'positive',
// //         timestamp: new Date().toISOString()
// //       },
// //       {
// //         id: `fallback-3-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
// //         title: 'Economic Indicators Show Stability',
// //         summary: 'Latest economic data suggests steady growth patterns across key performance metrics.',
// //         url: '#',
// //         source: 'Economic Times',
// //         publishedAt: new Date(Date.now() - 7200000).toISOString(),
// //         category: 'Economy',
// //         sentiment: 'neutral',
// //         timestamp: new Date().toISOString()
// //       }
// //     ];

// //     return fallbackArticles.slice(0, limit);
// //   }

// //   // Rate limit checker
// //   async checkRateLimit() {
// //     try {
// //       const response = await fetch(`${this.BASE_URL}/top-headlines?country=us&pageSize=1&apiKey=${this.API_KEY}`);
// //       return {
// //         remaining: response.headers.get('X-RateLimit-Remaining'),
// //         limit: response.headers.get('X-RateLimit-Limit'),
// //         reset: response.headers.get('X-RateLimit-Reset')
// //       };
// //     } catch (error) {
// //       return null;
// //     }
// //   }
// // }

// // const newsService = new NewsService();

// // // News Card Component
// // const NewsCard = ({ article, index }) => {
// //   const getSentimentIcon = (sentiment) => {
// //     switch (sentiment) {
// //       case 'positive':
// //         return <TrendingUp className="w-4 h-4 text-green-400" />;
// //       case 'negative':
// //         return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
// //       default:
// //         return <Minus className="w-4 h-4 text-gray-400" />;
// //     }
// //   };

// //   const getSentimentColor = (sentiment) => {
// //     switch (sentiment) {
// //       case 'positive':
// //         return 'border-green-500/30 bg-green-900/10';
// //       case 'negative':
// //         return 'border-red-500/30 bg-red-900/10';
// //       default:
// //         return 'border-gray-500/30 bg-gray-900/10';
// //     }
// //   };

// //   const formatTimeAgo = (dateString) => {
// //     const now = new Date();
// //     const published = new Date(dateString);
// //     const diffMs = now - published;
// //     const diffMins = Math.floor(diffMs / 60000);
// //     const diffHours = Math.floor(diffMins / 60);
// //     const diffDays = Math.floor(diffHours / 24);
    
// //     if (diffMins < 60) return `${diffMins}m ago`;
// //     if (diffHours < 24) return `${diffHours}h ago`;
// //     if (diffDays < 7) return `${diffDays}d ago`;
// //     return published.toLocaleDateString();
// //   };

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, y: 20 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       transition={{ duration: 0.5, delay: index * 0.1 }}
// //       whileHover={{ scale: 1.02 }}
// //       className="h-full"
// //     >
// //       <GlassCard className="p-6 h-full cursor-pointer group hover:border-blue-500/40 transition-all duration-300">
// //         <div className="flex flex-col h-full">
// //           {article.imageUrl && (
// //             <div className="mb-4 rounded-lg overflow-hidden">
// //               <img 
// //                 src={article.imageUrl} 
// //                 alt={article.title}
// //                 className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
// //                 onError={(e) => { e.target.style.display = 'none' }}
// //               />
// //             </div>
// //           )}

// //           <div className="flex items-start justify-between mb-4">
// //             <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(article.sentiment)}`}>
// //               <div className="flex items-center gap-1">
// //                 {getSentimentIcon(article.sentiment)}
// //                 <span className="capitalize">{article.sentiment}</span>
// //               </div>
// //             </div>
// //             <div className="flex items-center gap-2 text-xs text-gray-500">
// //               <Clock className="w-3 h-3" />
// //               <span>{formatTimeAgo(article.publishedAt)}</span>
// //             </div>
// //           </div>

// //           <div className="flex-1">
// //             <h4 className="font-bold text-lg text-blue-400 mb-3 group-hover:text-blue-300 transition-colors duration-300 leading-tight">
// //               {article.title}
// //             </h4>
// //             <p className="text-gray-300 text-sm mb-4 leading-relaxed">
// //               {article.summary}
// //             </p>
// //           </div>

// //           <div className="flex items-center justify-between pt-4 border-t border-gray-800/40">
// //             <div className="flex items-center gap-2">
// //               <span className="text-xs text-gray-500 font-medium">{article.source}</span>
// //               <span className="text-xs text-gray-600">•</span>
// //               <span className="text-xs text-gray-500">{article.category}</span>
// //             </div>
// //             {article.url !== '#' && (
// //               <motion.button
// //                 whileHover={{ scale: 1.1 }}
// //                 whileTap={{ scale: 0.95 }}
// //                 onClick={(e) => {
// //                   e.stopPropagation();
// //                   window.open(article.url, '_blank');
// //                 }}
// //                 className="p-2 rounded-full hover:bg-blue-500/20 transition-colors duration-200"
// //               >
// //                 <ExternalLink className="w-4 h-4 text-blue-400" />
// //               </motion.button>
// //             )}
// //           </div>
// //         </div>
// //       </GlassCard>
// //     </motion.div>
// //   );
// // };
// // Updated NewsService Class with ScrapingBee Integration
// class NewsService {
//   constructor() {
//     this.cache = new Map();
//     this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (longer due to rate limits)
//     this.API_KEY = import.meta.env.VITE_NEWS_API_KEY;
//     this.SCRAPINGBEE_API_KEY = import.meta.env.VITE_SCRAPINGBEE_API_KEY;
//     this.SCRAPINGBEE_BASE_URL = 'https://app.scrapingbee.com/api/v1/';
//     this.idCounter = 0; // Add a counter to ensure uniqueness
    
//     if (!this.API_KEY) {
//       console.warn('NewsAPI key not found. Using fallback news.');
//     }
//     if (!this.SCRAPINGBEE_API_KEY) {
//       console.warn('ScrapingBee API key not found. Direct NewsAPI calls may fail.');
//     }
    
//     console.log('NewsService initialized with ScrapingBee proxy');
//   }

//   // Create ScrapingBee proxy URL
//   createProxyUrl(endpoint, params = {}) {
//     // Build the complete NewsAPI URL
//     const newsApiParams = new URLSearchParams({
//       apiKey: this.API_KEY,
//       ...params
//     });
    
//     const fullNewsApiUrl = `https://newsapi.org/v2${endpoint}?${newsApiParams}`;
    
//     // Wrap it with ScrapingBee
//     const scrapingBeeParams = new URLSearchParams({
//       api_key: this.SCRAPINGBEE_API_KEY,
//       url: fullNewsApiUrl,
//       render_js: 'false', // We don't need browser rendering for API calls
//       premium_proxy: 'false' // Use regular proxy to save credits
//     });
    
//     return `${this.SCRAPINGBEE_BASE_URL}?${scrapingBeeParams}`;
//   }

//   async fetchWithCache(endpoint, params = {}) {
//     const cacheKey = `${endpoint}-${JSON.stringify(params)}`;
//     const now = Date.now();
//     const cached = this.cache.get(cacheKey);
    
//     if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
//       return cached.data;
//     }

//     try {
//       if (!this.API_KEY) {
//         throw new Error('NewsAPI key not configured');
//       }
      
//       if (!this.SCRAPINGBEE_API_KEY) {
//         throw new Error('ScrapingBee API key not configured');
//       }

//       // Use ScrapingBee proxy instead of direct call
//       const proxyUrl = this.createProxyUrl(endpoint, params);
      
//       console.log('Fetching via ScrapingBee proxy...');
      
//       const response = await fetch(proxyUrl, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
      
//       if (!response.ok) {
//         throw new Error(`ScrapingBee Error: ${response.status} - ${response.statusText}`);
//       }
      
//       const data = await response.json();
      
//       if (data.status !== 'ok') {
//         throw new Error(`NewsAPI Error: ${data.message || 'Unknown error'}`);
//       }
      
//       console.log('Successfully fetched via ScrapingBee:', data.articles?.length || 0, 'articles');
//       this.cache.set(cacheKey, { data: data.articles, timestamp: now });
//       return data.articles;
//     } catch (error) {
//       console.error('ScrapingBee fetch failed:', error);
//       return cached?.data || [];
//     }
//   }

//   async getTopHeadlines(limit = 3) {
//     const articles = await this.fetchWithCache('/top-headlines', {
//       country: 'in', // India
//       category: 'business',
//       pageSize: limit
//     });
//     return this.formatArticles(articles);
//   }

//   async getBusinessNews(limit = 3) {
//     const articles = await this.fetchWithCache('/everything', {
//       q: 'business OR economy OR markets OR finance',
//       language: 'en',
//       domains: 'moneycontrol.com,economictimes.indiatimes.com,business-standard.com',
//       sortBy: 'publishedAt',
//       pageSize: limit
//     });
//     return this.formatArticles(articles);
//   }

//   async getTechNews(limit = 3) {
//     const articles = await this.fetchWithCache('/everything', {
//       q: 'technology OR tech OR startup OR "artificial intelligence"',
//       language: 'en',
//       domains: 'techcrunch.com,theverge.com,wired.com',
//       sortBy: 'publishedAt',
//       pageSize: limit
//     });
//     return this.formatArticles(articles);
//   }

//   async getMixedNews(limit = 3) {
//     try {
//       // Try to get a mix of business and tech news
//       const [headlines, business, tech] = await Promise.allSettled([
//         this.getTopHeadlines(2),
//         this.getBusinessNews(2),
//         this.getTechNews(1)
//       ]);

//       const allArticles = [
//         ...(headlines.value || []),
//         ...(business.value || []),
//         ...(tech.value || [])
//       ];

//       // Remove duplicates BEFORE slicing
//       const uniqueArticles = this.removeDuplicates(allArticles);
//       const finalArticles = uniqueArticles.slice(0, limit);
      
//       // Debug logging
//       console.log('Final article IDs:', finalArticles.map(a => a.id));
      
//       return finalArticles;
//     } catch (error) {
//       console.error('Mixed news fetch failed:', error);
//       return this.getFallbackNews(limit);
//     }
//   }

//   formatArticles(articles) {
//     if (!Array.isArray(articles)) return [];

//     return articles
//       .filter(article => article.title && article.title !== '[Removed]')
//       .map((article, index) => {
//         const url = article.url?.trim();
//         const title = article.title?.trim();
        
//         // Generate GUARANTEED unique ID
//         this.idCounter++;
//         const timestamp = Date.now();
//         const randomSuffix = Math.random().toString(36).substring(2, 8);
        
//         // Create a unique ID that combines multiple factors
//         const id = `article-${this.idCounter}-${timestamp}-${randomSuffix}`;
        
//         return {
//           id,
//           title: this.truncateText(title, 80),
//           summary: this.truncateText(
//             article.description || article.content || 'Latest news update.',
//             150
//           ),
//           url: url || '',
//           source: article.source?.name || 'NewsAPI',
//           publishedAt: article.publishedAt || new Date().toISOString(),
//           category: this.categorizeArticle(article),
//           sentiment: this.detectSentiment(article.title + ' ' + (article.description || '')),
//           timestamp: new Date().toISOString(),
//           imageUrl: article.urlToImage
//         };
//       });
//   }

//   categorizeArticle(article) {
//     const title = article.title?.toLowerCase() || '';
//     const description = article.description?.toLowerCase() || '';
//     const content = title + ' ' + description;

//     if (content.includes('market') || content.includes('stock') || content.includes('finance')) {
//       return 'Markets';
//     }
//     if (content.includes('tech') || content.includes('startup') || content.includes('ai')) {
//       return 'Technology';
//     }
//     if (content.includes('economy') || content.includes('inflation') || content.includes('gdp')) {
//       return 'Economy';
//     }
//     return 'Business';
//   }

//   removeDuplicates(articles) {
//     const seen = new Set();
//     return articles.filter(article => {
//       // Use title as the primary deduplication key
//       const titleKey = article.title?.toLowerCase().trim() || '';
//       const urlKey = article.url?.toLowerCase().trim() || '';
      
//       // Create a composite key using both title and URL
//       const compositeKey = `${titleKey}|||${urlKey}`;
      
//       if (seen.has(compositeKey)) {
//         console.log('Duplicate found:', titleKey);
//         return false;
//       }
//       seen.add(compositeKey);
//       return true;
//     });
//   }

//   truncateText(text, maxLength) {
//     if (!text) return '';
//     return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
//   }

//   detectSentiment(text) {
//     const positiveWords = ['growth', 'profit', 'gain', 'rise', 'up', 'success', 'positive', 'boost', 'surge', 'rally'];
//     const negativeWords = ['fall', 'drop', 'loss', 'decline', 'down', 'negative', 'crash', 'plunge', 'slump'];
    
//     const lowerText = text.toLowerCase();
//     const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
//     const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
//     if (positiveCount > negativeCount) return 'positive';
//     if (negativeCount > positiveCount) return 'negative';
//     return 'neutral';
//   }

//   getFallbackNews(limit) {
//     const fallbackArticles = [
//       {
//         id: `fallback-1-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
//         title: 'Market Update: Indices Show Steady Growth',
//         summary: 'Indian stock markets maintain positive momentum with balanced trading across sectors.',
//         url: '#',
//         source: 'Market Intelligence',
//         publishedAt: new Date().toISOString(),
//         category: 'Markets',
//         sentiment: 'positive',
//         timestamp: new Date().toISOString()
//       },
//       {
//         id: `fallback-2-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
//         title: 'Technology Sector Continues Innovation Drive',
//         summary: 'Leading tech companies announce new product developments and strategic partnerships.',
//         url: '#',
//         source: 'Tech News',
//         publishedAt: new Date(Date.now() - 3600000).toISOString(),
//         category: 'Technology',
//         sentiment: 'positive',
//         timestamp: new Date().toISOString()
//       },
//       {
//         id: `fallback-3-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
//         title: 'Economic Indicators Show Stability',
//         summary: 'Latest economic data suggests steady growth patterns across key performance metrics.',
//         url: '#',
//         source: 'Economic Times',
//         publishedAt: new Date(Date.now() - 7200000).toISOString(),
//         category: 'Economy',
//         sentiment: 'neutral',
//         timestamp: new Date().toISOString()
//       }
//     ];

//     return fallbackArticles.slice(0, limit);
//   }

//   // Rate limit checker
//   async checkRateLimit() {
//     try {
//       const proxyUrl = this.createProxyUrl('/top-headlines', { 
//         country: 'us', 
//         pageSize: 1 
//       });
      
//       const response = await fetch(proxyUrl);
//       return {
//         remaining: response.headers.get('X-RateLimit-Remaining'),
//         limit: response.headers.get('X-RateLimit-Limit'),
//         reset: response.headers.get('X-RateLimit-Reset')
//       };
//     } catch (error) {
//       return null;
//     }
//   }
// }

// const newsService = new NewsService();

// // News Card Component (unchanged)
// const NewsCard = ({ article, index }) => {
//   const getSentimentIcon = (sentiment) => {
//     switch (sentiment) {
//       case 'positive':
//         return <TrendingUp className="w-4 h-4 text-green-400" />;
//       case 'negative':
//         return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
//       default:
//         return <Minus className="w-4 h-4 text-gray-400" />;
//     }
//   };

//   const getSentimentColor = (sentiment) => {
//     switch (sentiment) {
//       case 'positive':
//         return 'border-green-500/30 bg-green-900/10';
//       case 'negative':
//         return 'border-red-500/30 bg-red-900/10';
//       default:
//         return 'border-gray-500/30 bg-gray-900/10';
//     }
//   };

//   const formatTimeAgo = (dateString) => {
//     const now = new Date();
//     const published = new Date(dateString);
//     const diffMs = now - published;
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMins / 60);
//     const diffDays = Math.floor(diffHours / 24);
    
//     if (diffMins < 60) return `${diffMins}m ago`;
//     if (diffHours < 24) return `${diffHours}h ago`;
//     if (diffDays < 7) return `${diffDays}d ago`;
//     return published.toLocaleDateString();
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay: index * 0.1 }}
//       whileHover={{ scale: 1.02 }}
//       className="h-full"
//     >
//       <GlassCard className="p-6 h-full cursor-pointer group hover:border-blue-500/40 transition-all duration-300">
//         <div className="flex flex-col h-full">
//           {article.imageUrl && (
//             <div className="mb-4 rounded-lg overflow-hidden">
//               <img 
//                 src={article.imageUrl} 
//                 alt={article.title}
//                 className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
//                 onError={(e) => { e.target.style.display = 'none' }}
//               />
//             </div>
//           )}

//           <div className="flex items-start justify-between mb-4">
//             <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(article.sentiment)}`}>
//               <div className="flex items-center gap-1">
//                 {getSentimentIcon(article.sentiment)}
//                 <span className="capitalize">{article.sentiment}</span>
//               </div>
//             </div>
//             <div className="flex items-center gap-2 text-xs text-gray-500">
//               <Clock className="w-3 h-3" />
//               <span>{formatTimeAgo(article.publishedAt)}</span>
//             </div>
//           </div>

//           <div className="flex-1">
//             <h4 className="font-bold text-lg text-blue-400 mb-3 group-hover:text-blue-300 transition-colors duration-300 leading-tight">
//               {article.title}
//             </h4>
//             <p className="text-gray-300 text-sm mb-4 leading-relaxed">
//               {article.summary}
//             </p>
//           </div>

//           <div className="flex items-center justify-between pt-4 border-t border-gray-800/40">
//             <div className="flex items-center gap-2">
//               <span className="text-xs text-gray-500 font-medium">{article.source}</span>
//               <span className="text-xs text-gray-600">•</span>
//               <span className="text-xs text-gray-500">{article.category}</span>
//             </div>
//             {article.url !== '#' && (
//               <motion.button
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   window.open(article.url, '_blank');
//                 }}
//                 className="p-2 rounded-full hover:bg-blue-500/20 transition-colors duration-200"
//               >
//                 <ExternalLink className="w-4 h-4 text-blue-400" />
//               </motion.button>
//             )}
//           </div>
//         </div>
//       </GlassCard>
//     </motion.div>
//   );
// };

// // Main Dashboard Component
// function Dashboard() {
//   const navigate = useNavigate();
//   const { user } = useUser();
//   const { signOut } = useClerk();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [rightPanelOpen, setRightPanelOpen] = useState(false);
//   const [showFullCalendar, setShowFullCalendar] = useState(false);
//   //const [outlookEvents, setOutlookEvents] = useState([]);
//   const [calendarSynced, setCalendarSynced] = useState(false);
//   const [scrolled, setScrolled] = useState(false);

//   // News state variables
//   const [newsArticles, setNewsArticles] = useState([]);
//   const [newsLoading, setNewsLoading] = useState(false);
//   const [lastNewsUpdate, setLastNewsUpdate] = useState(null);

//   useEffect(() => {
//     if (!rightPanelOpen) setShowFullCalendar(false);
//   }, [rightPanelOpen]);

//   useEffect(() => {
//     if (user && !calendarSynced) {
//       setTimeout(() => {
//         //setOutlookEvents(mockOutlookEvents);
//         setCalendarSynced(true);
//       }, 1500);
//     }
//   }, [user, calendarSynced]);

//   // News fetching effect
//   useEffect(() => {
//     const fetchNews = async () => {
//       setNewsLoading(true);
//       try {
//         const articles = await newsService.getMixedNews(3);
//         setNewsArticles(articles);
//         setLastNewsUpdate(new Date());
        
//         const rateLimit = await newsService.checkRateLimit();
//         if (rateLimit) {
//           console.log(`API calls remaining: ${rateLimit.remaining}/${rateLimit.limit}`);
//         }
//       } catch (error) {
//         console.error('Failed to fetch news:', error);
//         setNewsArticles(newsService.getFallbackNews(3));
//       } finally {
//         setNewsLoading(false);
//       }
//     };

//     fetchNews();
//     const newsInterval = setInterval(fetchNews, 10 * 60 * 1000); // 10 minutes
//     return () => clearInterval(newsInterval);
//   }, []);

//   const handleSignOut = async () => {
//     await signOut();
//     navigate('/sign-in');
//   };

//   const handleScroll = (e) => {
//     setScrolled(e.target.scrollTop > 20);
//   };

//   const iconComponents = {
//     BarChart3: BarChart3,
//     Activity: Activity,
//     Sparkles: Sparkles
//   };

//   return (
//     <div className="flex h-screen overflow-hidden font-sans bg-black">
      
//       {/* Tech Background */}
//       <div className="fixed inset-0 z-0">
//         <TechBackground />
//       </div>
      
//       {/* Grid Overlay */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
//         <div className="absolute inset-0" style={{
//           backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)`,
//           backgroundSize: '60px 60px'
//         }}></div>
//       </div>

//       {/* Sidebar Overlay */}
//       <AnimatePresence>
//         {sidebarOpen && (
//           <motion.div 
//             className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden" 
//             onClick={() => setSidebarOpen(false)}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.3 }}
//           />
//         )}
//       </AnimatePresence>

//       {/* Sidebar */}
//       <motion.aside
//         className={`
//           fixed lg:relative top-0 left-0 h-full z-50 w-72 lg:w-64 xl:w-72
//           backdrop-blur-xl border-r shadow-2xl transform transition-all duration-700 ease-out
//           ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
//           ${sidebarOpen || 'lg:flex'} flex flex-col
//           bg-black/80 border-gray-800/40 text-white
//         `}
//         style={{
//           boxShadow: '10px 0 30px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(59, 130, 246, 0.1)'
//         }}
//         initial={{ x: -280 }}
//         animate={{ x: sidebarOpen ? 0 : (window.innerWidth >= 1024 ? 0 : -280) }}
//         transition={{ type: "spring", stiffness: 300, damping: 30 }}
//       >
//         <motion.div 
//           className="flex items-center justify-between mb-10 p-6"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2, duration: 0.5 }}
//         >
//           <div className="flex items-center gap-3">
//             <motion.div 
//               className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg"
//               whileHover={{ rotate: 10, scale: 1.1 }}
//               transition={{ type: "spring", stiffness: 400, damping: 10 }}
//               style={{
//                 boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)'
//               }}
//             >
//               <Sparkles className="w-6 h-6 text-white" />
//             </motion.div>
//             <h2 className="text-2xl font-bold text-transparent bg-clip-text" style={{
//               backgroundImage: 'linear-gradient(90deg, #60a5fa, #3b82f6)'
//             }}>
//               Pierre Executive
//             </h2>
//           </div>
//           <button 
//             onClick={() => setSidebarOpen(false)} 
//             className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-all duration-300 hover:scale-110"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </motion.div>
        
//         <nav className="space-y-3 flex-1 px-6">
//           {[
            
//             { icon: Sparkles, text: "Market Trends", path: "/trends" },
            
//             { icon: BarChart3, text:"Scope", path: "/scope" },

//           ].map((item, i) => (
//             <motion.div
//               key={i}
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.3 + (i * 0.1), duration: 0.5 }}
//             >
//               <Link
//                 to={item.path}
//                 className="flex items-center gap-4 px-6 py-8 rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:bg-gray-900 hover:border-blue-500/30 text-gray-300 text-xl group relative overflow-hidden border border-gray-800/40"
//                 style={{
//                   transform: 'perspective(1000px)',
//                   transformStyle: 'preserve-3d',
//                   boxShadow: '0 5px 15px rgba(229, 215, 215, 0.43), inset 0 0 0 1px rgba(59, 130, 246, 0.05)'
//                 }}
//               >
//                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
//                 <motion.div
//                   className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 bg-gray-900"
//                   whileHover={{ rotate: 5, scale: 1.1 }}
//                   transition={{ type: "spring", stiffness: 400, damping: 10 }}
//                   style={{
//                     boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(59, 130, 246, 0.1)'
//                   }}
//                 >
//                   <item.icon className="w-6 h-6 text-blue-400" />
//                 </motion.div>
//                 <div className="flex-1 relative z-10">
//                   <span className="font-semibold text-xl">{item.text}</span>
//                   {item.badge && (
//                     <motion.span
//                       className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-900/50 text-blue-400 border border-blue-800/50"
//                       initial={{ scale: 0.8 }}
//                       animate={{ scale: [0.8, 1.2, 1] }}
//                       transition={{ duration: 0.5, delay: 0.8 + (i * 0.1) }}
//                     >
//                       {item.badge}
//                     </motion.span>
//                   )}
//                 </div>
//                 <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" />
//               </Link>
//             </motion.div>
//           ))}
//         </nav>
        
//         <motion.div 
//           className="p-6 border-t border-gray-800/40"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.8, duration: 0.5 }}
//         >
//           <button
//             onClick={handleSignOut}
//             className="flex items-center gap-3 w-full px-5 py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-red-900/20 text-red-400 group hover:border-red-500/30 border border-gray-800/40"
//             style={{
//               boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(239, 68, 68, 0.1)'
//             }}
//           >
//             <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
//             <span className="font-semibold">Sign Out</span>
//           </button>
//         </motion.div>
//       </motion.aside>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col min-w-0">
//         <main 
//           className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto relative z-10"
//           onScroll={handleScroll}
//         >
//           {/* Header */}
//           <motion.header 
//             className="flex items-center justify-between gap-6 p-6 rounded-3xl backdrop-blur-xl border border-gray-800/40 sticky top-0 z-30 transition-all duration-500"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             style={{
//               background: 'linear-gradient(135deg, rgba(0,0,0,0.7), rgba(15,23,42,0.8))',
//               boxShadow: scrolled
//                 ? '0 10px 30px rgba(0, 0, 0, 0.3), 0 5px 15px rgba(0, 0, 0, 0.2)'
//                 : 'none'
//             }}
//           >
//             <TechButton
//               onClick={() => setSidebarOpen(!sidebarOpen)} 
//               className="lg:hidden p-3"
//             >
//               <Menu className="w-6 h-6 text-gray-300" />
//             </TechButton>

//             <div className="flex-1 max-w-md lg:max-w-lg">
//               <div className="relative p-4 rounded-2xl backdrop-blur-md border border-gray-800/40 transition-all duration-500 hover:shadow-xl focus-within:shadow-2xl focus-within:border-blue-500/30 group">
//                 <input 
//                   type="text" 
//                   placeholder="🔍 Search executive resources..." 
//                   className="w-full bg-transparent outline-none text-lg text-white placeholder:text-gray-500" 
//                 />
//                 <div className="absolute inset-0 rounded-2xl bg-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
//               </div>
//             </div>

//             <div className="flex items-center space-x-4">
//               <TechButton
//                 onClick={() => setRightPanelOpen(!rightPanelOpen)}
//                 className="px-5 py-3 hidden sm:flex items-center gap-2"
//               >
//                 <Calendar className="w-5 h-5 text-gray-300" />
//                 <span className="font-medium">{rightPanelOpen ? 'Hide' : 'Show'} Calendar</span>
//               </TechButton>
//             </div>
//           </motion.header>

//           {/* Executive Welcome Section */}
//           <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 0.2 }}
//             >
//               <GlassCard className="p-8">
//                 <div className="flex items-start gap-4">
//                   <motion.div 
//                     className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg relative overflow-hidden"
//                     whileHover={{ rotate: 5, scale: 1.1 }}
//                     transition={{ type: "spring", stiffness: 300, damping: 10 }}
//                     style={{
//                       boxShadow: '0 15px 30px -10px rgba(37, 99, 235, 0.3)'
//                     }}
//                   >
//                     <div className="absolute inset-0 opacity-60" style={{
//                       background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.4))'
//                     }}></div>
//                     <span className="relative z-10">{user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}</span>
//                   </motion.div>
                  
//                   <div className="flex-1">
//                     <motion.h1 
//                       className="text-3xl font-bold mb-2 text-transparent bg-clip-text"
//                       initial={{ opacity: 0, x: -10 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ duration: 0.5, delay: 0.4 }}
//                       style={{
//                         backgroundImage: 'linear-gradient(90deg, #60a5fa, #3b82f6)'
//                       }}
//                     >
//                       Welcome, {user?.firstName || user?.username || "User"}
//                     </motion.h1>
                    
//                     <motion.p 
//                       className="text-lg text-gray-300 mb-2"
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 0.8 }}
//                       transition={{ duration: 0.5, delay: 0.5 }}
//                     >
//                       {user?.primaryEmailAddress?.emailAddress || "user@example.com"}
//                     </motion.p>
                    
//                     <motion.p 
//                       className="text-base text-gray-500 mb-4"
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 0.7 }}
//                       transition={{ duration: 0.5, delay: 0.6 }}
//                     >
//                       {user?.publicMetadata?.title || "Executive User"}
//                     </motion.p>
                    
//                     <motion.div 
//                       className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-green-900/20 text-green-400 border border-green-800/30"
//                       initial={{ opacity: 0, scale: 0.8 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       transition={{ duration: 0.5, delay: 0.7 }}
//                     >
//                       <motion.div 
//                         className="w-2 h-2 bg-green-500 rounded-full"
//                         animate={{ 
//                           scale: [1, 1.5, 1],
//                           opacity: [0.7, 1, 0.7]
//                         }}
//                         transition={{ 
//                           duration: 2,
//                           repeat: Infinity,
//                           repeatType: "loop"
//                         }}
//                         style={{
//                           boxShadow: '0 0 8px rgba(16, 185, 129, 0.7)'
//                         }}
//                       />
//                       <span className="font-medium">Executive Access Active</span>
//                     </motion.div>
//                   </div>
//                 </div>
//               </GlassCard>
//             </motion.div>
            
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 0.3 }}
//             >
//               <GlassCard
//                 className="p-8 cursor-pointer"
//                 onClick={() => { setRightPanelOpen(true); setShowFullCalendar(true); }}
//               >
//                 <div className="flex items-center justify-between mb-4">
//                   <h4 className="font-bold text-2xl text-transparent bg-clip-text" style={{
//                     backgroundImage: 'linear-gradient(90deg, #60a5fa, #3b82f6)'
//                   }}>Executive Calendar</h4>
//                   <motion.div 
//                     whileHover={{ rotate: 15, scale: 1.1 }}
//                     transition={{ type: "spring", stiffness: 300, damping: 10 }}
//                   >
//                     <Calendar className="w-8 h-8 text-blue-500" />
//                   </motion.div>
//                 </div>
                
//                 <div className={`text-base flex items-center gap-3 mb-3 ${calendarSynced ? 'text-green-400' : 'text-blue-400'}`}>
//                   <motion.div 
//                     className={`w-3 h-3 rounded-full ${calendarSynced ? 'bg-green-500' : 'bg-blue-500'}`}
//                     animate={{ 
//                       scale: [1, 1.5, 1],
//                       opacity: [0.7, 1, 0.7]
//                     }}
//                     transition={{ 
//                       duration: 2,
//                       repeat: Infinity,
//                       repeatType: "loop"
//                     }}
//                     style={{
//                       boxShadow: calendarSynced 
//                         ? '0 0 8px rgba(16, 185, 129, 0.7)'
//                         : '0 0 8px rgba(59, 130, 246, 0.7)'
//                     }}
//                   />
                  
//                 </div>
                
//                 <p className="text-sm text-gray-500">
//                   Integrated Outlook calendar with priority scheduling and executive notifications
//                 </p>
//               </GlassCard>
//             </motion.div>
//           </section>

//           {/* Real-time News Section */}
//           <section className="relative z-10 py-8">
//             <motion.div 
//               className="flex items-center justify-between mb-8"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6 }}
//             >
//               <div>
//                 <h2 className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text mb-2" style={{
//                   backgroundImage: 'linear-gradient(135deg, #60a5fa, #3b82f6)'
//                 }}>
//                   Live Market Intelligence
//                 </h2>
//                 <p className="text-gray-400 text-sm flex items-center gap-2">
//                   <motion.div 
//                     className="w-2 h-2 bg-green-500 rounded-full"
//                     animate={{ 
//                       scale: [1, 1.5, 1],
//                       opacity: [0.7, 1, 0.7]
//                     }}
//                     transition={{ 
//                       duration: 2,
//                       repeat: Infinity,
//                       repeatType: "loop"
//                     }}
//                   />
//                   {lastNewsUpdate && `Last updated: ${lastNewsUpdate.toLocaleTimeString()}`}
//                 </p>
//               </div>
              
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={async () => {
//                   setNewsLoading(true);
                  
//                   const rateLimit = await newsService.checkRateLimit();
//                   if (rateLimit && parseInt(rateLimit.remaining) < 10) {
//                     alert('Approaching API rate limit. Please wait before refreshing again.');
//                     setNewsLoading(false);
//                     return;
//                   }
                  
//                   const articles = await newsService.getMixedNews(3);
//                   setNewsArticles(articles);
//                   setLastNewsUpdate(new Date());
//                   setNewsLoading(false);
//                 }}
//                 className="px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition-all duration-300 text-sm font-medium"
//               >
//                 {newsLoading ? 'Updating...' : 'Refresh News'}
//               </motion.button>
//             </motion.div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {/* {newsArticles.map((article, index) => (
                
//                 <NewsCard 
//                   key={article.id} 
//                   article={article} 
//                   index={index}
//                 />
//               ))} */}
//               {newsArticles.map((article, index) => {
//                 console.log(`Rendering: ${article.id}`);
//                 return <NewsCard key={article.id} article={article} index={index} />;
//               })}
//             </div>
//           </section>

          
//         </main>
//       </div>

//       {/* Right Panel Overlay */}
//       <AnimatePresence>
//         {rightPanelOpen && (
//           <motion.div 
//             className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 xl:hidden" 
//             onClick={() => setRightPanelOpen(false)}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.3 }}
//           />
//         )}
//       </AnimatePresence>

//       {/* Right Panel */}
//       <AnimatePresence>
//         {rightPanelOpen && (
//           <motion.aside 
//             className="fixed xl:relative top-0 right-0 h-full z-50 w-96 backdrop-blur-xl border-l border-gray-800/40 shadow-2xl overflow-y-auto bg-black/80"
//             style={{
//               boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(59, 130, 246, 0.1)'
//             }}
//             initial={{ x: 400, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             exit={{ x: 400, opacity: 0 }}
//             transition={{ type: "spring", stiffness: 300, damping: 30 }}
//           >
//             <div className="p-8 space-y-8">
//               <div className="flex items-center justify-between xl:justify-center">
//                 <div className="text-center">
//                   <motion.div 
//                     className="w-24 h-24 rounded-3xl mx-auto mb-6 relative overflow-hidden"
//                     initial={{ scale: 0.8, opacity: 0 }}
//                     animate={{ scale: 1, opacity: 1 }}
//                     transition={{ duration: 0.5, delay: 0.2 }}
//                     whileHover={{ rotate: 5, scale: 1.1 }}
//                     style={{
//                       background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
//                       boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3), 0 10px 15px rgba(37, 99, 235, 0.2)'
//                     }}
//                   >
//                     <div className="absolute inset-0 opacity-60" style={{
//                       background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 70%)'
//                     }}></div>
                    
//                     <div className="w-full h-full rounded-2xl flex items-center justify-center text-3xl font-bold text-white bg-blue-600/40 backdrop-blur-md relative z-10">
//                       {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
//                     </div>
//                   </motion.div>
                  
//                   <motion.h3 
//                     className="font-bold text-xl mb-2 text-white"
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.5, delay: 0.3 }}
//                   >
//                     {user?.firstName || user?.username || "User"} {user?.lastName || ""}
//                   </motion.h3>
                  
//                   <motion.p 
//                     className="text-base text-gray-400 mb-3"
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 0.8, y: 0 }}
//                     transition={{ duration: 0.5, delay: 0.4 }}
//                   >
//                     {user?.primaryEmailAddress?.emailAddress || "user@example.com"}
//                   </motion.p>
                  
//                   <motion.div 
//                     className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-green-900/20 text-green-400 border border-green-800/30"
//                     initial={{ opacity: 0, scale: 0.8 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ duration: 0.5, delay: 0.5 }}
//                   >
//                     <motion.div 
//                       className="w-2 h-2 bg-green-500 rounded-full"
//                       animate={{ 
//                         scale: [1, 1.5, 1],
//                         opacity: [0.7, 1, 0.7]
//                       }}
//                       transition={{ 
//                         duration: 2,
//                         repeat: Infinity,
//                         repeatType: "loop"
//                       }}
//                       style={{
//                         boxShadow: '0 0 8px rgba(16, 185, 129, 0.7)'
//                       }}
//                     />
//                     <span className="font-medium">Executive Status</span>
//                   </motion.div>
//                 </div>
                
//                 <button 
//                   onClick={() => setRightPanelOpen(false)} 
//                   className="xl:hidden p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 hover:scale-110"
//                 >
//                   <X className="w-6 h-6 text-gray-400" />
//                 </button>
//               </div>

//               <motion.div
//                 key="calendar"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5 }}
//               >
//                 <OutlookCalendar events={[]} />
//               </motion.div>

//               {showFullCalendar && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.5, delay: 0.2 }}
//                   className="space-y-4"
//                 >
//                   <h4 className="font-bold text-lg text-white flex items-center gap-2">
//                     <Settings className="w-5 h-5 text-blue-400" />
//                     <span>Calendar Settings</span>
//                   </h4>
                  
//                   <div className="grid grid-cols-2 gap-3">
//                     <TechButton
//                       className="p-4 text-sm"
//                       onClick={() => {}}
//                     >
//                       <span>Sync Calendar</span>
//                     </TechButton>
                    
//                     <TechButton
//                       className="p-4 text-sm"
//                       onClick={() => {}}
//                     >
//                       <span>Export Events</span>
//                     </TechButton>
//                   </div>
//                 </motion.div>
//               )}

//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: 0.3 }}
//                 className="pt-4 border-t border-gray-800/40"
//               >
//                 <div className="flex items-center justify-between text-sm">
//                   <div className="flex items-center gap-2 text-gray-400">
//                     <Sun className="w-4 h-4" />
//                     <span>Dark Theme</span>
//                   </div>
                  
//                   <div className="w-12 h-6 bg-blue-900/30 rounded-full relative p-1 cursor-pointer">
//                     <motion.div 
//                       className="absolute w-4 h-4 bg-blue-500 rounded-full"
//                       initial={{ x: 0 }}
//                       animate={{ x: 24 }}
//                       transition={{ duration: 0.3, type: "spring" }}
//                       style={{
//                         boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
//                       }}
//                     />
//                   </div>
//                 </div>
//               </motion.div>

//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.5, delay: 0.4 }}
//                 className="text-xs text-center text-gray-600"
//               >
//                 <div className="flex items-center justify-center gap-1">
//                   <Clock className="w-3 h-3" />
//                   <span>Last login: {new Date().toLocaleString()}</span>
//                 </div>
//               </motion.div>
//             </div>
//           </motion.aside>
//         )}
//       </AnimatePresence>
      
//       <style jsx global>{`
//         @keyframes subtle-shift {
//           0% { background-position: 0px 0px; }
//           100% { background-position: 60px 60px; }
//         }
//       `}</style>
//     </div>
//   );
// }

// export default Dashboard;











































// import React, { useState, useEffect } from 'react';
// import { Search, Calendar, Bell, User, TrendingUp, BarChart3, FileText, Settings, 
//          ArrowUpRight, Clock, MapPin, Users, Briefcase, Globe, ChevronRight,
//          Activity, DollarSign, Target, Zap } from 'lucide-react';

// const Dashboard = () => {
//   const [activeSection, setActiveSection] = useState('market-intelligence');
//   const [currentTime, setCurrentTime] = useState(new Date());

//   // Update time every second
//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   // Floating Particles Background Component
//   const ParticlesBackground = () => {
//     const [particles, setParticles] = useState([]);

//     useEffect(() => {
//       const newParticles = [];
//       for (let i = 0; i < 50; i++) {
//         newParticles.push({
//           id: i,
//           x: Math.random() * 100,
//           y: Math.random() * 100,
//           size: Math.random() * 4 + 1,
//           opacity: Math.random() * 0.5 + 0.1,
//           speed: Math.random() * 2 + 0.5,
//         });
//       }
//       setParticles(newParticles);
//     }, []);

//     useEffect(() => {
//       const animateParticles = () => {
//         setParticles(prev => prev.map(particle => ({
//           ...particle,
//           y: particle.y > 100 ? -5 : particle.y + particle.speed * 0.1,
//         })));
//       };

//       const interval = setInterval(animateParticles, 100);
//       return () => clearInterval(interval);
//     }, []);

//     return (
//       <div className="fixed inset-0 pointer-events-none overflow-hidden">
//         {particles.map(particle => (
//           <div
//             key={particle.id}
//             className="absolute w-1 h-1 bg-blue-400 rounded-full"
//             style={{
//               left: `${particle.x}%`,
//               top: `${particle.y}%`,
//               width: `${particle.size}px`,
//               height: `${particle.size}px`,
//               opacity: particle.opacity,
//               animation: `float ${particle.speed}s infinite ease-in-out`,
//             }}
//           />
//         ))}
//         <style jsx>{`
//           @keyframes float {
//             0%, 100% { transform: translateY(0px) rotate(0deg); }
//             50% { transform: translateY(-10px) rotate(180deg); }
//           }
//         `}</style>
//       </div>
//     );
//   };

//   // Sample market data
//   const marketNews = [
//     {
//       title: "Dr Reddy's Q1FY26 preview",
//       summary: "US headwinds may weigh on margins but revenue may see sequential improvement",
//       time: "3d ago",
//       category: "Business",
//       trend: "up",
//     },
//     {
//       title: "Tata Motors DVR shares trading",
//       summary: "DVR shares of Tata Motors gained over 4% in early trade on Wednesday",
//       time: "2d ago",
//       category: "Auto",
//       trend: "up",
//     },
//     {
//       title: "Federal Bank Q1 results",
//       summary: "Net profit rises 15% YoY to ₹991 crore, beats estimates",
//       time: "1d ago",
//       category: "Banking",
//       trend: "up",
//     },
//     {
//       title: "IT services outlook",
//       summary: "Sector expected to see gradual recovery in H2FY25",
//       time: "4h ago",
//       category: "Technology",
//       trend: "neutral",
//     },
//   ];

//   const executiveMetrics = [
//     { label: "Portfolio Value", value: "₹2.4Cr", change: "+12.5%", positive: true },
//     { label: "Active Deals", value: "34", change: "+8", positive: true },
//     { label: "Success Rate", value: "87%", change: "+3%", positive: true },
//     { label: "Market Share", value: "15.2%", change: "-0.8%", positive: false },
//   ];

//   const calendarEvents = [
//     { time: "10:30 AM", title: "Board Meeting - Q2 Strategy", location: "Conference Room A" },
//     { time: "02:00 PM", title: "Client Presentation - DataStax", location: "Virtual" },
//     { time: "04:15 PM", title: "Executive Review", location: "Executive Floor" },
//     { time: "05:30 PM", title: "Market Analysis Call", location: "Virtual" },
//   ];

//   const renderMarketIntelligence = () => (
//     <div className="space-y-6">
//       {/* Real-time Market Feed */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {marketNews.map((news, index) => (
//           <div key={index} className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 hover:bg-gray-800/70 transition-all duration-200 hover:border-blue-500/30">
//             <div className="flex items-start justify-between mb-3">
//               <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">
//                 {news.category}
//               </span>
//               <div className="flex items-center gap-1">
//                 {news.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
//                 <ArrowUpRight className="w-3 h-3 text-gray-400" />
//               </div>
//             </div>
//             <h4 className="font-semibold text-white mb-2 line-clamp-2">{news.title}</h4>
//             <p className="text-gray-300 text-sm mb-3 line-clamp-2">{news.summary}</p>
//             <div className="flex items-center justify-between">
//               <span className="text-xs text-gray-400 flex items-center gap-1">
//                 <Clock className="w-3 h-3" />
//                 {news.time}
//               </span>
//               <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
//                 Read more
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Market Indicators */}
//       <div className="bg-gray-800/40 border border-gray-700/30 rounded-lg p-6">
//         <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
//           <Activity className="w-5 h-5 text-blue-400" />
//           Live Market Indicators
//         </h4>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700/30">
//             <div className="text-2xl font-bold text-green-400">+2.3%</div>
//             <div className="text-xs text-gray-400">NIFTY 50</div>
//           </div>
//           <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700/30">
//             <div className="text-2xl font-bold text-green-400">+1.8%</div>
//             <div className="text-xs text-gray-400">SENSEX</div>
//           </div>
//           <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700/30">
//             <div className="text-2xl font-bold text-red-400">-0.5%</div>
//             <div className="text-xs text-gray-400">BANK NIFTY</div>
//           </div>
//           <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700/30">
//             <div className="text-2xl font-bold text-green-400">+3.1%</div>
//             <div className="text-xs text-gray-400">IT INDEX</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderAnalytics = () => (
//     <div className="space-y-6">
//       {/* Executive Metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {executiveMetrics.map((metric, index) => (
//           <div key={index} className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-6 hover:bg-gray-800/70 transition-colors">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-sm text-gray-400">{metric.label}</span>
//               <div className={`flex items-center gap-1 text-xs ${metric.positive ? 'text-green-400' : 'text-red-400'}`}>
//                 <TrendingUp className={`w-3 h-3 ${metric.positive ? '' : 'rotate-180'}`} />
//                 {metric.change}
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-white">{metric.value}</div>
//           </div>
//         ))}
//       </div>

//       {/* Performance Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-gray-800/40 border border-gray-700/30 rounded-lg p-6">
//           <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
//             <BarChart3 className="w-5 h-5 text-blue-400" />
//             Revenue Trends
//           </h4>
//           <div className="h-48 bg-gray-900/50 rounded-lg border border-gray-700/30 flex items-center justify-center">
//             <span className="text-gray-400">Chart Component Placeholder</span>
//           </div>
//         </div>

//         <div className="bg-gray-800/40 border border-gray-700/30 rounded-lg p-6">
//           <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
//             <Target className="w-5 h-5 text-blue-400" />
//             Goal Achievement
//           </h4>
//           <div className="space-y-4">
//             <div>
//               <div className="flex justify-between text-sm mb-1">
//                 <span className="text-gray-300">Q2 Sales Target</span>
//                 <span className="text-white">87%</span>
//               </div>
//               <div className="w-full bg-gray-700 rounded-full h-2">
//                 <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }}></div>
//               </div>
//             </div>
//             <div>
//               <div className="flex justify-between text-sm mb-1">
//                 <span className="text-gray-300">New Clients</span>
//                 <span className="text-white">94%</span>
//               </div>
//               <div className="w-full bg-gray-700 rounded-full h-2">
//                 <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
//               </div>
//             </div>
//             <div>
//               <div className="flex justify-between text-sm mb-1">
//                 <span className="text-gray-300">Market Expansion</span>
//                 <span className="text-white">72%</span>
//               </div>
//               <div className="w-full bg-gray-700 rounded-full h-2">
//                 <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '72%' }}></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderReports = () => (
//     <div className="space-y-6">
//       {/* Recent Reports */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {[
//           { title: "Q2 Executive Summary", date: "July 20, 2025", type: "Summary", size: "2.4 MB" },
//           { title: "Market Analysis Report", date: "July 18, 2025", type: "Analysis", size: "5.7 MB" },
//           { title: "Competitive Intelligence", date: "July 15, 2025", type: "Intelligence", size: "3.2 MB" },
//           { title: "Sales Performance Review", date: "July 12, 2025", type: "Performance", size: "4.1 MB" },
//           { title: "Strategic Planning Document", date: "July 10, 2025", type: "Strategy", size: "6.8 MB" },
//           { title: "Risk Assessment Report", date: "July 8, 2025", type: "Risk", size: "3.9 MB" },
//         ].map((report, index) => (
//           <div key={index} className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 hover:bg-gray-800/70 transition-colors cursor-pointer">
//             <div className="flex items-start justify-between mb-3">
//               <FileText className="w-5 h-5 text-blue-400 mt-1" />
//               <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30">
//                 {report.type}
//               </span>
//             </div>
//             <h4 className="font-semibold text-white mb-2">{report.title}</h4>
//             <div className="space-y-1">
//               <div className="text-xs text-gray-400">Generated: {report.date}</div>
//               <div className="text-xs text-gray-400">Size: {report.size}</div>
//             </div>
//             <button className="mt-3 w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-sm py-2 rounded-lg border border-blue-500/30 transition-colors">
//               Download Report
//             </button>
//           </div>
//         ))}
//       </div>

//       {/* Generate New Report */}
//       <div className="bg-gray-800/40 border border-gray-700/30 rounded-lg p-6">
//         <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
//           <Zap className="w-5 h-5 text-yellow-400" />
//           Generate Custom Report
//         </h4>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none">
//             <option>Select Report Type</option>
//             <option>Market Analysis</option>
//             <option>Performance Review</option>
//             <option>Competitive Intelligence</option>
//             <option>Executive Summary</option>
//           </select>
//           <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none">
//             <option>Select Time Period</option>
//             <option>Last 7 days</option>
//             <option>Last 30 days</option>
//             <option>Last Quarter</option>
//             <option>Last Year</option>
//           </select>
//           <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
//             Generate Report
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   const renderSettings = () => (
//     <div className="space-y-6">
//       {/* User Profile */}
//       <div className="bg-gray-800/40 border border-gray-700/30 rounded-lg p-6">
//         <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
//           <User className="w-5 h-5 text-blue-400" />
//           User Profile
//         </h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm text-gray-300 mb-2">Full Name</label>
//             <input 
//               type="text" 
//               value="Shatakshi Singh" 
//               className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
//             />
//           </div>
//           <div>
//             <label className="block text-sm text-gray-300 mb-2">Email</label>
//             <input 
//               type="email" 
//               value="shatakshi.singh@ibm.com" 
//               className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Notification Preferences */}
//       <div className="bg-gray-800/40 border border-gray-700/30 rounded-lg p-6">
//         <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
//           <Bell className="w-5 h-5 text-blue-400" />
//           Notification Preferences
//         </h4>
//         <div className="space-y-4">
//           {[
//             "Market alerts",
//             "Calendar reminders", 
//             "Report generation notifications",
//             "Executive updates"
//           ].map((item, index) => (
//             <label key={index} className="flex items-center gap-3">
//               <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" />
//               <span className="text-gray-300">{item}</span>
//             </label>
//           ))}
//         </div>
//       </div>
//     </div>
//   );

//   const renderContent = () => {
//     switch (activeSection) {
//       case 'market-intelligence':
//         return renderMarketIntelligence();
//       case 'analytics':
//         return renderAnalytics();
//       case 'reports':
//         return renderReports();
//       case 'settings':
//         return renderSettings();
//       default:
//         return renderMarketIntelligence();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white relative">
//       <ParticlesBackground />
      
//       {/* Header Bar - IBM Style */}
//       <header className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4 relative z-10">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
//                 <span className="text-white font-bold text-sm">P</span>
//               </div>
//               <h1 className="text-xl font-semibold text-white">Pierre Executive</h1>
//             </div>
//           </div>
          
//           <div className="flex items-center gap-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//               <input
//                 type="text"
//                 placeholder="Search executive resources..."
//                 className="bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none w-80"
//               />
//             </div>
//             <button className="p-2 text-gray-400 hover:text-white transition-colors">
//               <Calendar className="w-5 h-5" />
//             </button>
//             <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
//               <Bell className="w-5 h-5" />
//               <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
//             </button>
//             <div className="flex items-center gap-2 ml-4">
//               <User className="w-5 h-5 text-gray-400" />
//               <span className="text-sm text-gray-300">shatakshi.singh@ibm.com</span>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="flex h-[calc(100vh-80px)]">
//         {/* Left Sidebar - IBM Style Navigation */}
//         <aside className="w-64 bg-gray-900/70 backdrop-blur-sm border-r border-gray-700/50 relative z-10">
//           <div className="p-6">
//             <nav className="space-y-2">
//               <button
//                 onClick={() => setActiveSection('market-intelligence')}
//                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
//                   activeSection === 'market-intelligence' 
//                     ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
//                     : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
//                 }`}
//               >
//                 <TrendingUp className="w-5 h-5" />
//                 Market Intelligence
//               </button>
              
//               <button
//                 onClick={() => setActiveSection('analytics')}
//                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
//                   activeSection === 'analytics' 
//                     ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
//                     : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
//                 }`}
//               >
//                 <BarChart3 className="w-5 h-5" />
//                 Analytics & Insights
//               </button>
              
//               <button
//                 onClick={() => setActiveSection('reports')}
//                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
//                   activeSection === 'reports' 
//                     ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
//                     : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
//                 }`}
//               >
//                 <FileText className="w-5 h-5" />
//                 Executive Reports
//               </button>
              
//               <button
//                 onClick={() => setActiveSection('settings')}
//                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
//                   activeSection === 'settings' 
//                     ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
//                     : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
//                 }`}
//               >
//                 <Settings className="w-5 h-5" />
//                 Configuration
//               </button>
//             </nav>
//           </div>
          
//           {/* Status indicator like IBM */}
//           <div className="absolute bottom-6 left-6 right-6">
//             <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3">
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//                 <span className="text-xs text-green-300">Executive Access Active</span>
//               </div>
//             </div>
//           </div>
//         </aside>

//         {/* Main Content Area */}
//         <main className="flex-1 relative z-10">
//           <div className="p-6 h-full overflow-y-auto">
//             {/* Welcome Banner - IBM Style */}
//             <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/60 border border-blue-700/30 rounded-xl p-6 mb-8 backdrop-blur-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-bold text-white mb-2">Welcome, Shatakshi</h2>
//                   <p className="text-blue-200">Executive User • Integrated Outlook calendar with priority scheduling and executive notifications</p>
//                 </div>
//                 <div className="text-right">
//                   <div className="text-sm text-blue-300">
//                     Last updated: {currentTime.toLocaleTimeString('en-IN', { 
//                       hour: '2-digit', 
//                       minute: '2-digit', 
//                       second: '2-digit' 
//                     })}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Content Sections - IBM Style Cards */}
//             <div className="space-y-8">
//               {/* Dynamic Section Header */}
//               <section>
//                 <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg">
//                   <h3 className="font-semibold flex items-center gap-2">
//                     {activeSection === 'market-intelligence' && <><TrendingUp className="w-5 h-5" />Live Market Intelligence</>}
//                     {activeSection === 'analytics' && <><BarChart3 className="w-5 h-5" />Executive Analytics</>}
//                     {activeSection === 'reports' && <><FileText className="w-5 h-5" />Executive Reports</>}
//                     {activeSection === 'settings' && <><Settings className="w-5 h-5" />Configuration Settings</>}
//                   </h3>
//                   <p className="text-sm text-blue-100 mt-1">
//                     {activeSection === 'market-intelligence' && "Find content you can share with clients or learn about the enterprise capabilities that unlock real value for hybrid cloud and AI."}
//                     {activeSection === 'analytics' && "Execute with a proven sales methodology, and find sales plays, prospecting playbooks and demos to position our most strategic offerings."}
//                     {activeSection === 'reports' && "Access and generate comprehensive executive reports with real-time data insights and strategic analysis."}
//                     {activeSection === 'settings' && "Customize your executive dashboard preferences and notification settings for optimal productivity."}
//                   </p>
//                 </div>
                
//                 <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-b-lg p-6">
//                   {renderContent()}
//                 </div>
//               </section>
//             </div>
//           </div>
//         </main>

//         {/* Right Sidebar - Executive Calendar */}
//         <aside className="w-80 bg-gray-900/70 backdrop-blur-sm border-l border-gray-700/50 relative z-10">
//           <div className="p-6 h-full overflow-y-auto">
//             <div className="flex items-center gap-2 mb-4">
//               <Calendar className="w-5 h-5 text-blue-400" />
//               <h3 className="font-semibold text-white">Executive Calendar</h3>
//             </div>
            
//             <div className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 mb-6">
//               <div className="text-sm text-gray-300 mb-3">
//                 Integrated Outlook calendar with priority scheduling and executive notifications
//               </div>
              
//               <div className="space-y-3">
//                 {calendarEvents.map((event, index) => (
//                   <div key={index} className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-3 hover:bg-gray-900/70 transition-colors">
//                     <div className="flex items-center gap-2 mb-1">
//                       <Clock className="w-3 h-3 text-blue-400" />
//                       <span className="text-xs text-blue-300 font-medium">{event.time}</span>
//                     </div>
//                     <h4 className="text-sm font-medium text-white mb-1">{event.title}</h4>
//                     <div className="flex items-center gap-1">
//                       <MapPin className="w-3 h-3 text-gray-400" />
//                       <span className="text-xs text-gray-400">{event.location}</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4">
//               <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
//                 <Zap className="w-4 h-4 text-yellow-400" />
//                 Quick Actions
//               </h4>
//               <div className="space-y-2">
//                 <button className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-sm py-2 px-3 rounded-lg border border-blue-500/30 transition-colors text-left flex items-center gap-2">
//                   <Users className="w-4 h-4" />
//                   Schedule Meeting
//                 </button>
//                 <button className="w-full bg-green-600/20 hover:bg-green-600/30 text-green-300 text-sm py-2 px-3 rounded-lg border border-green-500/30 transition-colors text-left flex items-center gap-2">
//                   <FileText className="w-4 h-4" />
//                   Generate Report
//                 </button>
//                 <button className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-sm py-2 px-3 rounded-lg border border-purple-500/30 transition-colors text-left flex items-center gap-2">
//                   <Globe className="w-4 h-4" />
//                   Market Update
//                 </button>
//               </div>
//             </div>
//           </div>
//         </aside>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;





























import React, { useState, useEffect } from 'react';
import { Search, Calendar, Bell, User, TrendingUp, BarChart3, FileText, Settings, 
         ArrowUpRight, Clock, MapPin, Users, Briefcase, Globe, ChevronRight,
         Activity, DollarSign, Target, Zap, Menu, X, Mail, LogOut, Sparkles, 
         Sun, Moon, Star, Award, Shield, ExternalLink, Minus, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import TechBackground from '../components/TechBackground';
import GlassCard from '../components/GlassCard';
import TechButton from '../components/TechButton';
import OutlookCalendar from '../components/OutlookCalendar';

// Keep your NewsService class exactly as it was
class NewsService {
  constructor() {
    this.cache = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000;
    this.API_KEY = import.meta.env.VITE_NEWS_API_KEY;
    this.SCRAPINGBEE_API_KEY = import.meta.env.VITE_SCRAPINGBEE_API_KEY;
    this.SCRAPINGBEE_BASE_URL = 'https://app.scrapingbee.com/api/v1/';
    this.idCounter = 0;
    
    if (!this.API_KEY) {
      console.warn('NewsAPI key not found. Using fallback news.');
    }
    if (!this.SCRAPINGBEE_API_KEY) {
      console.warn('ScrapingBee API key not found. Direct NewsAPI calls may fail.');
    }
    
    console.log('NewsService initialized with ScrapingBee proxy');
  }

  createProxyUrl(endpoint, params = {}) {
    const newsApiParams = new URLSearchParams({
      apiKey: this.API_KEY,
      ...params
    });
    
    const fullNewsApiUrl = `https://newsapi.org/v2${endpoint}?${newsApiParams}`;
    
    const scrapingBeeParams = new URLSearchParams({
      api_key: this.SCRAPINGBEE_API_KEY,
      url: fullNewsApiUrl,
      render_js: 'false',
      premium_proxy: 'false'
    });
    
    return `${this.SCRAPINGBEE_BASE_URL}?${scrapingBeeParams}`;
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
        throw new Error('NewsAPI key not configured');
      }
      
      if (!this.SCRAPINGBEE_API_KEY) {
        throw new Error('ScrapingBee API key not configured');
      }

      const proxyUrl = this.createProxyUrl(endpoint, params);
      
      console.log('Fetching via ScrapingBee proxy...');
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`ScrapingBee Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(`NewsAPI Error: ${data.message || 'Unknown error'}`);
      }
      
      console.log('Successfully fetched via ScrapingBee:', data.articles?.length || 0, 'articles');
      this.cache.set(cacheKey, { data: data.articles, timestamp: now });
      return data.articles;
    } catch (error) {
      console.error('ScrapingBee fetch failed:', error);
      return cached?.data || [];
    }
  }

  async getTopHeadlines(limit = 3) {
    const articles = await this.fetchWithCache('/top-headlines', {
      country: 'in',
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
      const finalArticles = uniqueArticles.slice(0, limit);
      
      console.log('Final article IDs:', finalArticles.map(a => a.id));
      
      return finalArticles;
    } catch (error) {
      console.error('Mixed news fetch failed:', error);
      return this.getFallbackNews(limit);
    }
  }

  formatArticles(articles) {
    if (!Array.isArray(articles)) return [];

    return articles
      .filter(article => article.title && article.title !== '[Removed]')
      .map((article, index) => {
        const url = article.url?.trim();
        const title = article.title?.trim();
        
        this.idCounter++;
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        
        const id = `article-${this.idCounter}-${timestamp}-${randomSuffix}`;
        
        return {
          id,
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

  removeDuplicates(articles) {
    const seen = new Set();
    return articles.filter(article => {
      const titleKey = article.title?.toLowerCase().trim() || '';
      const urlKey = article.url?.toLowerCase().trim() || '';
      
      const compositeKey = `${titleKey}|||${urlKey}`;
      
      if (seen.has(compositeKey)) {
        console.log('Duplicate found:', titleKey);
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
        id: `fallback-1-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
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
        id: `fallback-2-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
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
        id: `fallback-3-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
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

  async checkRateLimit() {
    try {
      const proxyUrl = this.createProxyUrl('/top-headlines', { 
        country: 'us', 
        pageSize: 1 
      });
      
      const response = await fetch(proxyUrl);
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

const newsService = new NewsService();

// Simple NewsCard component without animations
const NewsCard = ({ article, index }) => {
  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'negative':
        return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'border-green-500/30 bg-green-900/10';
      case 'negative':
        return 'border-red-500/30 bg-red-900/10';
      default:
        return 'border-gray-500/30 bg-gray-900/10';
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffMs = now - published;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return published.toLocaleDateString();
  };

  return (
    <div className="h-full">
      <GlassCard className="p-6 h-full cursor-pointer group hover:border-blue-500/40 transition-colors duration-200">
        <div className="flex flex-col h-full">
          {article.imageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-32 object-cover"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </div>
          )}

          <div className="flex items-start justify-between mb-4">
            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(article.sentiment)}`}>
              <div className="flex items-center gap-1">
                {getSentimentIcon(article.sentiment)}
                <span className="capitalize">{article.sentiment}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(article.publishedAt)}</span>
            </div>
          </div>

          <div className="flex-1">
            <h4 className="font-bold text-lg text-blue-400 mb-3 group-hover:text-blue-300 transition-colors duration-200 leading-tight">
              {article.title}
            </h4>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              {article.summary}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-800/40">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">{article.source}</span>
              <span className="text-xs text-gray-600">•</span>
              <span className="text-xs text-gray-500">{article.category}</span>
            </div>
            {article.url !== '#' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(article.url, '_blank');
                }}
                className="p-2 rounded-full hover:bg-blue-500/20 transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4 text-blue-400" />
              </button>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [activeSection, setActiveSection] = useState('market-intelligence');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // News state variables
  const [newsArticles, setNewsArticles] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [lastNewsUpdate, setLastNewsUpdate] = useState(null);
  // To-Do List state
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');

  const handleToggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, checked: !todo.checked } : todo
    ));
  };

  const handleUpdateTodoText = (id, newText) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, text: newText } : todo
    ));
  };

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      setTodos([...todos, { 
        id: Date.now(), 
        text: newTodoText.trim(), 
        checked: false 
      }]);
      setNewTodoText('');
    }
  };

  const handleDeleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  // Update time every second (existing useEffect)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // News fetching effect
  useEffect(() => {
    const fetchNews = async () => {
      setNewsLoading(true);
      try {
        const articles = await newsService.getMixedNews(3);
        setNewsArticles(articles);
        setLastNewsUpdate(new Date());
        
        const rateLimit = await newsService.checkRateLimit();
        if (rateLimit) {
          console.log(`API calls remaining: ${rateLimit.remaining}/${rateLimit.limit}`);
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
        setNewsArticles(newsService.getFallbackNews(3));
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
    const newsInterval = setInterval(fetchNews, 10 * 60 * 1000);
    return () => clearInterval(newsInterval);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  const handleScroll = (e) => {
    setScrolled(e.target.scrollTop > 20);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white relative">
      {/* TechBackground */}
      <div className="fixed inset-0 z-0">
        <TechBackground />
      </div>
      
      {/* Header Bar */}
      <header className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-all duration-300"
            >
              <Menu className="w-6 h-6 text-gray-300" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <h1 className="text-xl font-semibold text-white">Pierre Executive</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search executive resources..."
                className="bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none w-80"
              />
            </div>
            {/* Calendar Toggle Button */}
            <button 
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </button>
            <div className="flex items-center gap-2 ml-4">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-300">
                {user?.primaryEmailAddress?.emailAddress || "user@example.com"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <aside
          className={`
            fixed lg:relative top-0 left-0 h-full z-50 w-64
            backdrop-blur-xl border-r shadow-2xl transform transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${sidebarOpen || 'lg:flex'} flex flex-col
            bg-gray-900/70 border-gray-700/50 text-white
          `}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                  Pierre Executive
                </h2>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)} 
                className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('market-intelligence')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === 'market-intelligence' 
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                Market Intelligence
              </button>
              
              <Link
                to="/trends"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-300 hover:bg-gray-800/50 hover:text-white"
              >
                <Sparkles className="w-5 h-5" />
                Market Trends
              </Link>
              
              <Link
                to="/scope"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-300 hover:bg-gray-800/50 hover:text-white"
              >
                <BarChart3 className="w-5 h-5" />
                Scope
              </Link>
              
              <button
                onClick={() => setActiveSection('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === 'settings' 
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <Settings className="w-5 h-5" />
                Configuration
              </button>
            </nav>
          </div>
          
          {/* Sign Out Button */}
          <div className="mt-auto p-6 border-t border-gray-800/40">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-5 py-4 rounded-2xl transition-all duration-300 hover:bg-red-900/20 text-red-400 group hover:border-red-500/30 border border-gray-800/40"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 relative z-10 transition-all duration-300 ${rightPanelOpen ? '' : 'mr-0'}`}>
          <div className="p-6 h-full overflow-y-auto" onScroll={handleScroll}>
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/60 border border-blue-700/30 rounded-xl p-6 mb-8 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    <span>
                      {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Welcome, {user?.firstName || user?.username || "User"}
                    </h2>
                    <p className="text-blue-200">
                      Executive User • Integrated Outlook calendar with priority scheduling and executive notifications
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-300">
                    Last updated: {currentTime.toLocaleTimeString('en-IN', { 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-8">
              <section>
                <div className="bg-blue-800 text-white px-4 py-3 rounded-t-lg">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Live Market Intelligence
                  </h3>
                  <p className="text-sm text-blue-100 mt-1">
                    Find content you can share with clients or learn about the enterprise capabilities that unlock real value for hybrid cloud and AI.
                  </p>
                </div>
                
                <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-b-lg p-6">
                  {/* News Section Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {lastNewsUpdate && `Last updated: ${lastNewsUpdate.toLocaleTimeString()}`}
                    </div>
                    
                    <button
                      onClick={async () => {
                        setNewsLoading(true);
                        
                        const rateLimit = await newsService.checkRateLimit();
                        if (rateLimit && parseInt(rateLimit.remaining) < 10) {
                          alert('Approaching API rate limit. Please wait before refreshing again.');
                          setNewsLoading(false);
                          return;
                        }
                        
                        const articles = await newsService.getMixedNews(3);
                        setNewsArticles(articles);
                        setLastNewsUpdate(new Date());
                        setNewsLoading(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition-all duration-300 text-sm font-medium"
                    >
                      {newsLoading ? 'Updating...' : 'Refresh News'}
                    </button>
                  </div>

                  {/* News Grid - Adjusts based on right panel state */}
                  {/* News Grid - Keep 3 columns max, just make them wider */}
                    <div 
                      className={`grid gap-6 transition-all duration-300 ${
                        rightPanelOpen 
                          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                      }`}
                    >

                    {newsArticles.map((article, index) => (
                      <NewsCard key={article.id} article={article} index={index} />
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Calendar */}
        {rightPanelOpen && (
          <aside className="w-80 bg-gray-900/70 backdrop-blur-sm border-l border-gray-700/50 relative z-10 transition-all duration-300">
            <div className="p-6 h-full overflow-y-auto">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Executive Calendar</h3>
                </div>
                <button
                  onClick={() => setRightPanelOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              {/* Calendar Component */}
              <div className="mb-6">
                <OutlookCalendar events={[]} />
              </div>

              <div className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                To-Do List
              </h4>
              
              {/* Existing todos */}
              <div className="space-y-2 mb-4">
                {todos.map((todo) => (
                  <div key={todo.id} className="flex items-center gap-2 group">
                    <input 
                      type="checkbox" 
                      checked={todo.checked}
                      onChange={() => handleToggleTodo(todo.id)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" 
                    />
                    <input 
                      type="text" 
                      value={todo.text}
                      onChange={(e) => handleUpdateTodoText(todo.id, e.target.value)}
                      className={`flex-1 bg-transparent text-sm text-gray-300 border-none outline-none focus:bg-gray-700/50 rounded px-2 py-1 transition-colors ${
                        todo.checked ? 'line-through text-gray-500' : ''
                      }`}
                      placeholder="Enter task..."
                    />
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add new todo */}
              <div className="flex gap-2 pt-2 border-t border-gray-700/30">
                <input 
                  type="text" 
                  placeholder="Add new task..." 
                  value={newTodoText} 
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-45 bg-gray-700 text-gray-300 text-sm rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={handleAddTodo}
                  disabled={!newTodoText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            </div>
          </aside>
        )}

        {/* Floating Toggle Button when Panel is Closed */}
        {!rightPanelOpen && (
          <button
            onClick={() => setRightPanelOpen(true)}
            className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 p-3 bg-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-full text-blue-400 hover:bg-blue-600/30 transition-all duration-300 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
