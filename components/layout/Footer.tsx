import Image from "next/image";
import Link from "next/link";

const footerItems: { href: string; label: string }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Condition" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="page-shell flex flex-col gap-8 px-6 py-12 sm:flex-row sm:items-center sm:justify-between lg:px-12">
        <Link href="/" aria-label="JobPilot home" className="shrink-0">
          <Image
            src="/logo.png"
            alt="JobPilot"
            width={148}
            height={50}
            className="h-10 w-auto"
          />
        </Link>
        <nav className="flex flex-col gap-4 text-base font-medium text-text-slate sm:flex-row sm:gap-10">
          {footerItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-accent">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
