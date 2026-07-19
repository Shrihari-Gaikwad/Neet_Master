"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, RefreshCcw, Layers, Zap, X, Check } from "lucide-react";

interface Flashcard {
  front: string;
  back: string;
}

export default function FlashcardsPage() {
  const { chapterId } = useParams();
  const router = useRouter();
  
  const [topic, setTopic] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionComplete, setSessionComplete] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setLoading(true);
    setError("");
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/v1/flashcards/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ topic, count: 10 })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "Failed to generate flashcards");
      }
      
      const data = await res.json();
      setCards(data.cards);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionComplete(true);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen pb-20">
      <button 
        onClick={() => router.push(`/chapter/${chapterId}`)}
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Chapter
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Generator Controls */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-card border rounded-3xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Smart Flashcards</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Generate AI-powered flashcards using spaced repetition principles.
            </p>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Topic</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Krebs Cycle"
                  className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading || !topic.trim()}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-50 mt-4"
              >
                {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</> : "Generate Flashcards"}
              </button>
            </form>
          </div>
        </div>

        {/* Flashcard Area */}
        <div className="w-full md:w-2/3 flex flex-col items-center">
          {error && (
            <div className="w-full p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 mb-6">
              {error}
            </div>
          )}

          {cards.length > 0 && !sessionComplete ? (
            <div className="w-full max-w-lg space-y-6">
              <div className="flex justify-between items-center text-sm font-bold text-muted-foreground px-2">
                <span>Card {currentIndex + 1} of {cards.length}</span>
                <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-orange-500" /> AI Generated</span>
              </div>
              
              {/* The Card */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full aspect-[4/3] perspective-1000 cursor-pointer group"
              >
                <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                  
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden bg-card border-2 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-md hover:border-primary/50 transition-colors">
                    <span className="absolute top-4 left-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Front</span>
                    <h2 className="text-2xl font-bold">{cards[currentIndex].front}</h2>
                    <p className="absolute bottom-6 text-sm text-muted-foreground animate-pulse">Click to flip</p>
                  </div>
                  
                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-primary/5 border-2 border-primary/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-md">
                    <span className="absolute top-4 left-4 text-xs font-bold text-primary uppercase tracking-wider">Back</span>
                    <h2 className="text-xl font-medium text-primary">{cards[currentIndex].back}</h2>
                  </div>
                  
                </div>
              </div>

              {/* Controls */}
              {isFlipped && (
                <div className="flex justify-center gap-4 pt-4 animate-in slide-in-from-bottom-4">
                  <button onClick={nextCard} className="flex-1 py-4 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors">
                    <X className="w-5 h-5" /> Forgot it
                  </button>
                  <button onClick={nextCard} className="flex-1 py-4 bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors">
                    <Check className="w-5 h-5" /> Got it!
                  </button>
                </div>
              )}
            </div>
          ) : sessionComplete ? (
            <div className="w-full h-full min-h-[400px] border-2 rounded-3xl flex flex-col items-center justify-center text-center bg-card p-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Session Complete!</h2>
              <p className="text-muted-foreground mb-8">You've reviewed all flashcards for this topic.</p>
              <button 
                onClick={() => handleGenerate(new Event('submit') as any)} 
                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 flex items-center gap-2"
              >
                <RefreshCcw className="w-5 h-5" /> Review Again
              </button>
            </div>
          ) : !loading && (
            <div className="w-full h-full min-h-[400px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-card/50">
              <Layers className="w-12 h-12 mb-4 opacity-20" />
              <p>Enter a topic to generate a smart flashcard deck.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
