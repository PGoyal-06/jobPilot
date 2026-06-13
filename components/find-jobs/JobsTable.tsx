"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { JobRow } from "@/app/find-jobs/page";
import { MATCH_THRESHOLD } from "@/lib/utils";

const PAGE_SIZE = 20;

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 2) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "bg-success";
  if (score >= 75) return "bg-info";
  return "bg-warning";
}

function MatchScoreBar({ score }: { score: number }) {
  const fill = getScoreColor(score);
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1 w-20 overflow-hidden rounded-full bg-border-light">
        <div className={`h-full rounded-full ${fill}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-medium text-text-primary">{score}%</span>
    </div>
  );
}

function CompanyIcon() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-secondary">
      <Building2 className="h-4 w-4 text-text-muted" />
    </div>
  );
}

type MatchFilter = "all" | "high" | "low";
type SortOrder = "newest" | "oldest" | "score";

const MATCH_OPTIONS: { value: MatchFilter; label: string }[] = [
  { value: "all", label: "All Matches" },
  { value: "high", label: "High Match" },
  { value: "low", label: "Low Match" },
];

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "score", label: "Match Score" },
];

function Dropdown<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const current = options.find((o) => o.value === value)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary"
      >
        {current.label}
        <ChevronDown className="h-4 w-4 text-text-muted" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 min-w-37 overflow-hidden rounded-lg border border-border bg-surface shadow-card">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-surface-secondary ${
                o.value === value ? "font-semibold text-accent" : "text-text-primary"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  const addPage = (n: number) => {
    if (!pages.includes(n)) pages.push(n);
  };
  addPage(1);
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    addPage(i);
  }
  if (current < total - 2) pages.push("...");
  addPage(total);
  return pages;
}

export function JobsTable({ jobs }: { jobs: JobRow[] }) {
  const router = useRouter();
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [filterText, setFilterText] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [matchFilter, sortOrder, filterText]);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (matchFilter === "high") {
      result = result.filter((j) => (j.match_score ?? 0) >= MATCH_THRESHOLD);
    } else if (matchFilter === "low") {
      result = result.filter((j) => (j.match_score ?? 0) < MATCH_THRESHOLD);
    }

    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      result = result.filter(
        (j) =>
          j.company?.toLowerCase().includes(q) ||
          j.title?.toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      if (sortOrder === "score") {
        return (b.match_score ?? 0) - (a.match_score ?? 0);
      }
      const aTime = new Date(a.found_at).getTime();
      const bTime = new Date(b.found_at).getTime();
      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });

    return result;
  }, [jobs, matchFilter, sortOrder, filterText]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pagedJobs = filteredJobs.slice(startIdx, startIdx + PAGE_SIZE);
  const showingFrom = filteredJobs.length === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + PAGE_SIZE, filteredJobs.length);

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card">
      {/* Filter row */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Filter by company or role..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <Dropdown
          value={matchFilter}
          options={MATCH_OPTIONS}
          onChange={setMatchFilter}
        />
        <Dropdown
          value={sortOrder}
          options={SORT_OPTIONS}
          onChange={setSortOrder}
        />
      </div>

      {/* Table */}
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="mb-3 h-10 w-10 text-text-muted" />
          <p className="text-sm font-medium text-text-primary">No jobs found yet</p>
          <p className="mt-1 text-sm text-text-secondary">
            Use the search above to discover matching roles.
          </p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="mb-3 h-10 w-10 text-text-muted" />
          <p className="text-sm font-medium text-text-primary">No results match your filters</p>
          <p className="mt-1 text-sm text-text-secondary">Try adjusting the filters above.</p>
        </div>
      ) : (
        <>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Match Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Salary Est.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Date Found
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedJobs.map((job, idx) => (
                <tr
                  key={job.id}
                  onClick={() => router.push(`/find-jobs/${job.id}`)}
                  className={`cursor-pointer hover:bg-surface-secondary ${
                    idx < pagedJobs.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <CompanyIcon />
                      <span className="text-sm font-medium text-text-primary">
                        {job.company ?? "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary">
                    {job.title ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <MatchScoreBar score={job.match_score ?? 0} />
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary">
                    {job.salary ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">
                    {formatRelativeTime(job.found_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination footer */}
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <p className="text-sm text-text-secondary">
              Showing{" "}
              <span className="font-semibold text-text-primary">{showingFrom}–{showingTo}</span>
              {" "}of{" "}
              <span className="font-semibold text-text-primary">{filteredJobs.length}</span>
              {filteredJobs.length !== jobs.length && (
                <> (filtered from <span className="font-semibold text-text-primary">{jobs.length}</span>)</>
              )}{" "}
              result{filteredJobs.length !== 1 ? "s" : ""}
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm text-text-primary hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                {getPageNumbers(safePage, totalPages).map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-sm text-text-muted">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`min-w-8 rounded-md border px-2 py-1.5 text-sm ${
                        p === safePage
                          ? "border-accent bg-accent font-semibold text-white"
                          : "border-border text-text-primary hover:bg-surface-secondary"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm text-text-primary hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
