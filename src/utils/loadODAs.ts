import { fetchAllODAs, apiODAToFrontend } from './api';
import { isVisibleInCatalog } from './catalogVisibility';
import type { ODAFromExcel } from '../types/project';

/**
 * Carrega ODAs da API backend.
 */
export async function loadODAsFromDatabase(): Promise<ODAFromExcel[]> {
  try {
    console.log('🔄 Carregando ODAs da API...');
    const odas = await fetchAllODAs();
    console.log(`✅ ${odas.length} ODAs carregados da API`);
    
    // Converter para formato do frontend
    const converted = odas
      .map(apiODAToFrontend)
      .filter((oda) => isVisibleInCatalog(oda.status, oda.videoUrl));
    console.log(`✅ loadODAsFromDatabase: ${converted.length} ODAs convertidos para frontend`);
    return converted;
  } catch (error: any) {
    console.error('❌ Erro ao carregar ODAs da API:', error);

    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('ERR_CONNECTION_REFUSED')) {
      console.error('⚠️ Servidor backend não está rodando!');
    }

    throw error;
  }
}

/**
 * Carrega ODAs da API por tipo de conteúdo
 */
export async function loadODAsByContentType(
  contentType: 'Audiovisual' | 'OED' | 'Todos'
): Promise<ODAFromExcel[]> {
  try {
    const odas = await fetchAllODAs({ tipoConteudo: contentType });
    return odas
      .map(apiODAToFrontend)
      .filter((oda) => isVisibleInCatalog(oda.status, oda.videoUrl));
  } catch (error) {
    console.error('Erro ao carregar ODAs por tipo:', error);
    return [];
  }
}

