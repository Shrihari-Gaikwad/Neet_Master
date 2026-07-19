"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface TestQuestion {
  id: number;
  text: string;
  subject: string;
  selected_option: string | null;
  is_correct: boolean | null;
  correct_answer: string;
  explanation: string;
}

interface TestResult {
  id: number;
  title: string;
  total_marks: number;
  score: number;
  time_taken_seconds: number;
  completed: boolean;
  questions: TestQuestion[];
}

export default function TestAnalysis() {
  const { testId } = useParams();
  const router = useRouter();
  
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://neet-master.onrender.com"}/api/v1/test/${testId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Failed to load test results");
        const data = await res.json();
        
        if (!data.completed) {
          router.push(`/dashboard/test/${testId}`);
          return;
        }

        setResult(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchResult();
  }, [testId, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Loading Analysis...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-destructive">{error}</div>;
  if (!result) return null;

  const totalQuestions = result.questions.length;
  let correct = 0;
  let incorrect = 0;
  let unattempted = 0;

  const subjectStats: Record<string, { total: number, correct: number, incorrect: number }> = {};

  result.questions.forEach(q => {
    if (!subjectStats[q.subject]) {
      subjectStats[q.subject] = { total: 0, correct: 0, incorrect: 0 };
    }
    subjectStats[q.subject].total++;

    if (!q.selected_option) {
      unattempted++;
    } else if (q.is_correct) {
      correct++;
      subjectStats[q.subject].correct++;
    } else {
      incorrect++;
      subjectStats[q.subject].incorrect++;
    }
  });

  const attempted = correct + incorrect;
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  // Find strongest and weakest subjects
  let strongestSubject = "";
  let weakestSubject = "";
  let highestAcc = -1;
  let lowestAcc = 101;

  Object.entries(subjectStats).forEach(([subj, stats]) => {
    const subjAttempted = stats.correct + stats.incorrect;
    if (subjAttempted > 0) {
      const acc = (stats.correct / subjAttempted) * 100;
      if (acc > highestAcc) {
        highestAcc = acc;
        strongestSubject = subj;
      }
      if (acc < lowestAcc) {
        lowestAcc = acc;
        weakestSubject = subj;
      }
    }
  });

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen pb-20">
      
      <button 
        onClick={() => router.push("/dashboard")}
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </button>

      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Exam Analysis Report</h1>
        <p className="text-muted-foreground">{result.title} • Completed just now</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Score & Overview */}
        <div className="lg:col-span-1 space-y-8">
          
          <div className="bg-gradient-to-br from-primary to-indigo-600 text-white p-8 rounded-3xl shadow-lg text-center">
            <h2 className="text-primary-foreground/80 font-bold uppercase tracking-wider text-sm mb-4">Total Score</h2>
            <div className="text-6xl font-black mb-2">{result.score}<span className="text-3xl text-primary-foreground/50">/{result.total_marks}</span></div>
            <p className="text-primary-foreground/90 font-medium">
              {result.score > result.total_marks * 0.8 ? "Excellent performance!" : 
               result.score > result.total_marks * 0.5 ? "Good effort!" : "Needs Improvement"}
            </p>
          </div>

          <div className="bg-card border rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Accuracy</h3>
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32 rounded-full border-8 border-green-500 flex items-center justify-center">
                <span className="text-3xl font-bold">{accuracy}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center mt-6">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <div className="text-green-600 font-bold text-xl">{correct}</div>
                <div className="text-xs font-semibold text-green-700/70 uppercase">Correct</div>
              </div>
              <div className="p-3 bg-red-500/10 rounded-xl">
                <div className="text-red-600 font-bold text-xl">{incorrect}</div>
                <div className="text-xs font-semibold text-red-700/70 uppercase">Incorrect</div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column - Breakdown */}
        <div className="lg:col-span-2 space-y-8">

          {/* Subject Breakdown */}
          <div className="bg-card border rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-xl mb-6">Subject Breakdown</h3>
            <div className="space-y-6">
              {Object.entries(subjectStats).map(([subj, stats]) => {
                const subjScore = (stats.correct * 4) - (stats.incorrect * 1);
                const subjTotalMarks = stats.total * 4;
                const percent = Math.max(0, Math.round((subjScore / subjTotalMarks) * 100));
                
                let colorClass = "bg-blue-500";
                if (subj === "Biology") colorClass = "bg-green-500";
                if (subj === "Physics") colorClass = "bg-purple-500";
                if (subj === "Chemistry") colorClass = "bg-orange-500";

                return (
                  <div key={subj}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-semibold text-lg">{subj}</span>
                      <span className="font-bold">{subjScore}/{subjTotalMarks} marks</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                      <div className={`${colorClass} h-3 rounded-full transition-all`} style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


        </div>

      </div>
    </div>
  );
}
