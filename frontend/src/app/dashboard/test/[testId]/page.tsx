"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, LayoutGrid, CheckCircle2, AlertCircle } from "lucide-react";

interface Question {
  id: number;
  text: string;
  options: string[];
  subject: string;
}

interface TestData {
  id: number;
  title: string;
  total_marks: number;
  questions: Question[];
}

export default function ExamInterface() {
  const { testId } = useParams();
  const router = useRouter();
  
  const [test, setTest] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State for exam
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(10800); // 3 hours in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState<"hidden" | "warning" | "terminated">("hidden");
  const [tabSwitches, setTabSwitches] = useState(0);

  const abandonTest = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:8000/api/v1/test/${testId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      router.push("/dashboard/test/setup");
    } catch (err) {
      console.error(err);
      router.push("/dashboard/test/setup");
    }
  };

  // Anti-Cheat: Tab Visibility (5 second grace period, max 3 strikes)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setTabSwitches(prev => {
          const newCount = prev + 1;
          if (newCount > 3) {
            setModalState("terminated");
          } else {
            timeoutId = setTimeout(() => {
              setModalState("warning");
            }, 5000);
          }
          return newCount;
        });
      } else {
        // If they come back before 5 seconds, clear the timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Anti-Cheat: Browser Back / Close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);



  useEffect(() => {
    const fetchTest = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8000/api/v1/test/${testId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Failed to load test");
        const data = await res.json();
        
        // Check if test is already completed
        if (data.completed) {
          router.push(`/dashboard/test/${testId}/analysis`);
          return;
        }

        setTest(data);
        
        // If it's a mini test (360 marks), give them 1.5 hours instead of 3
        if (data.total_marks === 360) {
          setTimeLeft(5400); 
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId, router]);

  useEffect(() => {
    if (!test) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [test]);


  const toggleReview = (qId: number) => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(qId)) newSet.delete(qId);
      else newSet.add(qId);
      return newSet;
    });
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const initialTime = test?.total_marks === 360 ? 5400 : 10800;
      const timeTaken = initialTime - timeLeft;
      
      const res = await fetch(`http://localhost:8000/api/v1/test/${testId}/submit`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ answers, time_taken_seconds: timeTaken })
      });

      if (res.ok) {
        router.push(`/dashboard/test/${testId}/analysis`);
      } else {
        throw new Error("Submit failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting test");
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Loading Exam Environment...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-destructive">{error}</div>;
  if (!test) return <div className="min-h-screen flex items-center justify-center text-destructive">Test not found</div>;

  const currentQuestion = test.questions[currentIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      {/* Header */}
      <header className="h-16 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="font-bold text-lg">{test.title}</div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-orange-500 font-mono font-bold text-lg bg-orange-500/10 px-4 py-1.5 rounded-lg">
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Exam"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Main Question Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-8 max-w-4xl mx-auto w-full">
            
            <div className="flex justify-between items-center mb-8">
              <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-bold">
                {currentQuestion.subject}
              </span>
              <span className="text-muted-foreground font-medium">
                Question {currentIndex + 1} of {test.questions.length}
              </span>
            </div>

            <h2 className="text-2xl font-medium leading-relaxed mb-10">
              {currentQuestion.text}
            </h2>

            <div className="space-y-4">
              {currentQuestion.options.map((opt, idx) => {
                const letter = ["A", "B", "C", "D"][idx];
                const isSelected = answers[currentQuestion.id] === letter;
                return (
                  <label 
                    key={idx}
                    className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-card'}`}
                  >
                    <input 
                      type="radio" 
                      className="hidden" 
                      name={`q-${currentQuestion.id}`} 
                      checked={isSelected}
                      onChange={() => setAnswers(prev => ({...prev, [currentQuestion.id]: letter}))} 
                    />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${isSelected ? 'border-primary' : 'border-muted-foreground'}`}>
                      {isSelected && <div className="w-3 h-3 bg-primary rounded-full" />}
                    </div>
                    <span className="font-medium text-lg"><span className="mr-2 font-bold text-muted-foreground">{letter}.</span> {opt}</span>
                  </label>
                );
              })}
            </div>

          </div>
          
          {/* Bottom Actions */}
          <div className="mt-auto border-t bg-card p-4 flex justify-between items-center sticky bottom-0">
            <button 
              onClick={() => toggleReview(currentQuestion.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${markedForReview.has(currentQuestion.id) ? 'bg-orange-500 text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
            >
              <AlertCircle className="w-5 h-5" />
              {markedForReview.has(currentQuestion.id) ? 'Unmark Review' : 'Mark for Review'}
            </button>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-6 py-3 border rounded-xl font-medium hover:bg-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentIndex(prev => Math.min(test.questions.length - 1, prev + 1))}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90"
              >
                {currentIndex === test.questions.length - 1 ? 'Finish' : 'Save & Next'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Question Palette */}
        <div className="w-80 border-l bg-card flex flex-col">
          <div className="p-4 border-b font-bold flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" />
            Question Palette
          </div>
          
          <div className="p-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-5 gap-2">
              {test.questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isMarked = markedForReview.has(q.id);
                const isCurrent = currentIndex === idx;
                
                let btnClass = "w-10 h-10 rounded-full font-bold text-sm border-2 transition-all flex items-center justify-center ";
                if (isCurrent) btnClass += "border-primary ring-2 ring-primary/20 ";
                else btnClass += "border-transparent ";

                if (isMarked && isAnswered) btnClass += "bg-purple-600 text-white";
                else if (isMarked) btnClass += "bg-orange-500 text-white";
                else if (isAnswered) btnClass += "bg-green-500 text-white";
                else btnClass += "bg-secondary text-secondary-foreground";

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={btnClass}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="p-4 border-t text-sm space-y-2 font-medium">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded-full"></div> Answered</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-500 rounded-full"></div> Marked for Review</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-purple-600 rounded-full"></div> Answered & Marked</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-secondary rounded-full"></div> Not Visited</div>
          </div>
        </div>

      </div>

      {/* Anti-Cheat Abandon Modal */}
      {modalState !== "hidden" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border-2 border-red-500/20 max-w-md w-full rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            
            {modalState === "warning" ? (
              <>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Warning: Tab Switch Detected</h2>
                  <p className="text-muted-foreground">
                    You navigated away from the exam window. In a real NEET exam, you cannot pause or leave. Do you want to abandon this test? 
                  </p>
                  <p className="text-sm font-bold text-red-500 mt-2">
                    (Strike {tabSwitches} of 3)
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setModalState("hidden")}
                    className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Resume Test
                  </button>
                  <button 
                    onClick={abandonTest}
                    className="w-full py-3 border border-red-500/20 text-red-500 font-bold rounded-xl hover:bg-red-500/10 transition-colors"
                  >
                    Abandon & Delete Test
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Exam Terminated</h2>
                  <p className="text-muted-foreground">
                    You exceeded the maximum allowed tab switches (3). This mock test has been terminated and deleted from your records.
                  </p>
                </div>
                <button 
                  onClick={abandonTest}
                  className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
                >
                  Return to Dashboard
                </button>
              </>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
}
