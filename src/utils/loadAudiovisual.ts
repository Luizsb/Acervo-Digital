import { fetchAllAudiovisual, audiovisualToFrontend } from './api';
import { ODAFromExcel } from './importODAs';

/**
 * Carrega Audiovisuais da API backend
 */
export async function loadAudiovisualFromDatabase(): Promise<ODAFromExcel[]> {
  try {
    console.log('🔄 loadAudiovisualFromDatabase: Carregando Audiovisuais do Supabase...');
    const audiovisual = await fetchAllAudiovisual();
    console.log(`✅ loadAudiovisualFromDatabase: ${audiovisual.length} Audiovisuais carregados do Supabase`);
    
    // Converter para formato do frontend
    const converted = audiovisual.map(audiovisualToFrontend);
    console.log(`✅ loadAudiovisualFromDatabase: ${converted.length} Audiovisuais convertidos para frontend`);
    return converted;
  } catch (error: any) {
    console.error('❌ Erro ao carregar Audiovisuais do Supabase:', error);
    
    // Verificar se é erro de conexão
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('ERR_CONNECTION_REFUSED')) {
      console.error('⚠️ Servidor backend não está rodando!');
      console.error('📝 Para iniciar o servidor, execute em um terminal separado:');
      console.error('   cd server');
      console.error('   npm run dev');
    }
    
    // Retornar array vazio se houver erro
    return [];
  }
}

