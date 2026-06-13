"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Sparkles } from "lucide-react";

type SearchResult = { total: number; strong: number };

export function SearchControls() {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);

  async function handleSearch() {
    if (!jobTitle.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/agent/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, location }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? "Search failed. Please try again.");
      } else {
        setResult({ total: data.total, strong: data.strong });
        router.refresh();
      }
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="flex items-end gap-4">
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Job Title
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Frontend Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Location
          </label>
          <input
            type="text"
            placeholder="Remote, New York..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={isLoading || !jobTitle.trim()}
          className="flex shrink-0 items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching…
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Find Jobs
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-warning">{error}</p>
      )}

      {result && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-success-lightest px-4 py-2.5">
          <Sparkles className="h-4 w-4 shrink-0 text-success-foreground" />
          <p className="text-sm font-medium text-success-foreground">
            Found <span className="font-semibold">{result.total}</span> jobs and saved{" "}
            <span className="font-semibold">{result.strong}</span> strong matches.
          </p>
        </div>
      )}
    </div>
  );
}
