"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles, FileText, Download, Bookmark } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function SmartNotesPage() {
  const { chapterId } = useParams();
  const router = useRouter();
  
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("detailed");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Chapter State
  const [chapter, setChapter] = useState<any>(null);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://neet-master.onrender.com"}/api/v1/syllabus/chapters/${chapterId}`);
        if (res.ok) {
          const data = await res.json();
          setChapter(data);
          setTopic(data.name); // Default to chapter name
        }
      } catch (err) {
        console.error("Failed to fetch chapter", err);
      }
    };
    if (chapterId) fetchChapter();
  }, [chapterId]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setLoading(true);
    setError("");
    setNotes("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://neet-master.onrender.com"}/api/v1/notes/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ topic, format })
      });

      if (!res.ok) {
        let errorMsg = "Failed to generate notes";
        try {
          const errorData = await res.json();
          if (errorData?.detail?.includes("429") || errorData?.detail?.includes("RESOURCE_EXHAUSTED")) {
            errorMsg = "API Rate Limit Exceeded. Please wait a few seconds before trying again.";
          } else {
            errorMsg = errorData?.detail || errorMsg;
          }
        } catch (e) {
          // ignore json parse error
        }
        throw new Error(errorMsg);
      }
      
      const data = await res.json();
      setNotes(data.content);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen pb-20">
      
      <button 
        onClick={() => router.push(`/dashboard/chapter/${chapterId}`)}
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Chapter
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Generator Controls */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-card border rounded-3xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Smart Notes</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Generate custom, high-yield NCERT study materials instantly using AI.
            </p>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">What topic do you want to study?</label>
                
                {chapter?.topics && chapter.topics.length > 0 ? (
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  >
                    <option value={chapter.name}>Entire Chapter ({chapter.name})</option>
                    {chapter.topics.map((t: any) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Structure of Mitochondria"
                    className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Note Format</label>
                <select 
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="detailed">Detailed Study Notes</option>
                  <option value="quick_revision">Quick Revision (Bullet Points)</option>
                  <option value="mnemonics">Mnemonics & Memory Tricks</option>
                  <option value="flowchart">Concept Flowchart</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={loading || !topic.trim()}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-50 mt-4"
              >
                {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</> : "Generate Notes"}
              </button>
            </form>
          </div>
        </div>

        {/* Generated Content Area */}
        <div className="w-full md:w-2/3">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 mb-6">
              {error}
            </div>
          )}

          {notes ? (
            <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 border-b flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-bold text-primary">{format.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors" title="Save to My Notes">
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors" title="Download PDF">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto max-h-[70vh]">
                <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-primary prose-a:text-primary">
                  <ReactMarkdown>{notes}</ReactMarkdown>
                </div>
              </div>
            </div>
          ) : !loading && (
            <div className="h-full min-h-[400px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-card/50">
              <Sparkles className="w-12 h-12 mb-4 opacity-20" />
              <p>Enter a topic and select a format to generate AI-powered study materials.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
