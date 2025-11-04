"use client";

import { motion } from "framer-motion";

export function Intro() {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Subtle background orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl -z-10"></div>
      
      <motion.div 
        className="max-w-4xl mx-auto text-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-full shadow-sm mb-6"
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-sm font-medium text-blue-600">
            Healthcare Innovation
          </span>
        </motion.div>
        
        <motion.h1 
          className="text-5xl font-bold text-gray-900 mb-4 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Ocura360 Blog
        </motion.h1>
        
        <motion.p 
          className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Expert insights on clinic management, ABDM integration, and modern healthcare technology.
        </motion.p>
      </motion.div>
    </section>
  );
}
