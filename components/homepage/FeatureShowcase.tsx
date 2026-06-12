import Image from "next/image";

const searchFeatures: { title: string; body: string; active?: boolean }[] = [
  {
    title: "Find jobs that actually fit",
    body: "Search by title and location or paste a job link. Get matched roles you can quickly scan.",
    active: true,
  },
  {
    title: "Know the Company Before You Apply",
    body: "Stop guessing what a company is about. JobPilot browses their site and gives you everything you need to apply with confidence.",
  },
  {
    title: "Keep track of every application",
    body: "Keep a clear view of every job you've found, tailored. Your activity and progress all stay in one simple place.",
  },
];

const confidenceFeatures: { title: string; body: string; active?: boolean }[] = [
  {
    title: "Understand your match score",
    body: "See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what's missing.",
  },
  {
    title: "AI-Powered Job Matching",
    body: "Stop guessing which jobs are worth applying to. JobPilot scores every role against your actual skills so you focus on the ones that matter.",
    active: true,
  },
  {
    title: "Focus on the right roles",
    body: "Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying.",
  },
];

export function FeatureShowcase() {
  return (
    <>
      <section className="grid border-b border-border bg-surface lg:grid-cols-2">
        <div className="border-b border-border lg:border-b-0 lg:border-r">
          <div className="border-b border-border px-8 py-16 sm:px-14 lg:px-18">
            <h2 className="max-w-xl text-5xl font-bold leading-tight text-text-slate sm:text-6xl">
              Manage Your Job Search With Ease
            </h2>
          </div>
          <div>
            {searchFeatures.map((feature) => (
              <article
                key={feature.title}
                className={`border-b border-border px-8 py-9 sm:px-14 lg:px-18 ${
                  feature.active ? "border-l-2 border-l-accent" : ""
                }`}
              >
                <h3 className="text-2xl font-semibold leading-8 text-text-slate">
                  {feature.title}
                </h3>
                <p className="mt-4 text-xl font-normal leading-8 text-text-slate-medium">
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </div>
        <div className="flex items-center bg-surface-muted px-6 py-16 sm:px-10 lg:px-14">
          <Image
            src="/images/jobs-lists.png"
            alt="Matched jobs list"
            width={2364}
            height={1778}
            className="w-full rounded-xl"
          />
        </div>
      </section>

      <div className="diagonal-divider border-b border-border" />

      <section className="grid border-b border-border bg-surface lg:grid-cols-2">
        <div className="flex items-center bg-surface-muted px-6 py-16 sm:px-10 lg:px-14">
          <Image
            src="/images/agnet-log.png"
            alt="Agent activity log"
            width={2144}
            height={1656}
            className="w-full rounded-xl"
          />
        </div>
        <div className="border-t border-border lg:border-l lg:border-t-0">
          <div className="border-b border-border px-8 py-16 sm:px-14 lg:px-18">
            <h2 className="max-w-2xl text-5xl font-bold leading-tight text-text-slate sm:text-6xl">
              Apply With More Confidence, Every Time
            </h2>
          </div>
          <div>
            {confidenceFeatures.map((feature) => (
              <article
                key={feature.title}
                className={`border-b border-border px-8 py-9 sm:px-14 lg:px-18 ${
                  feature.active ? "border-l-2 border-l-success" : ""
                }`}
              >
                <h3 className="text-2xl font-semibold leading-8 text-text-slate">
                  {feature.title}
                </h3>
                <p className="mt-4 text-xl font-normal leading-8 text-text-slate-medium">
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
