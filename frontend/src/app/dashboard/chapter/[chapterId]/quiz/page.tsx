"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Target, CheckCircle2, XCircle } from "lucide-react";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
}

interface QuizData {
  title: string;
  subject: string;
  chapter: string;
  topic: string;
  difficulty: string;
  total_questions: number;
  questions: QuizQuestion[];
}

export default function QuizPage() {
  const { chapterId } = useParams();
  const router = useRouter();
  
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Mixed");
  const [questionType, setQuestionType] = useState("Mixed");
  
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setLoading(true);
    setError("");
    setQuizData(null);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsComplete(false);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/v1/quiz/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          subject: "Science", // Placeholder, ideally fetch from chapter data
          chapter: chapterId as string,
          topic,
          difficulty,
          number: 10,
          question_type: questionType
        })
      });

      if (!res.ok) throw new Error("Failed to generate AI Quiz");
      
      const data = await res.json();
      setQuizData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const checkAnswer = () => {
    if (!selectedOption) return;
    const currentQ = quizData!.questions[currentQIndex];
    const optionLetter = selectedOption.charAt(7); // "Option A" -> "A"
    if (optionLetter === currentQ.correct_answer) {
      setScore(prev => prev + 4);
    } else {
      setScore(prev => prev - 1);
    }
    setIsAnswered(true);
  };

  const nextQuestion = () => {
    if (currentQIndex < quizData!.questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsComplete(true);
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
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">AI Mock Quiz</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Generate highly customized MCQs based on specific topics to test your NEET readiness.
            </p>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Topic / Subtopic</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Projectile Motion"
                  className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="Easy">Easy (NCERT Direct)</option>
                  <option value="Medium">Medium (Application)</option>
                  <option value="Hard">Hard (Multi-concept)</option>
                  <option value="Mixed">Mixed (Standard NEET)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Question Type</label>
                <select 
                  value={questionType} 
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="Conceptual">Conceptual</option>
                  <option value="Numerical">Numerical</option>
                  <option value="Assertion-Reason">Assertion-Reason</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={loading || !topic.trim()}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 mt-4"
              >
                {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating Quiz...</> : "Generate Quiz"}
              </button>
            </form>
          </div>
        </div>

        {/* Quiz Area */}
        <div className="w-full md:w-2/3 flex flex-col items-center">
          {error && (
            <div className="w-full p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 mb-6">
              {error}
            </div>
          )}

          {!quizData && !loading && !error && (
            <div className="w-full h-full min-h-[400px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-card/50">
              <Target className="w-12 h-12 mb-4 opacity-20" />
              <p>Enter your preferences and generate a mock quiz to begin.</p>
            </div>
          )}

          {quizData && !isComplete && (
            <div className="w-full space-y-6">
              <div className="flex justify-between items-center text-sm font-bold text-muted-foreground bg-card p-4 rounded-2xl border">
                <span>Question {currentQIndex + 1} of {quizData.total_questions}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  quizData.questions[currentQIndex].difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' :
                  quizData.questions[currentQIndex].difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-500' :
                  'bg-green-500/10 text-green-500'
                }`}>
                  {quizData.questions[currentQIndex].difficulty}
                </span>
                <span>Score: <span className="text-primary">{score}</span></span>
              </div>

              <div className="bg-card border rounded-3xl p-8 shadow-sm">
                <h2 className="text-xl font-medium mb-8">
                  {quizData.questions[currentQIndex].question}
                </h2>

                <div className="space-y-3 mb-8">
                  {quizData.questions[currentQIndex].options.map((option, idx) => {
                    const isSelected = selectedOption === option;
                    let optionStyle = "border-border hover:border-primary/50 bg-background";
                    
                    if (isAnswered) {
                      const isCorrectAnswer = option.charAt(7) === quizData.questions[currentQIndex].correct_answer;
                      if (isCorrectAnswer) {
                        optionStyle = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
                      } else if (isSelected && !isCorrectAnswer) {
                        optionStyle = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                      } else {
                        optionStyle = "opacity-50 border-border bg-background";
                      }
                    } else if (isSelected) {
                      optionStyle = "border-primary bg-primary/10";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(option)}
                        disabled={isAnswered}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${optionStyle}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {!isAnswered ? (
                  <button 
                    onClick={checkAnswer}
                    disabled={!selectedOption}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    Check Answer
                  </button>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className={`p-4 rounded-2xl flex items-start gap-3 ${
                      selectedOption?.charAt(7) === quizData.questions[currentQIndex].correct_answer 
                        ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
                        : 'bg-red-500/10 text-red-700 dark:text-red-400'
                    }`}>
                      {selectedOption?.charAt(7) === quizData.questions[currentQIndex].correct_answer ? (
                        <CheckCircle2 className="w-6 h-6 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <h4 className="font-bold mb-1">
                          {selectedOption?.charAt(7) === quizData.questions[currentQIndex].correct_answer ? "Correct!" : "Incorrect"}
                        </h4>
                        <p className="text-sm opacity-90">{quizData.questions[currentQIndex].explanation}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={nextQuestion}
                      className="w-full py-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-2xl font-bold transition-colors"
                    >
                      {currentQIndex < quizData.questions.length - 1 ? "Next Question" : "Finish Quiz"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {isComplete && quizData && (
            <div className="w-full h-full border-2 rounded-3xl flex flex-col items-center justify-center text-center bg-card p-12">
              <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                <Target className="w-12 h-12 text-blue-500" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
              <p className="text-muted-foreground mb-8">You have completed the AI Mock Quiz.</p>
              
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
                <div className="bg-background border rounded-2xl p-4">
                  <div className="text-sm font-bold text-muted-foreground mb-1">Final Score</div>
                  <div className="text-3xl font-black text-primary">{score}</div>
                </div>
                <div className="bg-background border rounded-2xl p-4">
                  <div className="text-sm font-bold text-muted-foreground mb-1">Total Marks</div>
                  <div className="text-3xl font-black">{quizData.total_questions * 4}</div>
                </div>
              </div>

              <button 
                onClick={() => router.push(`/dashboard/chapter/${chapterId}`)} 
                className="px-8 py-3 bg-secondary text-secondary-foreground rounded-xl font-bold hover:bg-secondary/80 transition-colors"
              >
                Back to Chapter
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
