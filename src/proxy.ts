import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection proxy (Next.js 16 — replaces middleware.ts).
 *
 * Protected routes (require authentication):
 *  - /dashboard and all sub-routes
 *  - /session and all sub-routes
 *  - /api/session, /api/answer, /api/transcribe, /api/resume
 *
 * Unauthenticated requests are redirected to /login with a `callbackUrl`
 * so the user lands back where they intended after signing in.
 *
 * @see https://nextjs.org/docs/app/getting-started/proxy
 */
export const proxy = auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!(req as { auth?: { user?: unknown } }).auth?.user;

  const protectedRoutes = [
    "/dashboard",
    "/session",
    "/api/session",
    "/api/answer",
    "/api/transcribe",
    "/api/resume",
  ];

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Security headers ──────────────────────────────────────────────────
  const response = NextResponse.next();

  // Content Security Policy — restrict script sources
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.openai.com https://api.anthropic.com; frame-ancestors 'none';"
  );

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions policy — disable unnecessary browser features
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(self), geolocation=(), payment=()"
  );

  return response;
});

export const config = {
  /*
   * Match all routes except:
   * - _next/static (static files)
   * - _next/image (image optimisation)
   * - favicon.ico
   * - public assets
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
