import { describe, expect, it, vi } from 'vitest';
import { createJwtRetryFetch, isJwtIssuedAtFuture } from './jwtRetryFetch';

const futureJwt = () =>
  new Response(JSON.stringify({ code: 'PGRST303', message: 'JWT issued at future' }), {
    status: 401,
  });
const ok = () => new Response('[]', { status: 200 });
const noWait = () => Promise.resolve();

describe('isJwtIssuedAtFuture', () => {
  it('reconhece o 401 de relógio adiantado', async () => {
    expect(await isJwtIssuedAtFuture(futureJwt())).toBe(true);
  });

  it('ignora outros 401 e respostas de sucesso', async () => {
    expect(await isJwtIssuedAtFuture(new Response('JWT expired', { status: 401 }))).toBe(false);
    expect(await isJwtIssuedAtFuture(ok())).toBe(false);
  });
});

describe('createJwtRetryFetch', () => {
  it('repete a chamada até o token ser aceito', async () => {
    const base = vi.fn().mockResolvedValueOnce(futureJwt()).mockResolvedValueOnce(ok());
    const wait = vi.fn(noWait);
    const response = await createJwtRetryFetch(base, [1000, 2000], wait)('/rest/v1/odas');
    expect(response.status).toBe(200);
    expect(base).toHaveBeenCalledTimes(2);
    expect(wait).toHaveBeenCalledWith(1000);
  });

  it('desiste depois das tentativas configuradas e devolve o último erro', async () => {
    const base = vi.fn().mockImplementation(() => Promise.resolve(futureJwt()));
    const response = await createJwtRetryFetch(base, [1000, 2000], noWait)('/rest/v1/odas');
    expect(response.status).toBe(401);
    expect(base).toHaveBeenCalledTimes(3);
  });

  it('não repete erro que não é de relógio', async () => {
    const base = vi.fn().mockResolvedValue(new Response('JWT expired', { status: 401 }));
    await createJwtRetryFetch(base, [1000], noWait)('/rest/v1/odas');
    expect(base).toHaveBeenCalledTimes(1);
  });
});
