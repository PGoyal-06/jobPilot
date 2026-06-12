"use client";

import { useState } from "react";
import { ResumeSection } from "@/components/profile/ResumeSection";
import { ProfileForm } from "@/components/profile/ProfileForm";
import type { ProfileFormData } from "@/actions/profile";
import type { ProfileRow } from "@/lib/profile-utils";

type Props = {
  initialHasResume: boolean;
  userEmail: string;
  initialData: ProfileRow | null;
};

export function ProfilePageClient({
  initialHasResume,
  userEmail,
  initialData,
}: Props) {
  const [extractedData, setExtractedData] =
    useState<Partial<ProfileFormData> | null>(null);

  return (
    <>
      <ResumeSection
        initialHasResume={initialHasResume}
        onExtract={setExtractedData}
      />
      <ProfileForm
        userEmail={userEmail}
        initialData={initialData}
        extractedData={extractedData}
      />
    </>
  );
}
