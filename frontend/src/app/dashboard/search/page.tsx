"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Loader2, BookOpen } from "lucide-react";

interface SearchResult {
  id: string;
  question: string;
  options: string;
  answer: string;
  year: number;
  subject: string;
  chapter: string;
  score: number;
  is_pyq: boolean;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Read query param on mount and auto-search
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      executeSearch(q);
    }
  }, [searchParams]);

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://neet-master.onrender.com"}/api/v1/search?query=${encodeURIComponent(searchQuery)}&limit=10`);
      if (!res.ok) {
        throw new Error("Failed to fetch search results");
      }
      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[80vh]">
      <div className="flex flex-col items-center justify-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-primary mt-8">Global Question Search</h1>
        <p className="text-muted-foreground max-w-xl text-center">
          Search for Previous Year Questions and Mock Questions using natural language. Try searching for concepts, topics, or exact questions!
        </p>
        
        <form onSubmit={handleSearch} className="w-full max-w-2xl relative mt-4">
          <div className="relative flex items-center w-full group">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g. Questions about plant kingdom or thermodynamics..."
              className="w-full h-14 pl-12 pr-32 rounded-2xl border-2 border-border focus:border-primary focus:outline-none bg-card text-foreground shadow-sm transition-all"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 h-10 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </button>
          </div>
        </form>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-center">
            {error}
          </div>
        )}

        {!loading && searched && results.length === 0 && !error && (
          <div className="text-center py-12 border-2 border-dashed rounded-2xl bg-card/50">
            <p className="text-muted-foreground">No relevant questions found for your query. Try rephrasing!</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider mb-2">
              Top Matches ({results.length})
            </h2>
            {results.map((res) => (
              <div key={res.id} className="p-6 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="flex items-center space-x-2 text-xs font-semibold text-primary mb-3 bg-primary/10 w-fit px-3 py-1 rounded-full">
                  <BookOpen className="w-3 h-3" />
                  <span>{res.subject}</span>
                  <span className="text-muted-foreground px-1">•</span>
                  <span>{res.chapter}</span>
                  {res.is_pyq && (
                    <>
                      <span className="text-muted-foreground px-1">•</span>
                      <span>NEET {res.year}</span>
                    </>
                  )}
                </div>
                
                <div className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded border ${res.is_pyq ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'}`}>
                  {res.is_pyq ? "Official PYQ" : "Mock Question"}
                </div>
                
                <h3 className="text-lg font-medium mb-4 pr-24">{res.question}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {res.options.split(", ").map((opt, i) => {
                    const isCorrect = opt.trim() === res.answer.trim();
                    const isRevealed = revealed[res.id];
                    let bgClass = 'bg-secondary/50';
                    if (isRevealed && isCorrect) {
                      bgClass = 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400 font-medium';
                    }
                    
                    return (
                      <div 
                        key={i} 
                        className={`p-3 rounded-lg border text-sm transition-colors ${bgClass}`}
                      >
                        <span className="font-bold mr-2 opacity-50">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-border/50">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleReveal(res.id)}
                      className="text-sm font-medium bg-secondary hover:bg-secondary/80 text-foreground px-4 py-1.5 rounded-lg transition-colors"
                    >
                      {revealed[res.id] ? "Hide Answer" : "Show Answer"}
                    </button>
                    {revealed[res.id] && (
                      <div className="text-sm font-medium animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="text-muted-foreground">Correct Answer:</span> <span className="text-green-600 dark:text-green-400">{res.answer}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    Relevance: {(res.score * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-pulse text-muted-foreground">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
