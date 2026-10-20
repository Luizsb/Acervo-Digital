/**
 * Porta de entrada da API do front. Cada função decide entre Supabase
 * (`supabaseApi.ts`) e Express (`server/`) por `isSupabaseBackend()`.
 */
export * from './types';
export { getAuthToken, setAuthToken } from './http';
export * from './auth';
export * from './favorites';
export * from './catalog';
export * from './admin';
export { apiODAToFrontend } from './odaToProject';
