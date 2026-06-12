"use client";

import { Calendar, ChevronDown, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { saveProfile } from "@/actions/profile";
import type { ProfileFormData } from "@/actions/profile";
import type { ProfileRow } from "@/lib/profile-utils";

type WorkEntry = {
  id: string;
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  responsibilities: string;
};

type Props = {
  userEmail: string;
  initialData?: ProfileRow | null;
  extractedData?: Partial<ProfileFormData> | null;
};

function FieldLabel({
  htmlFor,
  children,
  optional = false,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary"
    >
      {children}
      {optional && (
        <span className="ml-1 normal-case lowercase tracking-normal">
          (Optional)
        </span>
      )}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-text-muted"
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
    />
  );
}

function SelectField({
  id,
  value,
  onChange,
  children,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-md border border-border bg-surface px-3 py-2 pr-8 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
    </div>
  );
}

function DateInput({
  id,
  value,
  onChange,
  disabled = false,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const pickerRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      {/* Typeable text input — original design */}
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="YYYY-MM-DD"
        className="w-full rounded-md border border-border bg-surface px-3 py-2 pr-9 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-text-muted"
      />
      {/* Hidden date input used only for the native calendar picker */}
      <input
        ref={pickerRef}
        type="date"
        tabIndex={-1}
        disabled={disabled}
        aria-hidden="true"
        onChange={(e) => {
          if (e.target.value) onChange(e.target.value);
        }}
        className="pointer-events-none absolute right-0 top-0 h-full w-8 opacity-0"
      />
      <button
        type="button"
        disabled={disabled}
        tabIndex={-1}
        aria-label="Open date picker"
        onClick={() => pickerRef.current?.showPicker?.()}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary disabled:pointer-events-none"
      >
        <Calendar className="h-4 w-4" />
      </button>
    </div>
  );
}

function SectionDivider({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      {action}
    </div>
  );
}

function TagInput({
  tags,
  inputValue,
  placeholder,
  onInputChange,
  onAdd,
  onRemove,
}: {
  tags: string[];
  inputValue: string;
  placeholder: string;
  onInputChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (tag: string) => void;
}) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      onAdd();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="button"
          onClick={onAdd}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary"
        >
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs font-medium text-text-dark"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="text-text-muted hover:text-text-primary"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function initialWorkEntries(profile: ProfileRow | null | undefined): WorkEntry[] {
  if (profile?.work_experience && profile.work_experience.length > 0) {
    return profile.work_experience.map((e, i) => ({ id: String(i + 1), ...e }));
  }
  return [];
}

export function ProfileForm({ userEmail, initialData, extractedData }: Props) {
  const router = useRouter();

  const [fullName, setFullName] = useState(initialData?.full_name ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(initialData?.linkedin_url ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(initialData?.portfolio_url ?? "");
  const [workAuthorization, setWorkAuthorization] = useState(
    initialData?.work_authorization ?? "citizen",
  );

  const [currentTitle, setCurrentTitle] = useState(initialData?.current_title ?? "");
  const [experienceLevel, setExperienceLevel] = useState(
    initialData?.experience_level ?? "junior",
  );
  const [yearsExperience, setYearsExperience] = useState(
    initialData?.years_experience != null
      ? String(initialData.years_experience)
      : "",
  );
  const [skills, setSkills] = useState<string[]>(initialData?.skills ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [industries, setIndustries] = useState<string[]>(
    initialData?.industries ?? [],
  );
  const [industryInput, setIndustryInput] = useState("");

  const [workExperience, setWorkExperience] = useState<WorkEntry[]>(
    initialWorkEntries(initialData),
  );

  const [highestDegree, setHighestDegree] = useState(
    initialData?.education?.highestDegree ?? "high_school",
  );
  const [fieldOfStudy, setFieldOfStudy] = useState(
    initialData?.education?.fieldOfStudy ?? "",
  );
  const [institutionName, setInstitutionName] = useState(
    initialData?.education?.institutionName ?? "",
  );
  const [graduationYear, setGraduationYear] = useState(
    initialData?.education?.graduationYear ?? "",
  );

  const [jobTitlesSeeking, setJobTitlesSeeking] = useState(
    (initialData?.job_titles_seeking ?? []).join(", "),
  );
  const [remotePreference, setRemotePreference] = useState(
    initialData?.remote_preference ?? "any",
  );
  const [salaryExpectation, setSalaryExpectation] = useState(
    initialData?.salary_expectation ?? "",
  );
  const [preferredLocations, setPreferredLocations] = useState(
    (initialData?.preferred_locations ?? []).join(", "),
  );
  const [coverLetterTone, setCoverLetterTone] = useState(
    initialData?.cover_letter_tone ?? "formal",
  );

  const [isPending, setIsPending] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (!extractedData) return;
    if (extractedData.fullName) setFullName(extractedData.fullName);
    if (extractedData.phone) setPhone(extractedData.phone);
    if (extractedData.location) setLocation(extractedData.location);
    if (extractedData.linkedinUrl) setLinkedinUrl(extractedData.linkedinUrl);
    if (extractedData.portfolioUrl) setPortfolioUrl(extractedData.portfolioUrl);
    if (extractedData.workAuthorization) setWorkAuthorization(extractedData.workAuthorization);
    if (extractedData.currentTitle) setCurrentTitle(extractedData.currentTitle);
    if (extractedData.experienceLevel) setExperienceLevel(extractedData.experienceLevel);
    if (extractedData.yearsExperience) setYearsExperience(extractedData.yearsExperience);
    if (extractedData.skills?.length) setSkills(extractedData.skills);
    if (extractedData.industries?.length) setIndustries(extractedData.industries);
    if (extractedData.workExperience?.length) {
      setWorkExperience(
        extractedData.workExperience.map((e, i) => ({
          id: String(Date.now() + i),
          companyName: e.companyName ?? "",
          jobTitle: e.jobTitle ?? "",
          startDate: e.startDate ?? "",
          endDate: e.endDate ?? "",
          currentlyWorking: e.currentlyWorking ?? false,
          responsibilities: e.responsibilities ?? "",
        })),
      );
    }
    if (extractedData.highestDegree) setHighestDegree(extractedData.highestDegree);
    if (extractedData.fieldOfStudy) setFieldOfStudy(extractedData.fieldOfStudy);
    if (extractedData.institutionName) setInstitutionName(extractedData.institutionName);
    if (extractedData.graduationYear) setGraduationYear(extractedData.graduationYear);
    if (extractedData.jobTitlesSeeking) setJobTitlesSeeking(extractedData.jobTitlesSeeking);
    if (extractedData.remotePreference) setRemotePreference(extractedData.remotePreference);
    if (extractedData.salaryExpectation) setSalaryExpectation(extractedData.salaryExpectation);
    if (extractedData.preferredLocations) setPreferredLocations(extractedData.preferredLocations);
    if (extractedData.coverLetterTone) setCoverLetterTone(extractedData.coverLetterTone);
  }, [extractedData]);

  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  function addIndustry() {
    const trimmed = industryInput.trim();
    if (trimmed && !industries.includes(trimmed)) {
      setIndustries([...industries, trimmed]);
    }
    setIndustryInput("");
  }

  function removeIndustry(industry: string) {
    setIndustries(industries.filter((i) => i !== industry));
  }

  function addWorkEntry() {
    const newEntry: WorkEntry = {
      id: String(Date.now()),
      companyName: "",
      jobTitle: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      responsibilities: "",
    };
    setWorkExperience([...workExperience, newEntry]);
  }

  function updateWorkEntry(
    id: string,
    field: keyof WorkEntry,
    value: string | boolean,
  ) {
    setWorkExperience(
      workExperience.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setSaveStatus("idle");

    const result = await saveProfile({
      fullName,
      phone,
      location,
      linkedinUrl,
      portfolioUrl,
      workAuthorization,
      currentTitle,
      experienceLevel,
      yearsExperience,
      skills,
      industries,
      workExperience,
      highestDegree,
      fieldOfStudy,
      institutionName,
      graduationYear,
      jobTitlesSeeking,
      remotePreference,
      salaryExpectation,
      preferredLocations,
      coverLetterTone,
    });

    setIsPending(false);

    if (result.success) {
      setSaveStatus("success");
      router.refresh();
    } else {
      setSaveStatus("error");
      setSaveMessage(result.error ?? "Something went wrong.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-surface p-6 shadow-card"
    >
      <div className="border-b border-border pb-5">
        <h2 className="text-base font-semibold leading-6 text-text-primary">
          Profile Information
        </h2>
        <p className="mt-1 text-sm font-normal leading-5 text-text-secondary">
          This context is used to accurately represent you in agent interactions.
        </p>
      </div>

      {/* ── Personal Info ── */}
      <div className="mt-6">
        <SectionDivider title="Personal Info" />
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <FieldLabel htmlFor="full-name">Full Name</FieldLabel>
            <TextInput
              id="full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <TextInput
              id="email"
              type="email"
              value={userEmail}
              disabled
              placeholder="your@email.com"
            />
          </div>
          <div>
            <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
            <TextInput
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div>
            <FieldLabel htmlFor="location">Location</FieldLabel>
            <TextInput
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
            />
          </div>
          <div>
            <FieldLabel htmlFor="linkedin">LinkedIn URL</FieldLabel>
            <TextInput
              id="linkedin"
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/you"
            />
          </div>
          <div>
            <FieldLabel htmlFor="portfolio">Portfolio / GitHub</FieldLabel>
            <TextInput
              id="portfolio"
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://github.com/you"
            />
          </div>
          <div>
            <FieldLabel htmlFor="work-auth">Work Authorization</FieldLabel>
            <SelectField
              id="work-auth"
              value={workAuthorization}
              onChange={setWorkAuthorization}
            >
              <option value="citizen">Citizen</option>
              <option value="permanent_resident">Permanent Resident</option>
              <option value="visa_required">Visa Required</option>
            </SelectField>
          </div>
        </div>
      </div>

      {/* ── Professional Info ── */}
      <div className="mt-8">
        <SectionDivider title="Professional Info" />
        <div className="mt-5 space-y-4">
          <div>
            <FieldLabel htmlFor="current-title">
              Current / Recent Job Title
            </FieldLabel>
            <TextInput
              id="current-title"
              type="text"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              placeholder="e.g. Frontend Engineer"
            />
          </div>
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <FieldLabel htmlFor="exp-level">Experience Level</FieldLabel>
              <SelectField
                id="exp-level"
                value={experienceLevel}
                onChange={setExperienceLevel}
              >
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </SelectField>
            </div>
            <div>
              <FieldLabel htmlFor="years-exp">Years of Experience</FieldLabel>
              <TextInput
                id="years-exp"
                type="number"
                min="0"
                max="50"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <FieldLabel>Skills</FieldLabel>
            <TagInput
              tags={skills}
              inputValue={skillInput}
              placeholder="Add a skill..."
              onInputChange={setSkillInput}
              onAdd={addSkill}
              onRemove={removeSkill}
            />
          </div>
          <div>
            <FieldLabel optional>Industries</FieldLabel>
            <TagInput
              tags={industries}
              inputValue={industryInput}
              placeholder="e.g. FinTech, Healthcare"
              onInputChange={setIndustryInput}
              onAdd={addIndustry}
              onRemove={removeIndustry}
            />
          </div>
        </div>
      </div>

      {/* ── Work Experience ── */}
      <div className="mt-8">
        <SectionDivider
          title="Work Experience"
          action={
            <button
              type="button"
              onClick={addWorkEntry}
              className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-dark"
            >
              <Plus className="h-4 w-4" />
              Add role
            </button>
          }
        />
        <div className="mt-5 space-y-6">
          {workExperience.map((entry, idx) => (
            <div
              key={entry.id}
              className={
                idx > 0 ? "border-t border-border pt-6" : undefined
              }
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <FieldLabel>Company Name</FieldLabel>
                  <TextInput
                    type="text"
                    value={entry.companyName}
                    onChange={(e) =>
                      updateWorkEntry(entry.id, "companyName", e.target.value)
                    }
                    placeholder="e.g. Acme Inc."
                  />
                </div>
                <div>
                  <FieldLabel>Job Title</FieldLabel>
                  <TextInput
                    type="text"
                    value={entry.jobTitle}
                    onChange={(e) =>
                      updateWorkEntry(entry.id, "jobTitle", e.target.value)
                    }
                    placeholder="e.g. Frontend Engineer"
                  />
                </div>
                <div>
                  <FieldLabel>Start Date</FieldLabel>
                  <DateInput
                    value={entry.startDate}
                    onChange={(v) => updateWorkEntry(entry.id, "startDate", v)}
                  />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                      End Date
                    </span>
                    <label className="flex cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={entry.currentlyWorking}
                        onChange={(e) =>
                          updateWorkEntry(
                            entry.id,
                            "currentlyWorking",
                            e.target.checked,
                          )
                        }
                        className="h-3.5 w-3.5 accent-accent"
                      />
                      <span className="text-xs font-normal text-text-secondary">
                        Currently working here
                      </span>
                    </label>
                  </div>
                  <DateInput
                    value={entry.endDate}
                    onChange={(v) => updateWorkEntry(entry.id, "endDate", v)}
                    disabled={entry.currentlyWorking}
                  />
                </div>
              </div>
              <div className="mt-4">
                <FieldLabel>Key Responsibilities</FieldLabel>
                <TextArea
                  rows={3}
                  value={entry.responsibilities}
                  onChange={(e) =>
                    updateWorkEntry(
                      entry.id,
                      "responsibilities",
                      e.target.value,
                    )
                  }
                  placeholder="Describe your key responsibilities and achievements..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Education ── */}
      <div className="mt-8">
        <SectionDivider title="Education" />
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <FieldLabel htmlFor="degree">Highest Degree</FieldLabel>
            <SelectField
              id="degree"
              value={highestDegree}
              onChange={setHighestDegree}
            >
              <option value="high_school">High School</option>
              <option value="associate">Associate</option>
              <option value="bachelor">Bachelor&apos;s</option>
              <option value="master">Master&apos;s</option>
              <option value="phd">PhD</option>
              <option value="other">Other</option>
            </SelectField>
          </div>
          <div>
            <FieldLabel htmlFor="field-of-study">Field of Study</FieldLabel>
            <TextInput
              id="field-of-study"
              type="text"
              value={fieldOfStudy}
              onChange={(e) => setFieldOfStudy(e.target.value)}
              placeholder="e.g. Computer Science"
            />
          </div>
          <div>
            <FieldLabel htmlFor="institution">Institution Name</FieldLabel>
            <TextInput
              id="institution"
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="e.g. State University"
            />
          </div>
          <div>
            <FieldLabel htmlFor="grad-year">Graduation Year</FieldLabel>
            <TextInput
              id="grad-year"
              type="text"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              placeholder="YYYY"
            />
          </div>
        </div>
      </div>

      {/* ── Job Preferences ── */}
      <div className="mt-8">
        <SectionDivider title="Job Preferences" />
        <div className="mt-5 space-y-4">
          <div>
            <FieldLabel htmlFor="job-titles">Job Titles Seeking</FieldLabel>
            <TextInput
              id="job-titles"
              type="text"
              value={jobTitlesSeeking}
              onChange={(e) => setJobTitlesSeeking(e.target.value)}
              placeholder="e.g. Frontend Engineer, React Developer"
            />
          </div>
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <FieldLabel htmlFor="remote-pref">Remote Preference</FieldLabel>
              <SelectField
                id="remote-pref"
                value={remotePreference}
                onChange={setRemotePreference}
              >
                <option value="any">Any</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </SelectField>
            </div>
            <div>
              <FieldLabel htmlFor="salary" optional>
                Salary Expectation
              </FieldLabel>
              <TextInput
                id="salary"
                type="text"
                value={salaryExpectation}
                onChange={(e) => setSalaryExpectation(e.target.value)}
                placeholder="e.g. $120k+"
              />
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="locations" optional>
              Preferred Locations
            </FieldLabel>
            <TextInput
              id="locations"
              type="text"
              value={preferredLocations}
              onChange={(e) => setPreferredLocations(e.target.value)}
              placeholder="e.g. New York, London"
            />
          </div>
          <div>
            <FieldLabel htmlFor="cover-letter-tone">
              Cover Letter Tone
            </FieldLabel>
            <SelectField
              id="cover-letter-tone"
              value={coverLetterTone}
              onChange={setCoverLetterTone}
            >
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="enthusiastic">Enthusiastic</option>
            </SelectField>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-8 w-full rounded-md bg-accent py-3 text-sm font-medium text-accent-foreground hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving…" : "Save Profile"}
      </button>

      {saveStatus === "success" && (
        <p className="mt-2 text-center text-sm text-success-foreground">
          Profile saved successfully.
        </p>
      )}
      {saveStatus === "error" && (
        <p className="mt-2 text-center text-sm text-error">{saveMessage}</p>
      )}
    </form>
  );
}
