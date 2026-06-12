"use server";

import { revalidatePath } from "next/cache";
import {
  createInsforgeServer,
  requireCurrentUser,
} from "@/lib/insforge-server";
import { capturePostHogServerEvent } from "@/lib/posthog-server";
import {
  REQUIRED_CHECKS,
  type WorkEntryData,
  type ProfileRow,
} from "@/lib/profile-utils";


export type ProfileFormData = {
  fullName: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  workAuthorization: string;
  currentTitle: string;
  experienceLevel: string;
  yearsExperience: string;
  skills: string[];
  industries: string[];
  workExperience: Array<{ id: string } & WorkEntryData>;
  highestDegree: string;
  fieldOfStudy: string;
  institutionName: string;
  graduationYear: string;
  jobTitlesSeeking: string;
  remotePreference: string;
  salaryExpectation: string;
  preferredLocations: string;
  coverLetterTone: string;
};

type CompletionInput = Pick<
  ProfileRow,
  | "full_name"
  | "phone"
  | "location"
  | "current_title"
  | "skills"
  | "work_experience"
  | "education"
  | "job_titles_seeking"
>;

function buildDbPayload(
  data: ProfileFormData,
  userId: string,
  userEmail: string | null,
) {
  const workExperienceForDb = data.workExperience.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ id: _id, ...rest }) => rest,
  );
  const jobTitlesArray = data.jobTitlesSeeking
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const preferredLocationsArray = data.preferredLocations
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);

  const completionInput: CompletionInput = {
    full_name: data.fullName,
    phone: data.phone,
    location: data.location,
    current_title: data.currentTitle,
    skills: data.skills,
    work_experience: workExperienceForDb,
    education: {
      highestDegree: data.highestDegree,
      fieldOfStudy: data.fieldOfStudy,
      institutionName: data.institutionName,
      graduationYear: data.graduationYear,
    },
    job_titles_seeking: jobTitlesArray,
  };

  const isComplete = REQUIRED_CHECKS.every(({ check }) => check(completionInput));

  return {
    id: userId,
    email: userEmail,
    full_name: data.fullName,
    phone: data.phone,
    location: data.location,
    linkedin_url: data.linkedinUrl,
    portfolio_url: data.portfolioUrl,
    work_authorization: data.workAuthorization,
    current_title: data.currentTitle,
    experience_level: data.experienceLevel,
    years_experience: parseInt(data.yearsExperience, 10) || 0,
    skills: data.skills,
    industries: data.industries,
    work_experience: workExperienceForDb,
    education: {
      highestDegree: data.highestDegree,
      fieldOfStudy: data.fieldOfStudy,
      institutionName: data.institutionName,
      graduationYear: data.graduationYear,
    },
    job_titles_seeking: jobTitlesArray,
    remote_preference: data.remotePreference,
    salary_expectation: data.salaryExpectation,
    preferred_locations: preferredLocationsArray,
    cover_letter_tone: data.coverLetterTone,
    is_complete: isComplete,
  };
}

export async function saveProfile(
  data: ProfileFormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireCurrentUser();
    const insforge = await createInsforgeServer();

    const { data: existing } = await insforge.database
      .from("profiles")
      .select("is_complete")
      .eq("id", user.id)
      .single();

    const wasComplete = existing?.is_complete ?? false;
    const payload = buildDbPayload(data, user.id, user.email ?? null);

    const { error } = await insforge.database.from("profiles").upsert([payload]);

    if (error) {
      console.error("[actions/profile] saveProfile error:", error);
      return {
        success: false,
        error: "Failed to save profile. Please try again.",
      };
    }

    if (!wasComplete && payload.is_complete) {
      await capturePostHogServerEvent({
        event: "profile_completed",
        properties: { userId: user.id },
      });
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    console.error("[actions/profile] saveProfile exception:", err);
    return {
      success: false,
      error: "Failed to save profile. Please try again.",
    };
  }
}

export async function uploadResume(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireCurrentUser();
    const insforge = await createInsforgeServer();

    const file = formData.get("resume") as File | null;
    if (!file) return { success: false, error: "No file provided." };
    if (file.type !== "application/pdf")
      return { success: false, error: "Only PDF files are accepted." };
    if (file.size > 8 * 1024 * 1024)
      return { success: false, error: "File exceeds the 8 MB limit." };

    const blob = new Blob([await file.arrayBuffer()], {
      type: "application/pdf",
    });

    const storagePath = `${user.id}/resume.pdf`;

    const { data: uploadData, error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(storagePath, blob);

    if (uploadError || !uploadData?.key) {
      console.error(
        "[actions/profile] uploadResume storage error:",
        uploadError,
      );
      return {
        success: false,
        error: "Failed to upload resume. Please try again.",
      };
    }

    await insforge.database
      .from("profiles")
      .upsert([{ id: user.id, email: user.email, resume_pdf_url: uploadData.key }]);

    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    console.error("[actions/profile] uploadResume exception:", err);
    return {
      success: false,
      error: "Failed to upload resume. Please try again.",
    };
  }
}
