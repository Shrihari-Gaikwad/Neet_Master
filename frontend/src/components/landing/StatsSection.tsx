"use client";

import { motion } from "framer-motion";
import { BookOpen, Target, BrainCircuit, RotateCcw, PenTool, Trophy, ArrowRight } from "lucide-react";

const steps = [
  { icon: BookOpen, label: "Learn", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Target, label: "Practice", color: "text-orange-500", bg: "bg-orange-500/10" },
  { icon: BrainCircuit, label: "AI Analysis", color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: RotateCcw, label: "Revision", color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { icon: PenTool, label: "Mock Test", color: "text-red-500", bg: "bg-red-500/10" },
  { icon: Trophy, label: "Crack NEET", color: "text-green-500", bg: "bg-green-500/10" }
];

export function StatsSection() {
  return (
    <section className="py-24 border-y border-border/50 bg-secondary/10 relative z-10 overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            The Ultimate Learning Journey
          </h2>
          <p className="text-muted-foreground">
            A scientifically proven, AI-driven loop to guarantee your success.
          </p>
        </div>

        {/* Timeline Desktop */}
        <div className="hidden md:flex items-center justify-between relative px-8">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-16 right-16 h-1 bg-border -translate-y-1/2 z-0">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.3 }}
              className="relative z-10 flex flex-col items-center bg-background p-4 rounded-2xl shadow-sm border border-border"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${step.bg}`}>
                <step.icon className={`w-6 h-6 ${step.color}`} />
              </div>
              <span className="font-bold text-sm whitespace-nowrap">{step.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Timeline Mobile */}
        <div className="md:hidden flex flex-col gap-6 relative pl-8">
          {/* Connecting Line */}
          <div className="absolute top-0 bottom-0 left-[39px] w-1 bg-border z-0">
            <motion.div 
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-full bg-gradient-to-b from-blue-500 via-purple-500 to-green-500"
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative z-10 flex items-center gap-6"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-background ${step.bg}`}>
                <step.icon className={`w-5 h-5 ${step.color}`} />
              </div>
              <div className="bg-card border border-border p-4 rounded-xl flex-1 shadow-sm">
                <span className="font-bold">{step.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
