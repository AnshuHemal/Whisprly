"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

interface SessionProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

/**
 * Wraps the app with NextAuth's SessionProvider so any client component
 * can call `useSession()` to access the current user.
 */
export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>
  );
}
