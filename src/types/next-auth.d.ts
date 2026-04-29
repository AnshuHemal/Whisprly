import type { DefaultSession } from "next-auth";

/**
 * Extends the built-in NextAuth session types to include the user's database ID.
 * This is populated in the `session` callback in src/lib/auth.ts.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
