const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // npm install node-fetch
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Your NewsAPI key
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'f1eba614de4842ffa2e1fb0c31d859e5';
const NEWS_BASE_URL = 'https://newsapi.org/v2';

// Enable CORS for your frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5000', 'http://localhost:8080', 'https://pierre.1y4acne4tzya.us-east.codeengine.appdomain.cloud/'], // Add your Code Engine frontend URL
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'News API Backend is running' });
});

// Top Headlines endpoint
app.get('/api/news/top-headlines', async (req, res) => {
  try {
    const { country = 'in', category = 'business', pageSize = 3 } = req.query;
    
    console.log('Fetching top headlines:', { country, category, pageSize });
    
    const url = `${NEWS_BASE_URL}/top-headlines?country=${country}&category=${category}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('NewsAPI Error:', data);
      return res.status(response.status).json({ 
        error: data.message || 'NewsAPI Error',
        status: 'error'
      });
    }
    
    console.log('Top headlines fetched successfully:', data.articles?.length || 0, 'articles');
    res.json(data);
    
  } catch (error) {
    console.error('Top headlines error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch top headlines',
      status: 'error'
    });
  }
});

// Everything endpoint
app.get('/api/news/everything', async (req, res) => {
  try {
    const { 
      q, 
      language = 'en', 
      domains, 
      sortBy = 'publishedAt', 
      pageSize = 3 
    } = req.query;
    
    console.log('Fetching everything:', { q, language, domains, sortBy, pageSize });
    
    let url = `${NEWS_BASE_URL}/everything?q=${encodeURIComponent(q)}&language=${language}&sortBy=${sortBy}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;
    
    if (domains) {
      url += `&domains=${domains}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('NewsAPI Error:', data);
      return res.status(response.status).json({ 
        error: data.message || 'NewsAPI Error',
        status: 'error'
      });
    }
    
    console.log('Everything fetched successfully:', data.articles?.length || 0, 'articles');
    res.json(data);
    
  } catch (error) {
    console.error('Everything endpoint error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch news',
      status: 'error'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    status: 'error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    status: 'error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 News Backend Server running on port ${PORT}`);
  console.log(`📰 NewsAPI Key configured: ${NEWS_API_KEY ? 'Yes' : 'No'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});
