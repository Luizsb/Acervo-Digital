/**
 * Logo depois de o Supabase Auth renovar o token, a Data API pode recusá-lo com
 * 401 "JWT issued at future": os relógios dos dois serviços diferem por um ou dois
 * segundos. Esperar e repetir resolve, então o cliente faz isso sozinho.
 */
const JWT_ISSUED_AT_FUTURE = /JWT issued at future/i;

export const JWT_RETRY_DELAYS_MS = [1000, 2000];

type Wait = (ms: number) => Promise<void>;

const defaultWait: Wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function isJwtIssuedAtFuture(response: Response): Promise<boolean> {
  if (response.status !== 401) return false;
  try {
    return JWT_ISSUED_AT_FUTURE.test(await response.clone().text());
  } catch {
    return false;
  }
}

export function createJwtRetryFetch(
  baseFetch: typeof fetch = (...args) => fetch(...args),
  delays: number[] = JWT_RETRY_DELAYS_MS,
  wait: Wait = defaultWait
): typeof fetch {
  return async (input, init) => {
    let response = await baseFetch(input, init);
    for (const delay of delays) {
      if (!(await isJwtIssuedAtFuture(response))) return response;
      await wait(delay);
      response = await baseFetch(input, init);
    }
    return response;
  };
}
