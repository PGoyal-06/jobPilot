import { NextResponse } from "next/server";
import { createInsforgeServer, requireCurrentUser } from "@/lib/insforge-server";
import OpenAI from "openai";
import { createRequire } from "module";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a resume parser. Extract profile information from the provided resume text and return it as JSON.

Return exactly this JSON shape — no other keys, no markdown:
{
  "fullName": string,
  "phone": string,
  "location": string,
  "linkedinUrl": string,
  "portfolioUrl": string,
  "workAuthorization": one of ["citizen","permanent_resident","h1b","opt_cpt","other"],
  "currentTitle": string,
  "experienceLevel": one of ["junior","mid","senior","lead","executive"],
  "yearsExperience": string (digits only, e.g. "5"),
  "skills": string[],
  "industries": string[],
  "workExperience": Array<{
    "companyName": string,
    "jobTitle": string,
    "startDate": string (YYYY-MM or empty),
    "endDate": string (YYYY-MM or empty),
    "currentlyWorking": boolean,
    "responsibilities": string
  }>,
  "highestDegree": one of ["high_school","associate","bachelor","master","phd","other"],
  "fieldOfStudy": string,
  "institutionName": string,
  "graduationYear": string (4 digits or empty),
  "jobTitlesSeeking": string (comma-separated, infer from background),
  "remotePreference": one of ["remote","hybrid","onsite","any"],
  "salaryExpectation": string,
  "preferredLocations": string (comma-separated),
  "coverLetterTone": one of ["formal","conversational","enthusiastic"]
}

Rules:
- For fields not found, return "" or [].
- Do not invent information not present (except jobTitlesSeeking, which you infer).
- workAuthorization defaults to "other" if unclear.
- remotePreference defaults to "any" if unclear.
- coverLetterTone defaults to "formal" if unclear.
- Infer experienceLevel from years and seniority of roles.
- skills must be individual technology/skill names, not sentences.
- Return ONLY valid JSON, nothing else.`;

export async function POST() {
  try {
    const user = await requireCurrentUser();
    const insforge = await createInsforgeServer();

    const { data: blob, error: downloadError } = await insforge.storage
      .from("resumes")
      .download(`${user.id}/resume.pdf`);

    if (downloadError || !blob) {
      return NextResponse.json(
        { success: false, error: "No resume found. Please upload a resume first." },
        { status: 404 },
      );
    }

    const buffer = Buffer.from(await blob.arrayBuffer());
    const _require = createRequire(import.meta.url);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = _require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
    const { text } = await pdfParse(buffer);

    if (text.trim().length < 200) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not extract text from this PDF. Please try a different file.",
        },
        { status: 422 },
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.1,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Resume text:\n\n${text.slice(0, 12000)}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const extracted = JSON.parse(raw);

    return NextResponse.json({ success: true, data: extracted });
  } catch (err) {
    console.error("[api/resume/extract] error:", err);
    return NextResponse.json(
      { success: false, error: "Extraction failed. Please try again." },
      { status: 500 },
    );
  }
}
