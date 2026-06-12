"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { insforge } from "@/lib/insforge-client";
import { resetPostHog } from "@/lib/posthog-client";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut(): Promise<void> {
    setIsPending(true);

    const { error } = await insforge.auth.signOut();

    if (error) {
      console.error("[SignOutButton]", error);
    }

    const response = await fetch("/api/auth/signout", {
      method: "POST",
    });

    if (!response.ok) {
      console.error("[SignOutButton] Failed to clear auth cookies");
    }

    resetPostHog();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      disabled={isPending}
      className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary disabled:cursor-not-allowed disabled:text-text-muted sm:px-6"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
