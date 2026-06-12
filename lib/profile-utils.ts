export type WorkEntryData = {
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  responsibilities: string;
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  current_title: string | null;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[] | null;
  industries: string[] | null;
  work_experience: WorkEntryData[] | null;
  education: {
    highestDegree: string;
    fieldOfStudy: string;
    institutionName: string;
    graduationYear: string;
  } | null;
  job_titles_seeking: string[] | null;
  remote_preference: string | null;
  preferred_locations: string[] | null;
  salary_expectation: string | null;
  cover_letter_tone: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  work_authorization: string | null;
  resume_pdf_url: string | null;
  is_complete: boolean | null;
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

export const REQUIRED_CHECKS: Array<{
  label: string;
  check: (d: CompletionInput) => boolean;
}> = [
  { label: "Full Name", check: (d) => (d.full_name?.trim().length ?? 0) > 0 },
  { label: "Phone", check: (d) => (d.phone?.trim().length ?? 0) > 0 },
  { label: "Location", check: (d) => (d.location?.trim().length ?? 0) > 0 },
  {
    label: "Current Title",
    check: (d) => (d.current_title?.trim().length ?? 0) > 0,
  },
  { label: "Skills", check: (d) => (d.skills?.length ?? 0) >= 1 },
  {
    label: "Work Experience",
    check: (d) =>
      (d.work_experience ?? []).some(
        (e) => e.companyName?.trim() && e.jobTitle?.trim(),
      ),
  },
  {
    label: "Education",
    check: (d) => (d.education?.institutionName?.trim().length ?? 0) > 0,
  },
  {
    label: "Job Titles Seeking",
    check: (d) => (d.job_titles_seeking?.length ?? 0) >= 1,
  },
];

export function calculateProfileCompletion(profile: ProfileRow | null): {
  percentage: number;
  missingFields: string[];
} {
  if (!profile) {
    return {
      percentage: 0,
      missingFields: REQUIRED_CHECKS.map((c) => c.label),
    };
  }
  const missing = REQUIRED_CHECKS.filter(({ check }) => !check(profile)).map(
    ({ label }) => label,
  );
  const percentage = Math.round(
    ((REQUIRED_CHECKS.length - missing.length) / REQUIRED_CHECKS.length) * 100,
  );
  return { percentage, missingFields: missing };
}
