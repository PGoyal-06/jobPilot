"use client";

import { useEffect } from "react";

import { identifyPostHogUser } from "@/lib/posthog-client";

type Props = {
  userId: string;
  email?: string | null;
  name?: string | null;
};

export function PostHogIdentify({ userId, email, name }: Props) {
  useEffect(() => {
    identifyPostHogUser(userId, email, name);
  }, [userId, email, name]);

  return null;
}
