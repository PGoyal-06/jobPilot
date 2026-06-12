import Image from "next/image";
import Link from "next/link";

import { SignOutButton } from "@/components/auth/SignOutButton";

const navigationItems: { href: string; label: string }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/find-jobs", label: "Find Jobs" },
  { href: "/profile", label: "Profile" },
];

type Props = {
  ctaHref?: string;
  ctaLabel?: string;
  showSignOut?: boolean;
};

export function Navbar({
  ctaHref = "/login",
  ctaLabel = "Start for free",
  showSignOut = false,
}: Props) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="page-shell flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="JobPilot home" className="shrink-0">
          <Image
            src="/logo.png"
            alt="JobPilot"
            width={148}
            height={50}
            priority
            className="h-10 w-auto"
          />
        </Link>
        <nav className="hidden items-center gap-12 text-sm font-medium text-text-slate sm:flex">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-accent">
              {item.label}
            </Link>
          ))}
        </nav>
        {showSignOut ? (
          <SignOutButton />
        ) : (
          <Link
            href={ctaHref}
            className="rounded-md bg-overlay-dark px-4 py-2 text-sm font-medium text-accent-foreground shadow-card hover:bg-overlay sm:px-6"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </header>
  );
}
