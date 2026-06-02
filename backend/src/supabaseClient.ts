import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Lazily-initialized Supabase clients. In lowdb mode (DB_BACKEND=lowdb),
 * the env vars are not required and the clients are never created. In
 * Supabase mode, they initialize on first access so the server only
 * crashes if the env vars are missing when Supabase is actually needed.
 *
 * See docs/BACKEND_ROADMAP.md §1–2 for the client module contract.
 */

let adminClient: SupabaseClient | null = null;

function requireEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name} — check your .env file. Required when DB_BACKEND=supabase.`,
    );
  }
  return value;
}

/**
 * Server-side Supabase client with the service role key. Bypasses RLS
 * entirely — use only for admin operations, migrations, and the Supabase
 * adapter. Never expose this client or its key to the browser.
 *
 * Initializes on first call so lowdb mode never requires Supabase env vars.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    const url = requireEnvVar("SUPABASE_URL");
    const key = requireEnvVar("SUPABASE_SERVICE_ROLE_KEY");
    adminClient = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return adminClient;
}

/**
 * Creates a Supabase client that carries the user's JWT for RLS-protected
 * queries. This is used by route handlers that need to operate within the
 * user's RLS scope (Workstream 2). The service role client above handles
 * cross-tenant admin operations.
 */
export function createSupabaseUserClient(jwt: string): SupabaseClient {
  const url = requireEnvVar("SUPABASE_URL");
  const anonKey = requireEnvVar("SUPABASE_ANON_KEY");
  return createClient(url, anonKey, {
    global: {
      headers: { Authorization: `Bearer ${jwt}` },
    },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
