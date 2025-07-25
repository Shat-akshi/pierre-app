
import React, { useState, useEffect, useRef } from 'react';

const Scope = () => {
  // State management
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [globalCaseStudies, setGlobalCaseStudies] = useState([]);
  const [bookmarkedCaseStudies, setBookmarkedCaseStudies] = useState([]);
  const [originalPitchContent, setOriginalPitchContent] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});
  const [hasMarketInsights, setHasMarketInsights] = useState(false);
  const [hasCompanyInsights, setHasCompanyInsights] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [stickyNotes, setStickyNotes] = useState([]);
  const [noteIdCounter, setNoteIdCounter] = useState(1);
  const [storedMarketInsights, setStoredMarketInsights] = useState(null);
  const [storedCompanyInsights, setStoredCompanyInsights] = useState(null);
  
  // Deal management state
  const [currentDealId, setCurrentDealId] = useState(null);
  const [currentDealName, setCurrentDealName] = useState(null);
  const [deals, setDeals] = useState({});
  const [dealIdCounter, setDealIdCounter] = useState(1);
  
  // UI state
  const [showDealSidebar, setShowDealSidebar] = useState(false);
  const [showBookmarkSidebar, setShowBookmarkSidebar] = useState(false);
  const [showStickyNotes, setShowStickyNotes] = useState(false);
  const [showWorkflowSelector, setShowWorkflowSelector] = useState(true);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [showManageDealsModal, setShowManageDealsModal] = useState(false);
  const [isEditingPitch, setIsEditingPitch] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalData, setEmailModalData] = useState({ subject: '', body: '' });
  
  // Form state
  const [presalesForm, setPresalesForm] = useState({
    company: '',
    industry: '',
    region: 'World',
    prompt: ''
  });
  
  const [postsalesForm, setPostsalesForm] = useState({
    industry: '',
    region: '',
    useCase: '',
    product: '',
    prompt: '',
    pitchType: 'email',
    targetCompany: '',
    additionalContext: ''
  });
  
  const [newDealForm, setNewDealForm] = useState({
    name: '',
    client: '',
    description: ''
  });
  
  // Background processes state
  const [backgroundProcesses, setBackgroundProcesses] = useState({
    marketInsights: { isRunning: false, controller: null, completed: false },
    companyIntelligence: { isRunning: false, controller: null, completed: false }
  });
  
  // Loading states
  const [isExploring, setIsExploring] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMarketLoading, setIsMarketLoading] = useState(false);
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);
  
  // Refs
  const pitchEditorRef = useRef(null);

  // Industry and product options
  const industries = [
    'Technology Industry', 'Manufacturing', 'Financial services', 'Professional services',
    'Retail', 'Transportation', 'Energy and utilities', 'Healthcare', 
    'Media and entertainment', 'Public sector and NGOs'
  ];
  
  const products = [
    'AI and ML', 'Compute and servers', 'Analytics', 'IT automation', 'Middleware',
    'Business automation', 'Databases', 'Asset management', 'Security', 'Storage'
  ];
  
  const regions = ['World', 'Asia', 'Americas', 'Europe', 'Oceania', 'Africa'];
  
  const useCases = [
    'Digital Transformation', 'Cloud', 'Cybersecurity', 'Analytics', 'Business operations',
    'Consulting', 'IT Automation', 'Business automation', 'IT infrastructure'
  ];

  // Initialize component
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = () => {
    // Load data from localStorage
    const storedBookmarks = JSON.parse(localStorage.getItem('bookmarkedCaseStudies') || '[]');
    const storedNotes = JSON.parse(localStorage.getItem('stickyNotes') || '[]');
    const storedDeals = JSON.parse(localStorage.getItem('deals') || '{}');
    const storedDealCounter = parseInt(localStorage.getItem('dealIdCounter') || '1');
    const storedNoteCounter = parseInt(localStorage.getItem('noteIdCounter') || '1');
    
    setBookmarkedCaseStudies(storedBookmarks);
    setStickyNotes(storedNotes);
    setDeals(storedDeals);
    setDealIdCounter(storedDealCounter);
    setNoteIdCounter(storedNoteCounter);
    
    if (Object.keys(storedDeals).length === 0) {
      createDefaultDeal();
    } else {
      // KEEP: Always reset to default deal on page refresh
      const defaultDealId = Object.keys(storedDeals).find(id => 
        storedDeals[id].name === 'Default Deal'
      ) || Object.keys(storedDeals)[0];
      
      setCurrentDealId(defaultDealId);
      setCurrentDealName(storedDeals[defaultDealId].name);
      localStorage.setItem('currentDealId', defaultDealId);
      
      // KEEP: Reset all filters and state to default (don't load deal data)
      resetToDefaultState();
    }
  
  // Setup auto-save
  const interval = setInterval(() => {
    if (currentDealId) {
      saveCurrentDealData();
    }
  }, 30000);
  
  return () => clearInterval(interval);
};
const resetToDefaultState = () => {
  // Clear workflow
  setCurrentWorkflow(null);
  setShowWorkflowSelector(true);
  
  // Reset presales form
  setPresalesForm({
    company: '',
    industry: '',
    region: 'World',
    prompt: ''
  });
  setSelectedProducts([]);
  
  // Reset postsales form
  setPostsalesForm({
    industry: '',
    region: '',
    useCase: '',
    product: '',
    prompt: '',
    pitchType: 'email',
    targetCompany: '',
    additionalContext: ''
  });
  
  // Clear results and insights
  setGlobalCaseStudies([]);
  setOriginalPitchContent('');
  setBookmarkedCaseStudies([]);
  setStickyNotes([]);
  setHasMarketInsights(false);
  setHasCompanyInsights(false);
  setStoredMarketInsights(null);
  setStoredCompanyInsights(null);
};

  const createDefaultDeal = () => {
    const defaultDeal = {
      id: 1,
      name: 'Default Deal',
      client: '',
      description: 'Auto-created deal',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      currentWorkflow: null,
      presalesFilters: {
        industry: '',
        company: '',
        region: 'World',
        products: [],
        prompt: ''
      },
      postsalesFilters: {
        industry: '',
        region: '',
        useCase: '',
        product: '',
        prompt: '',
        pitchType: 'email',
        targetCompany: '',
        additionalContext: ''
      },
      globalCaseStudies: [],
      bookmarkedCaseStudies: [],
      stickyNotes: [],
      generatedPitch: '',
      marketInsights: null,
      companyInsights: null
    };
    
    const newDeals = { 1: defaultDeal };
    setDeals(newDeals);
    setCurrentDealId(1);
    setCurrentDealName('Default Deal');
    setDealIdCounter(2);
    
    localStorage.setItem('deals', JSON.stringify(newDeals));
    localStorage.setItem('dealIdCounter', '2');
    localStorage.setItem('currentDealId', '1');
  };

  const loadDealData = (dealId, dealsData) => {
    const deal = dealsData[dealId];
    if (!deal) return;
    
    setGlobalCaseStudies(deal.globalCaseStudies || []);
    setOriginalPitchContent(deal.generatedPitch || '');
    setBookmarkedCaseStudies(deal.bookmarkedCaseStudies || []);
    setStickyNotes(deal.stickyNotes || []);
    setSelectedProducts(deal.presalesFilters?.products || []);
    setStoredMarketInsights(deal.marketInsights);
    setStoredCompanyInsights(deal.companyInsights);
    
    if (deal.presalesFilters) {
      setPresalesForm(deal.presalesFilters);
    }
    
    if (deal.postsalesFilters) {
      setPostsalesForm(deal.postsalesFilters);
    }
    
   // if (deal.currentWorkflow) {
    //  setCurrentWorkflow(deal.currentWorkflow);
    //  setShowWorkflowSelector(false);
  //  }
 };

 const saveCurrentDealData = () => {
  if (!currentDealId || !deals[currentDealId]) {
    console.warn('⚠️ Cannot save: No current deal ID or deal not found');
    return;
  }
  
  const dealToSave = {
    ...deals[currentDealId],
    lastModified: new Date().toISOString(),
    currentWorkflow,
    presalesFilters: {
      company: presalesForm.company,
      industry: presalesForm.industry,
      region: presalesForm.region,
      prompt: presalesForm.prompt,
      products: selectedProducts
    },
    postsalesFilters: postsalesForm,
    globalCaseStudies,
    bookmarkedCaseStudies,
    stickyNotes,
    generatedPitch: originalPitchContent,
    marketInsights: storedMarketInsights,
    companyInsights: storedCompanyInsights
  };
  
  const updatedDeals = { ...deals, [currentDealId]: dealToSave };
  setDeals(updatedDeals);
  localStorage.setItem('deals', JSON.stringify(updatedDeals));
  
  console.log(`💾 Deal saved: ${dealToSave.name}`, {
    bookmarks: dealToSave.bookmarkedCaseStudies.length,
    notes: dealToSave.stickyNotes.length,
    caseStudies: dealToSave.globalCaseStudies.length,
    hasPitch: !!dealToSave.generatedPitch,
    workflow: dealToSave.currentWorkflow,
    hasPresalesData: !!(dealToSave.presalesFilters.company || dealToSave.presalesFilters.industry),
    hasPostsalesData: !!(dealToSave.postsalesFilters.targetCompany || dealToSave.postsalesFilters.industry)
  });
};
  const clearAllFilters = () => {
  // Clear presales filters
  setPresalesForm({
    company: '',
    industry: '',
    region: 'World',
    prompt: ''
  });
  setSelectedProducts([]);
  
  // Clear postsales filters
  setPostsalesForm({
    industry: '',
    region: '',
    useCase: '',
    product: '',
    prompt: '',
    pitchType: 'email',
    targetCompany: '',
    additionalContext: ''
  });
  
  // Clear results
  setGlobalCaseStudies([]);
  setOriginalPitchContent('');
  
  // Reset insights flags
  setHasMarketInsights(false);
  setHasCompanyInsights(false);
  setStoredMarketInsights(null);
  setStoredCompanyInsights(null);
};

// Modify selectWorkflow:
const selectWorkflow = (workflow) => {
  setCurrentWorkflow(workflow);
  setShowWorkflowSelector(false);
  clearAllFilters(); // Add this line
  
  if (currentDealId && deals[currentDealId]) {
    const updatedDeal = { ...deals[currentDealId], currentWorkflow: workflow };
    const updatedDeals = { ...deals, [currentDealId]: updatedDeal };
    setDeals(updatedDeals);
    localStorage.setItem('deals', JSON.stringify(updatedDeals));
  }
};

  const switchWorkflow = (workflow) => {
    setCurrentWorkflow(workflow);
    
    if (workflow === 'postsales') {
      updateUseCaseDisplay();
    }
  };

  // Product selection functions
  const toggleProductSelection = (product) => {
    const newSelectedProducts = selectedProducts.includes(product)
      ? selectedProducts.filter(p => p !== product)
      : [...selectedProducts, product];
    setSelectedProducts(newSelectedProducts);
  };

  const removeProduct = (product) => {
    setSelectedProducts(selectedProducts.filter(p => p !== product));
  };

  // Case study exploration
  const exploreCaseStudies = async () => {
    if (!presalesForm.industry || !presalesForm.company || selectedProducts.length === 0) {
      const missingFields = [];
      if (!presalesForm.industry) missingFields.push('Industry');
      if (!presalesForm.company) missingFields.push('Company Name');
      if (selectedProducts.length === 0) missingFields.push('Product');
      
      alert(`Please fill in the following mandatory fields:\n• ${missingFields.join('\n• ')}`);
      return;
    }
    
    setIsExploring(true);
    
    const searchQuery = {
      industry: presalesForm.industry,
      company: presalesForm.company,
      region: presalesForm.region,
      product: selectedProducts.join(','),
      prompt: presalesForm.prompt
    };
    
    setCurrentFilters(searchQuery);
    
    try {
      const response = await fetch('http://localhost:8000/explore_case_studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchQuery)
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
        return;
      }
      
      setGlobalCaseStudies(data.case_studies || []);
      
      // Start background insights generation
      setTimeout(() => {
        refreshMarketTrends();
        if (presalesForm.company) {
          setTimeout(() => {
            fetchCompanyIntelligence();
          }, 1000);
        }
      }, 500);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error exploring case studies. Please try again.');
    } finally {
      setIsExploring(false);
    }
  };

  // Market trends function
  const refreshMarketTrends = async () => {
    if (backgroundProcesses.marketInsights.isRunning) return;
    
    setBackgroundProcesses(prev => ({
      ...prev,
      marketInsights: { ...prev.marketInsights, isRunning: true }
    }));
    
    if (currentWorkflow === 'presales') {
      setIsMarketLoading(true);
    }
    
    try {
      const response = await fetch('http://localhost:8000/fetch_market_trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: presalesForm.industry || 'Technology' })
      });
      
      if (!response.ok) throw new Error('Failed to fetch trends');
      
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      const marketInsights = {
        ...data.trends.aggregate_insights,
        executive_summary: extractMarketExecutiveSummary(data.trends.aggregate_insights.insights)
      };
      
      setStoredMarketInsights(marketInsights);
      setHasMarketInsights(true);
      displayMarketInsights(marketInsights);
      
      setBackgroundProcesses(prev => ({
        ...prev,
        marketInsights: { ...prev.marketInsights, completed: true, isRunning: false }
      }));
      
    } catch (error) {
      console.error('Market trends error:', error);
      setBackgroundProcesses(prev => ({
        ...prev,
        marketInsights: { ...prev.marketInsights, isRunning: false }
      }));
    } finally {
      if (currentWorkflow === 'presales') {
        setIsMarketLoading(false);
      }
    }
  };
   // Company intelligence function
  const fetchCompanyIntelligence = async () => {
    if (!presalesForm.company || backgroundProcesses.companyIntelligence.isRunning) return;
    
    setBackgroundProcesses(prev => ({
      ...prev,
      companyIntelligence: { ...prev.companyIntelligence, isRunning: true }
    }));
    
    if (currentWorkflow === 'presales') {
      setIsCompanyLoading(true);
    }
    
    try {
      const response = await fetch('http://localhost:8000/fetch_company_intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: presalesForm.company, days_back: 7 })
      });
      
      if (!response.ok) throw new Error('Failed to fetch intelligence');
      
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      const companyInsights = {
        ...data.intelligence,
        executive_summary: data.intelligence.executive_summary || {
          bullet_points: [
            `Recent strategic developments for ${presalesForm.company}`,
            `Business opportunities identified in market analysis`,
            `Competitive positioning shows growth potential`
          ]
        }
      };
      
      setStoredCompanyInsights(companyInsights);
      setHasCompanyInsights(true);
      displayCompanyInsights(companyInsights);
      
      setBackgroundProcesses(prev => ({
        ...prev,
        companyIntelligence: { ...prev.companyIntelligence, completed: true, isRunning: false }
      }));
      
    } catch (error) {
      console.error('Company intelligence error:', error);
      setBackgroundProcesses(prev => ({
        ...prev,
        companyIntelligence: { ...prev.companyIntelligence, isRunning: false }
      }));
    } finally {
      if (currentWorkflow === 'presales') {
        setIsCompanyLoading(false);
      }
    }
  };
// Replace the existing displayMarketInsights function:
const displayMarketInsights = (insights) => {
  console.log('📊 Displaying market insights:', insights);
  
  // Only update state, don't try to manipulate DOM directly in React
  setStoredMarketInsights(insights);
  setHasMarketInsights(true);
  
  // Trigger strategic summary update
  setTimeout(() => {
    if (globalCaseStudies.length > 0) {
      // Strategic summary will auto-update when state changes
    }
  }, 100);
};

const displayCompanyInsights = (insights) => {
  console.log('🏢 Displaying company insights:', insights);
  
  // Only update state, don't try to manipulate DOM directly in React
  setStoredCompanyInsights(insights);
  setHasCompanyInsights(true);
  
  // Trigger strategic summary update
  setTimeout(() => {
    if (globalCaseStudies.length > 0) {
      // Strategic summary will auto-update when state changes
    }
  }, 100);
};
 

  // Add these new functions after displayCompanyInsights:
const parseInsightsIntoCategories = (insightsText) => {
  if (!insightsText) {
    return {
      painPoints: 'No pain points identified.',
      opportunities: 'No opportunities identified.',
      trends: 'No trends identified.'
    };
  }

  const sections = {
    painPoints: [],
    opportunities: [],
    trends: []
  };

  try {
    // Look for the structured sections in the response
    const painPointsMatch = insightsText.match(/TOP PAIN POINTS.*?\n((?:[-•]\s*.+\n?){1,3})/is);
    const opportunitiesMatch = insightsText.match(/KEY OPPORTUNITIES.*?\n((?:[-•]\s*.+\n?){1,3})/is);
    const trendsMatch = insightsText.match(/EMERGING TRENDS.*?\n((?:[-•]\s*.+\n?){1,3})/is);

    // Parse pain points
    if (painPointsMatch) {
      const painPoints = painPointsMatch[1].split('\n')
        .filter(line => line.trim() && (line.includes('-') || line.includes('•')))
        .map(line => line.replace(/^[-•]\s*/, '').trim())
        .slice(0, 3);
      sections.painPoints = painPoints;
    }

    // Parse opportunities
    if (opportunitiesMatch) {
      const opportunities = opportunitiesMatch[1].split('\n')
        .filter(line => line.trim() && (line.includes('-') || line.includes('•')))
        .map(line => line.replace(/^[-•]\s*/, '').trim())
        .slice(0, 3);
      sections.opportunities = opportunities;
    }

    // Parse trends
    if (trendsMatch) {
      const trends = trendsMatch[1].split('\n')
        .filter(line => line.trim() && (line.includes('-') || line.includes('•')))
        .map(line => line.replace(/^[-•]\s*/, '').trim())
        .slice(0, 3);
      sections.trends = trends;
    }

    // If structured parsing failed, try to extract bullet points from the entire text
    if (sections.painPoints.length === 0 && sections.opportunities.length === 0 && sections.trends.length === 0) {
      const allBullets = insightsText.split('\n')
        .filter(line => line.trim() && (line.includes('-') || line.includes('•')))
        .map(line => line.replace(/^[-•]\s*/, '').trim())
        .filter(line => line.length > 0);

      const third = Math.ceil(allBullets.length / 3);
      sections.painPoints = allBullets.slice(0, Math.min(3, third));
      sections.opportunities = allBullets.slice(third, Math.min(allBullets.length, third + 3));
      sections.trends = allBullets.slice(third * 2, Math.min(allBullets.length, third * 2 + 3));
    }

  } catch (error) {
    console.log('Error parsing structured insights:', error);
  }

  return {
    painPoints: sections.painPoints.length > 0 ? 
      sections.painPoints.map(point => `<div class="flex items-start mb-2">
        <span class="text-red-600 mr-2">•</span>
        <span>${formatBoldText(point)}</span>
      </div>`).join('') : 
      '<div class="text-slate-500 italic">No specific pain points identified</div>',
    
    opportunities: sections.opportunities.length > 0 ? 
      sections.opportunities.map(point => `<div class="flex items-start mb-2">
        <span class="text-green-600 mr-2">•</span>
        <span>${formatBoldText(point)}</span>
      </div>`).join('') : 
      '<div class="text-slate-500 italic">Market opportunities under analysis</div>',
    
    trends: sections.trends.length > 0 ? 
      sections.trends.map(point => `<div class="flex items-start mb-2">
        <span class="text-blue-600 mr-2">•</span>
        <span>${formatBoldText(point)}</span>
      </div>`).join('') : 
      '<div class="text-slate-500 italic">Emerging trends being monitored</div>'
  };
};

const formatBoldText = (text) => {
  text = text.replace(/\*\*(.*?)\*:/g, '<strong class="font-semibold">$1</strong>:');
  text = text.replace(/\*\*(.*?)\*\*:/g, '<strong class="font-semibold">$1</strong>:');
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
  text = text.replace(/\*/g, '');
  return text;
};
const cleanFormattingText = (text) => {
  if (!text) return '';
  
  // Remove ** formatting but keep the text
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  // Remove any remaining single asterisks
  text = text.replace(/\*/g, '');
  // Remove any markdown-style formatting
  text = text.replace(/_{1,2}(.*?)_{1,2}/g, '$1');
  // Clean up extra spaces
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
};
  // Pitch generation
 // Pitch generation
const generatePitch = async () => {
  setIsGenerating(true);
  
  const searchQuery = {
    industry: postsalesForm.industry,
    region: postsalesForm.region,
    useCase: postsalesForm.useCase,
    product: postsalesForm.product,
    prompt: postsalesForm.prompt
  };
  
  const pitchConfig = {
    pitch_type: postsalesForm.pitchType,
    target_company: postsalesForm.targetCompany,
    custom_context: postsalesForm.additionalContext,
    bookmarked_case_studies: bookmarkedCaseStudies,
    bookmarked_use_cases: extractUseCasesFromBookmarks()
  };
  
  try {
    let casesData;
    
    // Check if we have bookmarks or if we should use explored case studies
    if (bookmarkedCaseStudies.length === 0 && globalCaseStudies.length > 0) {
      // Use explored case studies for generalized pitch
      console.log('📊 Using explored case studies for generalized pitch');
      casesData = {
        case_studies: globalCaseStudies,
        message: 'Using explored case studies for generalized pitch'
      };
    } else if (bookmarkedCaseStudies.length > 0 || Object.values(searchQuery).some(val => val)) {
      // Use the normal find_similar_cases endpoint when we have bookmarks or search criteria
      const casesResponse = await fetch('http://localhost:8000/find_similar_cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...searchQuery,
          bookmarked_case_studies: pitchConfig.bookmarked_case_studies,
          bookmarked_use_cases: pitchConfig.bookmarked_use_cases
        })
      });
      
      if (!casesResponse.ok) throw new Error('Failed to find cases');
      
      casesData = await casesResponse.json();
      
      if (casesData.error) throw new Error(casesData.error);
    } else {
      // No bookmarks and no explored case studies
      alert('Please explore case studies first, bookmark some case studies, or fill in search criteria to generate a pitch.');
      return;
    }
    
    if (!casesData.case_studies?.length) {
      alert('No case studies found. Please try different parameters, explore case studies first, or bookmark some case studies.');
      return;
    }
    
    // Generate the pitch
    const pitchRequest = {
      case_study_results: casesData.case_studies,
      pitch_type: pitchConfig.pitch_type,
      target_info: {
        company: pitchConfig.target_company,
        industry: searchQuery.industry,
        region: searchQuery.region
      },
      custom_context: pitchConfig.custom_context,
      bookmarked_case_studies: pitchConfig.bookmarked_case_studies,
      bookmarked_use_cases: pitchConfig.bookmarked_use_cases
    };
    
    const pitchResponse = await fetch('http://localhost:8000/generate_pitch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pitchRequest)
    });
    
    if (!pitchResponse.ok) throw new Error('Failed to generate pitch');
    
    const pitchData = await pitchResponse.json();
    
    if (pitchData.error) throw new Error(pitchData.error);
    
    setOriginalPitchContent(pitchData.pitch);
    // Update global case studies with the ones used for the pitch
    setGlobalCaseStudies(casesData.case_studies);
    
  } catch (error) {
    console.error('Error generating pitch:', error);
    alert(`Error generating pitch: ${error.message}`);
  } finally {
    setIsGenerating(false);
  }
};

  // Add this function after parseInsightsIntoCategories:
const parseCompanyInsightsIntoCategories = (companyInsights) => {
  const keyInsights = companyInsights?.key_insights;
  
  if (!keyInsights) {
    return {
      developments: '<div class="text-slate-500 italic">No recent developments identified</div>',
      initiatives: '<div class="text-slate-500 italic">Strategic initiatives under analysis</div>',
      position: '<div class="text-slate-500 italic">Competitive positioning being evaluated</div>'
    };
  }

  console.log('Processing company key insights:', keyInsights);

  const sections = {
    developments: [],
    initiatives: [],
    position: []
  };

  try {
    // Extract each section with improved regex that handles blank lines
    const salesSection = keyInsights.match(/SALES_CONVERSATION_STARTERS\s*\n(.*?)(?=\n\n[A-Z_]|$)/s);
    const businessSection = keyInsights.match(/BUSINESS_OPPORTUNITIES\s*\n(.*?)(?=\n\n[A-Z_]|$)/s);
    const challengesSection = keyInsights.match(/STRATEGIC_CHALLENGES\s*\n(.*?)(?=\n\n[A-Z_]|$)/s);

    // Process each section with improved parsing
    [
      { section: salesSection, target: 'developments' },
      { section: businessSection, target: 'initiatives' },
      { section: challengesSection, target: 'position' }
    ].forEach(({ section, target }) => {
      if (section && section[1]) {
        const content = section[1].trim();
        
        // Split by ** at the start of lines, handling blank lines
        const items = content.split(/\n\s*\*\*/).filter(item => item.trim());
        
        items.forEach(item => {
          // Handle first item that might not start with **
          if (!item.startsWith('**')) {
            item = '**' + item;
          }
          
          const match = item.match(/\*\*(.*?)\*\*:\s*(.*)/s);
          if (match) {
            const title = match[1].trim();
            const description = match[2].trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ');
            sections[target].push(`<strong>${title}</strong>: ${description}`);
          }
        });
      }
    });

    console.log('Parsed company sections:', sections);

  } catch (error) {
    console.error('Error parsing company insights:', error);
  }

  return {
    developments: sections.developments.length > 0 ? 
      sections.developments.map(point => `<div class="flex items-start mb-2">
        <span class="text-purple-600 mr-2">•</span>
        <span>${point}</span>
      </div>`).join('') : 
      '<div class="text-slate-500 italic">No recent developments identified</div>',
    
    initiatives: sections.initiatives.length > 0 ? 
      sections.initiatives.map(point => `<div class="flex items-start mb-2">
        <span class="text-orange-600 mr-2">•</span>
        <span>${point}</span>
      </div>`).join('') : 
      '<div class="text-slate-500 italic">Strategic initiatives under analysis</div>',
    
    position: sections.position.length > 0 ? 
      sections.position.map(point => `<div class="flex items-start mb-2">
        <span class="text-indigo-600 mr-2">•</span>
        <span>${point}</span>
      </div>`).join('') : 
      '<div class="text-slate-500 italic">Competitive positioning being evaluated</div>'
  };
};


  // Bookmark functions
  const toggleBookmark = (caseStudyId) => {
    const caseStudy = globalCaseStudies.find(cs => String(cs.id) === String(caseStudyId));
    if (!caseStudy) return;
    
    const existingIndex = bookmarkedCaseStudies.findIndex(b => String(b.id) === String(caseStudyId));
    
    let newBookmarks;
    if (existingIndex > -1) {
      newBookmarks = bookmarkedCaseStudies.filter((_, index) => index !== existingIndex);
    } else {
      newBookmarks = [...bookmarkedCaseStudies, caseStudy];
    }
    
    setBookmarkedCaseStudies(newBookmarks);
    localStorage.setItem('bookmarkedCaseStudies', JSON.stringify(newBookmarks));
  };

  const removeBookmark = (caseStudyId) => {
    const newBookmarks = bookmarkedCaseStudies.filter(b => String(b.id) !== String(caseStudyId));
    setBookmarkedCaseStudies(newBookmarks);
    localStorage.setItem('bookmarkedCaseStudies', JSON.stringify(newBookmarks));
  };

  // Sticky notes functions
  const addStickyNote = () => {
    const newNote = {
      id: noteIdCounter,
      content: '',
      timestamp: new Date().toISOString()
    };
    
    setStickyNotes([newNote, ...stickyNotes]);
    setNoteIdCounter(noteIdCounter + 1);
    localStorage.setItem('noteIdCounter', (noteIdCounter + 1).toString());
  };

  const updateStickyNote = (noteId, content) => {
    const updatedNotes = stickyNotes.map(note => 
      note.id === noteId 
        ? { ...note, content, timestamp: new Date().toISOString() }
        : note
    );
    setStickyNotes(updatedNotes);
    localStorage.setItem('stickyNotes', JSON.stringify(updatedNotes));
  };

  const deleteStickyNote = (noteId) => {
    const updatedNotes = stickyNotes.filter(note => note.id !== noteId);
    setStickyNotes(updatedNotes);
    localStorage.setItem('stickyNotes', JSON.stringify(updatedNotes));
  };

  // Utility functions
  const extractUseCasesFromBookmarks = () => {
    if (bookmarkedCaseStudies.length === 0) return [];
    
    const useCases = new Set();
    bookmarkedCaseStudies.forEach(caseStudy => {
      if (caseStudy.use_case && caseStudy.use_case !== 'N/A') {
        caseStudy.use_case.split(',').forEach(useCase => {
          const cleanUseCase = useCase.trim();
          if (cleanUseCase && cleanUseCase !== 'N/A') {
            useCases.add(cleanUseCase);
          }
        });
      }
    });
    
    return Array.from(useCases);
  };

const extractMarketExecutiveSummary = (insightsText) => {
  if (!insightsText) return null;
  
  console.log('Extracting market executive summary from text:', insightsText.substring(0, 400) + '...');
  
const executiveSummaryPatterns = [
  /EXECUTIVE_SUMMARY_START\s*\n(.*?)EXECUTIVE_SUMMARY_END/is,
  /EXECUTIVE_SUMMARY_START\s*\n(.*?)(?:\n\n|\n(?:[0-9]+\.|[A-Z][A-Z\s]*(?:\(|:))|\n---|\Z)/is,
  /(?:^|\n)(?:1\.\s*)?EXECUTIVE SUMMARY\s*\n(.*?)(?:\n\n|\n(?:2\.|[A-Z][A-Z\s]*(?:\(|:))|\n---|\Z)/is,
  /(?:^|\n)EXECUTIVE SUMMARY\s*:?\s*\n(.*?)(?:\n\n|\n(?:[0-9]+\.|[A-Z][A-Z\s]*(?:\(|:))|\n---|\Z)/is
];
  
  let summaryMatch = null;
  for (const pattern of executiveSummaryPatterns) {
    summaryMatch = insightsText.match(pattern);
    if (summaryMatch && summaryMatch[1].trim()) {
      console.log('Found executive summary section');
      break;
    }
  }
  
  if (summaryMatch && summaryMatch[1]) {
    const summaryText = summaryMatch[1].trim();
    console.log('Raw summary text:', summaryText);
    
    // First try to extract bullet points (• or -) from the executive summary
    const bulletPoints = summaryText.split('\n')
      .filter(line => line.trim() && (line.includes('•') || line.includes('-')))
      .map(line => line.replace(/^[•-]\s*/, '').trim())
      .filter(point => point && point.length > 10) // Filter out very short points
      .slice(0, 3);
    
    if (bulletPoints.length > 0) {
      console.log('Extracted bullet points from executive summary:', bulletPoints);
      
      // Ensure exactly 3 points
      while (bulletPoints.length < 3) {
        if (bulletPoints.length === 1) {
          bulletPoints.push("Strategic technology investments driving competitive advantage");
        } else if (bulletPoints.length === 2) {
          bulletPoints.push("Emerging opportunities for digital transformation initiatives");
        }
      }
      
      return {
        bullet_points: bulletPoints.slice(0, 3)
      };
    }
    
    // Fallback: try numbered points (1. 2. 3.) from the executive summary
    const pointMatches = summaryText.match(/(\d+\.\s*[^0-9]+?)(?=\d+\.|$)/g);
    if (pointMatches) {
      const numberedPoints = pointMatches.map(point => 
        point.replace(/^\d+\.\s*/, '').trim()
      ).filter(point => point);
      
      console.log('Extracted numbered points from executive summary:', numberedPoints);
      
      if (numberedPoints.length > 0) {
        // Ensure exactly 3 points
        while (numberedPoints.length < 3) {
          if (numberedPoints.length === 1) {
            numberedPoints.push("Strategic technology investments driving competitive advantage");
          } else if (numberedPoints.length === 2) {
            numberedPoints.push("Emerging opportunities for digital transformation initiatives");
          }
        }
        
        return {
          bullet_points: numberedPoints.slice(0, 3)
        };
      }
    }
  }
  
  // Rest of your existing fallback logic remains the same...
  console.log('No executive summary section found, extracting from structured content...');
  
  const marketInsights = [];
  
  // Extract from KEY MARKET INSIGHTS section
  const marketInsightsMatch = insightsText.match(/KEY MARKET INSIGHTS.*?\n(.*?)(?:\n(?:[0-9]+\.|[A-Z][A-Z\s]*:)|\Z)/is);
  if (marketInsightsMatch) {
    const content = marketInsightsMatch[1];
    const bulletPoints = content.split('\n')
      .filter(line => line.trim() && (line.includes('-') || line.includes('•')))
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .slice(0, 2);
    
    if (bulletPoints.length > 0) {
      marketInsights.push(...bulletPoints.map(point => `Market analysis reveals ${point.toLowerCase()}`));
    }
  }
  
  // Extract from BUSINESS OPPORTUNITIES section
  const opportunitiesMatch = insightsText.match(/BUSINESS OPPORTUNITIES.*?\n(.*?)(?:\n(?:[0-9]+\.|[A-Z][A-Z\s]*:)|\Z)/is);
  if (opportunitiesMatch) {
    const content = opportunitiesMatch[1];
    const bulletPoints = content.split('\n')
      .filter(line => line.trim() && (line.includes('-') || line.includes('•')))
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .slice(0, 1);
    
    if (bulletPoints.length > 0) {
      marketInsights.push(`Key opportunities identified in ${bulletPoints[0].toLowerCase()}`);
    }
  }
  
  // If we found insights from structured sections, use them
  if (marketInsights.length > 0) {
    // Ensure exactly 3 points
    while (marketInsights.length < 3) {
      marketInsights.push("Competitive landscape reveals strategic investment priorities");
    }
    
    console.log('Extracted market insights from structured sections:', marketInsights);
    return {
      bullet_points: marketInsights.slice(0, 3)
    };
  }
  
  console.log('No market insights found, using generic fallback');
  return {
    bullet_points: [
      "Market analysis shows emerging opportunities in digital transformation",
      "Industry trends indicate accelerated technology adoption", 
      "Competitive landscape reveals strategic investment priorities"
    ]
  };
};

  const updateUseCaseDisplay = () => {
    const useCases = extractUseCasesFromBookmarks();
    if (useCases.length > 0) {
      const availableOptions = ['Digital Transformation', 'Cloud', 'Cybersecurity', 'Analytics', 'Business operations', 'Consulting', 'IT Automation', 'Business automation', 'IT infrastructure'];
      
      for (const useCase of useCases) {
        const matchingOption = availableOptions.find(option => 
          option.toLowerCase().includes(useCase.toLowerCase()) || 
          useCase.toLowerCase().includes(option.toLowerCase())
        );
        
        if (matchingOption) {
          setPostsalesForm(prev => ({ ...prev, useCase: matchingOption }));
          break;
        }
      }
    }
  };

const makePitchFromExplore = async () => {
  // Check if we have explored case studies or bookmarks
  if (globalCaseStudies.length === 0 && bookmarkedCaseStudies.length === 0) {
    alert('Please explore case studies first or bookmark some case studies before making a pitch');
    return;
  }

  // Autofill the filters
  setPostsalesForm(prev => ({
    ...prev,
    industry: presalesForm.industry,
    targetCompany: presalesForm.company,
    region: presalesForm.region,
    product: selectedProducts.length > 0 ? selectedProducts[0] : '',
    prompt: presalesForm.prompt
  }));
  
  // Switch to generate workflow
  switchWorkflow('postsales');
  
  // Generate pitch immediately without waiting for background processes
  setTimeout(async () => {
    await generatePitch();
  }, 500);
};
  // Email functions
  const sendPitchByEmail = () => {
    const subject = `${postsalesForm.pitchType.charAt(0).toUpperCase() + postsalesForm.pitchType.slice(1)} - ${postsalesForm.targetCompany || 'Prospect'}`;
    const emailBody = originalPitchContent
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/^# (.*$)/gim, '$1\n' + '='.repeat(50))
      .replace(/^## (.*$)/gim, '\n$1\n' + '-'.repeat(30))
      .trim();
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    
    try {
      window.location.href = mailtoUrl;
    } catch (error) {
      setEmailModalData({ subject, body: emailBody });
      setShowEmailModal(true);
    }
  };

  // Deal management functions
  const createNewDeal = (e) => {
  e.preventDefault();
  
  const newDeal = {
    id: dealIdCounter,
    name: newDealForm.name,
    client: newDealForm.client,
    description: newDealForm.description,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    currentWorkflow: 'presales', // Set to presales (explore) workflow
    presalesFilters: {
      industry: '',
      company: '',
      region: 'World', // Default region
      products: [], // Empty products array
      prompt: ''
    },
    postsalesFilters: {
      industry: '',
      region: '',
      useCase: '',
      product: '',
      prompt: '',
      pitchType: 'email',
      targetCompany: '',
      additionalContext: ''
    },
    globalCaseStudies: [], // Empty case studies
    bookmarkedCaseStudies: [], // Empty bookmarks
    stickyNotes: [], // Empty notes
    generatedPitch: '', // No pitch
    marketInsights: null, // No insights
    companyInsights: null // No insights
  };
  
  const updatedDeals = { ...deals, [dealIdCounter]: newDeal };
  setDeals(updatedDeals);
  setCurrentDealId(dealIdCounter);
  setCurrentDealName(newDeal.name);
  setDealIdCounter(dealIdCounter + 1);
  
  localStorage.setItem('deals', JSON.stringify(updatedDeals));
  localStorage.setItem('dealIdCounter', (dealIdCounter + 1).toString());
  localStorage.setItem('currentDealId', dealIdCounter.toString());
  
  // CHANGE: Reset all state to default when creating new deal
  resetToDefaultState();
  
  // CHANGE: Go directly to explore workflow for new deals
  setCurrentWorkflow('presales');
  setShowWorkflowSelector(false);
  
  setNewDealForm({ name: '', client: '', description: '' });
  setShowNewDealModal(false);
};

const switchDeal = (dealId) => {
  if (!dealId || String(dealId) === String(currentDealId)) {
    console.log('🚫 Switch deal cancelled: Same deal or no deal ID');
    return;
  }
  
  console.log(`🔄 Switching from deal ${currentDealId} to ${dealId}`);
  
  // Save current deal data before switching
  saveCurrentDealData();
  
  // Update current deal references
  setCurrentDealId(dealId);
  setCurrentDealName(deals[dealId].name);
  localStorage.setItem('currentDealId', dealId);
  
  // FIXED: Load the selected deal's data
  loadDealDataForOldDeal(dealId, deals);
  
  console.log(`✅ Successfully switched to deal: ${deals[dealId].name}`);
};
const loadDealDataForOldDeal = (dealId, dealsData) => {
  const deal = dealsData[dealId];
  if (!deal) {
    console.error(`❌ Deal ${dealId} not found`);
    return;
  }
  
  console.log(`🔄 Loading old deal data for: ${deal.name}`, deal);
  
  // Load case studies and results
  setGlobalCaseStudies(deal.globalCaseStudies || []);
  setOriginalPitchContent(deal.generatedPitch || '');
  
  // Load bookmarks and notes
  setBookmarkedCaseStudies(deal.bookmarkedCaseStudies || []);
  setStickyNotes(deal.stickyNotes || []);
  
  // Load insights
  setStoredMarketInsights(deal.marketInsights);
  setStoredCompanyInsights(deal.companyInsights);
  setHasMarketInsights(!!deal.marketInsights);
  setHasCompanyInsights(!!deal.companyInsights);
  
  // Load presales form data
  if (deal.presalesFilters) {
    setPresalesForm({
      company: deal.presalesFilters.company || '',
      industry: deal.presalesFilters.industry || '',
      region: deal.presalesFilters.region || 'World',
      prompt: deal.presalesFilters.prompt || ''
    });
    setSelectedProducts(deal.presalesFilters.products || []);
  } else {
    // Reset presales form if no data
    setPresalesForm({
      company: '',
      industry: '',
      region: 'World',
      prompt: ''
    });
    setSelectedProducts([]);
  }
  
  // Load postsales form data
  if (deal.postsalesFilters) {
    setPostsalesForm(deal.postsalesFilters);
  } else {
    // Reset postsales form if no data
    setPostsalesForm({
      industry: '',
      region: '',
      useCase: '',
      product: '',
      prompt: '',
      pitchType: 'email',
      targetCompany: '',
      additionalContext: ''
    });
  }
  
  // IMPORTANT: Restore workflow state
  if (deal.currentWorkflow) {
    setCurrentWorkflow(deal.currentWorkflow);
    setShowWorkflowSelector(false);
    console.log(`✅ Restored workflow: ${deal.currentWorkflow}`);
  } else {
    // If no workflow saved, show selector
    setCurrentWorkflow(null);
    setShowWorkflowSelector(true);
    console.log(`📋 No workflow saved, showing selector`);
  }
  
  // Update localStorage for backward compatibility
  localStorage.setItem('bookmarkedCaseStudies', JSON.stringify(deal.bookmarkedCaseStudies || []));
  localStorage.setItem('stickyNotes', JSON.stringify(deal.stickyNotes || []));
  
  console.log(`✅ Old deal loaded successfully: ${deal.name}`, {
    bookmarks: deal.bookmarkedCaseStudies?.length || 0,
    notes: deal.stickyNotes?.length || 0,
    caseStudies: deal.globalCaseStudies?.length || 0,
    hasPitch: !!deal.generatedPitch,
    workflow: deal.currentWorkflow,
    presalesFilters: deal.presalesFilters,
    postsalesFilters: deal.postsalesFilters
  });
};

  // Format pitch content for display
  const formatPitchContent = (content) => {
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^# (.*$)/gim, '<h1 className="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 className="text-xl font-semibold mb-3">$1</h2>');
  };

  // Render case study card
 const renderCaseStudyCard = (caseStudy, isPostsales = false) => {
  const isBookmarked = bookmarkedCaseStudies.some(b => String(b.id) === String(caseStudy.id));
  
  return (
    <div key={caseStudy.id} className="case-study-card">
      <button
        onClick={() => toggleBookmark(caseStudy.id)}
        className={`absolute top-4 right-4 w-8 h-8 rounded-md border flex items-center justify-center transition-all ${
          isBookmarked 
            ? 'bg-amber-400 border-amber-400 text-white' 
            : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
        }`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
        </svg>
      </button>
      
      {caseStudy.use_case && (
        <div className="mb-4">
          <h5 className="text-sm font-medium mb-3 text-slate-700">Use Cases</h5>
          <div className="space-y-1">
            {caseStudy.use_case.split(',').map((useCase, index) => (
              <div key={index} className="use-case-tag">
                {useCase.trim()}
              </div>
            ))}
          </div>
        </div>
      )}

      {caseStudy.key_results && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-slate-700 mb-2">Key Improvements</h5>
          <ul className="space-y-2 text-sm text-slate-600">
            {caseStudy.key_results.split(';').slice(0, 3).map((result, index) => (
              result.trim() && (
                <li key={index} className="flex items-start">
                  <span className="text-green-600 mr-2 mt-0.5">✓</span>
                  <span className="leading-relaxed">{result.trim()}</span>
                </li>
              )
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4">
        <h4 className="text-xl font-semibold text-slate-900 mb-3">{caseStudy.company || 'Unknown Company'}</h4>
        <div className="flex flex-wrap gap-2">
          {caseStudy.industry && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">{caseStudy.industry}</span>
          )}
          {caseStudy.region && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">{caseStudy.region}</span>
          )}
          {caseStudy.company_size && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">{caseStudy.company_size}</span>
          )}
        </div>
      </div>

      {caseStudy.product && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-slate-700 mb-2">Products</h5>
          <p className="text-sm text-slate-600 leading-relaxed">{caseStudy.product}</p>
        </div>
      )}

      {caseStudy.source && (
        <div className="mt-auto pt-4 border-t border-slate-200">
          <a href={caseStudy.source} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 transition-colors">
            View Details →
          </a>
        </div>
      )}
    </div>
  );
};
// Add navigation functions
const scrollToSection = (sectionId) => {
  // For React, we need to use refs or scroll to elements by class/id
  const element = document.querySelector(`#${sectionId}`) || 
                  document.querySelector(`.${sectionId}`) ||
                  document.querySelector(`[data-section="${sectionId}"]`);
  
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const scrollToCaseStudies = () => {
  const element = document.querySelector('[data-section="case-studies"]');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const scrollToMarketInsights = () => {
  const element = document.querySelector('[data-section="market-insights"]');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const scrollToPitch = () => {
  const element = document.querySelector('[data-section="generated-pitch"]');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const scrollToSimilarCases = () => {
  const element = document.querySelector('[data-section="similar-cases"]');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans hide-scrollbar" style={{ overflowY: 'auto', height: '100vh' }}>
 <style>{`
  /* CSS Variables */
  :root {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-tertiary: #334155;
    --bg-quaternary: #475569;
    --bg-off-white: #f8fafc;
    --bg-white: #ffffff;
    --bg-dark-container: #1c2431;
    --accent-blue: #3b82f6;
    --accent-blue-hover: #2563eb;
    --accent-blue-light: #dbeafe;
    --accent-red: #dc2626;
    --accent-red-light: #fef2f2;
    --accent-green: #10b981;
    --accent-green-light: #ecfdf5;
    --accent-amber: #f59e0b;
    --text-primary: #f8fafc;
    --text-secondary: #e2e8f0;
    --text-muted: #94a3b8;
    --text-dark: #1e293b;
    --glow-blue: rgba(59, 130, 246, 0.15);
    --glow-red: rgba(239, 68, 68, 0.15);
    --glow-green: rgba(16, 185, 129, 0.15);
  }

  /* Main content padding adjustment */
  body {
  overflow: auto !important;
}
  .main-container {
  overflow-y: auto !important;
  height: 100vh !important;
}
  .main-content-container {
    padding-top: 80px !important;
  }
    .workflow-spacer {
  height: 60px;
  width: 100%;
}
* {
  outline: none !important;
}

*:focus {
  outline: none !important;
  box-shadow: none !important;
}
  /* Enhanced workflow selector */
.glass-tab {
  background: transparent;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--text-secondary);
  position: relative;
  z-index: 2;
  padding: 12px 28px; /* Slightly reduced from 32px */
  font-weight: 500;
  font-size: 14px;
  flex: 1;
  cursor: pointer;
  white-space: nowrap;
  text-align: center; /* Center align text */
}

  .glass-tab.active {
    color: white;
  }

  .glass-tab:not(.active):hover {
    color: var(--text-primary);
  }
    .glass-tab:last-child {
  padding-left: 24px; /* Less left padding for Follow-Up */
}

  .sliding-indicator {
    position: absolute;
    top: 4px;
    left: 4px;
    height: calc(100% - 8px);
    background: linear-gradient(135deg, var(--accent-blue), var(--accent-blue-hover));
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 8px;
    z-index: 1;
    box-shadow: 0 4px 12px var(--glow-blue);
    width: calc(50% - 4px);
    transform: ${currentWorkflow === 'postsales' ? 'translateX(100%)' : 'translateX(0)'};
  }

 .workflow-selector-glass {
  background: rgba(51, 65, 85, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 8px 32px var(--glow-blue);
  max-width: 100%;
  width: 240px; /* Increased from 200px */
  display: flex;
  flex-direction: column;
}

  .workflow-tabs-container {
    display: flex;
    position: relative;
    width: 100%;
  }
  /* Smaller filter text */
  .filter-input {
    font-size: 13px !important;
  }

  .filter-label {
    font-size: 13px !important;
  }

  .filter-placeholder {
    font-size: 13px !important;
  }
.filter-input-small {
  font-size: 13px !important;
}

.filter-label-small {
  font-size: 13px !important;
}

.filter-select-small {
  font-size: 13px !important;
}

.filter-textarea-small {
  font-size: 13px !important;
}
  /* Selected product tags - rounder styling */
  .product-tag {
    background: #dbeafe;
    color: #1d4ed8;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
  }

  .product-tag-remove {
    cursor: pointer;
    font-weight: bold;
    font-size: 14px;
    line-height: 1;
  }

  /* Enhanced case study cards */
  .case-study-card {
    background: var(--bg-white) !important;
    border-radius: 16px;
    padding: 24px;
    height: 100%;
    border: 1px solid #e2e8f0;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    min-height: 350px;
  }

  .case-study-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  /* Enhanced use case styling with bigger font */
  .use-case-tag {
    background: var(--accent-red-light) !important;
    color: #991b1b !important;
    border: 1px solid #fecaca;
    font-weight: 600;
    border-radius: 12px;
    padding: 8px 16px;
    display: inline-block;
    margin-right: 8px;
    margin-bottom: 4px;
    font-size: 14px;
  }

  /* Industry insights container */
  .industry-insights {
    background: rgba(188, 199, 214, 0.95) !important;
    border: 1px solid #4a5568 !important;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  }

  /* Company insights container */
  .company-insights {
    background: rgba(188, 199, 214, 0.95) !important;
    border: 1px solid #4a5568 !important;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  }

  /* Single white container for all insights */
  .insights-unified-container {
    background: var(--bg-white) !important;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 16px;
  }

  /* Individual insight sections within unified container */
  .insight-section {
    padding: 16px 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .insight-section:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
.insight-section {
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}

.insight-section.pain-points {
  border-left: 2px solid #fecaca;
  padding-left: 12px;
}

.insight-section.opportunities {
  border-left: 2px solid #bbf7d0;
  padding-left: 12px;
}

.insight-section.trends {
  border-left: 2px solid #bfdbfe;
  padding-left: 12px;
}

.insight-section.developments {
  border-left: 2px solid #e9d5ff;
  padding-left: 12px;
}

.insight-section.initiatives {
  border-left: 2px solid #fed7aa;
  padding-left: 12px;
}

.insight-section.position {
  border-left: 2px solid #c7d2fe;
  padding-left: 12px;
}
  /* Insights footer styling */
  .insights-footer {
    background: var(--bg-white);
    border-radius: 8px;
    padding: 12px 16px;
    margin-top: 16px;
    border: 1px solid #e2e8f0;
    text-align: center;
  }

  /* Gradient buttons */
  .btn-gradient-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    font-size: 14px;
  }

  .btn-gradient-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e3a8a 100%);
  }

  .btn-gradient-primary:active {
    transform: translateY(0);
  }

  .btn-gradient-large {
    font-size: 16px;
    padding: 14px 32px;
  }

  /* Strategic summary */
  .strategic-summary {
    background: var(--bg-off-white) !important;
    border: 1px solid #e2e8f0 !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
    border-radius: 16px;
    padding: 24px;
  }

  .summary-section {
    background: var(--bg-white) !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  /* Dark container for results */
  .dark-container {
    background: var(--bg-dark-container);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    border: 2px solid var(--bg-tertiary);
  }

  /* Loading spinners */
  .loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(248, 250, 252, 0.3);
    border-radius: 50%;
    border-top-color: rgb(248, 250, 252);
    animation: spin 1s ease-in-out infinite;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: #666;
  }

  .box-spinner {
    width: 30px;
    height: 30px;
    background:rgba(248, 250, 252, 0.3);
    border-radius: 4px;
    animation: boxSpin 1.2s ease-in-out infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes boxSpin {
    0%, 100% { 
      transform: rotate(0deg) scale(1);
    }
    25% { 
      transform: rotate(90deg) scale(0.8);
    }
    50% { 
      transform: rotate(180deg) scale(1);
    }
    75% { 
      transform: rotate(270deg) scale(0.8);
    }
  }

  .fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Navigation mini panel */
  .nav-mini-panel {
    position: fixed;
    top: 50%;
    right: 24px;
    transform: translateY(-50%);
    z-index: 50;
    background: transparent;
    border: none;
    border-radius: 12px;
    padding: 8px;
    display: ${currentWorkflow ? 'flex' : 'none'};
    flex-direction: column;
    gap: 8px;
    box-shadow: none;
    transition: all 0.3s ease;
    width: 24px;
    overflow: visible;
  }

  .nav-mini-panel:hover {
    background: rgba(51, 65, 85, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(71, 85, 105, 0.3);
    box-shadow: 0 8px 32px var(--glow-blue);
    width: auto;
    min-width: 56px;
  }

  .nav-mini-button {
    background: transparent;
    color: var(--text-primary);
    border: none;
    border-radius: 50%;
    width: 8px;
    height: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: visible;
  }

  .nav-mini-button::before {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s ease;
    opacity: 1;
  }

  .nav-mini-panel:hover .nav-mini-button {
    background: var(--bg-tertiary);
    border: 1px solid var(--bg-quaternary);
    border-radius: 8px;
    width: 40px;
    height: 40px;
    padding: 0;
  }

  .nav-mini-panel:hover .nav-mini-button::before {
    opacity: 0;
    transform: scale(0);
  }

  .nav-mini-button svg {
    opacity: 0;
    transform: scale(0);
    transition: all 0.3s ease;
    position: absolute;
  }

  .nav-mini-panel:hover .nav-mini-button svg {
    opacity: 1;
    transform: scale(1);
  }

  .nav-mini-button:hover {
    transform: scale(1.05);
  }

  .nav-mini-panel:hover .nav-mini-button:hover {
    background: var(--bg-quaternary);
  }

  /* Hide scrollbars */
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  /* Sticky notes styling */
  .sticky-note {
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);
    position: relative;
  }

  .sticky-note textarea {
    width: 100%;
    background: transparent;
    border: none;
    resize: none;
    font-size: 14px;
    color: #92400e;
    font-family: 'Comic Sans MS', cursive, sans-serif;
  }

  .sticky-note textarea:focus {
    outline: none;
  }

  .sticky-note .note-actions {
    position: absolute;
    top: 8px;
    right: 8px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .sticky-note:hover .note-actions {
    opacity: 1;
  }

  .delete-note {
    background: #ef4444;
    color: white;
    border: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`}</style>

      {/* Deal Toggle Button */}
      {currentWorkflow && (
        <button 
          onClick={() => setShowDealSidebar(!showDealSidebar)}
          className={`fixed top-6 left-6 z-50 w-11 h-11 rounded-lg border flex items-center justify-center transition-all shadow-lg ${
            showDealSidebar 
              ? 'bg-blue-600 border-blue-700 text-white' 
              : 'bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
        </button>
      )}

      {/* Deal Sidebar */}
      {showDealSidebar && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowDealSidebar(false)}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          />
          <div className="fixed top-0 left-0 h-full w-96 bg-slate-700 border-r-2 border-slate-700 shadow-xl z-50 overflow-y-auto hide-scrollbar">
            <div className="p-5 border-b border-slate-700 bg-slate-900">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-100">Deal Management</h3>
                <button 
                  onClick={() => setShowDealSidebar(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-5">
              {/* Current Deal Info */}
              <div className="bg-slate-700 rounded-xl p-4 mb-5 border border-slate-600">
                <h4 className="text-sm font-medium text-slate-200 mb-2">Current Deal</h4>
                <div className="text-slate-300 text-sm">
                  {currentDealName && (
                    <>
                      <div className="font-medium">{currentDealName}</div>
                      <div className="text-xs mt-1">{deals[currentDealId]?.client || 'No client specified'}</div>
                      <div className="text-xs mt-1 text-slate-400">{deals[currentDealId]?.description || 'No description'}</div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Deal Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-200 mb-2">Switch Deal</label>
                <select 
                  value={currentDealId || ''}
                  onChange={(e) => switchDeal(e.target.value)}
                  className="w-full bg-slate-700 text-slate-100 border border-slate-600 rounded-lg p-3 text-sm"
                >
                  <option value="">Select a deal...</option>
                  {Object.values(deals).map(deal => (
                    <option key={deal.id} value={deal.id}>{deal.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Deal Actions */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <button 
                  onClick={() => setShowNewDealModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-4 rounded-md transition-all"
                >
                  + New Deal
                </button>
                <button 
                  onClick={() => setShowManageDealsModal(true)}
                  className="bg-slate-600 hover:bg-slate-500 text-slate-100 text-xs py-2 px-4 rounded-md transition-all"
                >
                  Manage
                </button>
              </div>
              
              {/* Deal Stats */}
              <div className="bg-slate-900 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-200 mb-3">Current Deal Stats</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Bookmarks:</span>
                    <span className="text-slate-100 font-medium">{bookmarkedCaseStudies.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Notes:</span>
                    <span className="text-slate-100 font-medium">{stickyNotes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Pitch Generated:</span>
                    <span className="text-slate-100 font-medium">{originalPitchContent ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Last Modified:</span>
                    <span className="text-slate-100 font-medium">
                      {currentDealId && deals[currentDealId] 
                        ? new Date(deals[currentDealId].lastModified).toLocaleDateString()
                        : '--'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Workflow Selector */}
      <div className="workflow-spacer">
      {showWorkflowSelector && (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
          <div className="text-center max-w-4xl mx-auto px-6">
            <h1 className="text-5xl font-light text-slate-100 mb-4">Case Study Platform</h1>
            <p className="text-xl text-slate-300 mb-12">Explore insights and generate compelling pitches</p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div 
                className="group cursor-pointer"
                onClick={() => selectWorkflow('presales')}
              >
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-medium text-white mb-4">Explore Scope</h3>
                  <p className="text-white/70">Search and discover use cases, market trends, company trends</p>
                </div>
              </div>
              
              <div 
                className="group cursor-pointer"
                onClick={() => selectWorkflow('postsales')}
              >
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-medium text-white mb-4">Follow-Up</h3>
                  <p className="text-white/70">Create personalised pitches with AI assistance backed by metrics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}</div>

      {/* Mini Workflow Selector */}
{!showWorkflowSelector && (
  <div className="fixed top-6 right-6 z-40 workflow-selector-glass">
    <div className="workflow-tabs-container">
      <button 
        onClick={() => switchWorkflow('presales')}
        className={`glass-tab ${currentWorkflow === 'presales' ? 'active' : ''}`}
      >
        Explore
      </button>
      <button 
        onClick={() => switchWorkflow('postsales')}
        className={`glass-tab ${currentWorkflow === 'postsales' ? 'active' : ''}`}
      >
        Follow-Up
      </button>
      <div className="sliding-indicator" />
    </div>
  </div>
)}



    {/* Navigation Mini Panel */}
{currentWorkflow && (
  <div className="nav-mini-panel">
    {currentWorkflow === 'presales' ? (
      <>
        <div className="nav-mini-button" onClick={scrollToCaseStudies} title="Case Studies">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
        </div>
        <div className="nav-mini-button" onClick={scrollToMarketInsights} title="Market Insights">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <div className="nav-mini-button" onClick={makePitchFromExplore} title="Make Pitch">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
      </>
    ) : (
      <>
        <div className="nav-mini-button" onClick={scrollToPitch} title="Generated Pitch">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        </div>
        <div className="nav-mini-button" onClick={scrollToSimilarCases} title="Similar Cases">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
        </div>
      </>
    )}
  </div>
)}

      {/* Main Content */}
{!showWorkflowSelector && (
  <div className="min-h-screen pt-20 pb-8 hide-scrollbar main-content-container" style={{ overflowY: 'auto', height: '100vh' }}>
    <div className="container mx-auto px-6 max-w-6xl">
            
            {/* Presales Workflow */}
            {currentWorkflow === 'presales' && (
              <div className="space-y-8">
                {/* Search Section */}
               <div className="bg-slate-50 rounded-2xl p-6 shadow-sm border border-slate-200 filter-container">
  <div className="mb-6">
    <label className="block text-sm font-medium text-slate-700 mb-3 filter-label">Filters</label>
    
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-2 filter-label ">
        Company Name <span className="text-red-500">*</span>
      </label>
      <input 
        type="text" 
        value={presalesForm.company}
        onChange={(e) => setPresalesForm(prev => ({ ...prev, company: e.target.value }))}
        className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 filter-input"
        placeholder="Company name..."
      />
    </div>
    
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 filter-label">
          Industry <span className="text-red-500">*</span>
        </label>
        <select 
          value={presalesForm.industry}
          onChange={(e) => setPresalesForm(prev => ({ ...prev, industry: e.target.value }))}
          className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 filter-input"
        >
          <option value="">Select industry...</option>
          {industries.map(industry => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 filter-label">Region</label>
        <select 
          value={presalesForm.region}
          onChange={(e) => setPresalesForm(prev => ({ ...prev, region: e.target.value }))}
          className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 filter-input"
        >
          {regions.map(region => (
            <option key={region} value={region}>
              {region === 'World' ? 'World (Default)' : region}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 filter-label">
          Product <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div 
            onClick={() => setShowProductDropdown(!showProductDropdown)}
            className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex justify-between items-center filter-input"
          >
            <span className="filter-placeholder">
              {selectedProducts.length === 0 
                ? 'Select products...' 
                : `${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''} selected`
              }
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
         
          {showProductDropdown && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {products.map((product) => (
                <div
                  key={product}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-900 filter-input ${
                    selectedProducts.includes(product) ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleProductSelection(product);
                  }}
                >
                  {product}
                </div>
              ))}
            </div>
          )}

          {selectedProducts.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedProducts.map(product => (
                <div key={product} className="product-tag">
                  {product}
                  <span 
                    onClick={() => removeProduct(product)}
                    className="product-tag-remove"
                  >
                    ×
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>

  <div className="mb-6">
    <label className="block text-sm font-medium text-slate-700 mb-3 filter-label">What are you looking for? (Optional)</label>
    <textarea 
      value={presalesForm.prompt}
      onChange={(e) => setPresalesForm(prev => ({ ...prev, prompt: e.target.value }))}
      rows="3" 
      className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 filter-input"
      placeholder="Describe what you're looking for... e.g., 'retail companies that improved customer experience using AI'"
    />
  </div>

  <div className="flex justify-center gap-4 mt-6">
   <button 
  onClick={exploreCaseStudies}
  disabled={isExploring}
  className="btn-gradient-primary flex items-center gap-2"
>
  {isExploring ? (
    <>
      <span className="loading-spinner"></span>
      Exploring...
    </>
  ) : (
    'Explore Scope'
  )}
</button>

  </div>
</div>

                {/* Strategic Summary Section */}
                {(hasMarketInsights || hasCompanyInsights) && globalCaseStudies.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-light text-slate-900 mb-1">Strategic Pitch Summary</h2>
                        <p className="text-slate-600">Key insights and trends for your pitch strategy</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Top Use Cases */}
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                          </div>
                          <h3 className="font-semibold text-slate-900">Top Use Cases to Pitch</h3>
                        </div>
                        <div className="space-y-2">
                          {globalCaseStudies.slice(0, 5).map((caseStudy, index) => (
                            caseStudy.use_case && (
                              <div key={index} className="flex items-start text-sm">
                                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">{index + 1}</span>
                                <span className="text-slate-700">{caseStudy.use_case} ({caseStudy.company})</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>

                     {/* Company Trends */}
<div className="bg-white rounded-lg p-4 border border-slate-200">
  <div className="flex items-center mb-3">
    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
      </svg>
    </div>
    <h3 className="font-semibold text-slate-900">Company Trends</h3>
  </div>
  <div className="space-y-2">
    {storedCompanyInsights?.executive_summary?.bullet_points && Array.isArray(storedCompanyInsights.executive_summary.bullet_points) ? (
      storedCompanyInsights.executive_summary.bullet_points.map((point, index) => (
        <div key={index} className="flex items-start text-sm">
          <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">{index + 1}</span>
          <span className="text-slate-700">{cleanFormattingText(point)}</span>
        </div>
      ))
    ) : (
      <div className="text-slate-500 italic">Company insights loading...</div>
    )}
  </div>
</div>

                     {/* Industry Trends */}
<div className="bg-white rounded-lg p-4 border border-slate-200">
  <div className="flex items-center mb-3">
    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
      </svg>
    </div>
    <h3 className="font-semibold text-slate-900">Industry Trends</h3>
  </div>
  <div className="space-y-2">
    {storedMarketInsights?.executive_summary?.bullet_points && Array.isArray(storedMarketInsights.executive_summary.bullet_points) ? (
      storedMarketInsights.executive_summary.bullet_points.map((point, index) => (
        <div key={index} className="flex items-start text-sm">
          <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">{index + 1}</span>
          <span className="text-slate-700">{cleanFormattingText(point)}</span>
        </div>
      ))
    ) : (
      <div className="text-slate-500 italic">Market insights loading...</div>
    )}
  </div>
</div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center text-sm text-blue-700">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>
                          <strong>Strategic Summary:</strong> {globalCaseStudies.length} case studies analyzed
                          {presalesForm.industry ? ` in ${presalesForm.industry}` : ''}
                          {presalesForm.company ? ` for ${presalesForm.company}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Results Container */}
               {globalCaseStudies.length > 0 && (
  <div className="dark-container">
    {/* Case Studies Grid */}
    <div id="caseStudiesSection" className="mb-8" data-section="case-studies">
      <div className="mb-6">
        <h2 className="text-2xl font-light text-slate-100 mb-2">Case Studies</h2>
        <p className="text-slate-300">{globalCaseStudies.length} result{globalCaseStudies.length !== 1 ? 's' : ''} found</p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {globalCaseStudies.map(caseStudy => renderCaseStudyCard(caseStudy))}
      </div>
    </div>

    {/* Market Insights and Company Intelligence */}
   <div className="grid lg:grid-cols-2 gap-6" data-section="market-insights">
  {/* Market Insights */}
  <div className="industry-insights">
    <div className="mb-6">
      <h3 className="text-xl font-medium text-slate-900 mb-4">Market Insights</h3>
    </div>
    {isMarketLoading ? (
      <div className="loading-state">
        <div className="box-spinner"></div>
        <p style={{ marginTop: '16px', fontSize: '14px' }}>Analysing market trends...</p>
      </div>
    ) : storedMarketInsights ? (
      <div className="space-y-4">
        <div className="insights-unified-container">
          {(() => {
            const categorizedInsights = parseInsightsIntoCategories(storedMarketInsights.insights);
            return (
              <>
                <div className="insight-section pain-points">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                    </div>
                    <h4 className="font-semibold text-red-900">Top Pain Points</h4>
                  </div>
                  <div className="text-slate-700 text-sm" dangerouslySetInnerHTML={{ __html: categorizedInsights.painPoints }} />
                </div>
                <div className="insight-section opportunities">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="text-slate-700 text-sm" dangerouslySetInnerHTML={{ __html: categorizedInsights.opportunities }} />
                </div>
                <div className="insight-section trends">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                      </svg>
                    </div>
                    <h4 className="font-semibold text-blue-900">Emerging Trends</h4>
                  </div>
                  <div className="text-slate-700 text-sm" dangerouslySetInnerHTML={{ __html: categorizedInsights.trends }} />
                </div>
              </>
            );
          })()}
        </div>
        
        <div className="insights-footer">
          <div className="text-xs text-slate-500">
            Based on {storedMarketInsights.based_on_articles} articles • {presalesForm.region} • 
            <button className="text-blue-600 hover:text-blue-800 transition-colors ml-1">
              View Details →
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div className="text-center py-8 text-slate-500">
        <p>Market insights will appear here after exploration</p>
      </div>
    )}
  </div>

  {/* Company Intelligence */}
  <div className="company-insights">
    <div className="mb-6">
      <h3 className="text-xl font-medium text-slate-900 mb-4">Company Intelligence</h3>
    </div>
    {isCompanyLoading ? (
      <div className="loading-state">
        <div className="box-spinner"></div>
        <p style={{ marginTop: '16px', fontSize: '14px' }}>Gathering intelligence...</p>
      </div>
    ) : storedCompanyInsights ? (
      <div className="space-y-4">
        <div className="insights-unified-container">
          {(() => {
            const categorizedCompanyInsights = parseCompanyInsightsIntoCategories(storedCompanyInsights);
            return (
              <>
              <div className="insight-section developments">
  <div className="flex items-center mb-3">
    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
      </svg>
    </div>
    <h4 className="font-semibold text-purple-900">Recent Developments</h4>
  </div>
  <div className="text-slate-700 text-sm" dangerouslySetInnerHTML={{ __html: categorizedCompanyInsights.developments }} />
</div>
<div className="insight-section initiatives">
  <div className="flex items-center mb-3">
    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
      </svg>
    </div>
    <h4 className="font-semibold text-orange-900">Strategic Initiatives</h4>
  </div>
  <div className="text-slate-700 text-sm" dangerouslySetInnerHTML={{ __html: categorizedCompanyInsights.initiatives }} />
</div>
<div className="insight-section position">
  <div className="flex items-center mb-3">
    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>
    </div>
    <h4 className="font-semibold text-indigo-900">Competitive Position</h4>
  </div>
  <div className="text-slate-700 text-sm" dangerouslySetInnerHTML={{ __html: categorizedCompanyInsights.position }} />
</div>

              </>
            );
          })()}
        </div>
        
        <div className="insights-footer">
          <div className="text-xs text-slate-500">
            {presalesForm.company} • 7 days • 
            <button className="text-blue-600 hover:text-blue-800 transition-colors ml-1">
              View Details →
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div className="text-center py-8 text-slate-500">
        <p>Company insights will appear here after exploration</p>
      </div>
    )}
  </div>
</div>

    {/* Make Pitch Button */}
    <div className="text-center mt-8">
      <button 
  onClick={makePitchFromExplore}
  className="btn-gradient-primary btn-gradient-large flex items-center gap-2 mx-auto"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
  </svg>
  Make Pitch
</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Postsales Workflow */}
            {currentWorkflow === 'postsales' && (
              <div className="space-y-8">
                {/* Generated Pitch */}
                {originalPitchContent && (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200" data-section="generated-pitch">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-light text-slate-900">Generated Pitch</h2>
                      <div className="flex gap-2">
                        <button 
                          onClick={sendPitchByEmail}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                          Send Mail
                        </button>
                        <button 
                          onClick={() => setIsEditingPitch(true)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-all border border-slate-300"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => navigator.clipboard.writeText(originalPitchContent)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-all border border-slate-300"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="prose max-w-none bg-slate-50 p-6 rounded-lg">
                      {isEditingPitch ? (
                        <div>
                          <textarea 
                            ref={pitchEditorRef}
                            defaultValue={originalPitchContent}
                            className="w-full h-96 p-4 border border-slate-300 rounded-lg resize-vertical font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <div className="flex gap-2 mt-4">
                            <button 
                              onClick={() => {
                                setOriginalPitchContent(pitchEditorRef.current.value);
                                setIsEditingPitch(false);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setIsEditingPitch(false)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-all border border-slate-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="text-slate-900"
                          dangerouslySetInnerHTML={{ __html: formatPitchContent(originalPitchContent) }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Pitch Configuration */}
                <div className="bg-slate-50 rounded-2xl p-6 shadow-sm border border-slate-200 filter-container">
                  <h2 className="text-2xl font-light text-slate-900 mb-6">Pitch Configuration</h2>

{/* Main configuration row */}
<div className="grid md:grid-cols-2 gap-6 mb-6">
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2 filter-label-small">Use Case</label>
    <select 
      value={postsalesForm.useCase}
      onChange={(e) => setPostsalesForm(prev => ({ ...prev, useCase: e.target.value }))}
      className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 filter-select-small"
    >
      <option value="">All use cases</option>
      {useCases.map(useCase => (
        <option key={useCase} value={useCase}>{useCase}</option>
      ))}
    </select>
    
    {/* Active use cases indicator */}
    {bookmarkedCaseStudies.length > 0 && (
      <div className="mt-2">
        <div className="text-xs text-blue-700 mb-1">Active use cases from bookmarks:</div>
        <div className="flex flex-wrap gap-1">
          {extractUseCasesFromBookmarks().map((useCase, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              {useCase}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2 filter-label-small">Additional Context</label>
    <textarea 
      value={postsalesForm.additionalContext}
      onChange={(e) => setPostsalesForm(prev => ({ ...prev, additionalContext: e.target.value }))}
      rows="1" 
      className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 filter-textarea-small"
      placeholder="Any specific requirements or context for the pitch..."
    />
  </div>
</div>

{/* Expandable Case Study Filters */}
<div className="mb-6">
 <button 
  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
  className="flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors"
>
  <span>Show case study filters</span>
  <svg 
    className={`w-4 h-4 ml-1 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
  </svg>
</button>

{showAdvancedFilters && (
    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 filter-label-small">Pitch Type</label>
        <select 
          value={postsalesForm.pitchType}
          onChange={(e) => setPostsalesForm(prev => ({ ...prev, pitchType: e.target.value }))}
          className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 filter-select-small"
        >
          <option value="email">Email</option>
          <option value="executive_summary">Executive Summary</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 filter-label-small">Target Company</label>
        <input 
          type="text" 
          value={postsalesForm.targetCompany}
          onChange={(e) => setPostsalesForm(prev => ({ ...prev, targetCompany: e.target.value }))}
          className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 filter-input-small"
          placeholder="Company name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 filter-label-small">Industry</label>
        <select 
          value={postsalesForm.industry}
          onChange={(e) => setPostsalesForm(prev => ({ ...prev, industry: e.target.value }))}
          className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 filter-select-small"
        >
          <option value="">All industries</option>
          {industries.map(industry => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 filter-label-small">Region</label>
        <select 
          value={postsalesForm.region}
          onChange={(e) => setPostsalesForm(prev => ({ ...prev, region: e.target.value }))}
          className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 filter-select-small"
        >
          <option value="">All regions</option>
          {regions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 filter-label-small">Product</label>
        <select 
          value={postsalesForm.product}
          onChange={(e) => setPostsalesForm(prev => ({ ...prev, product: e.target.value }))}
          className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 filter-select-small"
        >
          <option value="">All products</option>
          {products.map(product => (
            <option key={product} value={product}>{product}</option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-slate-700 mb-2 filter-label-small">Natural Language Search (Optional)</label>
        <textarea 
          value={postsalesForm.prompt}
          onChange={(e) => setPostsalesForm(prev => ({ ...prev, prompt: e.target.value }))}
          rows="2" 
          className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 filter-textarea-small"
          placeholder="Describe what you're looking for..."
        />
      </div>
    </div>
  )}
</div>

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-4 mt-6">
                    <button 
  onClick={generatePitch}
  disabled={isGenerating}
  className="btn-gradient-primary flex items-center gap-2"
>
  {isGenerating ? (
    <>
      <span className="loading-spinner"></span>
      Generating...
    </>
  ) : (
    'Generate Pitch'
  )}
</button>
                  </div>
                </div>

                {/* Case Studies for Postsales */}
                {globalCaseStudies.length > 0 && (
  <div className="bg-slate-50 rounded-2xl p-6 shadow-sm border border-slate-200" data-section="similar-cases">
    <div className="mb-6">
      <h2 className="text-2xl font-light text-slate-900 mb-2">Similar Case Studies</h2>
                      <p className="text-slate-600">{globalCaseStudies.length} result{globalCaseStudies.length !== 1 ? 's' : ''} found</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      {globalCaseStudies.map(caseStudy => renderCaseStudyCard(caseStudy, true))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toggle Buttons */}
      {currentWorkflow && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
          {/* Sticky Notes Toggle */}
          <button 
            onClick={() => setShowStickyNotes(!showStickyNotes)}
            className="w-14 h-14 bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110"
            title="Sticky Notes"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2h-3l-4 4z"></path>
            </svg>
          </button>
          
          {/* Bookmark Toggle */}
          <div className="relative">
            <button 
              onClick={() => setShowBookmarkSidebar(!showBookmarkSidebar)}
              className="w-14 h-14 bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110"
              title="Bookmarks"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
              </svg>
            </button>
            {bookmarkedCaseStudies.length > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                {bookmarkedCaseStudies.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky Notes Sidebar */}
      {showStickyNotes && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowStickyNotes(false)}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          />
          <div className="fixed top-0 left-0 h-full w-80 bg-slate-700 border-r-2 border-slate-600 shadow-xl z-50 overflow-y-auto hide-scrollbar">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium text-slate-100">Sticky Notes</h3>
                <button 
                  onClick={() => setShowStickyNotes(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={addStickyNote}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  Add Note
                </button>
                <button 
                  onClick={() => {
                    if (stickyNotes.length === 0) {
                      alert('No notes to clear');
                      return;
                    }
                    if (confirm(`Clear all ${stickyNotes.length} notes?`)) {
                      setStickyNotes([]);
                      localStorage.setItem('stickyNotes', JSON.stringify([]));
                    }
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all border border-slate-300"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {stickyNotes.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <svg className="w-12 h-12 mx-auto mb-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2h-3l-4 4z"></path>
                  </svg>
                  <p>No notes yet</p>
                  <p className="text-sm">Click "Add Note" to create your first sticky note</p>
                </div>
              ) : (
                stickyNotes.map(note => (
                  <div key={note.id} className="sticky-note">
                    <div className="note-actions">
                      <button 
                        onClick={() => deleteStickyNote(note.id)}
                        className="delete-note"
                        title="Delete note"
                      >
                        ×
                      </button>
                    </div>
                    <textarea 
                      value={note.content}
                      onChange={(e) => updateStickyNote(note.id, e.target.value)}
                      placeholder="Write your note here..."
                      rows="4"
                    />
                    <div className="text-xs text-slate-500 mt-2">
                      {new Date(note.timestamp).toLocaleDateString()} {new Date(note.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Bookmark Sidebar */}
      {showBookmarkSidebar && (
  <>
    <div 
      className="fixed inset-0 z-40"
      onClick={() => setShowBookmarkSidebar(false)}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    />
          <div className="fixed top-0 right-0 h-full w-96 bg-slate-700 shadow-xl z-50 overflow-y-auto hide-scrollbar">
            <div className="p-6 border-b border-slate-600">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium text-slate-100">Reference Case Studies</h3>
                <button 
                  onClick={() => setShowBookmarkSidebar(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if (bookmarkedCaseStudies.length === 0) {
                      alert('No bookmarks to export');
                      return;
                    }
                    const dataStr = JSON.stringify(bookmarkedCaseStudies, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(dataBlob);
                    link.download = `bookmarks_${new Date().toISOString().split('T')[0]}.json`;
                    link.click();
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-all border border-slate-300"
                >
                  Export
                </button>
                <button 
                  onClick={() => {
                    if (bookmarkedCaseStudies.length === 0) {
                      alert('No bookmarks to clear');
                      return;
                    }
                    if (confirm(`Clear all ${bookmarkedCaseStudies.length} bookmarks?`)) {
                      setBookmarkedCaseStudies([]);
                      localStorage.setItem('bookmarkedCaseStudies', JSON.stringify([]));
                    }
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all border border-slate-300"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {bookmarkedCaseStudies.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <svg className="w-12 h-12 mx-auto mb-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                  </svg>
                  <p>No bookmarks yet</p>
                  <p className="text-sm">Bookmark case studies to save them for later</p>
                </div>
              ) : (
                <>
                  {/* Use cases summary */}
                  {extractUseCasesFromBookmarks().length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                      <h4 className="font-medium text-blue-900 mb-2">Active Use Cases for Pitch Generation</h4>
                      <div className="flex flex-wrap gap-2">
                        {extractUseCasesFromBookmarks().map((useCase, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {useCase}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-blue-700 mt-2">These use cases will be used as filters when generating pitches</p>
                    </div>
                  )}
                  
                  {/* Bookmarked case studies */}
                  {bookmarkedCaseStudies.map(caseStudy => (
                    <div key={caseStudy.id} className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 mb-1">{caseStudy.company || 'Unknown Company'}</h4>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {caseStudy.industry && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{caseStudy.industry}</span>
                            )}
                            {caseStudy.region && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">{caseStudy.region}</span>
                            )}
                          </div>
                          {caseStudy.use_case && (
                            <p className="text-sm text-slate-600">
                              {caseStudy.use_case.length > 80 ? caseStudy.use_case.substring(0, 80) + '...' : caseStudy.use_case}
                            </p>
                          )}
                        </div>
                        <button 
                          onClick={() => removeBookmark(caseStudy.id)}
                          className="text-red-500 hover:text-red-700 ml-3 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Email Pitch</h3>
                <button 
                  onClick={() => setShowEmailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
                <input 
                  type="text" 
                  value={emailModalData.subject} 
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-900" 
                  readOnly 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Body:</label>
                <textarea 
                  rows="15" 
                  value={emailModalData.body}
                  className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm text-gray-900" 
                  readOnly
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const emailText = `Subject: ${emailModalData.subject}\n\n${emailModalData.body}`;
                    navigator.clipboard.writeText(emailText).then(() => {
                      alert('Email content copied to clipboard!');
                      setShowEmailModal(false);
                    }).catch(() => {
                      alert('Failed to copy email content');
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                >
                  Copy Email Content
                </button>
                <button 
                  onClick={() => setShowEmailModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-all border border-slate-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Deal Modal */}
      {showNewDealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Deal</h3>
              <form onSubmit={createNewDeal}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Deal Name *</label>
                  <input 
                    type="text" 
                    value={newDealForm.name}
                    onChange={(e) => setNewDealForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required 
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Client Name</label>
                  <input 
                    type="text" 
                    value={newDealForm.client}
                    onChange={(e) => setNewDealForm(prev => ({ ...prev, client: e.target.value }))}
                    className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea 
                    value={newDealForm.description}
                    onChange={(e) => setNewDealForm(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowNewDealModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-all border border-slate-300"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                  >
                    Create Deal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Manage Deals Modal */}
      {showManageDealsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-900">Manage Deals</h3>
                <button 
                  onClick={() => setShowManageDealsModal(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-96">
              {Object.values(deals).map(deal => (
                <div key={deal.id} className="p-4 border border-slate-200 rounded-lg mb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{deal.name}</h4>
                      <p className="text-sm text-slate-600">{deal.client || 'No client specified'}</p>
                      <p className="text-xs text-slate-500 mt-1">Created: {new Date(deal.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500">Modified: {new Date(deal.lastModified).toLocaleDateString()}</p>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500">
                        <span>📚 {deal.bookmarkedCaseStudies?.length || 0} bookmarks</span>
                        <span>📝 {deal.stickyNotes?.length || 0} notes</span>
                        <span>📊 {deal.generatedPitch ? 'Has pitch' : 'No pitch'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button 
                        onClick={() => {
                          const originalDeal = deal;
                          const newDeal = { ...originalDeal };
                          newDeal.id = dealIdCounter;
                          newDeal.name = originalDeal.name + ' (Copy)';
                          newDeal.createdAt = new Date().toISOString();
                          newDeal.lastModified = new Date().toISOString();
                          
                          const updatedDeals = { ...deals, [dealIdCounter]: newDeal };
                          setDeals(updatedDeals);
                          setDealIdCounter(dealIdCounter + 1);
                          localStorage.setItem('deals', JSON.stringify(updatedDeals));
                          localStorage.setItem('dealIdCounter', (dealIdCounter + 1).toString());
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-medium transition-all border border-slate-300"
                      >
                        Duplicate
                      </button>
                      {Object.keys(deals).length > 1 && (
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this deal? All data will be lost.')) {
                              const updatedDeals = { ...deals };
                              delete updatedDeals[deal.id];
                              
                              if (deal.id == currentDealId) {
                                const remainingDealIds = Object.keys(updatedDeals);
                                const newCurrentId = remainingDealIds[0];
                                setCurrentDealId(newCurrentId);
                                setCurrentDealName(updatedDeals[newCurrentId].name);
                                localStorage.setItem('currentDealId', newCurrentId);
                                loadDealData(newCurrentId, updatedDeals);
                              }
                              
                              setDeals(updatedDeals);
                              localStorage.setItem('deals', JSON.stringify(updatedDeals));
                            }
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition-all"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-slate-200">
              <div className="flex justify-end">
                <button 
                  onClick={() => setShowManageDealsModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-all border border-slate-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside handlers */}
      {showProductDropdown && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => setShowProductDropdown(false)}
        />
      )}
    </div>
  );
};

export default Scope;
