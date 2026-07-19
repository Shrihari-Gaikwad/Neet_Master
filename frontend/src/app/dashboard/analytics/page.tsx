"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  BrainCircuit,
  BarChart3,
  BookOpen
} from "lucide-react";

interface GlobalAnalytics {
  history: {
    id: number;
    title: string;
    score: number;
    total_marks: number;
    date: string;
  }[];
  subject_accuracy: {
    Physics: number;
    Chemistry: number;
    Biology: number;
  };
  strong_zones: {
    chapter: string;
    subject: string;
    accuracy: number;
  }[];
  weak_zones: {
    chapter: string;
    subject: string;
    accuracy: number;
  }[];
  mistakes: {
    unattempted: number;
    incorrect: number;
    correct: number;
    total: number;
  };
}

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [data, setData] = useState<GlobalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/api/v1/analytics/global", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to load analytics");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl text-muted-foreground animate-pulse">Loading Analytics Engine...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-destructive">{error}</div>;
  if (!data) return null;

  const totalQuestions = data.mistakes.total;
  const attempted = data.mistakes.correct + data.mistakes.incorrect;
  const overallAccuracy = attempted > 0 ? Math.round((data.mistakes.correct / attempted) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Global Analytics</h1>
        <p className="text-muted-foreground">Track your consistency and identify your mastery across all subjects.</p>
      </div>

      {data.history.length === 0 ? (
        <div className="bg-card border rounded-3xl p-12 text-center flex flex-col items-center">
          <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Data Yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">You need to complete at least one mock test for the analytics engine to process your performance.</p>
          <button 
            onClick={() => router.push("/dashboard/test/setup")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Take a Mock Test
          </button>
        </div>
      ) : (
        <>
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <h3 className="text-muted-foreground font-medium mb-4 flex items-center gap-2"><Target className="w-4 h-4" /> Tests Completed</h3>
              <div className="text-5xl font-black">{data.history.length}</div>
            </div>
            
            <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <h3 className="text-muted-foreground font-medium mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Overall Accuracy</h3>
              <div className="text-5xl font-black text-green-500">{overallAccuracy}%</div>
            </div>
            
            <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <h3 className="text-muted-foreground font-medium mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Questions Solved</h3>
              <div className="text-5xl font-black text-primary">{attempted}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - History & Subjects */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Consistency Chart */}
              <div className="bg-card border rounded-3xl p-8 shadow-sm">
                <h3 className="font-bold text-xl mb-8 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Consistency Tracker
                </h3>
                
                <div className="h-64 flex items-end gap-2 md:gap-4 justify-between mt-8 relative border-b border-border/50 pb-2">
                  {/* Y-Axis scale lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                    <div className="w-full h-px bg-foreground"></div>
                    <div className="w-full h-px bg-foreground"></div>
                    <div className="w-full h-px bg-foreground"></div>
                    <div className="w-full h-px bg-foreground"></div>
                  </div>
                  
                  {data.history.map((test, idx) => {
                    // Maximum possible marks dynamically from the test (usually 360 or 720)
                    const percent = Math.max(0, Math.round((test.score / test.total_marks) * 100));
                    return (
                      <div key={test.id} className="flex flex-col items-center flex-1 group">
                        <div className="w-full bg-primary/20 rounded-t-lg relative flex items-end justify-center transition-all group-hover:bg-primary/30" style={{ height: `100%` }}>
                          <div 
                            className="w-full bg-primary rounded-t-lg transition-all duration-1000 ease-out flex items-start justify-center pt-2"
                            style={{ height: `${percent}%` }}
                          >
                            <span className="text-xs font-bold text-primary-foreground opacity-0 group-hover:opacity-100 -translate-y-8 absolute bg-foreground text-background px-2 py-1 rounded">
                              {test.score}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground mt-3 truncate w-full text-center">T{idx+1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Subject Mastery */}
              <div className="bg-card border rounded-3xl p-8 shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-primary" /> Subject Mastery
                </h3>
                <div className="space-y-6">
                  {[
                    { subj: "Biology", color: "bg-green-500" },
                    { subj: "Physics", color: "bg-purple-500" },
                    { subj: "Chemistry", color: "bg-orange-500" },
                  ].map((s) => {
                    const acc = data.subject_accuracy[s.subj as keyof typeof data.subject_accuracy];
                    return (
                      <div key={s.subj}>
                        <div className="flex justify-between items-end mb-2">
                          <span className="font-semibold text-lg">{s.subj}</span>
                          <span className="font-bold">{acc}% Accuracy</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                          <div className={`${s.color} h-3 rounded-full transition-all duration-1000`} style={{ width: `${acc}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column - Zones & Mistakes */}
            <div className="space-y-8">
              
              {/* Mistake Analysis */}
              <div className="bg-card border rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-6">Mistake Analysis</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 rounded-2xl flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-green-700 dark:text-green-400">Correct</div>
                      <div className="text-xs text-muted-foreground">Well done!</div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{data.mistakes.correct}</div>
                  </div>
                  <div className="p-4 bg-red-500/10 rounded-2xl flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-red-700 dark:text-red-400">Incorrect</div>
                      <div className="text-xs text-muted-foreground">Negative marking</div>
                    </div>
                    <div className="text-2xl font-bold text-red-600">{data.mistakes.incorrect}</div>
                  </div>
                  <div className="p-4 bg-blue-500/10 rounded-2xl flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-blue-700 dark:text-blue-400">Unattempted</div>
                      <div className="text-xs text-muted-foreground">Skipped</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{data.mistakes.unattempted}</div>
                  </div>
                </div>
              </div>

              {/* Weak Zones */}
              <div className="bg-card border rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-5 h-5" /> Weak Zones
                </h3>
                {data.weak_zones.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Not enough data to identify weak zones. Keep practicing!</p>
                ) : (
                  <div className="space-y-3">
                    {data.weak_zones.map((zone, idx) => (
                      <div key={idx} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-sm line-clamp-1 flex-1 pr-2">{zone.chapter}</span>
                          <span className="text-red-500 font-bold text-sm shrink-0">{zone.accuracy}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{zone.subject}</div>
                      </div>
                    ))}
                    <button className="w-full py-2 text-sm font-semibold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors mt-2">
                      Generate Weak Zone Test
                    </button>
                  </div>
                )}
              </div>

              {/* Strong Zones */}
              <div className="bg-card border rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-green-500">
                  <CheckCircle className="w-5 h-5" /> Strong Zones
                </h3>
                {data.strong_zones.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Not enough data to identify strong zones.</p>
                ) : (
                  <div className="space-y-3">
                    {data.strong_zones.map((zone, idx) => (
                      <div key={idx} className="p-3 bg-green-500/5 border border-green-500/10 rounded-xl">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-sm line-clamp-1 flex-1 pr-2">{zone.chapter}</span>
                          <span className="text-green-500 font-bold text-sm shrink-0">{zone.accuracy}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{zone.subject}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
