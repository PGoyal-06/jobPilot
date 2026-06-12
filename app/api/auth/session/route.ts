import {
  createServerClient,
  refreshAuth,
  setAuthCookies,
} from "@insforge/sdk/ssr";
import { NextRequest, NextResponse } from "next/server";

type SessionBody = {
  accessToken: string;
  refreshToken?: string | null;
};

type VerifiedSession = {
  accessToken: string;
  refreshToken?: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSessionBody(value: unknown): value is SessionBody {
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

async function verifySession(body: SessionBody): Promise<VerifiedSession | null> {
  if (body.refreshToken) {
    const result = await refreshAuth({ refreshToken: body.refreshToken });

    if (result.error || !result.accessToken) {
      return null;
    }

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  const insforge = createServerClient({ accessToken: body.accessToken });
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data.user) {
    return null;
  }

  return {
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
  };
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body: unknown = await request.json();

    if (!isSessionBody(body)) {
      return NextResponse.json(
        { success: false, error: "Invalid auth session" },
        { status: 400 },
      );
    }

    const verifiedSession = await verifySession(body);

    if (!verifiedSession) {
      return NextResponse.json(
        { success: false, error: "Invalid auth session" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ success: true });
    setAuthCookies(response.cookies, verifiedSession);

    return response;
  } catch (error) {
    console.error("[api/auth/session]", error);
    return NextResponse.json(
      { success: false, error: "Unable to save auth session" },
      { status: 500 },
    );
  }
}
