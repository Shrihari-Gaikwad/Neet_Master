"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PlayCircle, ArrowRight, Sparkles, BrainCircuit, Layers, Target, CheckCircle2 } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2 space-y-8 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" /> NEET 2026/27 Edition
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Crack NEET with Your <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Personal AI Mentor</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Learn smarter with AI-generated notes, instant PYQ search, personalized revision, and realistic mock tests.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link
                href="/login"
                className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-xl bg-primary px-8 font-semibold text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary via-purple-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient"></span>
                <span className="relative flex items-center gap-2">Start Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
              </Link>
              <Link
                href="#demo"
                className="inline-flex h-14 items-center justify-center rounded-xl bg-card border border-border px-8 font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <PlayCircle className="w-5 h-5 mr-2" /> Watch Demo
              </Link>
            </div>
          </motion.div>

          {/* Right Animated Mockup */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="w-full lg:w-1/2 relative perspective-1000"
          >
            <div className="relative w-full max-w-lg mx-auto aspect-[4/3] bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out">
              
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="w-full bg-background/50 border border-border rounded-xl p-3 flex items-center gap-3 mb-6"
              >
                <span className="text-muted-foreground">🔍</span>
                <span className="font-mono text-sm">Human Heart</span>
                <motion.span 
                  animate={{ opacity: [1, 0, 1] }} 
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-1.5 h-4 bg-primary inline-block"
                ></motion.span>
              </motion.div>

              <div className="space-y-4">
                {[
                  { icon: BrainCircuit, text: "AI Notes Generated", color: "text-purple-500" },
                  { icon: Target, text: "124 PYQs Found", color: "text-blue-500" },
                  { icon: Layers, text: "Flashcards Created", color: "text-orange-500" },
                  { icon: CheckCircle2, text: "Mock Test Ready", color: "text-green-500" }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 + (index * 0.3) }}
                    className="flex items-center gap-4 bg-background/60 p-4 rounded-xl border border-border/50"
                  >
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="font-medium text-sm">{item.text}</span>
                  </motion.div>
                ))}
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
