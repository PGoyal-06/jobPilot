import Link from "next/link";

import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { ActivityList } from "@/components/dashboard/ActivityList";
import type { ActivityEntry } from "@/components/dashboard/ActivityList";
import { CompanyResearchChart } from "@/components/dashboard/CompanyResearchChart";
import { JobsFoundChart } from "@/components/dashboard/JobsFoundChart";
import { MatchScoreChart } from "@/components/dashboard/MatchScoreChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { Navbar } from "@/components/layout/Navbar";
import { createInsforgeServer, requireCurrentUser } from "@/lib/insforge-server";
import type { ProfileRow } from "@/lib/profile-utils";

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  if (diffMs < 0) return "Just now";
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(diffMs / 86_400_000);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type JobRow = {
  match_score: number | null;
  company_research: unknown;
  found_at: string;
  company: string | null;
};

type RunRow = {
  job_title_searched: string | null;
  jobs_found: number;
  completed_at: string | null;
  started_at: string;
};

function jobsFoundChartData(runs: RunRow[]): { day: string; value: number }[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return {
      day: label,
      value: runs
        .filter((r) => (r.completed_at ?? r.started_at).startsWith(dateStr))
        .reduce((sum, r) => sum + r.jobs_found, 0),
    };
  });
}

function matchScoreChartData(jobs: JobRow[]): { range: string; value: number }[] {
  return [
    { range: "50-60%", min: 50, max: 60 },
    { range: "60-70%", min: 60, max: 70 },
    { range: "70-80%", min: 70, max: 80 },
    { range: "80-90%", min: 80, max: 90 },
    { range: "90-100%", min: 90, max: 101 },
  ].map(({ range, min, max }) => ({
    range,
    value: jobs.filter(
      (j) => j.match_score != null && j.match_score >= min && j.match_score < max,
    ).length,
  }));
}

function researchChartData(jobs: JobRow[]): { day: string; value: number }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      value: jobs.filter(
        (j) => j.company_research != null && j.found_at.startsWith(dateStr),
      ).length,
    };
  });
}

export default async function DashboardPage() {
  const user = await requireCurrentUser();
  const insforge = await createInsforgeServer();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [{ data: profile }, { data: jobs }, { data: runs }] = await Promise.all([
    insforge.database
      .from("profiles")
      .select("is_complete")
      .eq("id", user.id)
      .single(),
    insforge.database
      .from("jobs")
      .select("match_score, company_research, found_at, company")
      .eq("user_id", user.id),
    insforge.database
      .from("agent_runs")
      .select("job_title_searched, jobs_found, completed_at, started_at")
      .eq("user_id", user.id)
      .eq("status", "complete")
      .gte("completed_at", thirtyDaysAgo.toISOString())
      .order("completed_at", { ascending: false }),
  ]);

  const isProfileComplete =
    (profile as Pick<ProfileRow, "is_complete"> | null)?.is_complete ?? false;

  const jobRows = (jobs ?? []) as JobRow[];
  const runRows = (runs ?? []) as RunRow[];

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalJobs = jobRows.length;

  const scoredJobs = jobRows.filter((j) => j.match_score != null);
  const avgMatchRate =
    scoredJobs.length > 0
      ? Math.round(
          scoredJobs.reduce((sum, j) => sum + j.match_score!, 0) /
            scoredJobs.length,
        )
      : 0;

  const companiesResearched = jobRows.filter(
    (j) => j.company_research != null,
  ).length;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const jobsThisWeek = jobRows.filter(
    (j) => new Date(j.found_at) >= oneWeekAgo,
  ).length;

  // ── Activity list ──────────────────────────────────────────────────────────
  const runActivities = runRows.map((r) => ({
    text: `Found ${r.jobs_found} job${r.jobs_found === 1 ? "" : "s"} for ${r.job_title_searched ?? "unknown"}`,
    time: relativeTime(r.completed_at ?? r.started_at),
    dot: "run" as const,
    sortKey: new Date(r.completed_at ?? r.started_at).getTime(),
  }));

  const researchActivities = jobRows
    .filter((j) => j.company_research != null)
    .map((j) => ({
      text: `Researched ${j.company ?? "company"}`,
      time: relativeTime(j.found_at),
      dot: "research" as const,
      sortKey: new Date(j.found_at).getTime(),
    }));

  const activities: ActivityEntry[] = [...runActivities, ...researchActivities]
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, 8)
    .map(({ text, time, dot }) => ({ text, time, dot }));

  return (
    <main className="min-h-screen bg-background">
      <PostHogIdentify
        userId={user.id}
        email={user.email}
        name={user.profile?.name}
      />
      <Navbar showSignOut />
      <section className="page-shell px-6 py-8 lg:px-12">
        {!isProfileComplete && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-warning bg-warning-light px-5 py-3.5">
            <p className="text-sm font-medium text-text-primary">
              Complete your profile to get accurate job matches.
            </p>
            <Link
              href="/profile"
              className="text-sm font-medium text-accent hover:text-accent-dark"
            >
              Complete Profile →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Jobs Found"
            value={totalJobs.toString()}
            subtitle="All time"
          />
          <StatCard
            label="Avg. Match Rate"
            value={avgMatchRate > 0 ? `${avgMatchRate}%` : "—"}
            subtitle="Across all jobs"
          />
          <StatCard
            label="Companies Researched"
            value={companiesResearched.toString()}
            subtitle="Total researched"
          />
          <StatCard
            label="Jobs This Week"
            value={jobsThisWeek.toString()}
            subtitle="New this week"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <ActivityList activities={activities} />
          </div>
          <div className="lg:col-span-3">
            <CompanyResearchChart data={researchChartData(jobRows)} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <JobsFoundChart data={jobsFoundChartData(runRows)} />
          <MatchScoreChart data={matchScoreChartData(jobRows)} />
        </div>
      </section>
    </main>
  );
}
