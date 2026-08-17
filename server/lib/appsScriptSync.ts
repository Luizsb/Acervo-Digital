/**
 * Dispara, sob demanda, o App da Web do Google Apps Script que exporta a planilha
 * e a envia para /api/sync/spreadsheet.
 *
 * Esse caminho é o único que funciona com planilha privada: o script roda com a
 * conta do dono da planilha, sem exigir link público nem conta de serviço.
 */

export type AppsScriptSource = {
  configured: boolean;
  label: string;
};

const TRIGGER_TIMEOUT_MS = 180_000;

function configuredUrl(): string {
  return (process.env.APPS_SCRIPT_SYNC_URL || '').trim();
}

function configuredSecret(): string {
  return (process.env.APPS_SCRIPT_SYNC_SECRET || '').trim();
}

export function getAppsScriptSource(): AppsScriptSource {
  const url = configuredUrl();
  return {
    configured: Boolean(url),
    label: url ? 'Apps Script (planilha privada)' : 'Apps Script não configurado',
  };
}

function buildTriggerUrl(): string {
  const url = new URL(configuredUrl());
  const secret = configuredSecret();
  if (secret) url.searchParams.set('token', secret);
  url.searchParams.set('mode', 'start');
  return url.toString();
}

/**
 * Chama o App da Web e devolve o jobId criado pelo webhook.
 * O script responde assim que a API aceita o arquivo, sem esperar a importação.
 */
export async function triggerAppsScriptSync(): Promise<{ jobId: string | null; via: string }> {
  if (!configuredUrl()) {
    throw new Error('Configure APPS_SCRIPT_SYNC_URL no .env da API.');
  }

  let response: Response;
  try {
    response = await fetch(buildTriggerUrl(), {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(TRIGGER_TIMEOUT_MS),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Não foi possível acionar o Apps Script: ${detail}`);
  }

  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      `Apps Script respondeu HTTP ${response.status}. Confirme a implantação como App da Web com acesso "Qualquer pessoa".`
    );
  }

  let payload: { ok?: boolean; jobId?: string; error?: string };
  try {
    payload = JSON.parse(body);
  } catch {
    // Resposta HTML normalmente significa tela de login: implantação sem acesso público.
    throw new Error(
      'O Apps Script não retornou JSON. Reimplante o App da Web com "Executar como: eu" e "Quem pode acessar: qualquer pessoa".'
    );
  }

  if (!payload.ok) {
    throw new Error(payload.error || 'O Apps Script não conseguiu enviar a planilha.');
  }

  return { jobId: payload.jobId || null, via: 'apps-script' };
}
