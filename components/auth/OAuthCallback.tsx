"use client";

import { createClient } from "@insforge/sdk";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CallbackState = "loading" | "error";

type OAuthSession = {
  accessToken: string;
  refreshToken?: string | null;
};

const pkceVerifierKey = "insforge_pkce_verifier";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOAuthSession(value: unknown): value is OAuthSession {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.accessToken === "string" &&
    (typeof value.refreshToken === "string" ||
      value.refreshToken === null ||
      value.refreshToken === undefined)
  );
}

function cleanCallbackUrl(): void {
  window.history.replaceState({}, document.title, window.location.pathname);
}

export function OAuthCallback() {
  const router = useRouter();
  const [state, setState] = useState<CallbackState>("loading");

  useEffect(() => {
    async function completeOAuth(): Promise<void> {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error") ?? params.get("insforge_error");

      if (error) {
        console.error("[OAuthCallback]", error);
        cleanCallbackUrl();
        setState("error");
        return;
      }

      const code = params.get("insforge_code");
      const verifier = window.sessionStorage.getItem(pkceVerifierKey);

      if (!code || !verifier) {
        setState("error");
        return;
      }

      cleanCallbackUrl();

      const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
      const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

      if (!baseUrl || !anonKey) {
        console.error("[OAuthCallback] Missing InsForge public env vars");
        setState("error");
        return;
      }

      const callbackClient = createClient({ baseUrl, anonKey });
      const { data, error: exchangeError } =
        await callbackClient.auth.exchangeOAuthCode(code, verifier);

      if (exchangeError || !isOAuthSession(data)) {
        console.error("[OAuthCallback]", exchangeError);
        setState("error");
        return;
      }

      window.sessionStorage.removeItem(pkceVerifierKey);

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),
      });

      if (!response.ok) {
        console.error("[OAuthCallback] Failed to persist auth cookies");
        setState("error");
        return;
      }

      router.replace("/dashboard");
    }

    void completeOAuth();
  }, [router]);

  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 text-center shadow-card">
        {state === "loading" ? (
          <>
            <div className="mx-auto mb-5 h-2 w-24 rounded-full bg-accent" />
            <h1 className="text-2xl font-semibold leading-8 text-text-primary">
              Finishing sign in
            </h1>
            <p className="mt-2 text-sm font-normal leading-5 text-text-secondary">
              We&apos;re connecting your JobPilot account and preparing your
              dashboard.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold leading-8 text-text-primary">
              Sign in did not finish
            </h1>
            <p className="mt-2 text-sm font-normal leading-5 text-text-secondary">
              Please return to the login page and try again.
            </p>
            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="mt-5 inline-flex min-h-10 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent-dark"
            >
              Back to login
            </button>
          </>
        )}
      </div>
    </section>
  );
}
