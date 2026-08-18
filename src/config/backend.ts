export type BackendTarget = 'ec2' | 'supabase';

const DEFAULT_TARGET: BackendTarget = 'ec2';

/**
 * Alvo do front. `ec2` = Express atual (local, Docker, instância AWS).
 * `supabase` = Auth/REST do projeto Free (fase 4). O servidor em server/
 * e o docker-compose.yml não são apagados: voltar é só esta variável.
 */
export function parseBackendTarget(raw?: string): BackendTarget {
  const value = raw?.trim().toLowerCase();
  if (!value || value === 'ec2' || value === 'express') return 'ec2';
  if (value === 'supabase') return 'supabase';
  throw new Error(
    `VITE_BACKEND inválido: "${raw}". Use "ec2" (Express) ou "supabase".`
  );
}

export function getBackendTarget(): BackendTarget {
  return parseBackendTarget(import.meta.env.VITE_BACKEND);
}

export function isSupabaseBackend(): boolean {
  return getBackendTarget() === 'supabase';
}

export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

/** Só a chave anon entra no front. A service_role nunca vai para o Vercel. */
export function getSupabasePublicConfig(): SupabasePublicConfig {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    throw new Error(
      'VITE_BACKEND=supabase exige VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
    );
  }
  return { url, anonKey };
}
