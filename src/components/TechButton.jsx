import React from 'react';
import { motion } from 'framer-motion';

// Clean Button Component
const TechButton = ({ children, onClick, className, primary = false }) => {
  const baseClasses = `relative overflow-hidden rounded-2xl font-medium transition-all duration-500 transform perspective-[1000px]`;
  
  const colorClasses = primary
    ? `bg-blue-600 text-white border border-blue-500/50 hover:bg-blue-700`
    : `bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800 hover:border-blue-600/50`;
  
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${colorClasses} ${className} hover:scale-105`}
      style={{
        boxShadow: primary 
          ? `0 5px 15px rgba(59, 130, 246, 0.3), inset 0 0 0 1px rgba(59, 130, 246, 0.2)` 
          : `0 5px 15px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(59, 130, 246, 0.1)`
      }}
    >
      {/* Light sweep effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      <div className="relative flex items-center justify-center z-10">
        {children}
      </div>
    </button>
  );
};

export default TechButton;