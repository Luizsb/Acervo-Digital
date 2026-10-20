import { createClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from '../config/backend';
import { createJwtRetryFetch } from '../utils/jwtRetryFetch';

let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!client) {
    const { url, anonKey } = getSupabasePublicConfig();
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
      global: { fetch: createJwtRetryFetch() },
    });
  }
  return client;
}
