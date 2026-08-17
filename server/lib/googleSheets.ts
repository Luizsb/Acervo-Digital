import fs from 'fs';
import path from 'path';
import { createSign } from 'crypto';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const DEFAULT_SHEET_ID = '1fAQaH8oG1UH8GMfN2xlqWULKVJ2EYvf3JGxYD2o00yk';

export type GoogleSheetsSource = {
  configured: boolean;
  sheetId: string | null;
  hasServiceAccount: boolean;
  sourceLabel: string;
};

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

/** Extrai o ID de uma URL do Sheets ou devolve o valor se já for o ID. */
export function extractGoogleSheetId(value?: string | null): string | null {
  const raw = (value || '').trim();
  if (!raw) return null;
  const fromUrl = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (fromUrl?.[1]) return fromUrl[1];
  if (/^[a-zA-Z0-9-_]{20,}$/.test(raw)) return raw;
  return null;
}

export function getGoogleSheetsSource(): GoogleSheetsSource {
  const sheetId =
    extractGoogleSheetId(process.env.GOOGLE_SHEETS_ID) ||
    extractGoogleSheetId(process.env.GOOGLE_SHEETS_URL) ||
    DEFAULT_SHEET_ID;
  const account = loadServiceAccount();
  return {
    configured: Boolean(sheetId),
    sheetId,
    hasServiceAccount: Boolean(account),
    sourceLabel: sheetId
      ? `Google Sheets (${sheetId.slice(0, 8)}…)`
      : 'Google Sheets não configurado',
  };
}

function loadServiceAccount(): ServiceAccount | null {
  const jsonPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (jsonPath && fs.existsSync(jsonPath)) {
    const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as ServiceAccount;
    if (parsed.client_email && parsed.private_key) return normalizeAccount(parsed);
  }

  const inlineJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_INLINE?.trim();
  if (inlineJson) {
    const parsed = JSON.parse(inlineJson) as ServiceAccount;
    if (parsed.client_email && parsed.private_key) return normalizeAccount(parsed);
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();
  if (email && privateKey) {
    return normalizeAccount({ client_email: email, private_key: privateKey });
  }

  return null;
}

function normalizeAccount(account: ServiceAccount): ServiceAccount {
  return {
    client_email: account.client_email,
    private_key: account.private_key.replace(/\\n/g, '\n'),
  };
}

function base64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getServiceAccountAccessToken(account: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(
    JSON.stringify({
      iss: account.client_email,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  );
  const unsigned = `${header}.${claim}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = base64url(signer.sign(account.private_key));
  const assertion = `${unsigned}.${signature}`;

  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = (await res.json()) as { access_token?: string; error?: string; error_description?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(
      data.error_description ||
        data.error ||
        'Falha ao autenticar a conta de serviço do Google.'
    );
  }
  return data.access_token;
}

async function fetchWorkbookBuffer(
  sheetId: string,
  accessToken?: string
): Promise<{ buffer: Buffer; via: 'public-export' | 'drive-export' | 'drive-media' }> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  // 1) Export nativo do Sheets (funciona com link público ou token).
  const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
  const exportRes = await fetch(exportUrl, { headers, redirect: 'follow' });
  if (exportRes.ok) {
    const buffer = Buffer.from(await exportRes.arrayBuffer());
    if (buffer.length > 1000) {
      return { buffer, via: accessToken ? 'drive-export' : 'public-export' };
    }
  }

  if (!accessToken) {
    if (exportRes.status === 401 || exportRes.status === 403) {
      throw new Error(
        'A planilha do Google está privada. Compartilhe como “Qualquer pessoa com o link — Leitor” ' +
          'ou configure uma conta de serviço (GOOGLE_SERVICE_ACCOUNT_*) e compartilhe a planilha com o e-mail dela.'
      );
    }
    throw new Error(`Não foi possível baixar a planilha do Google (HTTP ${exportRes.status}).`);
  }

  // 2) Drive API export (planilha nativa do Google).
  const driveExport =
    `https://www.googleapis.com/drive/v3/files/${sheetId}/export?mimeType=${encodeURIComponent(XLSX_MIME)}`;
  const driveExportRes = await fetch(driveExport, { headers });
  if (driveExportRes.ok) {
    const buffer = Buffer.from(await driveExportRes.arrayBuffer());
    if (buffer.length > 1000) return { buffer, via: 'drive-export' };
  }

  // 3) Download direto (arquivo .xlsx enviado ao Drive).
  const mediaUrl = `https://www.googleapis.com/drive/v3/files/${sheetId}?alt=media`;
  const mediaRes = await fetch(mediaUrl, { headers });
  if (mediaRes.ok) {
    const buffer = Buffer.from(await mediaRes.arrayBuffer());
    if (buffer.length > 1000) return { buffer, via: 'drive-media' };
  }

  const detail =
    (await driveExportRes.text().catch(() => '')) ||
    (await mediaRes.text().catch(() => '')) ||
    `HTTP ${exportRes.status}`;
  throw new Error(
    `Falha ao baixar a planilha do Google. Confira o ID e o compartilhamento com a conta de serviço. ${detail.slice(0, 240)}`
  );
}

/**
 * Baixa a planilha do Google Sheets e grava no caminho local do acervo (.xlsx).
 * Retorna o caminho gravado.
 */
export async function downloadGoogleSheetToWorkbook(targetPath: string): Promise<{
  filePath: string;
  sheetId: string;
  bytes: number;
  via: string;
}> {
  const source = getGoogleSheetsSource();
  if (!source.sheetId) {
    throw new Error('GOOGLE_SHEETS_ID (ou GOOGLE_SHEETS_URL) não configurado.');
  }

  const account = loadServiceAccount();
  const accessToken = account ? await getServiceAccountAccessToken(account) : undefined;
  const { buffer, via } = await fetchWorkbookBuffer(source.sheetId, accessToken);

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, buffer);

  return {
    filePath: targetPath,
    sheetId: source.sheetId,
    bytes: buffer.length,
    via,
  };
}
