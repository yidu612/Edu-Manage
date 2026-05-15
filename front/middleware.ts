import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/student", "/teacher", "/admin"];

// Role-to-prefix map — prevents a student from accessing /teacher/* etc.
const ROLE_PREFIX: Record<string, string> = {
  student: "/student",
  teacher: "/teacher",
  admin: "/admin",
};

function decodeJwtRole(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    // Edge Runtime supports atob
    const payload = JSON.parse(atob(base64));
    if (payload.exp && payload.exp < Date.now() / 1000) return null;
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode role and enforce section separation
  const role = decodeJwtRole(token);
  if (!role) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const allowedPrefix = ROLE_PREFIX[role];
  if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
    // Redirect to the user's own section rather than showing a 403
    return NextResponse.redirect(new URL(`${allowedPrefix}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/teacher/:path*", "/admin/:path*"],
};
