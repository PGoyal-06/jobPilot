"use client";

import { LayoutGrid, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/find-jobs", label: "Find Jobs", icon: Search },
  { href: "/profile", label: "Profile", icon: User },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-stretch sm:flex">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`flex h-16 items-center gap-1.5 border-b-2 px-4 text-sm font-medium transition-colors ${
              active
                ? "border-accent text-accent"
                : "border-transparent text-text-dark hover:text-accent"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
