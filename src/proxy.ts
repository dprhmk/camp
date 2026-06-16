import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

// Lightweight gate: redirect visitors with no session cookie to /login.
// Public paths are always allowed — we must NOT bounce /login -> / merely
// because a cookie exists, otherwise a stale/invalid cookie (e.g. after a DB
// reseed) loops forever (/ -> /login -> / ...). Whether an authenticated user
// should skip /login is decided on the page via getCurrentUser().
const PUBLIC_PATHS = ["/login"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  if (!request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Everything except Next internals, the upload/static assets and PWA files.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons|uploads).*)",
  ],
};
