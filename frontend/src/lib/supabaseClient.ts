import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/**
 * Browser-side Supabase client. Uses the anon key (public, RLS-protected)
 * and persists the auth session in localStorage via Supabase's built-in
 * storage adapter.
 *
 * Returns `null` when env vars are missing so the app can still run in
 * local-only (lowdb) mode without Supabase. Auth hooks and api.ts check
 * for null before making Supabase calls.
 */
export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          storage: window.localStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : null;
