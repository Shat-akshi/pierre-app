
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