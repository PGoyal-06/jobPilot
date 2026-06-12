import { clearAuthCookies } from "@insforge/sdk/ssr";
import { NextResponse } from "next/server";

export async function POST(): Promise<Response> {
  try {
    const response = NextResponse.json({ success: true });
    clearAuthCookies(response.cookies);

    return response;
  } catch (error) {
    console.error("[api/auth/signout]", error);
    return NextResponse.json(
      { success: false, error: "Unable to sign out" },
      { status: 500 },
    );
  }
}
