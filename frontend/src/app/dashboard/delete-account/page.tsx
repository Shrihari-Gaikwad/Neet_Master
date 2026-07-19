"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function DeleteAccount() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safety check - require typing 'DELETE' or just their password
    if (!password) {
      setError("Please enter your password to confirm.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // We would call a DELETE /api/v1/users/me endpoint here.
      // Since it's MVP, we simulate the request:
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
         // Just a fake check for the MVP to see if the server responds
         // We should implement a real DELETE endpoint in FastAPI later.
         method: "GET"
      }).catch(() => null);

      // Clear token and redirect
      localStorage.removeItem("token");
      router.push("/?deleted=true");
      
    } catch (err: any) {
      setError("Failed to delete account. Please verify your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-destructive/10 p-8 shadow-xl border border-destructive/30">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-destructive">
            Delete Account
          </h2>
          <p className="mt-2 text-sm text-destructive/80 font-medium">
            Warning: This action is permanent and cannot be undone. All your progress will be lost.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive p-3 text-sm text-destructive-foreground font-medium">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleDelete}>
          <div>
            <label className="block text-sm font-bold text-destructive mb-1">
              Confirm your Password
            </label>
            <input
              type="password"
              required
              className="w-full rounded-md border border-destructive/50 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-4">
            <Link
              href="/syllabus"
              className="flex flex-1 justify-center rounded-md border border-input bg-background py-2.5 px-4 text-sm font-semibold hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 justify-center rounded-md bg-destructive py-2.5 px-4 text-sm font-semibold text-destructive-foreground shadow-sm hover:bg-destructive/90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete Permanently"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
