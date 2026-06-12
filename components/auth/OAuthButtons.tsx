"use client";

import type { ReactElement } from "react";
import { useState } from "react";

import { insforge } from "@/lib/insforge-client";

type AuthProvider = "google" | "github";

type ProviderIconProps = {
  provider: AuthProvider;
};

const providers: {
  id: AuthProvider;
  label: string;
}[] = [
  {
    id: "google",
    label: "Continue with Google",
  },
  {
    id: "github",
    label: "Continue with GitHub",
  },
];

function GoogleIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 text-accent"
      fill="none"
    >
      <path
        d="M21.6 12.23c0-.78-.07-1.53-.2-2.23H12v4.26h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.55Z"
        fill="currentColor"
      />
      <path
        d="M12 22c2.7 0 4.98-.9 6.62-2.42l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.82-1.76-5.6-4.13H3.05v2.58A9.99 9.99 0 0 0 12 22Z"
        fill="currentColor"
      />
      <path
        d="M6.4 13.91a6.02 6.02 0 0 1 0-3.82V7.51H3.05a9.99 9.99 0 0 0 0 8.98l3.35-2.58Z"
        fill="currentColor"
      />
      <path
        d="M12 5.96c1.47 0 2.8.51 3.84 1.5l2.86-2.86A9.6 9.6 0 0 0 12 2a9.99 9.99 0 0 0-8.95 5.51l3.35 2.58C7.18 7.72 9.4 5.96 12 5.96Z"
        fill="currentColor"
      />
    </svg>
  );
}

function GitHubIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 text-text-primary"
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.86 8.37 6.84 9.72.5.09.68-.22.68-.49v-1.9c-2.78.62-3.37-1.22-3.37-1.22-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.85.09-.67.35-1.12.64-1.38-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.99c.85 0 1.69.12 2.48.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.71 1.03 1.62 1.03 2.74 0 3.93-2.34 4.8-4.57 5.05.36.32.68.95.68 1.92v2.79c0 .27.18.59.69.49A10.13 10.13 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function ProviderIcon({ provider }: ProviderIconProps): ReactElement {
  if (provider === "google") {
    return <GoogleIcon />;
  }

  return <GitHubIcon />;
}

export function OAuthButtons(): ReactElement {
  const [pendingProvider, setPendingProvider] = useState<AuthProvider | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleOAuth(provider: AuthProvider): Promise<void> {
    setPendingProvider(provider);
    setErrorMessage(null);

    const redirectTo = `${window.location.origin}/callback`;
    const { error } = await insforge.auth.signInWithOAuth(provider, {
      redirectTo,
    });

    if (error) {
      console.error("[OAuthButtons]", error);
      setErrorMessage("Could not start sign in. Please try again.");
      setPendingProvider(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => void handleOAuth(provider.id)}
          disabled={pendingProvider !== null}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-text-primary hover:bg-surface-secondary disabled:cursor-not-allowed disabled:text-text-muted"
        >
          <span
            aria-hidden="true"
            className="mr-3 inline-flex size-5 items-center justify-center"
          >
            <ProviderIcon provider={provider.id} />
          </span>
          <span>
            {pendingProvider === provider.id ? "Connecting..." : provider.label}
          </span>
        </button>
      ))}
      {errorMessage ? (
        <p className="text-center text-sm font-medium leading-5 text-error">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
