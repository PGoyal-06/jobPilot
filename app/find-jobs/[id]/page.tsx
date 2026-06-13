import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  DollarSign,
  MapPin,
  Briefcase,
  Clock,
  Sparkles,
  Building2,
  ClipboardList,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { createInsforgeServer, requireCurrentUser } from "@/lib/insforge-server";
import { MATCH_THRESHOLD } from "@/lib/utils";
import { CompanyResearchCard } from "@/components/find-jobs/CompanyResearchCard";
import type { CompanyResearch } from "@/components/find-jobs/CompanyResearchCard";

type JobDetail = {
  id: string;
  company: string | null;
  title: string | null;
  match_score: number | null;
  match_reason: string | null;
  matched_skills: string[] | null;
  missing_skills: string[] | null;
  salary: string | null;
  location: string | null;
  job_type: string | null;
  found_at: string;
  about_role: string | null;
  source_url: string | null;
  external_apply_url: string | null;
  company_research: CompanyResearch | null;
};

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

function scoreBadgeClass(score: number): string {
  return score >= MATCH_THRESHOLD
    ? "bg-success-lightest text-success-foreground"
    : "bg-warning-light text-warning";
}

function InfoCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            {label}
          </p>
          <p className="truncate text-sm font-medium text-text-primary">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireCurrentUser();
  const insforge = await createInsforgeServer();

  const { data: job } = await insforge.database
    .from("jobs")
    .select(
      "id, company, title, match_score, match_reason, matched_skills, missing_skills, salary, location, job_type, found_at, about_role, source_url, external_apply_url, company_research",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!job) notFound();

  const j = job as JobDetail;
  const score = j.match_score ?? 0;
  const applyUrl = j.external_apply_url ?? j.source_url ?? null;
  const matchedSkills = j.matched_skills ?? [];
  const missingSkills = j.missing_skills ?? [];

  return (
    <main className="min-h-screen bg-background">
      <PostHogIdentify
        userId={user.id}
        email={user.email}
        name={user.profile?.name}
      />
      <Navbar showSignOut />

      <section className="page-shell px-6 py-8 lg:px-12">
        {/* Back link */}
        <Link
          href="/find-jobs"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="mt-6 flex flex-col gap-6">
          {/* Job Header Card */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
                  <Building2 className="h-6 w-6 text-text-muted" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-text-primary">
                    {j.title ?? "—"}
                  </h1>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-text-secondary">
                      {j.company ?? "—"}
                    </span>
                    <span className="text-text-muted">·</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${scoreBadgeClass(score)}`}
                    >
                      {score}% Match Score
                    </span>
                  </div>
                </div>
              </div>

              {applyUrl && (
                <a
                  href={applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Job Post
                </a>
              )}
            </div>
          </div>

          {/* Info Cards Row */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <InfoCard
              icon={<DollarSign className="h-4 w-4 text-success-foreground" />}
              iconBg="bg-success-lightest"
              label="Salary Est."
              value={j.salary ?? "—"}
            />
            <InfoCard
              icon={<MapPin className="h-4 w-4 text-info-foreground" />}
              iconBg="bg-info-lightest"
              label="Location"
              value={j.location ?? "—"}
            />
            <InfoCard
              icon={<Briefcase className="h-4 w-4 text-text-muted" />}
              iconBg="bg-surface-secondary"
              label="Job Type"
              value={j.job_type ? j.job_type.charAt(0).toUpperCase() + j.job_type.slice(1) : "—"}
            />
            <InfoCard
              icon={<Clock className="h-4 w-4 text-text-muted" />}
              iconBg="bg-surface-secondary"
              label="Date Found"
              value={formatRelativeTime(j.found_at)}
            />
          </div>

          {/* AI Match Reasoning */}
          {j.match_reason && (
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-success" />
                <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  AI Match Reasoning
                </span>
              </div>
              <p className="text-sm leading-6 text-text-primary">
                {j.match_reason}
              </p>
            </div>
          )}

          {/* Required Skills vs Your Profile */}
          {(matchedSkills.length > 0 || missingSkills.length > 0) && (
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
              <p className="mb-4 text-xs font-medium uppercase tracking-wide text-text-secondary">
                Required Skills vs Your Profile
              </p>

              {matchedSkills.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-medium text-text-muted">You have</p>
                  <div className="flex flex-wrap gap-2">
                    {matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-full bg-success-lightest px-2.5 py-1 text-xs font-medium text-success-foreground"
                      >
                        <CheckCircle className="h-3 w-3" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {missingSkills.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-text-muted">Gap skills</p>
                  <div className="flex flex-wrap gap-2">
                    {missingSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-full bg-accent-muted px-2.5 py-1 text-xs font-medium text-accent"
                      >
                        <XCircle className="h-3 w-3" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Job Description */}
          {j.about_role && (
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
              <div className="mb-3 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-text-muted" />
                <h2 className="text-base font-semibold text-text-primary">
                  Job Description
                </h2>
              </div>
              <p className="text-sm leading-6 text-text-primary">
                {j.about_role}
              </p>
              {applyUrl && (
                <a
                  href={applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-dark"
                >
                  Read full description
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Company Research */}
          <CompanyResearchCard
            jobId={j.id}
            company={j.company}
            initialResearch={j.company_research}
          />
        </div>

        {/* Apply Now */}
        {applyUrl && (
          <div className="mt-6">
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-xl bg-accent py-4 text-center text-sm font-medium text-accent-foreground hover:bg-accent-dark"
            >
              Apply Now at {j.company ?? "Company"}
            </a>
          </div>
        )}
      </section>
    </main>
  );
}
