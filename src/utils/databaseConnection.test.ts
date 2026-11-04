import { describe, expect, it } from 'vitest';
import { postgresPoolConfig } from '../../server/lib/databaseConnection';

const SUPABASE_POOLER =
  'postgresql://postgres.ref:senha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';

describe('postgresPoolConfig', () => {
  it('Postgres local sem sslmode: sem TLS', () => {
    const config = postgresPoolConfig('postgresql://acervo:acervo@localhost:5433/acervo');
    expect(config).toEqual({
      connectionString: 'postgresql://acervo:acervo@localhost:5433/acervo',
      ssl: false,
    });
  });

  it('host remoto sem sslmode: criptografa mesmo assim', () => {
    expect(postgresPoolConfig(SUPABASE_POOLER).ssl).toEqual({ rejectUnauthorized: false });
  });

  it('tira da URL os parâmetros do Prisma 5 e o sslmode', () => {
    const config = postgresPoolConfig(
      `${SUPABASE_POOLER}?pgbouncer=true&sslmode=require&connection_limit=3&application_name=acervo`,
    );
    expect(config.connectionString).toBe(`${SUPABASE_POOLER}?application_name=acervo`);
    expect(config.ssl).toEqual({ rejectUnauthorized: false });
    expect(config.max).toBe(3);
  });

  it('verify-full valida o certificado; disable desliga o TLS', () => {
    expect(postgresPoolConfig(`${SUPABASE_POOLER}?sslmode=verify-full`).ssl).toEqual({
      rejectUnauthorized: true,
    });
    expect(postgresPoolConfig(`${SUPABASE_POOLER}?sslmode=disable`).ssl).toBe(false);
  });
});
