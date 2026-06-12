import Link from "next/link";

export function Hero() {
  return (
    <section className="soft-wash border-b border-border px-6 py-20 text-center sm:py-28 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-bold leading-tight text-text-black sm:text-6xl lg:text-7xl">
          Job hunting is hard.
          <br />
          Your tools shouldn&apos;t be.
        </h1>
        <p className="mx-auto mt-7 max-w-3xl text-xl font-normal leading-8 text-text-slate-medium">
          Stop applying blind. JobPilot finds the jobs, researches the companies,
          and gives you everything you need to stand out.
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
