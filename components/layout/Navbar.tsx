import Image from "next/image";
import Link from "next/link";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { NavLinks } from "@/components/layout/NavLinks";

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
        <NavLinks />
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
