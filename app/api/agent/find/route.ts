import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createInsforgeServer, requireCurrentUser } from "@/lib/insforge-server";
import { capturePostHogServerEvent } from "@/lib/posthog-server";
import { searchJobs, detectCountry } from "@/lib/adzuna";
import type { AdzunaJob } from "@/lib/adzuna";
import { MATCH_THRESHOLD } from "@/lib/utils";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SCORE_SYSTEM_PROMPT =
  "You are a job-matching assistant. Score how well this job matches the candidate. Return only valid JSON.";

type ProfileRow = {
  current_title?: string | null;
  years_experience?: number | null;
  skills?: string[] | null;
  work_experience?: unknown;
};

type ScoreResult = {
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
};

async function scoreJob(job: AdzunaJob, profile: ProfileRow): Promise<ScoreResult> {
  const userPrompt = `Job: ${job.title} at ${job.company.display_name}
Description: ${job.description}
Candidate title: ${profile.current_title ?? "Not specified"}
Experience: ${profile.years_experience ?? 0} years
Skills: ${(profile.skills ?? []).join(", ")}

Return JSON: { "matchScore": 0-100, "matchReason": "one paragraph", "matchedSkills": ["skill"], "missingSkills": ["skill"] }`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 300,
    messages: [
      { role: "system", content: SCORE_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  try {
    return JSON.parse(response.choices[0].message.content!) as ScoreResult;
  } catch {
    return { matchScore: 0, matchReason: "", matchedSkills: [], missingSkills: [] };
  }
}

function formatSalary(job: AdzunaJob): string | null {
  if (!job.salary_min) return null;
  const min = Math.round(job.salary_min / 1000);
  const max = job.salary_max ? Math.round(job.salary_max / 1000) : null;
  return max ? `$${min}k – $${max}k` : `$${min}k+`;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireCurrentUser();
    const body = await req.json();
    const { jobTitle, location } = body as { jobTitle: string; location: string };

    if (!jobTitle?.trim()) {
      return NextResponse.json(
        { success: false, error: "Job title is required." },
        { status: 400 },
      );
    }

    await capturePostHogServerEvent({
      event: "job_search_started",
      properties: { userId: user.id, jobTitle, location: location ?? "" },
    });

    const insforge = await createInsforgeServer();

    const { data: profile } = await insforge.database
      .from("profiles")
      .select("current_title, years_experience, skills, work_experience")
      .eq("id", user.id)
      .single();

    const typedProfile = (profile ?? {}) as ProfileRow;

    const country = detectCountry(location ?? "");
    const jobs = await searchJobs(jobTitle, location ?? "", country);

    const { data: run, error: runError } = await insforge.database
      .from("agent_runs")
      .insert([
        {
          user_id: user.id,
          status: "running",
          job_title_searched: jobTitle,
          location_searched: location ?? "",
        },
      ])
      .select()
      .single();

    if (runError || !run) {
      console.error("[api/agent/find] agent_runs insert error:", runError);
      return NextResponse.json(
        { success: false, error: "Failed to start agent run." },
        { status: 500 },
      );
    }

    const runId = (run as { id: string }).id;
    let strong = 0;

    for (const job of jobs) {
      const scored = await scoreJob(job, typedProfile);

      const jobRecord = {
        user_id: user.id,
        run_id: runId,
        source: "search",
        source_url: job.redirect_url,
        external_apply_url: job.redirect_url,
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        salary: formatSalary(job),
        job_type: job.contract_type ?? "fulltime",
        about_role: job.description,
        match_score: scored.matchScore,
        match_reason: scored.matchReason,
        matched_skills: scored.matchedSkills,
        missing_skills: scored.missingSkills,
      };

      await insforge.database.from("jobs").insert([jobRecord]);

      if (scored.matchScore >= MATCH_THRESHOLD) strong++;

      await capturePostHogServerEvent({
        event: "job_found",
        properties: { userId: user.id, source: "search", matchScore: scored.matchScore },
      });
    }

    const total = jobs.length;

    await insforge.database
      .from("agent_runs")
      .update({ status: "complete", jobs_found: total, completed_at: new Date().toISOString() })
      .eq("id", runId)
      .eq("user_id", user.id);

    return NextResponse.json({ success: true, total, strong });
  } catch (err) {
    console.error("[api/agent/find] error:", err);
    return NextResponse.json(
      { success: false, error: "Search failed. Please try again." },
      { status: 500 },
    );
  }
}
