"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, Loader2, FlaskConical, Dna, Rocket, ChevronDown, ChevronRight, Check } from "lucide-react";

interface Chapter {
  id: number;
  name: string;
}

interface Unit {
  id: number;
  name: string;
  grade: string;
  chapters: Chapter[];
}

interface Subject {
  id: number;
  name: string;
  units: Unit[];
}

export default function TestSetup() {
  const router = useRouter();
  const [testType, setTestType] = useState<"full" | "mini">("mini");
  const [syllabusTree, setSyllabusTree] = useState<Subject[]>([]);
  
  // Track selected subjects (entire subject)
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set(["Physics", "Chemistry", "Biology"]));
  
  // Track selected chapters by their ID
  const [selectedChapters, setSelectedChapters] = useState<Set<number>>(new Set());
  
  // UI state for expanding subjects/grades
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://neet-master.onrender.com"}/api/v1/syllabus/tree`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to load syllabus");
        const data = await res.json();
        setSyllabusTree(data);
        
        // Auto-select all chapters initially
        const allChapterIds = new Set<number>();
        data.forEach((s: Subject) => {
          s.units.forEach(u => {
            u.chapters.forEach(c => allChapterIds.add(c.id));
          });
        });
        setSelectedChapters(allChapterIds);
        setFetching(false);
      } catch (err) {
        console.error(err);
        setFetching(false);
      }
    };
    fetchTree();
  }, []);

  const toggleSubject = (subjName: string) => {
    setSelectedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(subjName)) next.delete(subjName);
      else next.add(subjName);
      return next;
    });
  };

  const toggleChapter = (chapterId: number) => {
    setSelectedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };
  
  const selectAllClass = (subjectName: string, grade: string, select: boolean) => {
    setSelectedChapters(prev => {
      const next = new Set(prev);
      const subject = syllabusTree.find(s => s.name === subjectName);
      if (subject) {
        subject.units.filter(u => u.grade === grade).forEach(u => {
          u.chapters.forEach(c => {
            if (select) next.add(c.id);
            else next.delete(c.id);
          });
        });
      }
      return next;
    });
  };

  const toggleExpand = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, key: string) => {
    setter(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleGenerate = async () => {
    if (selectedSubjects.size === 0) return;
    setLoading(true);
    setError("");

    // Gather selected chapter names for the API
    const selectedChapterNames: string[] = [];
    syllabusTree.forEach(s => {
      if (selectedSubjects.has(s.name)) {
        s.units.forEach(u => {
          u.chapters.forEach(c => {
            if (selectedChapters.has(c.id)) {
              selectedChapterNames.push(c.name);
            }
          });
        });
      }
    });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://neet-master.onrender.com"}/api/v1/test/generate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          subjects: Array.from(selectedSubjects), 
          type: testType, 
          chapters: selectedChapterNames 
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || "Failed to generate test.");
      }

      const data = await res.json();
      router.push(`/dashboard/test/${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[80vh] flex flex-col items-center justify-center pb-24">
      <div className="max-w-3xl w-full space-y-8 bg-card border rounded-3xl p-8 md:p-10 shadow-sm">
        
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <BrainCircuit className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Mock Test Engine</h1>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-2xl font-medium text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          
          {/* Test Type */}
          <div>
            <h2 className="text-lg font-bold mb-3">1. Select Test Type</h2>
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => setTestType("mini")}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${testType === "mini" ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
              >
                <h3 className="font-bold text-lg">Mini Mock</h3>
                <p className="text-sm text-muted-foreground">90 Questions (360 Marks)</p>
              </div>
              <div 
                onClick={() => setTestType("full")}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${testType === "full" ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
              >
                <h3 className="font-bold text-lg">Full Mock</h3>
                <p className="text-sm text-muted-foreground">180 Questions (720 Marks)</p>
              </div>
            </div>
          </div>

          {/* Subjects & Chapters */}
          <div>
            <h2 className="text-lg font-bold mb-3">2. Customize Syllabus</h2>
            {fetching ? (
              <div className="p-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading Syllabus...</div>
            ) : (
              <div className="space-y-4">
                {syllabusTree.map(subj => {
                  const isSelected = selectedSubjects.has(subj.name);
                  const isExpanded = expandedSubjects.has(subj.name);
                  const Icon = subj.name === "Physics" ? Rocket : subj.name === "Chemistry" ? FlaskConical : Dna;
                  
                  return (
                    <div key={subj.id} className={`rounded-2xl border-2 transition-all overflow-hidden ${isSelected ? 'border-primary/50' : 'border-border'}`}>
                      <div className={`p-4 flex items-center justify-between ${isSelected ? 'bg-primary/5' : 'bg-background'}`}>
                        <div className="flex items-center gap-4 flex-1">
                          <button 
                            onClick={() => toggleSubject(subj.name)}
                            className="flex items-center gap-3 text-left flex-1"
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold">{subj.name}</h3>
                              <p className="text-xs text-muted-foreground">{isSelected ? "Included in test" : "Excluded"}</p>
                            </div>
                          </button>
                        </div>
                        {isSelected && (
                          <button 
                            onClick={() => toggleExpand(setExpandedSubjects, subj.name)}
                            className="p-2 hover:bg-muted rounded-lg"
                          >
                            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </button>
                        )}
                      </div>

                      {isSelected && isExpanded && (
                        <div className="p-4 pt-0 bg-primary/5 border-t border-border/50">
                          {["Class 11", "Class 12"].map(grade => {
                            const gradeKey = `${subj.name}-${grade}`;
                            const isGradeExpanded = expandedGrades.has(gradeKey);
                            const gradeUnits = subj.units.filter(u => u.grade === grade);
                            
                            if (gradeUnits.length === 0) return null;
                            
                            // Check if all chapters in this grade are selected
                            let allSelected = true;
                            let someSelected = false;
                            gradeUnits.forEach(u => {
                              u.chapters.forEach(c => {
                                if (selectedChapters.has(c.id)) someSelected = true;
                                else allSelected = false;
                              });
                            });
                            
                            return (
                              <div key={gradeKey} className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => toggleExpand(setExpandedGrades, gradeKey)}
                                      className="text-sm font-bold flex items-center"
                                    >
                                      {isGradeExpanded ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
                                      {grade}
                                    </button>
                                  </div>
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => selectAllClass(subj.name, grade, true)}
                                      className="text-xs text-primary font-semibold hover:underline"
                                    >
                                      Select All
                                    </button>
                                    <span className="text-muted-foreground/50 text-xs">|</span>
                                    <button 
                                      onClick={() => selectAllClass(subj.name, grade, false)}
                                      className="text-xs text-muted-foreground hover:underline"
                                    >
                                      Clear
                                    </button>
                                  </div>
                                </div>
                                
                                {isGradeExpanded && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-5 mt-2">
                                    {gradeUnits.map(unit => (
                                      <div key={unit.id} className="contents">
                                        {unit.chapters.map(chapter => (
                                          <label 
                                            key={chapter.id} 
                                            onClick={(e) => {
                                              e.preventDefault();
                                              toggleChapter(chapter.id);
                                            }}
                                            className="flex items-start gap-2 p-2 hover:bg-background/50 rounded-lg cursor-pointer group"
                                          >
                                            <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedChapters.has(chapter.id) ? 'bg-primary border-primary' : 'border-input bg-background group-hover:border-primary/50'}`}>
                                              {selectedChapters.has(chapter.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                                            </div>
                                            <span className="text-sm leading-tight flex-1">{chapter.name}</span>
                                          </label>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        <div className="pt-4 border-t">
          <button
            onClick={handleGenerate}
            disabled={loading || selectedSubjects.size === 0 || selectedChapters.size === 0}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Generating Exam...</>
            ) : (
              "Generate Exam Engine"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
