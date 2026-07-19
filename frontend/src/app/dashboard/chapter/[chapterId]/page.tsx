"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, BookOpen, BrainCircuit, PlayCircle, 
  Target, Zap, Flame, FileText, CheckCircle2, Layers, X
} from "lucide-react";
import { MermaidDiagram } from "@/components/dashboard/MermaidDiagram";

interface Topic {
  id: number;
  name: string;
}

interface Chapter {
  id: number;
  name: string;
  unit_id: number;
  pdf_url: string;
  weightage: number;
  pyq_count: number;
  difficulty_level: string;
  estimated_time_minutes: number;
  importance_rating: number;
  topics?: Topic[];
}

export default function ChapterDashboard() {
  const { chapterId } = useParams();
  const router = useRouter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Mind Map State
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);
  const [mindMapData, setMindMapData] = useState<string | null>(null);

  // Topics State
  interface TopicItem {
    title: string;
    description: string;
    importance: string;
  }
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://neet-master.onrender.com"}/api/v1/syllabus/chapters/${chapterId}`);
        if (!res.ok) throw new Error("Failed to fetch chapter details");
        const data = await res.json();
        setChapter(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (chapterId) fetchChapter();
  }, [chapterId]);

  const generateMindMap = async () => {
    if (!chapter) return;
    setIsGeneratingMindMap(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://neet-master.onrender.com"}/api/v1/tutor/mindmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapter_name: chapter.name })
      });
      if (!res.ok) {
        if (res.status === 429 || res.status === 500) {
          const errorData = await res.json().catch(() => null);
          if (errorData?.detail?.includes("429") || errorData?.detail?.includes("RESOURCE_EXHAUSTED")) {
            throw new Error("API Rate Limit Exceeded. You are generating too fast! Please wait 15-20 seconds before trying again.");
          }
        }
        throw new Error("Failed to generate mind map");
      }
      
      const data = await res.json();
      setMindMapData(data.mermaid_code);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to generate mind map. Please try again later.");
    } finally {
      setIsGeneratingMindMap(false);
    }
  };

  const generateTopics = async () => {
    if (!chapter) return;
    setIsGeneratingTopics(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://neet-master.onrender.com"}/api/v1/tutor/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapter_name: chapter.name })
      });
      
      if (!res.ok) {
        if (res.status === 429 || res.status === 500) {
          const errorData = await res.json().catch(() => null);
          if (errorData?.detail?.includes("429") || errorData?.detail?.includes("RESOURCE_EXHAUSTED")) {
            throw new Error("API Rate Limit Exceeded. Please wait 15-20 seconds before trying again.");
          }
        }
        throw new Error("Failed to generate topics");
      }
      
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to generate topics. Please try again later.");
    } finally {
      setIsGeneratingTopics(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[80vh]"><div className="animate-pulse">Loading Chapter Dashboard...</div></div>;
  if (error || !chapter) return <div className="text-red-500 p-8 text-center">{error || "Chapter not found"}</div>;

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen pb-20">
      
      {/* Mind Map Full Screen Modal */}
      {mindMapData && (
        <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-sm flex flex-col p-4 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-green-500" />
              {chapter.name} - Concept Map
            </h2>
            <button 
              onClick={() => setMindMapData(null)}
              className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 bg-card rounded-2xl border p-4 overflow-auto shadow-2xl">
            <MermaidDiagram chart={mindMapData} />
          </div>
        </div>
      )}

      {/* Header */}
      <button 
        onClick={() => router.push("/syllabus")}
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Syllabus
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-md uppercase tracking-wider">
              {chapter.difficulty_level} Difficulty
            </span>
            <div className="flex items-center text-orange-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Flame key={i} className={`w-4 h-4 ${i < chapter.importance_rating ? 'fill-orange-500' : 'text-muted/30'}`} />
              ))}
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{chapter.name}</h1>
        </div>

        <Link 
          href={`/dashboard/books?url=${encodeURIComponent(chapter.pdf_url || '')}`}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-md"
        >
          <BookOpen className="w-5 h-5" />
          Read NCERT Book
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Learning Tools */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-purple-500" /> AI Learning Tools
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              
              <Link href={`/dashboard/chapter/${chapterId}/notes`} className="group border-2 border-border hover:border-purple-500/50 bg-card p-6 rounded-3xl transition-all block">
                <div className="bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-bold text-lg mb-2">Smart Notes</h3>
                <p className="text-muted-foreground text-sm">
                  Generate quick revision bullet points, flowcharts, and mnemonics for {chapter.name}.
                </p>
              </Link>

              <Link href={`/dashboard/chapter/${chapterId}/quiz`} className="group border-2 border-border hover:border-blue-500/50 bg-card p-6 rounded-3xl transition-all block cursor-pointer">
                <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-2">AI Mock Quiz</h3>
                <p className="text-muted-foreground text-sm">
                  Generate 10 custom MCQs based on this chapter to test your understanding.
                </p>
              </Link>



            </div>
          </section>

        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          <div className="bg-card border rounded-3xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-green-500" /> Interactive Mind Map
            </h3>
            <p className="text-muted-foreground text-sm mb-4">Visualize how concepts in {chapter.name} connect with each other.</p>
            
            <button 
              onClick={generateMindMap}
              disabled={isGeneratingMindMap}
              className={`w-full aspect-video bg-secondary/50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-border transition-colors group ${isGeneratingMindMap ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-green-500/50 hover:bg-green-500/5'}`}
            >
              {isGeneratingMindMap ? (
                <>
                  <BrainCircuit className="w-8 h-8 text-green-500 animate-pulse mb-2" />
                  <span className="font-medium text-sm text-green-600 animate-pulse">Generating Map...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-8 h-8 text-muted-foreground/50 group-hover:text-green-500 transition-colors mb-2" />
                  <span className="font-medium text-sm group-hover:text-green-600">Generate Mind Map</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-card border rounded-3xl p-6">
            <h3 className="font-bold text-lg mb-4">Chapter Topics</h3>
            
            {(!chapter.topics || chapter.topics.length === 0) ? (
              <p className="text-muted-foreground text-sm italic mb-4">Topics haven't been seeded for this chapter yet.</p>
            ) : (
              <div className="space-y-3">
                {chapter.topics.map((topic, index) => (
                  <div key={topic.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                    <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center text-xs font-bold border">{index + 1}</div>
                    <span className="font-medium text-sm">{topic.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
