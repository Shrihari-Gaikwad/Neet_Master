"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Note {
  id: number;
  topic_id: number;
  content: string;
}

export default function TopicNotesPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;
  
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/syllabus/topics/${topicId}/notes`);
        if (!res.ok) {
          throw new Error("Failed to fetch or generate notes. Please try again.");
        }
        const data = await res.json();
        setNote(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (topicId) {
      fetchNotes();
    }
  }, [topicId]);

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[80vh] max-w-4xl">
      <button 
        onClick={() => router.back()} 
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Chapter
      </button>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">
            Our AI Tutor is writing comprehensive notes for this topic... 
          </p>
          <p className="text-xs text-muted-foreground">This usually takes about 5-10 seconds.</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      ) : note ? (
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl font-extrabold mt-8 mb-4 border-b pb-2" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-8 mb-4" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-6 mb-3" {...props} />,
              p: ({node, ...props}) => <p className="leading-relaxed mb-4" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
              li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold text-primary" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4" {...props} />,
              img: ({node, ...props}) => <img className="rounded-lg shadow-md my-6 max-h-[400px] object-cover mx-auto" {...props} />
            }}
          >
            {note.content}
          </ReactMarkdown>
        </div>
      ) : null}
    </div>
  );
}
