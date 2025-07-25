import { useState } from 'react';
import { Mail, Shield, X, Award, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TechBackground from '../components/TechBackground';
import { SignIn } from "@clerk/clerk-react";

function SignInPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Tech Background */}
      <TechBackground />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Main Sign-in Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotateX: 10 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          rotateX: 0,
          transition: { 
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: 0.2
          }
        }}
        className="w-full max-w-lg p-10 rounded-3xl backdrop-blur-xl border border-gray-800/40 relative z-10 transform perspective-[1000px]"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(15,23,42,0.9))',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 5px 15px rgba(59, 130, 246, 0.1)'
        }}
      >
        {/* Blue glow effect */}
        <div className="absolute inset-0 rounded-3xl opacity-20 blur-md -z-10" style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.4), transparent 70%)',
          transform: 'scale(1.02) translateY(5px)'
        }}></div>
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <motion.div 
            className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center backdrop-blur-md group relative overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ rotate: 6, scale: 1.1 }}
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(99, 102, 241, 0.3))',
              boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(59, 130, 246, 0.2)',
            }}
          >
            <Mail className="w-12 h-12 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
          </motion.div>
          
          <motion.h1 
            className="text-4xl font-bold mb-3 text-transparent bg-clip-text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            style={{
              backgroundImage: 'linear-gradient(135deg, #60a5fa, #3b82f6)'
            }}
          >
            Pierre Executive
          </motion.h1>
          
          <motion.p 
            className="text-lg text-gray-300 leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Access your executive dashboard and integrated workspace
          </motion.p>
          
          <motion.div 
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm bg-blue-500/10 text-blue-400 border border-blue-500/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <Shield className="w-4 h-4" />
            <span>Enterprise Security</span>
          </motion.div>
        </div>

        {/* Clerk Sign-in UI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="clerk-form-container"
        >
          <SignIn 
            routing="path" 
            path="/sign-in" 
            signUpUrl="/sign-up"
            redirectUrl="/dashboard"
            appearance={{
              elements: {
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                card: "bg-transparent shadow-none",
                formFieldInput: "bg-gray-900/50 backdrop-blur-md border-gray-800 text-white placeholder:text-gray-500",
                footer: "text-gray-400"
              }
            }}
          />
        </motion.div>

        <motion.div 
          className="mt-8 text-xs text-center text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <div className="flex items-center justify-center gap-2">
            <Award className="w-4 h-4" />
            <span>Secure enterprise authentication with calendar integration</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SignInPage;