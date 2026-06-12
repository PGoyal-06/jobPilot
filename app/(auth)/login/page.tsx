import { redirect } from "next/navigation";

import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { Navbar } from "@/components/layout/Navbar";
import { getCurrentUser } from "@/lib/insforge-server";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="page-shell flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-14 lg:px-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-surface shadow-card lg:grid-cols-2">
          <section className="soft-wash border-b border-border px-8 py-10 sm:px-11 sm:py-14 lg:border-b-0 lg:border-r">
            <div className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium leading-4 text-text-secondary shadow-card">
              <span className="mr-2 text-accent">*</span>
              OAuth secured by InsForge
            </div>
            <h1 className="mt-9 max-w-lg text-5xl font-semibold leading-none text-text-slate sm:text-6xl">
              Sign in and let JobPilot find the signal.
            </h1>
            <p className="mt-7 max-w-xl text-xl font-normal leading-8 text-text-secondary">
              Connect with Google or GitHub to manage your profile, match jobs,
              and research companies before you apply.
            </p>
            <p className="mt-12 text-sm font-medium leading-5 text-text-secondary">
              New users continue to profile setup after sign-in.
            </p>
          </section>

          <section className="flex items-center px-8 py-10 sm:px-11 sm:py-14">
            <div className="w-full">
              <p className="text-base font-normal leading-6 text-text-secondary">
                Welcome to
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-9 text-text-primary">
                JobPilot
              </h2>
              <p className="mt-4 text-base font-normal leading-6 text-text-secondary">
                Choose your preferred provider to continue.
              </p>
              <div className="mt-9">
                <OAuthButtons />
              </div>
              <p className="mt-5 text-xs font-normal leading-5 text-text-secondary">
                If Google asks for passkey verification and gets stuck, use
                GitHub to continue.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
