"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Filter, BookOpen, Target, CheckCircle2, XCircle } from "lucide-react";

interface PYQ {
  id: number;
  text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
  year: number;
  subject: string;
}

export default function PYQPage() {
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [yearFilter, setYearFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  
  // Interactive state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchPYQs();
  }, [yearFilter, subjectFilter, difficultyFilter]);

  const fetchPYQs = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      
      const params = new URLSearchParams();
      if (yearFilter) params.append("year", yearFilter);
      if (subjectFilter) params.append("subject", subjectFilter);
      if (difficultyFilter) params.append("difficulty", difficultyFilter);
      
      const url = `${process.env.NEXT_PUBLIC_API_URL || "https://neet-master.onrender.com"}/api/v1/pyq${params.toString() ? `?${params.toString()}` : ''}`;
      
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch PYQs");
      
      const data = await res.json();
      setPyqs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId: number, optionLetter: string) => {
    if (showExplanations[qId]) return; // Don't allow changing answer after revealed
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionLetter }));
  };

  const handleCheckAnswer = (qId: number) => {
    setShowExplanations(prev => ({ ...prev, [qId]: true }));
  };

  const years = Array.from({length: 16}, (_, i) => 2023 - i); // 2008 to 2023
  const subjects = ["Physics", "Chemistry", "Biology"];
  const difficulties = ["Easy", "Medium", "Hard"];

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">NEET PYQ Bank</h1>
          <p className="text-muted-foreground">Practice previous year questions from 2008 to 2023.</p>
        </div>
        <div className="flex items-center gap-2 bg-card border rounded-xl p-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <span className="font-bold">{pyqs.length} Questions Loaded</span>
        </div>
      </div>

      <div className="bg-card border rounded-3xl p-6 mb-8 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <Filter className="w-5 h-5 text-muted-foreground hidden md:block" />
        
        <select 
          value={yearFilter} 
          onChange={e => setYearFilter(e.target.value)}
          className="w-full md:w-auto p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select 
          value={subjectFilter} 
          onChange={e => setSubjectFilter(e.target.value)}
          className="w-full md:w-auto p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select 
          value={difficultyFilter} 
          onChange={e => setDifficultyFilter(e.target.value)}
          className="w-full md:w-auto p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="">All Difficulties</option>
          {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Loader2 className="w-12 h-12 mb-4 animate-spin opacity-50" />
          <p>Loading PYQs...</p>
        </div>
      ) : pyqs.length === 0 ? (
        <div className="w-full h-full min-h-[300px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-card/50">
          <Target className="w-12 h-12 mb-4 opacity-20" />
          <p>No questions found for the selected filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pyqs.map((q, idx) => {
            const isRevealed = showExplanations[q.id];
            const userAns = selectedAnswers[q.id];
            const isCorrect = userAns === q.correct_answer;

            return (
              <div key={q.id} className="bg-card border rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-muted-foreground">
                    NEET {q.year} • {q.subject}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    q.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' :
                    q.difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-green-500/10 text-green-500'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-medium mb-6">
                  {idx + 1}. {q.text}
                </h3>

                <div className="grid md:grid-cols-2 gap-3 mb-6">
                  {q.options.map((option, oIdx) => {
                    const letters = ["A", "B", "C", "D"];
                    const optLetter = letters[oIdx] || option.charAt(7); // Fallback if format differs
                    const isSelected = userAns === optLetter;
                    const isActualCorrect = q.correct_answer === optLetter;
                    
                    let style = "border-border hover:border-primary/50 bg-background";
                    if (isRevealed) {
                      if (isActualCorrect) style = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
                      else if (isSelected) style = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                      else style = "opacity-50 border-border bg-background";
                    } else if (isSelected) {
                      style = "border-primary bg-primary/10";
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(q.id, optLetter)}
                        disabled={isRevealed}
                        className={`text-left p-4 rounded-2xl border-2 transition-all ${style}`}
                      >
                        <span className="font-bold mr-2">{optLetter}.</span>
                        {option.replace(/^Option [A-D]:?\s*/i, '')}
                      </button>
                    );
                  })}
                </div>

                {!isRevealed ? (
                  <button
                    onClick={() => handleCheckAnswer(q.id)}
                    disabled={!userAns}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    Check Answer
                  </button>
                ) : (
                  <div className={`p-4 rounded-2xl flex flex-col md:flex-row items-start gap-4 animate-in fade-in ${
                    isCorrect ? 'bg-green-500/10 border border-green-500/20 text-green-800 dark:text-green-200' : 'bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-200'
                  }`}>
                    {isCorrect ? (
                      <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-500 shrink-0 mt-1" />
                    )}
                    <div>
                      <h4 className="font-bold text-lg mb-1">{isCorrect ? "Correct!" : `Incorrect. The answer is ${q.correct_answer}`}</h4>
                      <p className="opacity-90 leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
