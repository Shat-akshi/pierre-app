import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon, DocumentArrowUpIcon, ChartBarIcon, EyeIcon, ClipboardDocumentIcon, ShareIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Eye, EyeOff, Download, Share2 } from 'lucide-react';

const Metric = () => {
  const [selectedFilters, setSelectedFilters] = useState({
    industries: [],
    use_cases: [],
    regions: [],
    ibm_solution: '',
    business_outcomes: [],
    time_savings: [],
    productivity_and_efficiency: [],
    employee_satisfaction: []
  });
  
  const [extractedMetrics, setExtractedMetrics] = useState('');
  const [showVisualStats, setShowVisualStats] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);

  const filterOptions = {
    industries: [
      "Technology Industry", "Public Sector and NGOs", "Professional services",
      "Financial services", "Manufacturing", "Energy and utilities",
      "Healthcare", "Media and entertainment", "Transportation", "Life Sciences",
      "Railway signalling systems"
    ],
    use_cases: [
      "AI & Machine Learning", "Cloud Migration", "Data Analytics & Insights",
      "Process Automation", "Cybersecurity", "Supply Chain Optimization",
      "Customer Experience", "Digital Transformation", "Infrastructure Modernization", 
      "Sustainability", "Facilitating information consumption with gen AI"
    ],
    regions: ["Americas", "Europe", "Asia", "Oceania", "Africa", "World"],
    ibm_solutions: ["Watsonx", "Cloud Pak for Data", "Cloud Pak for Integration", "Cloud Pak for Security"],
    business_outcomes: [
      "Time Savings",
      "Productivity and Efficiency", 
      "Employee Satisfaction",
      "Cost Reduction",
      "Revenue Growth",
      "Risk Mitigation"
    ],
    time_savings: [
      "Reduced search time",
      "Faster decision making",
      "Automated processes",
      "Streamlined workflows",
      "Quick access to information"
    ],
    productivity_and_efficiency: [
      "Centralized knowledge management",
      "Homogenized information sources",
      "Enhanced workflow automation",
      "Improved resource utilization",
      "Optimized operations"
    ],
    employee_satisfaction: [
      "Easy access to information",
      "Natural language interfaces",
      "Improved autonomy",
      "Better work-life balance",
      "Enhanced job satisfaction"
    ]
  };

  const barData = [
  { month: 'Jan', revenue: 2400, deals: 1200 },
  { month: 'Feb', revenue: 1398, deals: 980 },
  { month: 'Mar', revenue: 9800, deals: 3200 },
  { month: 'Apr', revenue: 3908, deals: 2100 },
  { month: 'May', revenue: 4800, deals: 2800 },
  { month: 'Jun', revenue: 3800, deals: 2300 }
  ];

  const pieData = [
    { name: 'Watsonx', value: 35, color: '#3b82f6' },
    { name: 'Cloud Pak for Data', value: 28, color: '#8b5cf6' },
    { name: 'Cloud Pak for Integration', value: 22, color: '#06b6d4' },
    { name: 'Red Hat OpenShift', value: 15, color: '#10b981' }
  ];

  const lineData = [
    { quarter: 'Q1', satisfaction: 85, productivity: 78 },
    { quarter: 'Q2', satisfaction: 88, productivity: 82 },
    { quarter: 'Q3', satisfaction: 92, productivity: 87 },
    { quarter: 'Q4', satisfaction: 95, productivity: 91 }
  ];

  useEffect(() => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Grid configuration
  const gridSize = 60; // Size of each grid cell
  const lineWidth = 1;
  const baseOpacity = 0.1;
  const pulseOpacity = 0.4;
  
  // Grid lines array to track animation states
  const gridLines = [];
  const gridNodes = [];
  
  // Initialize grid lines
  const cols = Math.ceil(canvas.width / gridSize) + 1;
  const rows = Math.ceil(canvas.height / gridSize) + 1;
  
  // Vertical lines
  for (let i = 0; i < cols; i++) {
    gridLines.push({
      type: 'vertical',
      x: i * gridSize,
      y1: 0,
      y2: canvas.height,
      opacity: baseOpacity,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.015 + Math.random() * 0.025,

      lastPulse: 0
    });
  }
  
  // Horizontal lines
  for (let i = 0; i < rows; i++) {
    gridLines.push({
      type: 'horizontal',
      y: i * gridSize,
      x1: 0,
      x2: canvas.width,
      opacity: baseOpacity,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.015 + Math.random() * 0.025,

      lastPulse: 0
    });
  }
  
  // // Initialize intersection nodes
  // for (let i = 0; i < cols; i++) {
  //   for (let j = 0; j < rows; j++) {
  //     gridNodes.push({
  //       x: i * gridSize,
  //       y: j * gridSize,
  //       opacity: baseOpacity,
  //       size: 0.5,
  //       pulsePhase: Math.random() * Math.PI * 2,
  //       pulseSpeed: 0.015 + Math.random() * 0.025,
  //       color: Math.random() > 0.5 ? '#3b82f6' : '#8b5cf6'
  //     });
  //   }
  // }
  
  let time = 0;
  let animationFrame = 0;
  
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    time += 0.002; // ~60fps
    animationFrame++;
    
    // Update canvas size if needed
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      resizeCanvas();
    }
    
    // Draw grid lines with pulsing effect
    gridLines.forEach((line, index) => {
      // Calculate pulsing opacity
      const pulse = Math.sin(time * line.pulseSpeed + line.pulsePhase);
      const currentOpacity = baseOpacity + (pulse * 0.5 + 0.5) * (pulseOpacity - baseOpacity);
      
      // Occasional bright pulse
      if (animationFrame % 180 === index % 180) {
        line.lastPulse = time;
      }
      
      const timeSincePulse = time - line.lastPulse;
      const brightPulse = Math.max(0, 1 - timeSincePulse * 2) * 0.6;
      
      ctx.strokeStyle = `rgba(59, 130, 246, ${Math.min(currentOpacity + brightPulse, 0.8)})`;
      ctx.lineWidth = lineWidth + brightPulse * 2;
      
      ctx.beginPath();
      if (line.type === 'vertical') {
        ctx.moveTo(line.x, line.y1);
        ctx.lineTo(line.x, line.y2);
      } else {
        ctx.moveTo(line.x1, line.y);
        ctx.lineTo(line.x2, line.y);
      }
      ctx.stroke();
    });
    
    // Draw intersection nodes
    gridNodes.forEach((node, index) => {
      const pulse = Math.sin(time * node.pulseSpeed + node.pulsePhase);
      const currentOpacity = baseOpacity + (pulse * 0.5 + 0.5) * (pulseOpacity - baseOpacity);
      const currentSize = node.size + pulse * 1.5;
      
      // Occasional bright pulse for nodes
      if (animationFrame % 240 === index % 240) {
        node.lastPulse = time;
      }
      
      const timeSincePulse = time - (node.lastPulse || 0);
      const brightPulse = Math.max(0, 1 - timeSincePulse * 3) * 0.8;
      
      ctx.fillStyle = `${node.color}${Math.floor((currentOpacity + brightPulse) * 255).toString(16).padStart(2, '0')}`;
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, Math.max(currentSize + brightPulse * 3, 0.5), 0, Math.PI * 2);
      ctx.fill();
      
      // Add glow effect for bright pulses
      if (brightPulse > 0.1) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = node.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
    
    // Draw connecting lines between nearby nodes occasionally
    if (animationFrame % 4 === 0) { // Reduce frequency for performance
      gridNodes.forEach((node, i) => {
        if (Math.random() > 0.995) { // Very rare connections
          const nearbyNodes = gridNodes.filter((other, j) => {
            if (i === j) return false;
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= gridSize * 1.5;
          });
          
          if (nearbyNodes.length > 0) {
            const target = nearbyNodes[Math.floor(Math.random() * nearbyNodes.length)];
            ctx.strokeStyle = `rgba(139, 92, 246, 0.3)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
          }
        }
      });
    }
    
    requestAnimationFrame(animate);
  };
  
  animate();
  
  return () => window.removeEventListener('resize', resizeCanvas);
}, []);


  const handleFilterChange = (category, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: Array.isArray(prev[category]) 
        ? prev[category].includes(value)
          ? prev[category].filter(item => item !== value)
          : [...prev[category], value]
        : value
    }));
  };

  const processMetrics = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setExtractedMetrics(`
📊 **Key Sales Metrics Extracted**

**Revenue Performance:**
• Q4 2024 Revenue: $2.4M (+18% YoY)
• Average Deal Size: $145K
• Win Rate: 67% (Industry: ${selectedFilters.industries.join(', ') || 'All'})

**Business Outcomes Analysis:**
• Time Savings: ${selectedFilters.time_savings.join(', ') || 'Reduced search and interpretation time'}
• Productivity: ${selectedFilters.productivity_and_efficiency.join(', ') || 'Centralized knowledge management'}
• Employee Satisfaction: ${selectedFilters.employee_satisfaction.join(', ') || 'Enhanced autonomy and access'}

**Pipeline Analysis:**
• Active Opportunities: 47 deals worth $6.8M
• Sales Velocity: 89 days average
• Top Performing Region: ${selectedFilters.regions[0] || 'Europe'}

**Solution Adoption:**
• Primary Use Case: ${selectedFilters.use_cases[0] || 'AI & Machine Learning'}
• Implementation Success Rate: 94%
• Customer Satisfaction Score: 4.7/5

**Forecasting Insights:**
• Q1 2025 Projection: $2.8M
• Risk-Adjusted Pipeline: $4.2M
• Business Outcomes Focus: ${selectedFilters.business_outcomes.join(', ') || 'Comprehensive improvement'}
      `);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,hsl(0, 0.00%, 0.00%) 0%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      
      {/* Enhanced Floating Navigation Orbs */}
      <div style={{
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        display: 'flex',
        gap: '1rem',
        zIndex: 1000
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: i === 0 ? 'linear-gradient(45deg, #3b82f6, #8b5cf6)' : 
                       i === 1 ? 'linear-gradient(45deg, #8b5cf6, )' :
                       'linear-gradient(45deg, #06b6d4, #3b82f6)',
            boxShadow: `0 0 30px ${i === 0 ? '#3b82f6' : i === 1 ? '#8b5cf6' : '#06b6d4'}80`,
            animation: `pulse ${2 + i * 0.5}s ease-in-out infinite alternate`
          }} />
        ))}
      </div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '2rem',
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        
        {/* Enhanced Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '900',
            // background: 'linear-gradient(135deg,#083680 0%,#1a99ee 30%,#285a8f 70%, #06b6d4 100%)',
            background: 'linear-gradient(135deg,#46c0f4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
            textShadow: '0 0 40px rgba(59, 130, 246, 0.3)'
          }}>
            Advanced Metrics Intelligence
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1.25rem',
            fontWeight: '300'
          }}>
            Transform data into actionable insights with AI-powered analytics
          </p>
        </div>

        {/* Enhanced Glass Morphism Filters Panel */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)', // More visible glass effect
          backdropFilter: 'blur(25px)', // Stronger blur
          WebkitBackdropFilter: 'blur(25px)', // Safari support
          border: '2px solid rgba(255, 255, 255, 0.15)', // More prominent border
          borderRadius: '28px',
          padding: '2.5rem',
          boxShadow: `
            0 25px 50px -12px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.05)
          `, // Multiple shadow layers for depth
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Glass reflection effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)',
            borderRadius: '28px 28px 0 0',
            pointerEvents: 'none'
          }} />
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            position: 'relative',
            zIndex: 1
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: 'white',
              margin: 0,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
            }}>
              Configuration Matrix
            </h2>
            <div style={{
              width: '80px',
              height: '3px',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
              borderRadius: '2px',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
            }} />
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            position: 'relative',
            zIndex: 1
          }}>
            {/* Multi-select Dropdowns */}
            {Object.entries(filterOptions).slice(0, 3).map(([key, options]) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.9)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                }}>
                  {key.replace('_', ' ')}
                </label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  {selectedFilters[key].map(item => (
                    <span key={item} style={{
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      color: 'white',
                      padding: '0.4rem 1rem',
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      {item}
                      <button 
                        onClick={() => handleFilterChange(key, item)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '50%',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <select 
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '14px',
                    padding: '1rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                  onChange={(e) => e.target.value && handleFilterChange(key, e.target.value)}
                  value=""
                >
                  <option value="">Select {key.replace('_', ' ')}</option>
                  {options.filter(opt => !selectedFilters[key].includes(opt)).map(option => (
                    <option key={option} value={option} style={{ background: '#1a1a2e' }}>{option}</option>
                  ))}
                </select>
              </div>
            ))}
            
            {/* IBM Solution - Single Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.9)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
              }}>
                IBM Solution
              </label>
              <select 
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '14px',
                  padding: '1rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
                value={selectedFilters.ibm_solution}
                onChange={(e) => setSelectedFilters(prev => ({...prev, ibm_solution: e.target.value}))}
              >
                <option value="">Select Solution</option>
                {filterOptions.ibm_solutions.map(solution => (
                  <option key={solution} value={solution} style={{ background: '#1a1a2e' }}>{solution}</option>
                ))}
              </select>
            </div>

            {/* Remaining multi-select filters */}
            {Object.entries(filterOptions).slice(4).map(([key, options]) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.9)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                }}>
                  {key.replace('_', ' ')}
                </label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  {selectedFilters[key]?.map(item => (
                    <span key={item} style={{
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      color: 'white',
                      padding: '0.4rem 1rem',
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      {item}
                      <button 
                        onClick={() => handleFilterChange(key, item)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '50%',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <select 
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '14px',
                    padding: '1rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                  onChange={(e) => e.target.value && handleFilterChange(key, e.target.value)}
                  value=""
                >
                  <option value="">Select {key.replace('_', ' ')}</option>
                  {options.filter(opt => !selectedFilters[key]?.includes(opt)).map(option => (
                    <option key={option} value={option} style={{ background: '#1a1a2e' }}>{option}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          
          <button 
            onClick={processMetrics}
            disabled={isProcessing}
            style={{
              marginTop: '2.5rem',
              background: isProcessing ? 'rgba(59, 130, 246, 0.2)' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              border: 'none',
              borderRadius: '18px',
              padding: '1.25rem 2.5rem',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'all 0.3s ease',
              boxShadow: isProcessing ? 'none' : '0 15px 35px rgba(59, 130, 246, 0.4)',
              transform: isProcessing ? 'scale(0.98)' : 'scale(1)',
              position: 'relative',
              overflow: 'hidden',
              zIndex: 1
            }}
          >
            <DocumentArrowUpIcon style={{ width: '24px', height: '24px' }} />
            {isProcessing ? 'Processing...' : 'Extract Metrics'}
            {!isProcessing && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
                transform: 'translateX(-100%)',
                animation: 'shimmer 2.5s infinite'
              }} />
            )}
          </button>
        </div>

        {/* Rest of the components remain the same but with enhanced glass effects */}
        {/* Metrics Output */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(25px)',
          border: '2px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: `
            0 25px 50px -12px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.15)
          `,
          minHeight: '400px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Glass reflection */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 100%)',
            borderRadius: '24px 24px 0 0',
            pointerEvents: 'none'
          }} />
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            position: 'relative',
            zIndex: 1
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'white',
              margin: 0,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
            }}>
              📊 Extracted Key Sales Metrics
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                padding: '0.75rem',
                color: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <ClipboardDocumentIcon style={{ width: '18px', height: '18px' }} />
              </button>
              <button style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                padding: '0.75rem',
                color: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <ShareIcon style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            position: 'relative',
            zIndex: 1
          }}>
            {isProcessing ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem'
              }}>
                <div style={{
                  position: 'relative',
                  width: '140px',
                  height: '140px'
                }}>
                  {[...Array(12)].map((_, i) => (
                    <div key={i} style={{
                      position: 'absolute',
                      width: '16px',
                      height: '16px',
                      background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                      borderRadius: '50%',
                      top: '50%',
                      left: '50%',
                      transformOrigin: '8px 70px',
                      transform: `rotate(${i * 30}deg) translateY(-70px)`,
                      animation: `orbit ${2.5}s linear infinite`,
                      animationDelay: `${i * 0.2}s`,
                      opacity: 0.8,
                      boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)'
                    }} />
                  ))}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '28px',
                    height: '28px',
                    background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                    borderRadius: '50%',
                    animation: 'pulse 2s ease-in-out infinite',
                    boxShadow: '0 0 25px rgba(139, 92, 246, 0.6)'
                  }} />
                </div>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  textAlign: 'center',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                }}>
                  Analyzing data patterns...
                </p>
              </div>
            ) : extractedMetrics ? (
              <div style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.25)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <pre style={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '0.9rem',
                  lineHeight: '1.7',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'Monaco, Consolas, "Lucida Console", monospace'
                }}>
                  {extractedMetrics}
                </pre>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                color: 'rgba(255, 255, 255, 0.5)'
              }}>
                <ChartBarIcon style={{ width: '56px', height: '56px' }} />
                <p style={{ fontSize: '1.25rem', textAlign: 'center', fontWeight: '500' }}>
                  Configure filters and extract metrics to see results
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={() => setShowVisualStats(!showVisualStats)}
            style={{
              background: showVisualStats ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(15px)',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '50px',
              padding: '1.25rem 2.5rem',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'all 0.3s ease',
              boxShadow: showVisualStats ? '0 15px 35px rgba(59, 130, 246, 0.4)' : '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}
          >
            <EyeIcon style={{ width: '24px', height: '24px' }} />
            {showVisualStats ? 'Hide Visual Stats' : '🔍 Show Visual Stats'}
          </button>
        </div>

        {showVisualStats && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(5px)', //viusual stats glass effect
          WebkitBackdropFilter: 'blur(25px)',
          border: '2px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: `
            0 25px 50px -12px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.15)
          `,
          maxHeight: showVisualStats ? '1200px' : '0',
          overflow: 'hidden',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative'
        }}>
    {/* Glass reflection */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '40%',
      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 100%)',
      borderRadius: '24px 24px 0 0',
      pointerEvents: 'none'
    }} />
    
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '2rem',
      position: 'relative',
      zIndex: 1
    }}>
      <h2 style={{
        fontSize: '1.75rem',
        fontWeight: '700',
        color: 'white',
        margin: 0,
        textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <span>📈</span>
        Visual Analytics Dashboard
      </h2>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(0px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          padding: '0.75rem',
          color: 'rgba(255, 255, 255, 0.8)',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}>
          <Download style={{ width: '18px', height: '18px' }} />
        </button>
        <button style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          padding: '0.75rem',
          color: 'rgba(255, 255, 255, 0.8)',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}>
          <Share2 style={{ width: '18px', height: '18px' }} />
        </button>
      </div>
    </div>
    
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
      gap: '2rem',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Revenue Analysis Bar Chart */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(0px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
      }}>
        <h3 style={{
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
        }}>
          Revenue & Deals Analysis
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="month" stroke="rgba(255, 255, 255, 0.7)" />
            <YAxis stroke="rgba(255, 255, 255, 0.7)" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                backdropFilter: 'blur(10px)'
              }} 
            />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="deals" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Solution Distribution Pie Chart */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(0px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
      }}>
        <h3 style={{
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
        }}>
          IBM Solution Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                backdropFilter: 'blur(10px)'
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          {pieData.map((entry, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: entry.color,
                borderRadius: '50%'
              }} />
              <span style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.875rem'
              }}>
                {entry.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Trends Line Chart */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(0px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        gridColumn: 'span 2'
      }}>
        <h3 style={{
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
        }}>
          Performance Trends Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="quarter" stroke="rgba(255, 255, 255, 0.7)" />
            <YAxis stroke="rgba(255, 255, 255, 0.7)" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                backdropFilter: 'blur(10px)'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="satisfaction" 
              stroke="#06b6d4" 
              strokeWidth={3}
              dot={{ fill: '#06b6d4', strokeWidth: 2, r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="productivity" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
)}
      </div>

      {/* Enhanced CSS animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        
        @keyframes orbit {
          0% { transform: rotate(0deg) translateY(-70px) rotate(0deg); }
          100% { transform: rotate(360deg) translateY(-70px) rotate(-360deg); }
        }
        
        @keyframes growUp {
          0% { height: 0; opacity: 0; }
          100% { height: var(--target-height); opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        select:focus, button:hover {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4) !important;
          border-color: rgba(59, 130, 246, 0.6) !important;
          transform: translateY(-1px) !important;
        }
        
        button:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3) !important;
        }
        
        .tag-remove:hover {
          background: rgba(255, 255, 255, 0.3) !important;
          transform: scale(1.1) !important;
        }
        
        @media (max-width: 768px) {
          .grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Metric;
