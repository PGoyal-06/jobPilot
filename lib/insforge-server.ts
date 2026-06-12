import type { InsForgeClient, UserSchema } from "@insforge/sdk";
import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createInsforgeServer(): Promise<InsForgeClient> {
  return createServerClient({
    cookies: await cookies(),
  });
}

export async function getCurrentUser(): Promise<UserSchema | null> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error) {
    return null;
  }

  return data.user;
}

export async function requireCurrentUser(): Promise<UserSchema> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
