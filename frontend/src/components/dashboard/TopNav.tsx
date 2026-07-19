"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Search, Bell, ChevronDown, User, Settings, LogOut, Award, Moon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <>
      <nav className="sticky top-0 h-[65px] z-10 bg-background/95 backdrop-blur border-b border-border/50 flex items-center px-4 md:px-8 justify-between shrink-0">
        {/* Empty left spacer */}
        <div className="w-4 md:w-16 shrink-0"></div>

        {/* Center-Right Search Removed */}
        <div className="flex-1"></div>

        <div className="flex items-center space-x-4 shrink-0 pl-4 border-l border-border/50 relative">
          <button className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
          </button>

          <div className="relative">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 hover:bg-secondary py-1.5 px-3 rounded-full transition-colors outline-none"
            >
              <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                S
              </div>
              <span className="text-sm font-medium hidden md:block">Shrihari</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setProfileOpen(false)}
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 p-2 rounded-xl bg-card border border-border shadow-lg z-50 flex flex-col"
                  >
                    <div className="px-2 py-2">
                      <p className="text-sm font-medium">Shrihari</p>
                      <p className="text-xs text-muted-foreground">NEET 2026 Aspirant</p>
                    </div>
                    <div className="h-px bg-border my-1 -mx-2" />
                    <button className="flex items-center rounded-lg cursor-pointer py-2 px-2 hover:bg-secondary text-sm w-full transition-colors">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" /> Profile
                    </button>
                    <button className="flex items-center rounded-lg cursor-pointer py-2 px-2 hover:bg-secondary text-sm w-full transition-colors">
                      <Award className="mr-2 h-4 w-4 text-orange-500" /> Achievements
                    </button>
                    <button className="flex items-center rounded-lg cursor-pointer py-2 px-2 hover:bg-secondary text-sm w-full transition-colors">
                      <Settings className="mr-2 h-4 w-4 text-muted-foreground" /> Settings
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const root = document.documentElement;
                        if (root.classList.contains("dark")) {
                          root.classList.remove("dark");
                          localStorage.setItem("theme", "light");
                        } else {
                          root.classList.add("dark");
                          localStorage.setItem("theme", "dark");
                        }
                      }}
                      className="flex items-center justify-between rounded-lg cursor-pointer py-2 px-2 hover:bg-secondary text-sm w-full transition-colors"
                    >
                      <div className="flex items-center">
                        <Moon className="mr-2 h-4 w-4 text-muted-foreground" /> Theme
                      </div>
                      <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">Toggle</span>
                    </button>
                    <div className="h-px bg-border my-1 -mx-2" />
                    <button 
                      onClick={handleLogout} 
                      className="flex items-center rounded-lg cursor-pointer py-2 px-2 hover:bg-red-500/10 text-red-600 text-sm w-full transition-colors"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

      </nav>

    </>
  );
}
