import Link from "next/link";

export function BottomCta() {
  return (
    <section className="soft-wash border-b border-border px-6 py-24 text-center lg:px-12">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-5xl font-bold leading-tight text-text-black sm:text-6xl">
          Your next job search can feel a lot less overwhelming
        </h2>
        <p className="mt-7 text-xl font-normal leading-8 text-text-slate">
          Set up your profile, upload your resume, and start finding matches in
          minutes.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center rounded-md bg-overlay-dark px-8 text-lg font-medium text-accent-foreground shadow-card hover:bg-overlay"
          >
            Get Started <span className="ml-3 text-text-muted">&gt;</span>
          </Link>
          <Link
            href="/find-jobs"
            className="inline-flex min-h-12 items-center rounded-md border border-border bg-surface/70 px-8 text-lg font-medium text-text-black shadow-card hover:bg-surface"
          >
            Find Your First Match
          </Link>
        </div>
      </div>
    </section>
  );
}
