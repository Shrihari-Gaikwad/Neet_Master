"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  PlayCircle,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Target,
  Search
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastOpened, setLastOpened] = useState<{id: number, name: string, subject_name?: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
      fetchDashboardData(token);
    }
    
    const stored = localStorage.getItem("last_opened_chapter");
    if (stored) {
      try {
        setLastOpened(JSON.parse(stored));
      } catch (e) {}
    }
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://neet-master.onrender.com"}/api/v1/analytics/dashboard`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else if (res.status === 401) {
        // Token is invalid or user was deleted (e.g. DB wipe)
        localStorage.removeItem("token");
        router.push("/login");
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || loading) return <div className="min-h-screen flex items-center justify-center animate-pulse text-muted-foreground">Loading your workspace...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-red-500">Failed to load workspace</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-16 mt-8 font-sans">
      
      {/* Welcome Section */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4">
          Good Evening, Shrihari
        </h1>
        <p className="text-xl text-muted-foreground">
          Continue where you left off.
        </p>
      </motion.section>

      {/* Global Search Bar */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        <form onSubmit={handleSearch} className="relative w-full group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PYQs and Mock Questions by topic, keyword, or concept..."
            className="w-full h-16 pl-16 pr-6 rounded-3xl border-2 border-border focus:border-primary focus:outline-none bg-card/50 hover:bg-card focus:bg-card text-foreground shadow-sm hover:shadow-xl transition-all text-lg"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-2xl font-medium hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </div>
        </form>
      </motion.section>

      {/* Continue Learning */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-xl font-medium mb-6">Continue Learning</h2>
        <div 
          onClick={() => lastOpened ? router.push(`/dashboard/syllabus/${lastOpened.id}`) : router.push('/dashboard/syllabus')}
          className="bg-card/50 hover:bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-3xl p-8 cursor-pointer flex items-center justify-between group"
        >
          <div>
            <span className="text-sm font-medium text-blue-500 mb-2 block uppercase tracking-wider">
              {lastOpened?.subject_name || "Syllabus"}
            </span>
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              {lastOpened?.name || "Start Your Journey"}
            </h3>
            <p className="text-muted-foreground">
              {lastOpened ? "Click to resume studying this chapter." : "Pick a chapter from the syllabus to start learning."}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
            <PlayCircle className="w-6 h-6" />
          </div>
        </div>
      </motion.section>



      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-xl font-medium mb-6">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard/test/setup">
            <button className="px-6 py-3 rounded-2xl bg-secondary/50 hover:bg-secondary text-foreground text-sm font-medium transition-colors flex items-center gap-2">
              <Target className="w-4 h-4 text-red-500" /> Take Mock Test
            </button>
          </Link>
          <button className="px-6 py-3 rounded-2xl bg-secondary/50 hover:bg-secondary text-foreground text-sm font-medium transition-colors flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-500" /> Solve PYQs
          </button>
          <button className="px-6 py-3 rounded-2xl bg-secondary/50 hover:bg-secondary text-foreground text-sm font-medium transition-colors flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-orange-500" /> Revision
          </button>
          <button className="px-6 py-3 rounded-2xl bg-secondary/50 hover:bg-secondary text-foreground text-sm font-medium transition-colors flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" /> Generate Notes
          </button>
        </div>
      </motion.section>

      {/* Recent Mock Test & Analytics Preview */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <section>
          <h2 className="text-xl font-medium mb-6">Recent Test</h2>
          <div className="bg-card/50 hover:bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-3xl p-8 h-full flex flex-col justify-center">
            {data.recent_test ? (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{data.recent_test.title}</h3>
                    <p className="text-sm text-muted-foreground">{data.recent_test.completed_at}</p>
                  </div>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-semibold tracking-tight">{data.recent_test.score}</span>
                  <span className="text-muted-foreground mb-1">/ {data.recent_test.total_marks}</span>
                </div>
                {data.recent_test.diff > 0 && (
                  <p className="text-sm text-green-600 font-medium">+{data.recent_test.diff} marks from last test</p>
                )}
                {data.recent_test.diff < 0 && (
                  <p className="text-sm text-red-500 font-medium">{data.recent_test.diff} marks from last test</p>
                )}
                {data.recent_test.diff === 0 && (
                  <p className="text-sm text-muted-foreground font-medium">Same score as last test</p>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">You haven't completed any tests yet.</p>
                <Link href="/dashboard/test/setup">
                  <button className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary/20 transition-colors">
                    Take your first test
                  </button>
                </Link>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-6">Performance</h2>
          <div className="bg-card/50 hover:bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-3xl p-8 space-y-6">
            
            {["Biology", "Physics", "Chemistry"].map((subject, idx) => {
              const percentages = { Biology: data.progress?.Biology || 85, Physics: data.progress?.Physics || 40, Chemistry: data.progress?.Chemistry || 65 };
              const colors = { Biology: "bg-green-500", Physics: "bg-blue-500", Chemistry: "bg-orange-500" };
              const val = percentages[subject as keyof typeof percentages];
              const color = colors[subject as keyof typeof colors];

              return (
                <div key={subject}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium">{subject}</span>
                    <span className="text-sm text-muted-foreground">{val}%</span>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-1 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{ duration: 1, delay: 0.6 + (idx * 0.1) }}
                      className={`${color} h-1 rounded-full`}
                    />
                  </div>
                </div>
              );
            })}

          </div>
        </section>
      </motion.div>

      {/* Recent Activity */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h2 className="text-xl font-medium mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { title: "Generated Notes for Plant Physiology", time: "2 hours ago", icon: BookOpen },
            { title: "Solved 45 PYQs in Ray Optics", time: "Yesterday", icon: HelpCircle },
            { title: "Revised Flashcards: Molecular Basis of Inheritance", time: "Yesterday", icon: RotateCcw }
          ].map((activity, idx) => (
            <div key={idx} className="flex items-center justify-between py-4 border-b border-border/50 last:border-0 group cursor-pointer hover:px-2 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <activity.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{activity.title}</span>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </motion.section>

    </div>
  );
}
