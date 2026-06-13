import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import Browserbase from "@browserbasehq/sdk";
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import { createInsforgeServer, requireCurrentUser } from "@/lib/insforge-server";
import { capturePostHogServerEvent } from "@/lib/posthog-server";
import type { CompanyResearch } from "@/components/find-jobs/CompanyResearchCard";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type JobRow = {
  id: string;
  company: string | null;
  title: string | null;
  about_role: string | null;
  source_url: string | null;
  matched_skills: string[] | null;
  missing_skills: string[] | null;
};

type ProfileRow = {
  current_title: string | null;
  years_experience: number | null;
  experience_level: string | null;
  skills: string[] | null;
  work_experience: unknown;
};

async function deriveHomepageUrl(sourceUrl: string, company: string): Promise<string> {
  try {
    const resp = await fetch(sourceUrl, { redirect: "follow" });
    const { hostname } = new URL(resp.url);
    const parts = hostname.split(".");
    const root = parts.slice(-2).join(".");
    if (root.includes("adzuna")) throw new Error("still adzuna");
    return `https://${root}`;
  } catch {
    const slug = company.toLowerCase().replace(/[^a-z0-9]/g, "");
    return `https://www.${slug}.com`;
  }
}

const homepageSchema = z.object({
  oneLiner: z.string().optional(),
  productSummary: z.string().optional(),
  signals: z.array(z.string()).optional(),
  pageLinks: z
    .array(
      z.object({
        url: z.string(),
        kind: z.enum(["about", "careers", "blog", "engineering", "product", "team", "other"]),
      }),
    )
    .optional(),
});

const subPageSchema = z.object({
  keyPoints: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  valuesOrCulture: z.array(z.string()).optional(),
  notable: z.array(z.string()).optional(),
});

const PRIORITY_ORDER = ["about", "engineering", "product", "blog", "team", "other", "careers"];

const SYNTHESIS_SYSTEM_PROMPT = `You are a sharp career strategist preparing a candidate to apply for a specific role. You are given (a) research collected from the company's own website, (b) the job posting, and (c) the candidate's profile. Produce a concise, concrete briefing that gives this specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent funding, customers, headcount, or facts. If research was thin, infer carefully from the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY valid JSON matching this shape:
{
  "companyOverview": string,
  "techStack": string[],
  "culture": string[],
  "whyThisRole": string,
  "yourEdge": string[],
  "gapsToAddress": string[],
  "smartQuestions": string[],
  "interviewPrep": string[],
  "sources": string[]
}`;

async function synthesizeDossier(
  companyResearch: unknown,
  job: JobRow,
  profile: ProfileRow,
): Promise<CompanyResearch> {
  const userPrompt = `COMPANY RESEARCH (from their website):
${JSON.stringify(companyResearch)}

JOB POSTING:
Title: ${job.title ?? ""}
Company: ${job.company ?? ""}
Description: ${job.about_role ?? ""}
Matched skills (already computed): ${(job.matched_skills ?? []).join(", ")}
Missing skills (already computed): ${(job.missing_skills ?? []).join(", ")}

CANDIDATE PROFILE:
Current title: ${profile.current_title ?? "Not specified"}
Experience: ${profile.years_experience ?? 0} years, level ${profile.experience_level ?? "unspecified"}
Skills: ${(profile.skills ?? []).join(", ")}
Work history: ${JSON.stringify(profile.work_experience)}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    temperature: 0.4,
    max_tokens: 800,
    messages: [
      { role: "system", content: SYNTHESIS_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  return JSON.parse(response.choices[0].message.content!) as CompanyResearch;
}

export async function POST(req: NextRequest) {
  let stagehand: Stagehand | null = null;

  try {
    const user = await requireCurrentUser();
    const body = await req.json();
    const { jobId } = body as { jobId: string };

    if (!jobId?.trim()) {
      return NextResponse.json({ success: false, error: "jobId is required." }, { status: 400 });
    }

    const insforge = await createInsforgeServer();

    const { data: jobData } = await insforge.database
      .from("jobs")
      .select("id, company, title, about_role, source_url, matched_skills, missing_skills")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single();

    if (!jobData) {
      return NextResponse.json({ success: false, error: "Job not found." }, { status: 404 });
    }

    const job = jobData as JobRow;

    const { data: profileData } = await insforge.database
      .from("profiles")
      .select("current_title, years_experience, experience_level, skills, work_experience")
      .eq("id", user.id)
      .single();

    const profile = (profileData ?? {}) as ProfileRow;

    // Derive homepage URL from the Adzuna redirect URL
    const homepageUrl = await deriveHomepageUrl(
      job.source_url ?? "",
      job.company ?? "company",
    );

    // Collected browser research (may stay empty if browser fails)
    let companyResearch: unknown = {};
    const sources: string[] = [homepageUrl];

    // Browserbase + Stagehand session
    const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      timeout: 120,
    });

    stagehand = new Stagehand({
      env: "BROWSERBASE",
      apiKey: process.env.BROWSERBASE_API_KEY!,
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      browserbaseSessionID: session.id,
      model: { modelName: "openai/gpt-4o", apiKey: process.env.OPENAI_API_KEY! },
      disablePino: true,
    });

    await stagehand.init();
    const page = stagehand.context.activePage()!;

    try {
      // Step 1 — Homepage extraction
      await page.goto(homepageUrl, { waitUntil: "domcontentloaded", timeoutMs: 30000 });

      const homepageData = await stagehand.extract(
        "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
        homepageSchema,
      );

      // Bailout: wrong site or parked domain
      if (!homepageData.oneLiner && !homepageData.productSummary) {
        companyResearch = {};
      } else {
        // Step 2 — Sub-page extraction (max 3 pages)
        // Filter to real URLs only — Stagehand a11y snapshots can return node IDs instead of hrefs
        const sortedLinks = [...(homepageData.pageLinks ?? [])]
          .filter((l) => l.url.startsWith("http"))
          .sort(
            (a, b) => PRIORITY_ORDER.indexOf(a.kind) - PRIORITY_ORDER.indexOf(b.kind),
          )
          .slice(0, 3);

        const subPageResults = [];
        for (const link of sortedLinks) {
          try {
            await page.goto(link.url, { waitUntil: "domcontentloaded", timeoutMs: 30000 });
            sources.push(link.url);
            const data = await stagehand.extract(
              "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
              subPageSchema,
            );
            subPageResults.push(data);
          } catch {
            // Skip failed sub-pages
          }
        }

        companyResearch = {
          homepage: {
            oneLiner: homepageData.oneLiner,
            productSummary: homepageData.productSummary,
            signals: homepageData.signals,
          },
          subPages: subPageResults,
        };
      }
    } catch {
      // Browser research failed — synthesis will run on job + profile only
      companyResearch = {};
    }

    // Step 3 — GPT-4o synthesis (always runs, even with empty browser research)
    const dossier = await synthesizeDossier(companyResearch, job, profile);
    dossier.sources = sources;

    // Save dossier to DB
    await insforge.database
      .from("jobs")
      .update({ company_research: dossier })
      .eq("id", jobId)
      .eq("user_id", user.id);

    await capturePostHogServerEvent({
      event: "company_researched",
      properties: { userId: user.id, jobId, company: job.company ?? "" },
    });

    return NextResponse.json({ success: true, research: dossier });
  } catch (err) {
    console.error("[api/agent/research] error:", err);
    return NextResponse.json(
      { success: false, error: "Research failed. Please try again." },
      { status: 500 },
    );
  } finally {
    if (stagehand) {
      try {
        await stagehand.close();
      } catch {
        // Ignore close errors
      }
    }
  }
}
