import posthog from "posthog-js";

import type { PostHogEventPayload } from "@/lib/posthog-events";

function getPostHogKey(): string | null {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_KEY ??
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ??
    null
  );
}

export function initPostHog(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (posthog.__loaded) {
    return true;
  }

  const posthogKey = getPostHogKey();

  if (!posthogKey) {
    return false;
  }

  posthog.init(posthogKey, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false,
  });

  return true;
}

export function identifyPostHogUser(
  userId: string,
  email?: string | null,
  name?: string | null,
): void {
  if (!initPostHog()) {
    return;
  }

  posthog.identify(userId, {
    ...(email ? { email } : {}),
    ...(name ? { name } : {}),
  });
}

export function resetPostHog(): void {
  if (typeof window === "undefined" || !posthog.__loaded) {
    return;
  }

  posthog.reset();
}

export function capturePostHogEvent(payload: PostHogEventPayload): void {
  if (!initPostHog()) {
    return;
  }

  posthog.capture(payload.event, payload.properties);
}
