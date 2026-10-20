/**
 * Exporta o banco em JSON para migração ou backup, em data/export-AAAAMMDD-HHMM/.
 * Funciona contra o Supabase ou contra um Postgres comum (usa o DATABASE_URL do server/.env).
 * Tabelas que não existem no banco de origem são puladas.
 *
 * O export contém dado pessoal (e-mails, favoritos, visualizações, auditoria): fica em data/,
 * fora do Git, e deve ser apagado depois de usado.
 *
 * Uso: npm run db:exportar
 */
import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma';
import { workbookDir } from '../lib/acervoPaths';

type ExportQuery = {
  file: string;
  /** Tabela cuja existência é conferida antes da consulta. */
  table: string;
  sql: string;
};

/** Nunca exporta hash de senha nem token de redefinição. */
const QUERIES: ExportQuery[] = [
  { file: 'odas', table: 'public.odas', sql: 'select * from public.odas order by id' },
  { file: 'bncc', table: 'public.bncc', sql: 'select * from public.bncc order by id' },
  { file: 'import_events', table: 'public.import_events', sql: 'select * from public.import_events order by id' },
  { file: 'audit_events', table: 'public.audit_events', sql: 'select * from public.audit_events order by id' },
  {
    file: 'users_express',
    table: 'public.users',
    sql: 'select id, email, name, role, created_at from public.users order by id',
  },
  { file: 'user_favorites', table: 'public.user_favorites', sql: 'select * from public.user_favorites order by id' },
  { file: 'oda_view_events', table: 'public.oda_view_events', sql: 'select * from public.oda_view_events order by id' },
  {
    file: 'users_supabase',
    table: 'auth.users',
    sql: `select id, email, raw_app_meta_data ->> 'role' as role, raw_user_meta_data ->> 'name' as name,
                 created_at, last_sign_in_at
          from auth.users order by created_at`,
  },
  {
    file: 'auth_favorites',
    table: 'public.auth_favorites',
    sql: 'select * from public.auth_favorites order by created_at',
  },
  {
    file: 'auth_view_events',
    table: 'public.auth_view_events',
    sql: 'select * from public.auth_view_events order by created_at',
  },
];

function timestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

function toJson(rows: unknown): string {
  return JSON.stringify(rows, (_key, value) => (typeof value === 'bigint' ? value.toString() : value), 2);
}

async function tableExists(qualifiedName: string): Promise<boolean> {
  const result = await prisma.$queryRaw<{ exists: boolean }[]>`
    select to_regclass(${qualifiedName}) is not null as exists`;
  return Boolean(result[0]?.exists);
}

async function main() {
  const outDir = path.join(workbookDir(), `export-${timestamp()}`);
  fs.mkdirSync(outDir, { recursive: true });

  const manifest: Record<string, number | 'ausente'> = {};
  for (const query of QUERIES) {
    if (!(await tableExists(query.table))) {
      manifest[query.file] = 'ausente';
      continue;
    }
    const rows = await prisma.$queryRawUnsafe<unknown[]>(query.sql);
    fs.writeFileSync(path.join(outDir, `${query.file}.json`), toJson(rows));
    manifest[query.file] = rows.length;
  }

  fs.writeFileSync(
    path.join(outDir, 'manifest.json'),
    toJson({ exportadoEm: new Date().toISOString(), linhas: manifest })
  );

  console.log(`📦 Export em ${outDir}`);
  for (const [file, count] of Object.entries(manifest)) {
    console.log(`   ${file}: ${count}`);
  }
  console.log('\n⚠️  Contém dado pessoal. Apague a pasta depois da migração ou guarde em local controlado.');
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
