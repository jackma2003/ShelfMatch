import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Must match AUTH_COOKIE_NAME in backend/src/lib/jwt.ts — the two are separate deployments
// so this can't be a shared import, only a shared literal.
const AUTH_COOKIE_NAME = "shelfmatch_token";

const AUTH_PAGES = ["/login", "/signup"];

// Optimistic check only: presence of the cookie, not validity. Verifying the JWT would mean
// duplicating the signing secret into the Edge runtime for little benefit — an expired or
// tampered token still gets caught by AuthGuard's real `/api/auth/me` call after this runs.
export default function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const isAuthPage = AUTH_PAGES.some((page) => request.nextUrl.pathname.startsWith(page));

  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!hasSession && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pantry/:path*",
    "/recipes/:path*",
    "/saved/:path*",
    "/shopping-list/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
  ],
};
