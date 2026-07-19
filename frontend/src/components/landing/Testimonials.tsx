"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "After using the AI revision planner, I stopped forgetting chapters. My mock scores jumped from 450 to 620 in two months.",
    author: "Sneha R.",
    role: "NEET 2025 Aspirant",
    rating: 5
  },
  {
    quote: "The semantic PYQ search is a game changer. I searched 'kidney filtration' and it found 15 related past year questions instantly.",
    author: "Rahul M.",
    role: "Dropper Batch",
    rating: 5
  },
  {
    quote: "Snap & Solve explained a physics numerical step-by-step better than my coaching teacher. Absolutely brilliant.",
    author: "Aditi P.",
    role: "Class 12",
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section id="reviews" className="py-32 relative z-10">
      <div className="container mx-auto px-4">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-bold tracking-tight mb-6">
            Trusted by future doctors.
          </h2>
          <p className="text-lg text-muted-foreground">
            Don't just take our word for it. See how AI is accelerating the preparation of thousands of NEET aspirants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="bg-card/40 backdrop-blur-sm border-2 border-border p-8 rounded-3xl"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-orange-500 text-orange-500" />
                ))}
              </div>
              <p className="text-lg font-medium mb-8 leading-relaxed">
                "{t.quote}"
              </p>
              <div>
                <p className="font-bold text-foreground">{t.author}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
