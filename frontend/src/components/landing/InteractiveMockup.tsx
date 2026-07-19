"use client";

import { motion } from "framer-motion";

export function InteractiveMockup() {
  return (
    <section id="why-us" className="py-32 relative z-10 overflow-hidden bg-secondary/10">
      <div className="container mx-auto px-4">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            A beautiful experience, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">engineered for focus.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            No ads. No distractions. Just you and the most powerful AI study tools ever built for NEET.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto perspective-1000">
          <motion.div 
            initial={{ opacity: 0, rotateX: 20, y: 100 }}
            whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full aspect-[16/10] bg-card rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Fake Browser Chrome */}
            <div className="h-12 border-b border-border flex items-center px-4 gap-2 bg-secondary/50">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="mx-auto w-1/2 h-6 bg-background rounded-md border border-border flex items-center justify-center text-xs text-muted-foreground font-mono">
                neet-mentor.com/dashboard
              </div>
            </div>

            {/* Mock Dashboard Body */}
            <div className="flex-1 flex p-6 gap-6 bg-background/50">
              
              {/* Sidebar */}
              <div className="w-48 hidden md:flex flex-col gap-4">
                <div className="h-8 w-24 bg-primary/20 rounded mb-4"></div>
                {[1,2,3,4].map((i) => (
                  <div key={i} className={`h-8 rounded-lg ${i===1 ? 'bg-primary/10 w-full' : 'bg-secondary w-3/4'}`}></div>
                ))}
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col gap-6">
                
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="h-8 w-64 bg-foreground/10 rounded-lg mb-2"></div>
                    <div className="h-4 w-48 bg-muted rounded"></div>
                  </div>
                  <div className="h-12 w-32 bg-primary/20 rounded-xl"></div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1,2,3].map((i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                      className={`h-32 rounded-2xl border border-border p-4 ${i===1 ? 'bg-gradient-to-br from-primary/10 to-transparent border-primary/30' : 'bg-card'}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-foreground/5 mb-4"></div>
                      <div className="h-4 w-1/2 bg-foreground/10 rounded mb-2"></div>
                      <div className="h-3 w-1/3 bg-muted rounded"></div>
                    </motion.div>
                  ))}
                </div>

                {/* Big Chart Area */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="flex-1 rounded-2xl bg-card border border-border p-6 flex flex-col justify-end"
                >
                  <div className="flex items-end gap-2 h-3/4 w-full">
                    {[30, 50, 40, 70, 60, 90, 80].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        transition={{ delay: 1.2 + (i * 0.05), duration: 0.5 }}
                        className="flex-1 bg-primary/20 rounded-t-sm"
                      ></motion.div>
                    ))}
                  </div>
                </motion.div>

              </div>

            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
