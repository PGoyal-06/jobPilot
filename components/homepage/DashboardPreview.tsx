import Image from "next/image";

export function DashboardPreview() {
  return (
    <section className="border-b border-border bg-surface-tertiary px-6 py-16 sm:py-20 lg:px-12">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-xl">
        <Image
          src="/images/dashboard-demo.png"
          alt="JobPilot dashboard preview"
          width={4788}
          height={2416}
          priority
          className="w-full rounded-xl"
        />
      </div>
    </section>
  );
}
