"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Sparkles, Loader2, ExternalLink } from "lucide-react";

export type CompanyResearch = {
  companyOverview: string;
  techStack: string[];
  culture: string[];
  whyThisRole: string;
  yourEdge: string[];
  gapsToAddress: string[];
  smartQuestions: string[];
  interviewPrep: string[];
  sources: string[];
};

type Props = {
  jobId: string;
  company: string | null;
  initialResearch: CompanyResearch | null;
};

export function CompanyResearchCard({ jobId, company, initialResearch }: Props) {
  const router = useRouter();
  const [isResearching, setIsResearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [research, setResearch] = useState<CompanyResearch | null>(initialResearch);

  async function handleResearch() {
    setIsResearching(true);
    setError(null);
    try {
      const res = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (data.success) {
        setResearch(data.research);
        router.refresh();
      } else {
        setError(data.error ?? "Research failed. Please try again.");
      }
    } catch {
      setError("Research failed. Please try again.");
    } finally {
      setIsResearching(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-text-muted" />
          <h2 className="text-base font-semibold text-text-primary">Company Research</h2>
          {research && (
            <span className="inline-flex items-center rounded-full bg-success-lightest px-2 py-0.5 text-xs font-medium text-success-foreground">
              Researched
            </span>
          )}
        </div>
        {!research && (
          <button
            onClick={handleResearch}
            disabled={isResearching}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isResearching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Researching…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Research Company
              </>
            )}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="mb-4 rounded-lg bg-error-lightest px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      {/* Empty state */}
      {!research && !isResearching && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="mb-3 h-10 w-10 text-text-muted" />
          <p className="text-sm font-medium text-text-primary">No research yet</p>
          <p className="mt-1 max-w-xs text-sm text-text-muted">
            Click &ldquo;Research Company&rdquo; to let the AI browse{" "}
            {company ?? "this company"}&apos;s public pages and build a Dossier
          </p>
        </div>
      )}

      {/* Loading state */}
      {!research && isResearching && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="mb-3 h-10 w-10 animate-spin text-accent" />
          <p className="text-sm font-medium text-text-primary">Researching {company ?? "company"}…</p>
          <p className="mt-1 text-sm text-text-muted">
            Browsing their website and building your dossier. This takes about 30–60 seconds.
          </p>
        </div>
      )}

      {/* Dossier */}
      {research && (
        <div className="flex flex-col gap-5">
          {/* Company Overview */}
          <div className="rounded-xl bg-surface-secondary p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">
              Company Overview
            </p>
            <p className="text-sm leading-6 text-text-primary">{research.companyOverview}</p>
          </div>

          {/* Tech Stack */}
          {research.techStack.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                Tech Stack
              </p>
              <div className="flex flex-wrap gap-2">
                {research.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-accent-muted px-2.5 py-1 text-xs font-medium text-accent"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Culture */}
          {research.culture.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                Culture &amp; Values
              </p>
              <ul className="flex flex-col gap-1.5">
                {research.culture.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-text-muted" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Why This Role */}
          {research.whyThisRole && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">
                Why This Role Exists
              </p>
              <p className="text-sm italic leading-6 text-text-secondary">{research.whyThisRole}</p>
            </div>
          )}

          {/* Your Edge */}
          {research.yourEdge.length > 0 && (
            <div className="rounded-xl bg-success-lightest p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-success-foreground">
                Your Edge
              </p>
              <ul className="flex flex-col gap-1.5">
                {research.yourEdge.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-success-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success-foreground opacity-60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gaps to Address */}
          {research.gapsToAddress.length > 0 && (
            <div className="rounded-xl bg-warning-light p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-warning">
                Areas to Address
              </p>
              <ul className="flex flex-col gap-1.5">
                {research.gapsToAddress.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-warning">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning opacity-60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Smart Questions */}
          {research.smartQuestions.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                Smart Questions to Ask
              </p>
              <ul className="flex flex-col gap-1.5">
                {research.smartQuestions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-text-muted" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interview Prep */}
          {research.interviewPrep.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                Interview Prep
              </p>
              <ul className="flex flex-col gap-1.5">
                {research.interviewPrep.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-text-muted" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources */}
          {research.sources.length > 0 && (
            <div className="border-t border-border pt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                Sources
              </p>
              <div className="flex flex-col gap-1">
                {research.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary truncate"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    {src}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
