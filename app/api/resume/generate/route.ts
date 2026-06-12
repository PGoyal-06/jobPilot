import { NextResponse } from "next/server";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { createInsforgeServer, requireCurrentUser } from "@/lib/insforge-server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a professional resume writer. Given a user's profile data, produce polished resume content.

Return exactly this JSON shape — no other keys, no markdown:
{
  "summary": string (2-4 sentences, professional first-person tone),
  "workExperience": Array<{
    "companyName": string,
    "jobTitle": string,
    "startDate": string (YYYY-MM or empty),
    "endDate": string (YYYY-MM or empty),
    "currentlyWorking": boolean,
    "bullets": string[] (3-5 concise achievement-oriented bullet points, no leading dash)
  }>
}

Rules:
- summary must be specific to the person's background — do not use generic filler phrases
- bullets must start with strong action verbs (Led, Built, Reduced, Delivered, Owned, etc.)
- bullets must be concise — one line each
- do not invent facts not present in the profile
- Return ONLY valid JSON, nothing else.`;

type WorkEntry = {
  companyName?: string;
  jobTitle?: string;
  startDate?: string;
  endDate?: string;
  currentlyWorking?: boolean;
  responsibilities?: string;
};

type GeneratedContent = {
  summary: string;
  workExperience: Array<{
    companyName: string;
    jobTitle: string;
    startDate: string;
    endDate: string;
    currentlyWorking: boolean;
    bullets: string[];
  }>;
};

type ProfileRow = {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  current_title?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  skills?: string[] | null;
  industries?: string[] | null;
  work_experience?: WorkEntry[] | null;
  education?: {
    highestDegree?: string;
    fieldOfStudy?: string;
    institutionName?: string;
    graduationYear?: string;
  } | null;
};

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, paddingTop: 40, paddingBottom: 40, paddingLeft: 50, paddingRight: 50, color: "#1a1a1a" },
  header: { marginBottom: 16 },
  name: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  title: { fontSize: 11, color: "#444444", marginBottom: 6 },
  contactRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, fontSize: 9, color: "#555555" },
  contactItem: { marginRight: 8 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#dddddd", marginBottom: 10 },
  section: { marginBottom: 14 },
  sectionLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", letterSpacing: 1, color: "#888888", textTransform: "uppercase", marginBottom: 6, borderBottomWidth: 0.5, borderBottomColor: "#e0e0e0", paddingBottom: 3 },
  summaryText: { lineHeight: 1.5, color: "#333333" },
  jobBlock: { marginBottom: 10 },
  jobHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  jobTitle: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  jobCompany: { fontSize: 10, color: "#555555" },
  jobDates: { fontSize: 9, color: "#888888" },
  bullet: { flexDirection: "row", marginBottom: 2, paddingLeft: 8 },
  bulletDot: { width: 10, color: "#888888" },
  bulletText: { flex: 1, lineHeight: 1.4, color: "#333333" },
  skillsText: { lineHeight: 1.5, color: "#333333" },
  eduText: { color: "#333333" },
});

function formatDateRange(start: string, end: string, current: boolean): string {
  const fmt = (d: string) => {
    if (!d) return "";
    const [year, month] = d.split("-");
    if (!month) return year;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[parseInt(month, 10) - 1]} ${year}`;
  };
  return [fmt(start), current ? "Present" : fmt(end)].filter(Boolean).join(" – ");
}

function buildResumePDF(profile: ProfileRow, generated: GeneratedContent) {
  const contactItems: string[] = [];
  if (profile.email) contactItems.push(profile.email);
  if (profile.phone) contactItems.push(profile.phone);
  if (profile.location) contactItems.push(profile.location);
  if (profile.linkedin_url) contactItems.push(profile.linkedin_url);
  if (profile.portfolio_url) contactItems.push(profile.portfolio_url);

  const edu = profile.education;
  const eduLine = [edu?.highestDegree, edu?.fieldOfStudy, edu?.institutionName, edu?.graduationYear]
    .filter(Boolean)
    .join(" · ");

  return createElement(
    Document,
    {},
    createElement(
      Page,
      { size: "A4", style: styles.page },
      // Header
      createElement(
        View,
        { style: styles.header },
        createElement(Text, { style: styles.name }, profile.full_name ?? ""),
        profile.current_title
          ? createElement(Text, { style: styles.title }, profile.current_title)
          : null,
        createElement(
          View,
          { style: styles.contactRow },
          ...contactItems.map((item, i) =>
            createElement(Text, { key: String(i), style: styles.contactItem }, item),
          ),
        ),
      ),
      createElement(View, { style: styles.divider }),
      // Summary
      generated.summary
        ? createElement(
            View,
            { style: styles.section },
            createElement(Text, { style: styles.sectionLabel }, "Professional Summary"),
            createElement(Text, { style: styles.summaryText }, generated.summary),
          )
        : null,
      // Experience
      generated.workExperience.length > 0
        ? createElement(
            View,
            { style: styles.section },
            createElement(Text, { style: styles.sectionLabel }, "Experience"),
            ...generated.workExperience.map((job, i) =>
              createElement(
                View,
                { key: String(i), style: styles.jobBlock },
                createElement(
                  View,
                  { style: styles.jobHeader },
                  createElement(
                    View,
                    {},
                    createElement(Text, { style: styles.jobTitle }, job.jobTitle),
                    createElement(Text, { style: styles.jobCompany }, job.companyName),
                  ),
                  createElement(
                    Text,
                    { style: styles.jobDates },
                    formatDateRange(job.startDate, job.endDate, job.currentlyWorking),
                  ),
                ),
                ...job.bullets.map((bullet, j) =>
                  createElement(
                    View,
                    { key: String(j), style: styles.bullet },
                    createElement(Text, { style: styles.bulletDot }, "•"),
                    createElement(Text, { style: styles.bulletText }, bullet),
                  ),
                ),
              ),
            ),
          )
        : null,
      // Skills
      profile.skills && profile.skills.length > 0
        ? createElement(
            View,
            { style: styles.section },
            createElement(Text, { style: styles.sectionLabel }, "Skills"),
            createElement(Text, { style: styles.skillsText }, profile.skills.join(", ")),
          )
        : null,
      // Education
      eduLine
        ? createElement(
            View,
            { style: styles.section },
            createElement(Text, { style: styles.sectionLabel }, "Education"),
            createElement(Text, { style: styles.eduText }, eduLine),
          )
        : null,
    ),
  );
}

export async function POST() {
  try {
    const user = await requireCurrentUser();
    const insforge = await createInsforgeServer();

    const { data: profile, error: profileError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || !(profile as ProfileRow).full_name) {
      return NextResponse.json(
        { success: false, error: "Complete your profile before generating a resume." },
        { status: 400 },
      );
    }

    const typedProfile = profile as ProfileRow;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Profile data:\n\n${JSON.stringify(
            {
              fullName: typedProfile.full_name,
              currentTitle: typedProfile.current_title,
              skills: typedProfile.skills,
              industries: typedProfile.industries,
              workExperience: typedProfile.work_experience,
              education: typedProfile.education,
            },
            null,
            2,
          )}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const generated = JSON.parse(raw) as GeneratedContent;

    const pdfDoc = buildResumePDF(typedProfile, generated);
    const buffer = await renderToBuffer(pdfDoc);

    if (!buffer || buffer.length < 100) {
      console.error("[api/resume/generate] renderToBuffer returned empty/invalid buffer:", buffer?.length);
      return NextResponse.json(
        { success: false, error: "Failed to generate PDF. Please try again." },
        { status: 500 },
      );
    }

    const storagePath = `${user.id}/resume.pdf`;

    const pdfBlob = new Blob([new Uint8Array(buffer)], { type: "application/pdf" });
    const { data: uploadData, error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(storagePath, pdfBlob);

    if (uploadError || !uploadData?.key) {
      console.error("[api/resume/generate] storage upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to save generated resume. Please try again." },
        { status: 500 },
      );
    }

    await insforge.database
      .from("profiles")
      .upsert([{ id: user.id, email: user.email, resume_pdf_url: uploadData.key }]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/resume/generate] error:", err);
    return NextResponse.json(
      { success: false, error: "Generation failed. Please try again." },
      { status: 500 },
    );
  }
}
