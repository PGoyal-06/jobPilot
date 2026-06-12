import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { Navbar } from "@/components/layout/Navbar";
import { CompletionBanner } from "@/components/profile/CompletionBanner";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import { calculateProfileCompletion } from "@/lib/profile-utils";
import type { ProfileRow } from "@/lib/profile-utils";
import { createInsforgeServer, requireCurrentUser } from "@/lib/insforge-server";

export default async function ProfilePage() {
  const user = await requireCurrentUser();
  const insforge = await createInsforgeServer();

  const { data: profile } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { percentage, missingFields } = calculateProfileCompletion(
    profile as ProfileRow | null,
  );

  return (
    <main className="min-h-screen bg-background">
      <PostHogIdentify
        userId={user.id}
        email={user.email}
        name={user.profile?.name}
      />
      <Navbar showSignOut />
      <section className="page-shell px-6 py-8 lg:px-12">
        <div className="mx-auto max-w-3xl space-y-6">
          <CompletionBanner
            percentage={percentage}
            missingFields={missingFields}
          />
          <ProfilePageClient
            initialHasResume={!!(profile as ProfileRow | null)?.resume_pdf_url}
            userEmail={user.email ?? ""}
            initialData={profile as ProfileRow | null}
          />
        </div>
      </section>
    </main>
  );
}
