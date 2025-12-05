import { fetchAllODAs, apiODAToFrontend } from './api';
import { ODAFromExcel } from './importODAs';

/**
 * Carrega ODAs da API backend, migrando da planilha se necessário
 */
export async function loadODAsFromDatabase(): Promise<ODAFromExcel[]> {
  try {
    // Carregar ODAs diretamente da API (dados já estão no Supabase)
    console.log('🔄 loadODAsFromDatabase: Carregando ODAs do Supabase...');
    const odas = await fetchAllODAs();
    console.log(`✅ loadODAsFromDatabase: ${odas.length} ODAs carregados do Supabase`);
    
    // Converter para formato do frontend
    const converted = odas.map(apiODAToFrontend);
    console.log(`✅ loadODAsFromDatabase: ${converted.length} ODAs convertidos para frontend`);
    return converted;
  } catch (error) {
    console.error('❌ Erro ao carregar ODAs do Supabase:', error);
    // Retornar array vazio se houver erro (não tentar planilha)
    return [];
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
    return odas.map(apiODAToFrontend);
  } catch (error) {
    console.error('Erro ao carregar ODAs por tipo:', error);
    return [];
  }
}

