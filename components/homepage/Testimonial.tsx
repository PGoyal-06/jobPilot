import Image from "next/image";

export function Testimonial() {
  return (
    <section className="border-b border-border bg-surface px-6 py-24 text-center lg:px-12">
      <p className="text-sm font-medium uppercase text-accent">
        Success Stories
      </p>
      <blockquote className="mx-auto mt-8 max-w-5xl text-4xl font-medium leading-tight text-text-slate sm:text-5xl">
        &ldquo;I used to spend my evenings copy-pasting resumes. Now I open my
        dashboard to see interviews waiting. It feels like cheating. Had 3
        offers on the table simultaneously.&rdquo;
      </blockquote>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Image
          src="/images/user-icon.png"
          alt="Tom Wilson"
          width={64}
          height={64}
          className="rounded-md border border-border"
        />
        <div className="text-left">
          <p className="text-base font-semibold text-text-black">Tom Wilson</p>
          <p className="mt-1 text-sm font-normal text-text-secondary">
            Junior Developer
          </p>
        </div>
      </div>
    </section>
  );
}
