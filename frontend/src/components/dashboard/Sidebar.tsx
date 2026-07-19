"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  BookOpen, 
  HelpCircle, 
  PenTool, 
  BarChart3, 
  Trophy, 
  Settings,
  Menu,
  Plus,
  BrainCircuit,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: BookOpen, label: "Syllabus", href: "/dashboard/syllabus" },
  { icon: HelpCircle, label: "PYQs", href: "/dashboard/pyqs" },
  { icon: PenTool, label: "Mock Tests", href: "/dashboard/test/setup" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },

];

export function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const [recentActivity, setRecentActivity] = useState([
    "Human Physiology",
    "Genetics",
    "Ray Optics"
  ]);

  useEffect(() => {
    const stored = localStorage.getItem("last_opened_chapter");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecentActivity([parsed.name, "Genetics", "Ray Optics"]);
      } catch(e) {}
    }
  }, [pathname]);

  return (
    <motion.aside
      initial={{ width: 60 }}
      animate={{ width: expanded ? 240 : 60 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="sticky top-0 h-screen z-50 bg-[#171717] text-white flex flex-col overflow-hidden shrink-0"
    >
      {/* Top Header */}
      <div className={`flex items-center h-[65px] shrink-0 ${expanded ? 'px-4' : 'justify-center'}`}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="group p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white flex items-center justify-center relative w-9 h-9"
        >
          <BrainCircuit className="w-5 h-5 absolute transition-opacity group-hover:opacity-0" />
          <div className="w-5 h-5 absolute opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {expanded ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </div>
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 ml-3 overflow-hidden"
            >
              <span className="font-semibold text-sm whitespace-nowrap tracking-wide">NEET Master</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`flex-1 overflow-y-auto overflow-x-hidden py-2 flex flex-col gap-6 custom-scrollbar ${expanded ? 'px-3' : 'px-2'}`}>
        
        {/* Main Navigation */}
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center p-2.5 rounded-lg transition-colors ${
                  expanded ? 'gap-3 justify-start' : 'justify-center'
                } ${
                  isActive 
                    ? "text-white font-medium" 
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
                title={!expanded ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>

        {/* Recent Activity */}
        {expanded && (
          <div className="flex flex-col gap-1 mt-4 border-t border-white/10 pt-4">
            <div className="px-3 py-2 text-xs font-semibold text-white/40 mb-1">
              Continue Learning
            </div>
            {recentActivity.map((topic, idx) => (
              <button
                key={idx}
                className="flex items-center gap-3 p-2.5 rounded-lg transition-colors text-white/70 hover:bg-white/5 hover:text-white"
                title={topic}
              >
                <MessageSquare className="w-4 h-4 shrink-0 opacity-50" />
                <span className="whitespace-nowrap overflow-hidden text-sm text-left truncate">{topic}</span>
              </button>
            ))}
          </div>
        )}
      </div>

    </motion.aside>
  );
}
