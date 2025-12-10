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
  } catch (error: any) {
    console.error('❌ Erro ao carregar ODAs do Supabase:', error);
    
    // Verificar se é erro de conexão
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('ERR_CONNECTION_REFUSED')) {
      console.error('⚠️ Servidor backend não está rodando!');
      console.error('📝 Para iniciar o servidor, execute em um terminal separado:');
      console.error('   cd server');
      console.error('   npm run dev');
      console.error('');
      console.error('Ou na raiz do projeto:');
      console.error('   npm run server:dev');
    }
    
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

