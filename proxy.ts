import {
  updateSession,
  type CookieOptions,
  type CookieStore,
} from "@insforge/sdk/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/profile", "/find-jobs"];

function isProtectedPath(pathname: string): boolean {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

class RequestCookieStore implements CookieStore {
  constructor(private readonly cookies: NextRequest["cookies"]) {}

  get(name: string): ReturnType<NextRequest["cookies"]["get"]> {
    return this.cookies.get(name);
  }

  set(name: string, value: string, options?: CookieOptions): unknown;
  set(options: { name: string; value: string } & CookieOptions): unknown;
  set(
    nameOrOptions: string | ({ name: string; value: string } & CookieOptions),
    value?: string,
  ): unknown {
    if (typeof nameOrOptions === "string") {
      this.cookies.set(nameOrOptions, value ?? "");
      return undefined;
    }

    this.cookies.set({
      name: nameOrOptions.name,
      value: nameOrOptions.value,
    });
    return undefined;
  }

  delete(name: string): unknown;
  delete(options: { name: string } & CookieOptions): unknown;
  delete(nameOrOptions: string | ({ name: string } & CookieOptions)): unknown {
    const name =
      typeof nameOrOptions === "string" ? nameOrOptions : nameOrOptions.name;
    this.cookies.delete(name);
    return undefined;
  }
}

function copyResponseCookies(
  source: NextResponse,
  target: NextResponse,
): void {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next({ request });
  const session = await updateSession({
    requestCookies: new RequestCookieStore(request.cookies),
    responseCookies: response.cookies,
  });

  const { pathname } = request.nextUrl;

  if (isProtectedPath(pathname) && !session.accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    copyResponseCookies(response, redirectResponse);
    return redirectResponse;
  }

  if ((pathname === "/" || pathname === "/login") && session.accessToken) {
    const redirectResponse = NextResponse.redirect(
      new URL("/dashboard", request.url),
    );
    copyResponseCookies(response, redirectResponse);
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/profile/:path*",
    "/find-jobs/:path*",
  ],
};
