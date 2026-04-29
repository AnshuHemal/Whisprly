import { handlers } from "@/lib/auth";

/**
 * NextAuth v5 route handler.
 * Handles all /api/auth/* requests (sign in, sign out, callbacks, etc.)
 */
export const { GET, POST } = handlers;
