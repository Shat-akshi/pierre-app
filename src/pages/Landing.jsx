

// import React, { useState, useEffect, useMemo, useRef } from 'react';

// // CSS-based floating particles
// function FloatingParticles({ darkMode }) {
//   return (
//     <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
//       {Array.from({ length: 80 }).map((_, i) => (
//         <div
//           key={i}
//           className={`absolute rounded-full animate-float ${
//             darkMode ? 'bg-blue-400' : 'bg-blue-500'
//           }`}
//           style={{
//             width: `${3 + Math.random() * 5}px`,
//             height: `${3 + Math.random() * 5}px`,
//             left: `${Math.random() * 100}%`,
//             top: `${Math.random() * 100}%`,
//             animationDelay: `${Math.random() * 5}s`,
//             animationDuration: `${3 + Math.random() * 4}s`,
//             boxShadow: darkMode 
//               ? '0 0 10px rgba(0, 174, 255, 1), 0 0 20px rgba(0, 174, 255, 0.5)' 
//               : '0 0 10px rgba(33, 150, 243, 1), 0 0 20px rgba(33, 150, 243, 0.5)',
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// // ✨ Animated Theme Toggle Button
// function ThemeToggle({ darkMode, toggleTheme }) {
//   return (
//     <div className="fixed top-6 right-6 z-50">
//       <button
//         onClick={toggleTheme}
//         className={`w-25 h-10 rounded-full relative transition-colors duration-500 shadow-inner overflow-hidden
//           ${darkMode ? 'bg-gradient-to-r from-gray-800 to-blue-900' : 'bg-gradient-to-r from-yellow-300 to-blue-200'}
//         `}
//       >
//         <div
//           className={`absolute top-1 left-1 w-8 h-8 rounded-full transition-all duration-500 transform
//             ${darkMode ? 'translate-x-10 bg-gray-100' : 'translate-x-0 bg-yellow-400'}
//           `}
//         >
//           <div className="absolute inset-0 flex items-center justify-center">
//             {darkMode ? '🌙' : '☀️'}
//           </div>
//         </div>

//         {/* Clouds / Stars layer */}
//         <div className="absolute inset-0 flex items-center justify-around text-sm opacity-70 pointer-events-none">
//           {darkMode ? (
//             <>
//               <span className="text-white">✨</span>
//               <span className="text-white"></span>
//             </>
//           ) : (
//             <>
//               <span className="text-white"></span>
//               <span className="text-white">⛅</span>
//             </>
//           )}
//         </div>
//       </button>
//     </div>
//   );
// }

// // Growing Circle Transition Component
// function GrowingCircleTransition({ isActive, darkMode, originX, originY, onComplete }) {
//   const canvasRef = useRef(null);
//   const animationRef = useRef(null);
//   const startTimeRef = useRef(null);

//   useEffect(() => {
//     if (!isActive || !canvasRef.current) return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
    
//     // Set canvas size to full screen
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     // Calculate max radius needed to cover entire screen from origin point
//     const maxRadius = Math.sqrt(
//       Math.pow(Math.max(originX, canvas.width - originX), 2) + 
//       Math.pow(Math.max(originY, canvas.height - originY), 2)
//     ) + 50; // Add padding

//     const ANIMATION_DURATION = 800; // Total animation time in ms
//     startTimeRef.current = Date.now();

//     const animate = () => {
//       const now = Date.now();
//       const elapsed = now - startTimeRef.current;
//       const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

//       // Smooth easing function (ease-out)
//       const easedProgress = 1 - Math.pow(1 - progress, 3);
//       const currentRadius = maxRadius * easedProgress;

//       // Clear canvas
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       // Set the new theme colors
//       const gradient = ctx.createRadialGradient(
//         originX, originY, 0,
//         originX, originY, currentRadius
//       );

//       if (darkMode) {
//         gradient.addColorStop(0, '#1f2937');
//         gradient.addColorStop(0.6, '#111827');
//         gradient.addColorStop(1, '#030712');
//       } else {
//         gradient.addColorStop(0, '#f0f9ff');
//         gradient.addColorStop(0.6, '#e0f2fe');
//         gradient.addColorStop(1, '#bae6fd');
//       }

//       ctx.fillStyle = gradient;
//       ctx.beginPath();
//       ctx.arc(originX, originY, currentRadius, 0, 2 * Math.PI);
//       ctx.fill();

//       if (progress < 1) {
//         animationRef.current = requestAnimationFrame(animate);
//       } else {
//         // Animation complete
//         if (onComplete) onComplete();
//       }
//     };

//     animate();

//     return () => {
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current);
//       }
//     };
//   }, [isActive, darkMode, originX, originY, onComplete]);

//   if (!isActive) return null;

//   return (
//     <canvas
//       ref={canvasRef}
//       className="fixed inset-0 z-40 pointer-events-none"
//       style={{ background: 'transparent' }}
//     />
//   );
// }

// // Animated counter component
// function AnimatedCounter({ target, label, darkMode, isVisible }) {
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     if (!isVisible) return;
    
//     let start = 0;
//     const duration = 2000;
//     const increment = target / (duration / 16);
    
//     const timer = setInterval(() => {
//       start += increment;
//       if (start >= target) {
//         setCount(target);
//         clearInterval(timer);
//       } else {
//         setCount(Math.floor(start));
//       }
//     }, 16);

//     return () => clearInterval(timer);
//   }, [target, isVisible]);

//   return (
//     <div className="text-center p-8">
//       <span className={`block text-5xl font-bold mb-2 ${
//         darkMode ? 'text-blue-400' : 'text-blue-600'
//       }`}>
//         {count}
//       </span>
//       <div className={`text-lg ${
//         darkMode ? 'text-gray-300' : 'text-gray-700'
//       }`}>
//         {label}
//       </div>
//     </div>
//   );
// }

// // Main landing page component
// export default function LandingPage() {
//   const [darkMode, setDarkMode] = useState(true);
//   const [visibleSections, setVisibleSections] = useState(new Set());
//   const [transitioning, setTransitioning] = useState(false);
//   const [transitionOrigin, setTransitionOrigin] = useState({ x: 0, y: 0 });
//   const buttonRef = useRef(null);



//   // Custom toggle with growing circle animation
//   const toggleTheme = (event) => {
//     if (buttonRef.current) {
//       const rect = buttonRef.current.getBoundingClientRect();
//       setTransitionOrigin({
//         x: rect.left + rect.width / 2,
//         y: rect.top + rect.height / 2
//       });
//     }

//     setTransitioning(true);
//   };

//   const handleTransitionComplete = () => {
//     setDarkMode(!darkMode);
//     setTimeout(() => {
//       setTransitioning(false);
//     }, 100);
//   };

//   const cardColors = useMemo(() => [
//     darkMode ? "rgba(0, 174, 255, 0.15)" : "rgba(33, 150, 243, 0.15)",
//     darkMode ? "rgba(0, 90, 156, 0.15)" : "rgba(0, 90, 156, 0.15)",
//     darkMode ? "rgba(0, 40, 85, 0.15)" : "rgba(0, 40, 85, 0.15)",
//   ], [darkMode]);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             setVisibleSections(prev => new Set([...prev, entry.target.id]));
//           }
//         });
//       },
//       { threshold: 0.1 }
//     );

//     document.querySelectorAll('[data-animate]').forEach((el) => {
//       observer.observe(el);
//     });

//     return () => observer.disconnect();
//   }, []);

//   const themeClasses = {
//     bg: darkMode 
//       ? 'bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900' 
//       : 'bg-gradient-to-br from-blue-50 via-white to-blue-100',
//     text: darkMode ? 'text-white' : 'text-gray-900',
//     subtext: darkMode ? 'text-gray-300' : 'text-gray-600',
//     card: darkMode 
//       ? 'bg-white/5 backdrop-blur-lg border-white/10' 
//       : 'bg-white/70 backdrop-blur-lg border-gray-200/50',
//   };

//   return (
//     <div className={`min-h-screen transition-all duration-500 ${themeClasses.bg}`}>
//       <div ref={buttonRef} className="fixed top-6 right-6 z-50">
//         <button
//           onClick={toggleTheme}
//           className={`w-25 h-10 rounded-full relative transition-colors duration-500 shadow-inner overflow-hidden
//             ${darkMode ? 'bg-gradient-to-r from-gray-800 to-blue-900' : 'bg-gradient-to-r from-yellow-300 to-blue-200'}
//           `}
//         >
//           <div
//             className={`absolute top-1 left-1 w-8 h-8 rounded-full transition-all duration-500 transform
//               ${darkMode ? 'translate-x-10 bg-gray-100' : 'translate-x-0 bg-yellow-400'}
//             `}
//           >
//             <div className="absolute inset-0 flex items-center justify-center">
//               {darkMode ? '🌙' : '☀️'}
//             </div>
//           </div>

//           {/* Clouds / Stars layer */}
//           <div className="absolute inset-0 flex items-center justify-around text-sm opacity-70 pointer-events-none">
//             {darkMode ? (
//               <>
//                 <span className="text-white">✨</span>
//                 <span className="text-white"></span>
//               </>
//             ) : (
//               <>
//                 <span className="text-white"></span>
//                 <span className="text-white">⛅</span>
//               </>
//             )}
//           </div>
//         </button>
//       </div>

//       <GrowingCircleTransition 
//         isActive={transitioning}
//         darkMode={!darkMode} // Use the NEW theme for the transition
//         originX={transitionOrigin.x}
//         originY={transitionOrigin.y}
//         onComplete={handleTransitionComplete}
//       />
      
//       <FloatingParticles darkMode={darkMode} />

//       {/* Hero Section */}
//       <section className="min-h-screen flex items-center justify-center px-4 relative z-10">
//         <div className="absolute inset-0 opacity-30">
//           {cardColors.map((color, i) => (
//             <div
//               key={i}
//               className="absolute rounded-full blur-3xl animate-pulse"
//               style={{
//                 background: color,
//                 width: `${300 + i * 100}px`,
//                 height: `${300 + i * 100}px`,
//                 left: `${20 + i * 30}%`,
//                 top: `${20 + i * 20}%`,
//                 animationDelay: `${i * 2}s`,
//               }}
//             />
//           ))}
//         </div>
        
//         <div className="text-center max-w-4xl mx-auto relative z-10">
//           <h1 className={`text-6xl md:text-8xl font-bold mb-6 ${themeClasses.text} animate-fade-in-up`}>
//             <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
//               Think Bold.
//             </span>{' '}
//             Pitch Better. Pierre.
//           </h1>
//           <p className={`text-xl md:text-2xl mb-8 ${themeClasses.subtext} animate-fade-in-up animation-delay-300`}>
//             Your AI-powered sales copilot that transforms scattered IBM insights into personalized, pitch-ready intelligence.
//           </p>
//           <button 
//             onClick={() => window.location.href = '/dashboard'}
//             className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up animation-delay-600"
//           >
//             <span className="relative z-10">Discover Pierre</span>
//             <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//           </button>
//         </div>
//       </section>

//       {/* Features */}
//       <section id="features" data-animate className="py-20 px-4">
//         <div className="max-w-6xl mx-auto">
//           <h2 className={`text-4xl md:text-6xl font-bold text-center mb-16 ${themeClasses.text} ${
//             visibleSections.has('features') ? 'animate-fade-in-up' : 'opacity-0'
//           }`}>
//             Why Choose Excellence
//           </h2>
//           <div className="grid md:grid-cols-3 gap-8">
//             {[
//               { icon:'🔵', title: 'Lightning Fast', desc: 'Experience blazing performance with our optimized solutions that deliver results in milliseconds, not minutes.' },
//               { icon:'🔵', title: 'Precision Focused', desc: 'Every detail matters. Our meticulous approach ensures pixel-perfect execution and flawless user experiences.' },
//               { icon:'🔵', title: 'Future Ready', desc: 'Built with tomorrow in mind, our solutions scale seamlessly as your vision grows and evolves.' }
//             ].map((feature, i) => (
//               <div
//                 key={i}
//                 className={`${themeClasses.card} border rounded-2xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
//                   visibleSections.has('features') ? 'animate-fade-in-up' : 'opacity-0'
//                 }`}
//                 style={{ 
//                   backgroundColor: cardColors[i],
//                   animationDelay: `${i * 200}ms`
//                 }}
//               >
//                 <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center text-2xl ${
//                   darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
//                 }`}>
//                   {feature.icon}
//                 </div>
//                 <h3 className={`text-xl font-semibold mb-4 text-center ${themeClasses.text}`}>
//                   {feature.title}
//                 </h3>
//                 <p className={`text-center ${themeClasses.subtext}`}>
//                   {feature.desc}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Stats */}
//       <section id="stats" data-animate className={`py-20 px-4 ${
//         darkMode ? 'bg-black/20' : 'bg-white/50'
//       } backdrop-blur-sm`}>
//         <div className="max-w-6xl mx-auto">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//             {[
//               { target: 99, label: 'Client Satisfaction' },
//               { target: 150, label: 'Projects Delivered' },
//               { target: 24, label: 'Hours Support' },
//               { target: 5, label: 'Years Experience' }
//             ].map((stat, i) => (
//               <AnimatedCounter
//                 key={i}
//                 target={stat.target}
//                 label={stat.label}
//                 darkMode={darkMode}
//                 isVisible={visibleSections.has('stats')}
//               />
//             ))}
//           </div>
//         </div>
//       </section>

//       <footer className={`py-8 px-4 text-center border-t ${
//         darkMode ? 'border-white/10' : 'border-gray-200'
//       }`}>
//         <p className={themeClasses.subtext}>
//           © 2025 Excellence Delivered. Crafted with precision and passion.
//         </p>
//       </footer>

//       <style jsx>{`
//         @keyframes fade-in-up {
//           from {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         @keyframes float {
//           0%, 100% {
//             transform: translateY(0px) translateX(0px);
//             opacity: 0.7;
//           }
//           33% {
//             transform: translateY(-20px) translateX(10px);
//             opacity: 1;
//           }
//           66% {
//             transform: translateY(20px) translateX(-10px);
//             opacity: 0.5;
//           }
//         }

//         .animate-fade-in-up {
//           animation: fade-in-up 0.8s ease-out forwards;
//         }

//         .animate-float {
//           animation: float linear infinite;
//         }

//         .animation-delay-300 {
//           animation-delay: 300ms;
//         }

//         .animation-delay-600 {
//           animation-delay: 600ms;
//         }
//       `}</style>
//     </div>
//   );
// }
import React, { useState, useEffect, useRef } from 'react';
import TechBackground from '../components/TechBackground';

// Growing Circle Transition Component (can be removed if not needed)
function GrowingCircleTransition({ isActive, darkMode, originX, originY, onComplete }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const maxRadius = Math.sqrt(
      Math.pow(Math.max(originX, canvas.width - originX), 2) + 
      Math.pow(Math.max(originY, canvas.height - originY), 2)
    ) + 50;

    const ANIMATION_DURATION = 800;
    startTimeRef.current = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentRadius = maxRadius * easedProgress;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createRadialGradient(
        originX, originY, 0,
        originX, originY, currentRadius
      );

      if (darkMode) {
        gradient.addColorStop(0, '#1f2937');
        gradient.addColorStop(0.6, '#111827');
        gradient.addColorStop(1, '#030712');
      } else {
        gradient.addColorStop(0, '#f0f9ff');
        gradient.addColorStop(0.6, '#e0f2fe');
        gradient.addColorStop(1, '#bae6fd');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(originX, originY, currentRadius, 0, 2 * Math.PI);
      ctx.fill();

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, darkMode, originX, originY, onComplete]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-40 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
}

// Animated counter component
function AnimatedCounter({ target, label, isVisible }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, isVisible]);

  return (
    <div className="text-center p-8">
      <span className="block text-5xl font-bold mb-2 text-blue-400">
        {count}
      </span>
      <div className="text-lg text-gray-300">
        {label}
      </div>
    </div>
  );
}

// Main landing page component
export default function LandingPage() {
  const [visibleSections, setVisibleSections] = useState(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const themeClasses = {
    bg: 'bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900',
    text: 'text-white',
    subtext: 'text-gray-300',
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${themeClasses.bg}`}>

      <TechBackground />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <h1 className={`text-6xl md:text-8xl font-bold mb-6 ${themeClasses.text} animate-fade-in-up`}>
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Think Bold.
            </span>{' '}
            Pitch Better. Pierre.
          </h1>
          <p className={`text-xl md:text-2xl mb-8 ${themeClasses.subtext} animate-fade-in-up animation-delay-300`}>
            Your AI-powered sales copilot that transforms scattered IBM insights into personalized, pitch-ready intelligence.
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up animation-delay-600"
          >
            <span className="relative z-10">Discover Pierre</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </section>

      

      <footer className="py-8 px-4 text-center border-t border-white/10">
        <p className={themeClasses.subtext}>
          © 2025 Excellence Delivered. Crafted with precision and passion.
        </p>
      </footer>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-600 {
          animation-delay: 600ms;
        }
      `}</style>
    </div>
  );
}