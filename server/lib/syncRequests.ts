/**
 * Fila de pedidos de sincronização sob demanda.
 *
 * Contas Google Workspace costumam proibir App da Web com acesso "qualquer pessoa",
 * então a API não consegue chamar o Apps Script. Aqui o fluxo é invertido: o painel
 * admin registra um pedido e o script da planilha, rodando por acionador de tempo,
 * pergunta se há pedido pendente e envia a planilha.
 */

import { randomUUID } from 'crypto';

export type SyncRequestStatus = 'pending' | 'running' | 'completed' | 'failed';

export type SyncRequest = {
  id: string;
  status: SyncRequestStatus;
  requestedAt: string;
  requestedBy: string | null;
  claimedAt: string | null;
  jobId: string | null;
  error: string | null;
};

/** Tempo máximo que um pedido espera pelo script antes de ser descartado. */
const REQUEST_TTL_MS = 60 * 60 * 1000;
/** Se o script pegou o pedido e não enviou nada, ele volta para a fila. */
const CLAIM_TIMEOUT_MS = 10 * 60 * 1000;

let currentRequest: SyncRequest | null = null;

function isExpired(request: SyncRequest): boolean {
  if (request.status !== 'pending' && request.status !== 'running') return false;
  return Date.now() - new Date(request.requestedAt).getTime() > REQUEST_TTL_MS;
}

function releaseStaleClaim(request: SyncRequest): void {
  if (request.status !== 'running' || request.jobId || !request.claimedAt) return;
  if (Date.now() - new Date(request.claimedAt).getTime() > CLAIM_TIMEOUT_MS) {
    request.status = 'pending';
    request.claimedAt = null;
  }
}

export function getSyncRequest(): SyncRequest | null {
  if (!currentRequest) return null;
  if (isExpired(currentRequest)) {
    currentRequest.status = 'failed';
    currentRequest.error = 'O script da planilha não respondeu no tempo esperado.';
    return currentRequest;
  }
  releaseStaleClaim(currentRequest);
  return currentRequest;
}

/** Registra um pedido; se já houver um aguardando, devolve o mesmo. */
export function requestSync(requestedBy?: string | null): SyncRequest {
  const existing = getSyncRequest();
  if (existing && (existing.status === 'pending' || existing.status === 'running')) {
    return existing;
  }

  currentRequest = {
    id: randomUUID(),
    status: 'pending',
    requestedAt: new Date().toISOString(),
    requestedBy: requestedBy || null,
    claimedAt: null,
    jobId: null,
    error: null,
  };
  return currentRequest;
}

/** O script assume o pedido pendente para enviar a planilha. */
export function claimSyncRequest(): SyncRequest | null {
  const request = getSyncRequest();
  if (!request || request.status !== 'pending') return null;
  request.status = 'running';
  request.claimedAt = new Date().toISOString();
  return request;
}

export function attachJobToSyncRequest(requestId: string, jobId: string): void {
  if (!currentRequest || currentRequest.id !== requestId) return;
  currentRequest.status = 'running';
  currentRequest.jobId = jobId;
}

export function finishSyncRequest(jobId: string, error?: string | null): void {
  if (!currentRequest || currentRequest.jobId !== jobId) return;
  currentRequest.status = error ? 'failed' : 'completed';
  currentRequest.error = error || null;
}
