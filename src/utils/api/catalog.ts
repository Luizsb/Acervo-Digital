import { isSupabaseBackend } from '../../config/backend';
import { supabaseFetchOdas, supabaseRecordOdaView } from '../supabaseApi';
import { API_BASE_URL, authHeaders, requestJson } from './http';
import type { ODA, ODAResponse, OdaViewKind, RecordOdaViewResponse } from './types';

export async function fetchAllODAs(): Promise<ODA[]> {
  if (isSupabaseBackend()) return supabaseFetchOdas();
  try {
    const response = await fetch(`${API_BASE_URL}/odas`, { headers: authHeaders() });
    if (!response.ok) {
      if (response.status === 401) throw new Error('Não autorizado.');
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: ODAResponse = await response.json();
    return data.data;
  } catch (error) {
    if (error instanceof TypeError) {
      const connectionError = new Error(
        `Não foi possível conectar ao servidor backend em ${API_BASE_URL}. ` +
          `Certifique-se de que o servidor está rodando na porta 3001. ` +
          `Execute 'npm run server:dev' em um terminal separado.`,
      );
      connectionError.name = 'ConnectionError';
      throw connectionError;
    }
    throw error;
  }
}

export async function apiRecordOdaView(odaId: number, kind: OdaViewKind): Promise<RecordOdaViewResponse> {
  if (isSupabaseBackend()) return supabaseRecordOdaView(odaId, kind);
  return requestJson<RecordOdaViewResponse>(
    `/odas/${odaId}/view`,
    { method: 'POST', headers: authHeaders(true), body: JSON.stringify({ kind }) },
    'Erro ao registrar visualização.',
  );
}
