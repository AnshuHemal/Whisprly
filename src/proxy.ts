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

  return NextResponse.next();
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
