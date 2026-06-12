import { PostHog } from "posthog-node";

import type { PostHogEventPayload } from "@/lib/posthog-events";

function getPostHogKey(): string | null {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_KEY ??
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ??
    null
  );
}

export function createPostHogServer(): PostHog | null {
  const posthogKey = getPostHogKey();

  if (!posthogKey) {
    return null;
  }

  return new PostHog(posthogKey, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
}

export async function capturePostHogServerEvent(
  payload: PostHogEventPayload,
): Promise<void> {
  const posthog = createPostHogServer();

  if (!posthog) {
    return;
  }

  try {
    posthog.capture({
      distinctId: payload.properties.userId,
      event: payload.event,
      properties: payload.properties,
    });
  } finally {
    await posthog.shutdown();
  }
}
