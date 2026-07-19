"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, FileText } from "lucide-react";

interface Chapter {
  id: number;
  name: string;
  pdf_url?: string;
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

export default function Syllabus() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        // Because syllabus is public, no auth token needed for GET
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://neet-master.onrender.com"}/api/v1/syllabus/subjects`);
        if (!res.ok) {
          throw new Error("Failed to fetch syllabus data");
        }
        const data = await res.json();
        setSubjects(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSyllabus();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[80vh]">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-primary">NCERT Syllabus & Books</h1>
        <p className="text-muted-foreground max-w-2xl">
          Browse through the official NCERT textbooks. Click on any chapter to read the book directly!
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <p className="text-muted-foreground animate-pulse">Loading NCERT syllabus...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-8 text-center border rounded-xl bg-card text-muted-foreground border-dashed">
          No subjects found in the database.
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {subjects.map((subject) => {
            const class11Units = subject.units.filter(u => u.grade === "Class 11");
            const class12Units = subject.units.filter(u => u.grade === "Class 12");

            return (
              <div key={subject.id} className="flex flex-col border rounded-2xl shadow-sm bg-card overflow-hidden">
                <div className="p-6 bg-primary/5 border-b">
                  <h2 className="text-2xl font-extrabold text-primary">{subject.name}</h2>
                </div>
                
                <Tabs defaultValue="class11" className="flex-1 flex flex-col">
                  <div className="px-6 pt-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="class11">Class 11</TabsTrigger>
                      <TabsTrigger value="class12">Class 12</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  {/* Class 11 Content */}
                  <TabsContent value="class11" className="p-6 flex-1 m-0 space-y-6">
                    {class11Units.length > 0 ? (
                      class11Units.sort((a, b) => a.name.localeCompare(b.name)).map((unit) => (
                        <div key={unit.id} className="space-y-3">
                          {unit.name !== "Complete Book" && (
                            <h3 className="font-bold text-foreground border-b pb-1 text-sm text-primary uppercase tracking-wider">{unit.name}</h3>
                          )}
                          <ul className="space-y-2 pl-2">
                            {unit.chapters.sort((a, b) => {
                                // Extract numbers for sorting (e.g. "Chapter 1" vs "Chapter 10")
                                const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
                                const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
                                return numA - numB;
                            }).map((chapter) => (
                              <li key={chapter.id} className="text-sm">
                                <Link 
                                  href={`/dashboard/chapter/${chapter.id}`} 
                                  className="hover:text-primary transition-colors flex items-center group py-1"
                                >
                                  <FileText className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                                  <span className="font-medium text-muted-foreground group-hover:text-foreground">{chapter.name}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No Class 11 units available.</p>
                    )}
                  </TabsContent>

                  {/* Class 12 Content */}
                  <TabsContent value="class12" className="p-6 flex-1 m-0 space-y-6">
                    {class12Units.length > 0 ? (
                      class12Units.sort((a, b) => a.name.localeCompare(b.name)).map((unit) => (
                        <div key={unit.id} className="space-y-3">
                          {unit.name !== "Complete Book" && (
                            <h3 className="font-bold text-foreground border-b pb-1 text-sm text-primary uppercase tracking-wider">{unit.name}</h3>
                          )}
                          <ul className="space-y-2 pl-2">
                            {unit.chapters.sort((a, b) => {
                                const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
                                const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
                                return numA - numB;
                            }).map((chapter) => (
                              <li key={chapter.id} className="text-sm">
                                <Link 
                                  href={`/dashboard/chapter/${chapter.id}`} 
                                  className="hover:text-primary transition-colors flex items-center group py-1"
                                >
                                  <FileText className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                                  <span className="font-medium text-muted-foreground group-hover:text-foreground">{chapter.name}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No Class 12 units available.</p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
