"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Topic {
  id: number;
  name: string;
  chapter_id: number;
}

interface Chapter {
  id: number;
  name: string;
  weightage: number;
  subject_id: number;
}

export default function ChapterPage() {
  const params = useParams();
  const chapterId = params.chapterId as string;
  
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChapterAndTopics = async () => {
      try {
        // Fetch Chapter details
        const chapRes = await fetch(`http://localhost:8000/api/v1/syllabus/chapters/${chapterId}`);
        if (!chapRes.ok) throw new Error("Failed to fetch chapter");
        const chapData = await chapRes.json();
        setChapter(chapData);

        // Fetch Topics for the chapter
        const topRes = await fetch(`http://localhost:8000/api/v1/syllabus/chapters/${chapterId}/topics`);
        if (!topRes.ok) throw new Error("Failed to fetch topics");
        const topData = await topRes.json();
        setTopics(topData);
        
        // Save to local storage for "Continue Learning"
        localStorage.setItem("last_opened_chapter", JSON.stringify({
          id: chapData.id,
          name: chapData.name,
          subject_name: chapData.subject_name
        }));
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (chapterId) {
      fetchChapterAndTopics();
    }
  }, [chapterId]);

  return (
    <div className="container mx-auto p-8 min-h-[80vh]">
      <Link href="/syllabus" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Syllabus
      </Link>

      {loading ? (
        <div className="flex justify-center py-12">
          <p className="text-muted-foreground animate-pulse">Loading chapter details...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-2 border-b pb-6">
            <h1 className="text-4xl font-bold tracking-tight">{chapter?.name}</h1>
            <p className="text-muted-foreground">
              Select a topic below to read its detailed AI-generated notes.
            </p>
          </div>

          {topics.length === 0 ? (
            <div className="p-8 text-center border rounded-xl bg-card text-muted-foreground border-dashed">
              No topics found for this chapter yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => (
                <Link 
                  href={`/syllabus/topic/${topic.id}`} 
                  key={topic.id}
                  className="group flex flex-col p-6 border rounded-xl shadow-sm bg-card hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
                    {topic.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Read AI Notes &rarr;
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
