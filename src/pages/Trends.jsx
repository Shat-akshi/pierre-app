

import React, { useState, useEffect } from 'react';
import { Download, ChevronLeft, ChevronRight, X, Search, Building2 } from 'lucide-react';

const TrendAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [apiHealth, setApiHealth] = useState(null);
  
  // Competitor landscape state
  const [showCompetitorLandscape, setShowCompetitorLandscape] = useState(false);
  const [competitorLandscape, setCompetitorLandscape] = useState(null);
  const [loadingCompetitors, setLoadingCompetitors] = useState(false);
  
  // Individual articles state
  const [showIndividualArticles, setShowIndividualArticles] = useState(false);
  
  // Company-specific search state
  const [showCompanySearch, setShowCompanySearch] = useState(false);
  const [companySearchModal, setCompanySearchModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyInsights, setCompanyInsights] = useState(null);
  const [loadingCompanyInsights, setLoadingCompanyInsights] = useState(false);
  
  // PPT generation state
  const [loadingPPT, setLoadingPPT] = useState(false);
  const [showPPTPreview, setShowPPTPreview] = useState(false);
  const [pptData, setPptData] = useState(null);
  
  // const [filters, setFilters] = useState({
  //   industry: 'Financial services',
  //   use_case: 'AI & Machine Learning',
  //   region: 'Asia'
  // });
  const [filters, setFilters] = useState({
    industry: '',
    use_case: '',
    region: ''
  });

  // Improved text formatting function to properly handle bullet points
  const formatText = (text) => {
    if (!text) return '';
    
    // Step 1: Convert **bold** to <strong>bold</strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Step 2: First, identify actual bullet points (starting with - or *)
    // and add proper list markup
    let lines = formatted.split('\n');
    
    // Process lines to create proper HTML lists
    let inList = false;
    let processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      
      // Check if line is a bullet point
      if (line.startsWith('- ') || line.startsWith('* ')) {
        // Remove the bullet character
        let content = line.substring(2).trim();
        
        // Start new list if we're not in one
        if (!inList) {
          processedLines.push('<ul class="list-disc pl-5 space-y-1">');
          inList = true;
        }
        
        // Add list item
        processedLines.push(`<li>${content}</li>`);
      } else {
        // Close list if we were in one
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        
        // Add the regular line
        if (line) {
          processedLines.push(line);
        }
      }
    }
    
    // Close any open list
    if (inList) {
      processedLines.push('</ul>');
    }
    
    formatted = processedLines.join('\n');
    
    // Convert remaining line breaks to <br> tags, but not inside lists
    formatted = formatted.replace(/(?<!<\/li>|<\/ul>)\n(?!<ul|<li)/g, '<br>');
    
    return formatted;
  };

  // Simulate loading phases
  const simulateLoadingPhases = () => {
    setLoadingProgress(0);
    setLoadingPhase('Collecting links from news sources...');
    
    const phases = [
      { phase: 'Collecting links from news sources...', duration: 2000 },
      { phase: 'Scraping articles...', duration: 4000 },
      { phase: 'Pre-filtering relevant content...', duration: 3000 },
      { phase: 'Analyzing articles with AI...', duration: 10000 },
      { phase: 'Generating market insights...', duration: 5000 },
    ];
    
    let totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
    let cumulativeTime = 0;
    
    phases.forEach((phase, index) => {
      setTimeout(() => {
        setLoadingPhase(phase.phase);
        setLoadingProgress(Math.floor((cumulativeTime / totalDuration) * 100));
      }, cumulativeTime);
      
      cumulativeTime += phase.duration;
    });
    
    // Final progress update
    setTimeout(() => {
      setLoadingProgress(95); // Leave the last 5% for server response
    }, cumulativeTime);
  };

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      setApiHealth(data);
    } catch (err) {
      setApiHealth({ status: 'error', message: 'API not reachable' });
    }
  };

  const testComponents = async () => {
    setLoading(true);
    setError(null);
    simulateLoadingPhases();
    
    try {
      const response = await fetch('http://localhost:5000/api/test-components');
      const data = await response.json();
      setResults({ type: 'test', data });
    } catch (err) {
      setError(`Test failed: ${err.message}`);
    } finally {
      setLoading(false);
      setLoadingProgress(0);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setShowCompetitorLandscape(false);
    setCompetitorLandscape(null);
    setShowIndividualArticles(false);
    setShowCompanySearch(false);
    setCompanyInsights(null);
    
    simulateLoadingPhases();

    try {
      const response = await fetch('http://localhost:5000/api/analyze-trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setLoadingProgress(100);
      setResults({ type: 'analysis', data });
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Improved parsing function for insights
  const parseInsights = (insightsText) => {
    if (!insightsText) return {};
    
    const sections = {
      executive: 'EXECUTIVE SUMMARY',
      painPoints: 'TOP PAIN POINTS',
      opportunities: 'KEY OPPORTUNITIES',
      trends: 'EMERGING TRENDS'
    };
    
    const result = {};
    
    Object.entries(sections).forEach(([key, heading]) => {
      const regex = new RegExp(`${heading}[:\\s]*(.*?)(?=\\d+\\.\\s*[A-Z]|$)`, 's');
      const match = insightsText.match(regex);
      
      if (match && match[1]) {
        const content = match[1].trim();
        const bulletPointsRegex = /^[-*]\s+(.*?)$/gm;
        const bulletPoints = [];
        let bulletMatch;
        
        while ((bulletMatch = bulletPointsRegex.exec(content)) !== null) {
          if (bulletMatch[1].trim()) {
            bulletPoints.push(bulletMatch[1].trim());
          }
        }
        
        result[key] = {
          title: heading,
          points: bulletPoints.length > 0 ? bulletPoints : [content]
        };
      }
    });
    
    return result;
  };
  
  // Improved parsing function for competitor landscape
  const parseCompetitorLandscape = (landscapeText) => {
    if (!landscapeText) return {};
    
    const sections = {
      keyPlayers: 'KEY PLAYERS',
      strategies: 'COMPETITIVE STRATEGIES',
      opportunities: 'IBM POSITIONING OPPORTUNITIES'
    };
    
    const result = {};
    
    Object.entries(sections).forEach(([key, heading]) => {
      const regex = new RegExp(`${heading}[:\\s]*(.*?)(?=\\d+\\.\\s*[A-Z]|$)`, 's');
      const match = landscapeText.match(regex);
      
      if (match && match[1]) {
        const content = match[1].trim();
        const bulletPointsRegex = /^[-*]\s+(.*?)$/gm;
        const bulletPoints = [];
        let bulletMatch;
        
        while ((bulletMatch = bulletPointsRegex.exec(content)) !== null) {
          if (bulletMatch[1].trim()) {
            bulletPoints.push(bulletMatch[1].trim());
          }
        }
        
        result[key] = {
          title: heading,
          points: bulletPoints.length > 0 ? bulletPoints : [content]
        };
      }
    });
    
    return result;
  };

  // Generate competitor landscape
  const generateCompetitorLandscape = async () => {
    if (!results || !results.data || !results.data.results || results.data.results.length < 2) {
      alert("Need at least 2 analyzed articles to generate competitor landscape");
      return;
    }
    
    setLoadingCompetitors(true);
    setLoadingPhase('Analyzing competitor landscape...');
    
    try {
      const response = await fetch('http://localhost:5000/api/generate-competitor-landscape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article_summaries: results.data.results,
          industry: filters.industry,
          use_case: filters.use_case,
          region: filters.region
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate competitor landscape');
      }

      setCompetitorLandscape(data.competitor_landscape);
      setShowCompetitorLandscape(true);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoadingCompetitors(false);
    }
  };

  // Search for company-specific insights
  const searchCompanyInsights = async () => {
    if (!companyName.trim()) {
      alert("Please enter a company name");
      return;
    }
    
    setLoadingCompanyInsights(true);
    setCompanySearchModal(false);
    setLoadingPhase(`Analyzing trends for ${companyName}...`);
    
    try {
      const response = await fetch('http://localhost:5000/api/company-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: companyName,
          industry: filters.industry,
          use_case: filters.use_case,
          region: filters.region
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to get insights for ${companyName}`);
      }

      setCompanyInsights(data);
      setShowCompanySearch(true);
    } catch (err) {
      alert(`Error: ${err.message}`);
      setShowCompanySearch(false);
    } finally {
      setLoadingCompanyInsights(false);
    }
  };

  const clearCache = async () => {
    try {
      await fetch('http://localhost:5000/api/clear-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters }),
      });
      alert('Cache cleared for current filters!');
    } catch (err) {
      alert('Failed to clear cache');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Toggle individual articles visibility
  const toggleIndividualArticles = () => {
    setShowIndividualArticles(prev => !prev);
    if (showCompanySearch) setShowCompanySearch(false);
  };

  // Toggle company search modal
  const toggleCompanySearchModal = () => {
    setCompanySearchModal(prevState => !prevState);
    if (companySearchModal) setCompanyName('');
  };

  // Toggle company insights view
  const toggleCompanySearch = () => {
    if (showIndividualArticles) setShowIndividualArticles(false);
    setShowCompanySearch(prev => !prev);
  };

  // Generate and preview PowerPoint
  const generatePowerPoint = async () => {
    if (!results || !results.data) {
      alert("Please run analysis first to generate PowerPoint");
      return;
    }
    
    setLoadingPPT(true);
    setLoadingPhase('Generating PowerPoint presentation with charts and statistics...');
    
    try {
      const response = await fetch('http://localhost:5000/api/generate-ppt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aggregate_insights: results.data.aggregate_insights,
          competitor_landscape: competitorLandscape,
          company_insights: companyInsights,
          filters: filters
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate PowerPoint');
      }

      setPptData(data);
      setShowPPTPreview(true);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoadingPPT(false);
    }
  };

  // Download PowerPoint file
  const downloadPowerPoint = () => {
    if (!pptData) return;
    
    const link = document.createElement('a');
    link.href = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${pptData.ppt_data}`;
    link.download = pptData.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('PowerPoint presentation downloaded successfully!');
  };

  // Close PPT preview
  const closePPTPreview = () => {
    setShowPPTPreview(false);
    setPptData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Centered Gradient Heading */}
        <div className="text-center mb-12 py-8">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent mb-4 drop-shadow-lg">
            Market Trend Analyzer
          </h1>

          <div className="w-32 h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto mb-6 rounded-full shadow-lg"></div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Analyze market trends using AI-powered insights from financial news sources
          </p>
        </div>

        {/* API Health Status */}
        <div className="mb-8 p-5 rounded-lg border bg-gray-900/70 border-gray-700 shadow-md backdrop-blur-sm transition-all duration-300">
          <h3 className="font-semibold mb-2 text-white text-lg flex items-center gap-2">
            <span className="text-blue-400">🔌</span> API Status
          </h3>
          {apiHealth ? (
            <div className={`flex items-center gap-2 ${
              apiHealth.status === 'healthy' ? 'text-blue-400' : 'text-red-400'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                apiHealth.status === 'healthy' ? 'bg-blue-400' : 'bg-red-400'
              }`} />
              <span>{apiHealth.message}</span>
            </div>
          ) : (
            <div className="text-gray-400">Checking API status...</div>
          )}
        </div>

        {/* Filters */}
<div className="mb-8 p-5 rounded-lg bg-gray-900/70 border border-gray-700 shadow-md backdrop-blur-sm">
  <h3 className="font-semibold mb-4 text-white text-lg flex items-center gap-2">
    <span className="text-blue-400">🔍</span>
    Analysis Filters
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-300">
        Industry
      </label>
      <select
        value={filters.industry}
        onChange={(e) => handleFilterChange('industry', e.target.value)}
        className="w-full p-2 border rounded-md transition-colors bg-black border-gray-600 text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
      >
        <option value="" disabled>Select Industry</option>
        <option value="Financial services">Financial services</option>
        <option value="Technology">Technology</option>
        <option value="Healthcare">Healthcare</option>
      </select>
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-300">
        Use Case
      </label>
      <select
        value={filters.use_case}
        onChange={(e) => handleFilterChange('use_case', e.target.value)}
        className="w-full p-2 border rounded-md transition-colors bg-black border-gray-600 text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
      >
        <option value="" disabled>Select Use Case</option>
        <option value="AI & Machine Learning">AI & Machine Learning</option>
        <option value="Automation">Automation</option>
      </select>
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-300">
        Region
      </label>
      <select
        value={filters.region}
        onChange={(e) => handleFilterChange('region', e.target.value)}
        className="w-full p-2 border rounded-md transition-colors bg-black border-gray-600 text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
      >
        <option value="" disabled>Select Region</option>
        <option value="Asia">Asia</option>
        <option value="Europe">Europe</option>
      </select>
    </div>
  </div>
</div>


        {/* Action Buttons */}
        <div className="mb-8 flex gap-5 flex-wrap justify-center">
          <button
            onClick={testComponents}
            disabled={loading}
            className="px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40"
          >
            {loading ? '🔄 Testing...' : 'Test Components'}
          </button>
          
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-400/40"
          >
            {loading ? '🔄 Analyzing...' : 'Run Full Analysis'}
          </button>

          <button
            onClick={clearCache}
            disabled={loading}
            className="px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
          >
            Clear Cache
          </button>
        </div>

        {/* Enhanced Loading State */}
        {loading && (
          <div className="text-center py-8 px-4 rounded-lg border bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-blue-400 text-xs">{loadingProgress}%</span>
                </div>
              </div>
              
              <div className="mt-6 mb-2 text-lg font-medium text-blue-300">{loadingPhase}</div>
              
              <div className="w-full max-w-md bg-gray-800 rounded-full h-2.5 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2.5 rounded-full transition-all duration-500" 
                     style={{ width: `${loadingProgress}%` }}></div>
              </div>
              
              <p className="text-gray-400 text-sm mt-2">Processing time may vary (typically 1-3 minutes)</p>
              <div className="mt-4 grid grid-cols-5 gap-2 text-xs text-gray-400">
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full mb-1 ${loadingProgress >= 20 ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
                  <span>Collecting</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full mb-1 ${loadingProgress >= 40 ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
                  <span>Scraping</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full mb-1 ${loadingProgress >= 60 ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
                  <span>Filtering</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full mb-1 ${loadingProgress >= 80 ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
                  <span>Analyzing</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full mb-1 ${loadingProgress >= 95 ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
                  <span>Insights</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border bg-red-900/30 border-red-500/50 backdrop-blur-sm">
            <h3 className="font-semibold mb-2 text-red-400">❌ Error</h3>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="space-y-6">
            {results.type === 'test' && (
              <div className="p-4 rounded-lg border bg-blue-900/30 border-blue-500/50 backdrop-blur-sm">
                <h3 className="font-semibold mb-4 text-blue-400">🧪 Component Test Results</h3>
                <pre className="text-sm whitespace-pre-wrap text-blue-300">
                  {JSON.stringify(results.data, null, 2)}
                </pre>
              </div>
            )}

            {results.type === 'analysis' && (
              <div className="space-y-8">
                {/* Stats */}
                <div className="p-5 rounded-lg border bg-blue-900/30 border-blue-700/50 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-blue-900/40">
                  <h3 className="font-semibold mb-3 text-blue-300 text-lg flex items-center gap-2">
                    <span className="text-blue-200">📈</span> Analysis Statistics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-blue-300">Articles Processed:</span>
                      <span className="font-semibold ml-2">{results.data.stats.total_articles_fetched}</span>
                    </div>
                    <div>
                      <span className="text-blue-300">Analysis Time:</span>
                      <span className="font-semibold ml-2">{results.data.stats.timing.total.toFixed(1)}s</span>
                    </div>
                  </div>
                </div>

                {/* Aggregate Insights Section */}
                {results.data.aggregate_insights && (
                  <div className="p-6 rounded-xl border bg-gradient-to-br from-blue-900/40 to-blue-800/60 border-blue-600/30 shadow-xl backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-5 flex items-center gap-2 text-blue-200 border-b border-blue-700/40 pb-3">
                      <span className="text-blue-300">🎯</span> Sales Pitch Insights: {results.data.aggregate_insights.industry} + {results.data.aggregate_insights.use_case} in {results.data.aggregate_insights.region}
                    </h3>
                    
                    <div className="text-sm mb-5 text-blue-300 italic">
                      Based on all articles scraped
                    </div>
                    
                    {/* Parse and display insights as cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(parseInsights(results.data.aggregate_insights.insights)).map(([key, section], index) => (
                        <div key={key} className="p-5 rounded-lg shadow-lg bg-black/60 border-2 border-white hover:border-blue-500/60 transition-all duration-300 transform hover:-translate-y-1">
                          <h4 className="font-bold text-white mb-3 pb-2 border-b border-white">{section.title}</h4>
                          
                          <ul className="list-disc pl-5 space-y-2 text-gray-100">
                            {section.points.map((point, i) => (
                              <li key={i} className="text-gray-200 text-base md:text-lg leading-relaxed" 
                                  dangerouslySetInnerHTML={{ __html: formatText(point) }} />
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-7 text-sm p-4 rounded-lg text-blue-200 bg-blue-900/50 backdrop-blur-sm border border-blue-700/30">
                      <p className="flex items-center gap-2">
                        <span className="text-lg">💡</span> 
                        <strong>Sales Tip:</strong> Use these insights to understand market pain points and position IBM solutions effectively in your pitch!
                      </p>
                    </div>
                    
                    <div className="mt-7">
                      <button
                        onClick={generateCompetitorLandscape}
                        disabled={loadingCompetitors || results.data.results.length < 2}
                        className="px-6 py-3 rounded-lg disabled:opacity-50 transition-all duration-300 bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25 hover:shadow-purple-500/40 flex items-center gap-2 font-medium"
                      >
                        {loadingCompetitors ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                            Analyzing Competitors...
                          </>
                        ) : (
                          <>
                            <Building2 className="h-5 w-5" />
                            Generate Competitor Landscape
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Competitor Landscape */}
                {showCompetitorLandscape && competitorLandscape && (
                  <div className="p-6 rounded-xl border bg-gradient-to-br from-purple-900/40 to-indigo-900/60 border-purple-600/30 shadow-xl backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-5 flex items-center gap-2 text-purple-200 border-b border-purple-700/40 pb-3">
                      <span className="text-purple-300">🏆</span> Competitor Landscape: {competitorLandscape.industry} + {competitorLandscape.use_case} in {competitorLandscape.region}
                    </h3>
                    
                    <div className="text-sm mb-5 text-purple-300 italic">
                      Based on all articles scraped
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {Object.entries(parseCompetitorLandscape(competitorLandscape.landscape)).map(([key, section], index) => (
                        <div key={key} className="p-5 rounded-lg shadow-lg bg-black/60 border-2 border-white hover:border-purple-500/60 transition-all duration-300 transform hover:-translate-y-1">
                          <h4 className="font-semibold text-white mb-3 pb-2 border-b border-white">{section.title}</h4>
                          
                          <ul className="list-disc pl-5 space-y-2 text-gray-100">
                            {section.points.map((point, i) => (
                              <li key={i} className="text-gray-200 text-base md:text-lg leading-relaxed" 
                                  dangerouslySetInnerHTML={{ __html: formatText(point) }} />
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Display Options Buttons */}
                {results.data.results && results.data.results.length > 0 && (
                  <div className="flex justify-center gap-4 flex-wrap">
                    <button
                      onClick={toggleIndividualArticles}
                      className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium ${
                        showIndividualArticles 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white border border-blue-400' 
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40'
                      }`}
                    >
                      <ChevronRight className="h-5 w-5" />
                      {showIndividualArticles ? 'Hide Individual Articles' : 'Show Individual Articles'}
                    </button>

                    <button
                      onClick={toggleCompanySearchModal}
                      className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium ${
                        showCompanySearch 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white border border-green-400' 
                          : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/25 hover:shadow-green-500/40'
                      }`}
                      disabled={loadingCompanyInsights}
                    >
                      <Search className="h-5 w-5" />
                      {loadingCompanyInsights ? 'Searching...' : 'Company-Specific Analysis'}
                    </button>

                    <button
                      onClick={generatePowerPoint}
                      className="px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg shadow-orange-600/25 hover:shadow-orange-500/40"
                      disabled={loadingPPT}
                    >
                      <Download className="h-5 w-5" />
                      {loadingPPT ? 'Generating...' : 'Generate Sales Presentation'}
                    </button>
                  </div>
                )}

                {/* Company Search Modal */}
                {companySearchModal && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-blue-500 rounded-xl p-6 max-w-md w-full m-4">
                      <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-400" />
                        Company Analysis
                      </h3>
                      
                      <p className="text-gray-300 mb-4">
                        Enter a company name to analyze trends specific to that organization.
                      </p>
                      
                      <div className="mb-4">
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Enter company name (e.g., Microsoft, IBM)"
                          className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="flex gap-3 justify-end">
                        <button 
                          onClick={toggleCompanySearchModal}
                          className="px-4 py-2 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800"
                        >
                          Cancel
                        </button>
                        
                        <button
                          onClick={searchCompanyInsights}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50"
                          disabled={!companyName.trim()}
                        >
                          Search
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Company Insights Display */}
                {showCompanySearch && companyInsights && (
                  <div className="p-6 rounded-xl border bg-gradient-to-br from-green-900/40 to-emerald-900/60 border-green-600/30 shadow-xl backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-5 flex items-center gap-2 text-green-200 border-b border-green-700/40 pb-3">
                      <span className="text-green-300">🏢</span> Company Analysis: {companyInsights.company_name}
                    </h3>
                    
                    <div className="text-sm mb-5 text-green-300 italic">
                      Based on recent news and market trends
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-5 rounded-lg shadow-lg bg-black/60 border-2 border-white hover:border-green-500/60 transition-all duration-300 transform hover:-translate-y-1">
                        <h4 className="font-bold text-white mb-3 pb-2 border-b border-white">KEY INITIATIVES</h4>
                        <ul className="list-disc pl-5 space-y-2 text-gray-100">
                          {companyInsights.initiatives.map((point, i) => (
                            <li key={i} className="text-gray-200 text-base md:text-lg leading-relaxed" 
                                dangerouslySetInnerHTML={{ __html: formatText(point) }} />
                          ))}
                        </ul>
                      </div>
                      
                      <div className="p-5 rounded-lg shadow-lg bg-black/60 border-2 border-white hover:border-green-500/60 transition-all duration-300 transform hover:-translate-y-1">
                        <h4 className="font-bold text-white mb-3 pb-2 border-b border-white">MARKET POSITION</h4>
                        <ul className="list-disc pl-5 space-y-2 text-gray-100">
                          {companyInsights.market_position.map((point, i) => (
                            <li key={i} className="text-gray-200 text-base md:text-lg leading-relaxed" 
                                dangerouslySetInnerHTML={{ __html: formatText(point) }} />
                          ))}
                        </ul>
                      </div>
                      
                      <div className="p-5 rounded-lg shadow-lg bg-black/60 border-2 border-white hover:border-green-500/60 transition-all duration-300 transform hover:-translate-y-1">
                        <h4 className="font-bold text-white mb-3 pb-2 border-b border-white">STRENGTHS & OPPORTUNITIES</h4>
                        <ul className="list-disc pl-5 space-y-2 text-gray-100">
                          {companyInsights.strengths.map((point, i) => (
                            <li key={i} className="text-gray-200 text-base md:text-lg leading-relaxed" 
                                dangerouslySetInnerHTML={{ __html: formatText(point) }} />
                          ))}
                        </ul>
                      </div>
                      
                      <div className="p-5 rounded-lg shadow-lg bg-black/60 border-2 border-white hover:border-green-500/60 transition-all duration-300 transform hover:-translate-y-1">
                        <h4 className="font-bold text-white mb-3 pb-2 border-b border-white">SALES CONVERSATION STARTERS</h4>
                        <ul className="list-disc pl-5 space-y-2 text-gray-100">
                          {companyInsights.conversation_starters.map((point, i) => (
                            <li key={i} className="text-gray-200 text-base md:text-lg leading-relaxed" 
                                dangerouslySetInnerHTML={{ __html: formatText(point) }} />
                          ))}
                        </ul>
                      </div>
                    </div>

                    {companyInsights.related_articles && companyInsights.related_articles.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-lg text-green-200 mb-3">Recent News</h4>
                        <div className="space-y-2">
                          {companyInsights.related_articles.map((article, i) => (
                            <a 
                              key={i} 
                              href={article.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block p-3 rounded-lg bg-black/50 hover:bg-black/70 border border-green-900/30 hover:border-green-500/50 transition-all duration-300"
                            >
                              <div className="font-medium text-green-300">{article.title}</div>
                              <div className="text-xs text-green-100/70 mt-1">{article.source} • {article.date}</div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Individual Articles */}
                <div className="space-y-5">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-white border-b border-gray-700/50 pb-3">
                    <span className="text-blue-300">📊</span> Individual Market Trends 
                    {results.data.results && results.data.results.length > 0 && (
                      <span className="ml-2 text-sm font-normal text-gray-400">
                        (Top {results.data.results.length} most relevant)
                      </span>
                    )}
                  </h3>
                  
                  {showIndividualArticles && (
                    results.data.results.length === 0 ? (
                      <div className="p-6 rounded-lg border bg-yellow-900/30 border-yellow-500/40 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-2">⚠️</span>
                          <h4 className="font-semibold text-yellow-400">No Relevant Trends Found</h4>
                        </div>
                        <p className="mb-3 text-yellow-300">
                          No articles were found that are relevant to the specified criteria:
                        </p>
                        <ul className="list-disc list-inside mb-3 text-yellow-300">
                          <li>Industry: <strong>{filters.industry}</strong></li>
                          <li>Use Case: <strong>{filters.use_case}</strong></li>
                          <li>Region: <strong>{filters.region}</strong></li>
                        </ul>
                        <p className="text-sm text-yellow-300">
                          Try broadening your search criteria or check if there are recent articles covering this specific combination.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {results.data.results.map((result, index) => (
                          <div key={index} className="p-6 border rounded-lg shadow-lg transition-all duration-300 bg-gray-900/60 border-gray-700/50 hover:bg-gray-800/70 hover:border-blue-500/50 backdrop-blur-sm transform hover:-translate-y-1">
                            <h4 className="font-semibold text-xl mb-4 text-white border-b border-blue-500 pb-2 flex items-center gap-2">
                              <span className="text-blue-300">📰</span> {result.title}
                            </h4>
                            
                            <div 
                              className="prose mb-5 max-w-none text-gray-200 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>strong]:font-semibold [&>strong]:text-white"
                              dangerouslySetInnerHTML={{ 
                                __html: formatText(result.summary) 
                              }}
                            />
                            
                            <a
                              href={result.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm font-medium transition-colors text-blue-400 hover:text-blue-300 border border-blue-800/30 hover:border-blue-500/50 py-2 px-4 rounded-lg"
                            >
                              🔗 Read full article
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PowerPoint Preview Modal */}
        {showPPTPreview && pptData && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-orange-500/20 bg-gradient-to-r from-orange-900/20 to-red-900/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Download className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Sales Presentation Ready</h2>
                    <p className="text-sm text-gray-300">Professional PowerPoint with charts and insights</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={downloadPowerPoint}
                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg transition-all duration-300 flex items-center gap-2 font-medium shadow-lg"
                  >
                    <Download className="h-4 w-4" />
                    Download PPT
                  </button>
                  <button
                    onClick={closePPTPreview}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content Preview */}
              <div className="p-8">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 bg-clip-text text-transparent">
                    Sales Presentation Generated
                  </h1>
                  <p className="text-xl text-gray-300 mb-6">
                    Professional PowerPoint with market insights, charts, and sales-focused content
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-900/30 to-blue-800/50 border border-blue-500/30">
                    <div className="text-2xl mb-2">📊</div>
                    <h3 className="font-semibold text-white mb-2">Market Analytics</h3>
                    <p className="text-sm text-gray-300">Charts and statistics showing market trends and opportunities</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-900/30 to-purple-800/50 border border-purple-500/30">
                    <div className="text-2xl mb-2">🎯</div>
                    <h3 className="font-semibold text-white mb-2">Sales Insights</h3>
                    <p className="text-sm text-gray-300">Targeted talking points and conversation starters</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-900/30 to-green-800/50 border border-green-500/30">
                    <div className="text-2xl mb-2">🏆</div>
                    <h3 className="font-semibold text-white mb-2">Competitive Edge</h3>
                    <p className="text-sm text-gray-300">Competitor analysis and positioning strategies</p>
                  </div>
                </div>

                {/* Metadata */}
                {pptData.metadata && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <h4 className="font-semibold text-white mb-3">Presentation Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Slides:</span>
                        <span className="ml-2 text-white font-medium">{pptData.metadata.slides_count}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">File Size:</span>
                        <span className="ml-2 text-white font-medium">{pptData.metadata.file_size_mb?.toFixed(1)} MB</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Generated:</span>
                        <span className="ml-2 text-white font-medium">{pptData.metadata.generation_time?.toFixed(1)}s</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Format:</span>
                        <span className="ml-2 text-white font-medium">PowerPoint (.pptx)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Call to Action */}
                <div className="text-center mt-8">
                  <p className="text-gray-400 mb-4">
                    Your professional sales presentation is ready for download
                  </p>
                  <button
                    onClick={downloadPowerPoint}
                    className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg transition-all duration-300 flex items-center gap-3 font-medium shadow-lg mx-auto text-lg"
                  >
                    <Download className="h-6 w-6" />
                    Download Sales Presentation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <div className="mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-bold">
              Market Trend Analyzer
            </span>
          </div>
          <p>© 2025 - Powered by AI and Data Analysis</p>
          <p className="mt-1">✨ Optimized for real-time financial market insights ✨</p>
        </footer>
      </div>
    </div>
  );
};

export default TrendAnalyzer;

