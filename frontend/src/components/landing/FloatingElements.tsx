"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Target, Star, ShieldCheck } from "lucide-react";

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      
      {/* Background Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px]"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[120px]"
      />

      {/* Floating Chips */}
      <motion.div 
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] right-[25%] hidden lg:flex items-center gap-2 bg-background/60 backdrop-blur-md border border-white/10 shadow-lg px-4 py-2 rounded-full"
      >
        <span className="text-xl">🧬</span>
        <span className="font-semibold text-sm">Biology</span>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[35%] left-[15%] hidden lg:flex items-center gap-2 bg-background/60 backdrop-blur-md border border-white/10 shadow-lg px-4 py-2 rounded-full"
      >
        <BrainCircuit className="w-4 h-4 text-purple-500" />
        <span className="font-semibold text-sm">AI Tutor</span>
      </motion.div>

      <motion.div 
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[40%] left-[10%] hidden lg:flex items-center gap-2 bg-background/60 backdrop-blur-md border border-white/10 shadow-lg px-4 py-2 rounded-full"
      >
        <Target className="w-4 h-4 text-orange-500" />
        <span className="font-semibold text-sm">720 Marks</span>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 25, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-[20%] right-[10%] hidden lg:flex items-center gap-2 bg-background/60 backdrop-blur-md border border-white/10 shadow-lg px-4 py-2 rounded-full"
      >
        <ShieldCheck className="w-4 h-4 text-green-500" />
        <span className="font-semibold text-sm">99% Accuracy</span>
      </motion.div>

    </div>
  );
}
