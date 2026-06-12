import { NextResponse } from "next/server";
import { createInsforgeServer, requireCurrentUser } from "@/lib/insforge-server";

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const insforge = await createInsforgeServer();

    const { data: profile } = await insforge.database
      .from("profiles")
      .select("resume_pdf_url")
      .eq("id", user.id)
      .single();

    const resumeKey = (profile as { resume_pdf_url?: string } | null)?.resume_pdf_url;

    if (!resumeKey) {
      return NextResponse.json(
        { success: false, error: "Resume not found." },
        { status: 404 },
      );
    }

    const { data: blob, error } = await insforge.storage
      .from("resumes")
      .download(resumeKey);

    if (error || !blob) {
      return NextResponse.json(
        { success: false, error: "Resume not found." },
        { status: 404 },
      );
    }

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="resume.pdf"',
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}
