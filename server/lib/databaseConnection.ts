/** Subconjunto do `PoolConfig` do `pg` que o projeto define. */
export interface PostgresPoolConfig {
  connectionString: string;
  ssl: false | { rejectUnauthorized: boolean };
  max?: number;
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/**
 * Parâmetros da URL que eram do Prisma 5 ou que viram configuração explícita do pool.
 * O `sslmode` precisa sair: o `pg` deixa o da URL sobrescrever a opção `ssl`.
 */
const URL_ONLY_PARAMS = ['sslmode', 'pgbouncer', 'connection_limit', 'pool_timeout'];

/** Configuração do pool do `pg` a partir do `DATABASE_URL` do `server/.env`. */
export function postgresPoolConfig(databaseUrl: string): PostgresPoolConfig {
  const url = new URL(databaseUrl);
  const sslmode = url.searchParams.get('sslmode');
  const connectionLimit = Number(url.searchParams.get('connection_limit'));
  for (const param of URL_ONLY_PARAMS) url.searchParams.delete(param);

  return {
    connectionString: url.toString(),
    ssl: sslFor(url.hostname, sslmode),
    ...(connectionLimit > 0 ? { max: connectionLimit } : {}),
  };
}

function sslFor(hostname: string, sslmode: string | null): PostgresPoolConfig['ssl'] {
  if (sslmode === 'disable') return false;
  if (sslmode === 'verify-full' || sslmode === 'verify-ca') return { rejectUnauthorized: true };
  if (sslmode === null && LOCAL_HOSTS.has(hostname)) return false;
  // Host remoto: sempre criptografado. Sem validar a cadeia, como o Prisma 5 fazia com
  // `require`: o certificado do Supabase é de CA própria. Para validar, use `verify-full`.
  return { rejectUnauthorized: false };
}
