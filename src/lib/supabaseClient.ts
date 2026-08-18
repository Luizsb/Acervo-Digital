import { createClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from '../config/backend';

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
    });
  }
  return client;
}
