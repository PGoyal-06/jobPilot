import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { Navbar } from "@/components/layout/Navbar";
import { requireCurrentUser } from "@/lib/insforge-server";

export default async function DashboardPage() {
  const user = await requireCurrentUser();

  return (
    <main className="min-h-screen bg-background">
      <PostHogIdentify
        userId={user.id}
        email={user.email}
        name={user.profile?.name}
      />
      <Navbar showSignOut />
      <section className="page-shell px-6 py-8 lg:px-12">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
          <h1 className="text-base font-semibold leading-6 text-text-primary">
            Dashboard
          </h1>
          <p className="mt-2 text-sm font-normal leading-5 text-text-secondary">
            Your job search dashboard will appear here.
          </p>
        </div>
      </section>
    </main>
  );
}
