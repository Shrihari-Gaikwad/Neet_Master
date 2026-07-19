"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Suspense } from "react";

function BookViewer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pdfUrl = searchParams.get("url");

  if (!pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
        <BookOpen className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
        <h1 className="text-2xl font-bold mb-2">No Book Selected</h1>
        <p className="text-muted-foreground mb-6">Please select a chapter from the syllabus to read.</p>
        <button 
          onClick={() => router.push("/syllabus")}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go to Syllabus
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background">
      {/* Floating Back Button */}
      <button 
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-10 flex items-center justify-center w-10 h-10 bg-background/80 backdrop-blur-md border border-border text-foreground hover:bg-background rounded-full shadow-lg transition-all hover:scale-105"
        title="Go Back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Full Screen Book Viewer */}
      <iframe 
        src={pdfUrl} 
        className="absolute inset-0 w-full h-full border-0"
        title="NCERT Book Viewer"
      />
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[80vh] animate-pulse text-muted-foreground">Loading Book Viewer...</div>}>
      <BookViewer />
    </Suspense>
  );
}
