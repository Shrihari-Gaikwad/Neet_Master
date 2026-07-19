"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2, Image as ImageIcon, Sparkles, AlertCircle } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function AIImageSolver() {
  const router = useRouter();
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [context, setContext] = useState("");
  
  const [solution, setSolution] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setSolution("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSolve = async () => {
    if (!file) return;
    
    setLoading(true);
    setError("");
    setSolution("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", file);
      if (context) formData.append("context", context);

      const res = await fetch("http://localhost:8000/api/v1/solver/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error("Failed to process image. Make sure the file is valid.");
      
      const data = await res.json();
      setSolution(data.solution);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen pb-20">
      
      <button 
        onClick={() => router.push("/dashboard")}
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </button>

      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border-4 border-background shadow-xl">
          <ImageIcon className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Snap & Solve</h1>
        <p className="text-muted-foreground">
          Stuck on a Physics numerical or a tricky Biology assertion-reason? 
          Upload a photo of the question and Gemini AI will provide a step-by-step solution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        
        {/* Upload Area */}
        <div className="space-y-6">
          <div className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="font-bold text-lg mb-4">Upload Question</h2>
            
            <div 
              className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-colors ${preview ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/50 cursor-pointer'}`}
              onClick={() => !preview && fileInputRef.current?.click()}
            >
              {preview ? (
                <div className="w-full relative rounded-xl overflow-hidden shadow-sm">
                  <img src={preview} alt="Question preview" className="w-full object-contain max-h-[300px]" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleClear(); }}
                    className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-lg hover:bg-black/80 transition-colors"
                  >
                    Clear Image
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-10 h-10 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="font-medium mb-1">Click to upload an image</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Additional Context (Optional)</label>
              <textarea 
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="E.g., I'm stuck on step 2, or what does option B mean?"
                className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none resize-none h-24 text-sm"
              ></textarea>
            </div>

            <button 
              onClick={handleSolve}
              disabled={loading || !file}
              className="w-full py-4 mt-6 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-50 text-lg shadow-md"
            >
              {loading ? (
                <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Analyzing Image...</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" /> Solve Question</>
              )}
            </button>
          </div>
        </div>

        {/* Solution Area */}
        <div className="space-y-6">
          <div className="bg-card border rounded-3xl overflow-hidden shadow-sm h-full flex flex-col">
            <div className="p-4 border-b flex items-center gap-2 bg-secondary/30">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="font-bold">AI Solution</span>
            </div>
            
            <div className="p-6 md:p-8 flex-1 overflow-y-auto">
              {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {solution ? (
                <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-primary prose-a:text-primary prose-li:my-1">
                  <ReactMarkdown>{solution}</ReactMarkdown>
                </div>
              ) : !loading && !error && (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-muted-foreground text-center">
                  <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                  <p>Upload a question and click Solve.<br/> The detailed, step-by-step solution will appear here.</p>
                </div>
              )}

              {loading && (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-primary/30" />
                    <Sparkles className="w-5 h-5 text-purple-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <p className="mt-4 font-medium animate-pulse text-primary">Gemini is thinking...</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
