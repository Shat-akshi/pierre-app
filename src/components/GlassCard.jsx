import React from 'react';
import { motion } from 'framer-motion';

// Enhanced Glass Card Component
const GlassCard = ({ children, className, hoverEffect = true }) => {
  // const baseClasses = `rounded-3xl backdrop-blur-lg border border-gray-800/40 transition-all duration-700 bg-black/50`;
  const baseClasses = `rounded-3xl backdrop-blur-lg border border-[#5b84b1]/20 transition-all duration-700 bg-[#f4f4f4]/90 text-black`;

  
  const hoverClasses = hoverEffect 
    ? `hover:transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500/30` 
    : '';
  
  return (
    <motion.div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(59, 130, 246, 0.1)'
      }}
    >
      {/* Edge highlight */}
      <div className="absolute inset-0 rounded-3xl opacity-20" style={{
        background: 'linear-gradient(130deg, transparent 20%, rgba(59, 130, 246, 0.3), transparent 80%)',
        filter: 'blur(10px)',
        transform: 'rotate(-1deg) scale(1.02) translateY(2px)'
      }}></div>
      
      {/* Subtle blue top light */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div className="absolute h-1/2 w-full bg-gradient-to-b from-blue-500/10 to-transparent"></div>
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;