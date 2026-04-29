import { createClient } from "@supabase/supabase-js";

/**
 * Supabase public client — safe to use in browser and server components.
 * Uses the anon key with Row Level Security enforced.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Supabase admin client — server-side only.
 * Uses the service role key to bypass RLS for trusted server operations
 * (e.g., resume uploads, admin queries).
 * Never expose this client to the browser.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
