import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { JobsTable } from "@/components/find-jobs/JobsTable";
import { SearchControls } from "@/components/find-jobs/SearchControls";
import { Navbar } from "@/components/layout/Navbar";
import { createInsforgeServer, requireCurrentUser } from "@/lib/insforge-server";

export type JobRow = {
  id: string;
  company: string | null;
  title: string | null;
  match_score: number | null;
  salary: string | null;
  found_at: string;
};

export default async function FindJobsPage() {
  const user = await requireCurrentUser();
  const insforge = await createInsforgeServer();

  const { data: jobs } = await insforge.database
    .from("jobs")
    .select("id, company, title, match_score, salary, found_at")
    .eq("user_id", user.id)
    .order("found_at", { ascending: false });

  return (
    <main className="min-h-screen bg-background">
      <PostHogIdentify
        userId={user.id}
        email={user.email}
        name={user.profile?.name}
      />
      <Navbar showSignOut />
      <section className="page-shell px-6 py-8 lg:px-12">
        <div className="flex flex-col gap-6">
          <SearchControls />
          <JobsTable jobs={(jobs ?? []) as JobRow[]} />
        </div>
      </section>
    </main>
  );
}
