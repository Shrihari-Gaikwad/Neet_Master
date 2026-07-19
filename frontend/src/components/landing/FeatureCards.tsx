"use client";

import { motion } from "framer-motion";
import { BrainCircuit, BookOpen, Search, BarChart3 } from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Mentor",
    description: "Explains every complex concept step-by-step just like a real teacher.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "group-hover:border-purple-500/50"
  },
  {
    icon: BookOpen,
    title: "AI Notes",
    description: "Generate instant detailed notes, flashcards, and mind maps for revision.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "group-hover:border-blue-500/50"
  },
  {
    icon: Search,
    title: "PYQ Search",
    description: "Find every related previous year question for any topic instantly.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "group-hover:border-orange-500/50"
  },
  {
    icon: BarChart3,
    title: "Performance Analysis",
    description: "Know exactly what chapters to improve based on your mock test data.",
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "group-hover:border-green-500/50"
  }
];

export function FeatureCards() {
  return (
    <section id="features" className="py-32 relative z-10">
      <div className="container mx-auto px-4">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Everything you need. <br />
            <span className="text-muted-foreground">Nothing you don't.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete suite of tools designed specifically to help you master the NEET syllabus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -5 }}
              className={`group relative overflow-hidden bg-card/40 backdrop-blur-sm border-2 border-border p-10 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 ${feature.border}`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feature.bg}`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
