"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is the AI based on the official NEET syllabus?",
    answer: "Yes, the AI is explicitly grounded in the latest NCERT syllabus and past year papers to ensure it never teaches you out-of-syllabus concepts."
  },
  {
    question: "Are PYQs organized chapter-wise?",
    answer: "Absolutely. Our semantic search allows you to not only search chapter-wise but also by specific micro-topics within a chapter."
  },
  {
    question: "Can I generate unlimited mock tests?",
    answer: "Yes, our dynamic mock test engine can generate unlimited 720-mark papers with accurate NEET marking schemes (+4/-1)."
  },
  {
    question: "Is my progress saved?",
    answer: "Yes. Once you create an account, your daily streak, mock test scores, weak areas, and flashcard progress are securely saved and synced across devices."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-32 relative z-10 bg-secondary/10">
      <div className="container mx-auto px-4 max-w-3xl">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about NEET Master.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-semibold text-lg">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-muted-foreground">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
