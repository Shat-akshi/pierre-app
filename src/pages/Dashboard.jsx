

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


// [NewsService class remains exactly the same - no color changes needed]
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
    return this.getFallbackNews(limit);
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
        title: 'RBI likely to cut FY26 inflation outlook, keep rates unchanged in August',
        summary: 'JM Financial expects MPC to lower inflation expectation by 20bps for FY26 to 3.5% while maintaining status quo on rates.',
        url: 'https://www.moneycontrol.com/news/business/markets/daily-voice-rbi-likely-to-cut-fy26-inflation-outlook-keep-rates-unchanged-in-august-says-jm-financial-s-ankur-jhaveri-13329330.html',
        imageUrl: 'https://images.moneycontrol.com/static-mcnews/2025/07/20250725190312_Ankur-Jhaveri.jpg?impolicy=website&width=770&height=431',
        source: 'Moneycontrol',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: 'Markets',
        timestamp: new Date().toISOString()
      },
      {
        id: `fallback-2-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        title: 'Premji Invest, Accel, Norwest Venture-backed Amagi Media Labs files IPO papers, fresh issue size at Rs 1,020 crore',
        summary: 'The Amagi Media Labs IPO will be a combination of fresh issue Rs 1,020 crore worth shares, and an offer-for-sale of 3.4 crore shares by existing shareholders.',
        url: 'https://www.moneycontrol.com/news/business/ipo/premji-invest-accel-norwest-venture-backed-amagi-media-labs-files-ipo-papers-fresh-issue-size-at-rs-1-020-crore-13329187.html',
        imageUrl: 'https://images.moneycontrol.com/static-mcnews/2023/08/ott-streaming-rep.jpg?impolicy=website&width=770&height=431',
        source: 'Moneycontrol',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        category: 'Business',
        timestamp: new Date().toISOString()
      },
      {
        id: `fallback-3-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        title: 'Deloitte sought independent external probe into Hindenburg allegations, Adani firm says',
        summary: 'Adani firm states reasons for Deloitte resignation not convincing as auditor sought external investigation.',
        url: 'https://economictimes.indiatimes.com/news/company/corporate-trends/deloitte-sought-independent-external-probe-into-hindenburg-allegations-adani-firm-says-reasons-for-resignation-not-convincing/articleshow/102695449.cms',
        imageUrl: 'https://img.etimg.com/thumb/msid-102695449,width-650,height-450,imgsize-123456,overlay-economictimes/photo.jpg',
        source: 'Economic Times',
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        category: 'Business',
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


// NewsCard component with OFF-WHITE and DULL BLUE colors
const NewsCard = ({ article, index }) => {
  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default:
        return <Minus className="w-4 h-4 text-stone-500" />; // ✅ CHANGED: stone instead of gray
    }
  };


  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'border-green-400/40 bg-green-50/50';
      case 'negative':
        return 'border-red-400/40 bg-red-50/50';
      default:
        return 'border-stone-400/40 bg-stone-50/50'; // ✅ CHANGED: stone instead of gray
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
  <GlassCard className="p-6 h-full cursor-pointer group bg-[#f4f4f4] text-black border border-[#5b84b1]/30 hover:border-[#5b84b1]/60 transition-colors duration-200 rounded-xl shadow-sm">
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
        <div className="flex items-center gap-2 text-xs text-stone-600">
          <Clock className="w-3 h-3" />
          <span>{formatTimeAgo(article.publishedAt)}</span>
        </div>
      </div>


      <div className="flex-1">
        <h4 className="font-bold text-lg mb-3 group-hover:text-[#4a6c93] transition-colors duration-200 leading-tight">
          {article.title}
        </h4>
        <p className="text-sm mb-4 leading-relaxed">
          {article.summary}
        </p>
      </div>


      <div className="flex items-center justify-between pt-4 border-t border-stone-300">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{article.source}</span>
          <span className="text-xs text-stone-500">•</span>
          <span className="text-xs">{article.category}</span>
        </div>
        {article.url !== '#' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(article.url, '_blank');
            }}
            className="p-2 rounded-full hover:bg-[#5b84b1]/10 transition-colors duration-200"
          >
            <ExternalLink className="w-4 h-4 text-[#5b84b1]" />
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
    <div className="min-h-screen bg-[#f4f4f4] text-stone-800 relative"> 
      {/* Header Bar */}
      <header className="bg-[#f4f4f4]/90 backdrop-blur-sm border-b border-stone-300/50 px-6 py-4 relative z-10"> 
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="lg:hidden p-2 rounded-xl hover:bg-stone-200/50 transition-all duration-300"> 
              <Menu className="w-6 h-6 text-stone-700" /> 
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"> 
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <h1 className="text-xl font-semibold text-stone-800">Pierre Executive</h1> 
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500 w-4 h-4" /> 
              <input
                type="text"
                placeholder="Search executive resources..."
                className="bg-stone-50 border border-stone-300 rounded-lg pl-10 pr-4 py-2 text-sm text-stone-800 placeholder-stone-500 focus:border-blue-500 focus:outline-none w-80" /* ✅ CHANGED: off-white bg, dull blue focus */
              />
            </div>
            <button 
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className="p-2 text-stone-600 hover:text-stone-800 transition-colors"> 
              <Calendar className="w-5 h-5" />
            </button>
            <button className="p-2 text-stone-600 hover:text-stone-800 transition-colors relative"> 
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </button>
            <div className="flex items-center gap-2 ml-4">
              <User className="w-5 h-5 text-stone-600" /> {/* ✅ CHANGED: stone */}
              <span className="text-sm text-stone-700"> {/* ✅ CHANGED: stone */}
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" 
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
            bg-[#fcf8ef]/90 text-[#3e3a35] border-[#e4dcc7]
          `}
        >

          <div className="p-6">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
              </div>
              <button 
                onClick={() => setSidebarOpen(false)} 
                className="lg:hidden p-2 rounded-xl hover:bg-stone-200/50 transition-all duration-300"> {/* ✅ CHANGED: stone hover */}
                <X className="w-5 h-5" />
              </button>
            </div>


            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('market-intelligence')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === 'market-intelligence' 
                    ? 'bg-blue-400/20 text-blue-700 border border-blue-400/40' /* ✅ CHANGED: dull blue active state */
                    : 'text-stone-700 hover:bg-stone-200/50 hover:text-stone-800' /* ✅ CHANGED: stone colors */
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                Home
              </button>
              
              <Link
                to="/trends"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-stone-700 hover:bg-stone-200/50 hover:text-stone-800" /* ✅ CHANGED: stone colors */
              >
                <Sparkles className="w-5 h-5" />
                Market Trends
              </Link>
              
              <Link
                to="/scope"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-stone-700 hover:bg-stone-200/50 hover:text-stone-800" /* ✅ CHANGED: stone colors */
              >
                <BarChart3 className="w-5 h-5" />
                Scope
              </Link>
            </nav>
          </div>
          
          {/* Sign Out Button */}
          <div className="mt-auto p-6 border-t border-stone-300/60"> {/* ✅ CHANGED: stone border */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-5 py-4 rounded-2xl transition-all duration-300 hover:bg-red-100/60 text-red-600 group hover:border-red-400/40 border border-stone-300/60" /* ✅ CHANGED: stone border */
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
            <div className="bg-gradient-to-r from-blue-100 border border-blue-300/40 rounded-xl p-6 mb-8 backdrop-blur-sm"> {/* ✅ CHANGED: dull blue gradient banner */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue shadow-lg"> {/* ✅ CHANGED: dull blue */}
                    <span>
                      {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-stone-800 mb-2"> {/* ✅ CHANGED: stone text */}
                      Welcome, {user?.firstName || user?.username || "User"}
                    </h2>
                    
                  </div>
                </div>
                
              </div>
            </div>


            {/* Content Sections */}
            <div className="space-y-8">
            <section>
              {/* Header */}
              <div className="bg-blue-100 text-black px-4 py-3 rounded-t-lg">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Live Market
                </h3>
                
              </div>


              {/* Card Container */}
              <div className="bg-[#f4f4f4] backdrop-blur-sm border-2 border-blue-100 rounded-b-lg p-6">
                {/* News Section Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2 text-stone-600 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {lastNewsUpdate && `Last updated: ${lastNewsUpdate.toLocaleTimeString()}`}
                  </div>


                  {/* <button
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
                    className="px-4 py-2 rounded-xl bg-stone-300/40 border border-stone-400 text-black hover:bg-stone-400/50 transition-all duration-300 text-sm font-medium"
                  >
                    {newsLoading ? 'Updating...' : 'Refresh News'}
                  </button> */}
                </div>


                {/* News Grid */}
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
          <aside className="w-80 bg-stone-50/80 backdrop-blur-sm border-l border-stone-300/50 relative z-10 transition-all duration-300"> {/* ✅ CHANGED: OFF-WHITE sidebar */}
            <div className="p-6 h-full overflow-y-auto">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" /> {/* ✅ CHANGED: dull blue */}
                  <h3 className="font-semibold text-stone-800">Calendar</h3> {/* ✅ CHANGED: stone text */}
                </div>
                <button
                  onClick={() => setRightPanelOpen(false)}
                  className="p-2 rounded-lg hover:bg-stone-200/50 text-stone-600 hover:text-stone-800 transition-colors" /* ✅ CHANGED: stone colors */
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              {/* Calendar Component */}
              <div className="mb-6">
                <OutlookCalendar events={[]} />
              </div>


              <div className="bg-stone-100/70 border border-stone-300/40 rounded-lg p-4"> {/* ✅ CHANGED: OFF-WHITE todo background */}
                <h4 className="font-semibold text-stone-800 mb-3 flex items-center gap-2"> {/* ✅ CHANGED: stone text */}
                  <FileText className="w-4 h-4 text-blue-600" /> {/* ✅ CHANGED: dull blue */}
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
                        className="w-4 h-4 text-blue-600 bg-stone-100 border-stone-400 rounded focus:ring-blue-500" /* ✅ CHANGED: dull blue and stone */
                      />
                      <input 
                        type="text" 
                        value={todo.text}
                        onChange={(e) => handleUpdateTodoText(todo.id, e.target.value)}
                        className={`flex-1 bg-transparent text-sm text-stone-700 border-none outline-none focus:bg-stone-100/70 rounded px-2 py-1 transition-colors ${ /* ✅ CHANGED: stone colors */
                          todo.checked ? 'line-through text-stone-500' : ''
                        }`}
                        placeholder="Enter task..."
                      />
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>


                {/* Add new todo */}
                <div className="flex gap-2 pt-2 border-t border-stone-300/40"> {/* ✅ CHANGED: stone border */}
                  <input 
                    type="text" 
                    placeholder="Add new task..." 
                    value={newTodoText} 
                    onChange={(e) => setNewTodoText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-45 bg-stone-100 text-stone-700 text-sm rounded px-3 py-2 border border-stone-300 focus:border-blue-500 focus:outline-none" /* ✅ CHANGED: stone colors, blue focus */
                  />
                  <button
                    onClick={handleAddTodo}
                    disabled={!newTodoText.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-stone-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium transition-colors" /* ✅ CHANGED: dull blue button */
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
            className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 p-3 bg-blue-400/20 backdrop-blur-sm border border-blue-400/40 rounded-full text-blue-600 hover:bg-blue-400/30 transition-all duration-300 shadow-lg" /* ✅ CHANGED: dull blue floating button */
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};


export default Dashboard;
