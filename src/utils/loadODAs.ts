import { fetchAllODAs, apiODAToFrontend, getMigrationStatus, migrateExcel } from './api';
import { ODAFromExcel } from './importODAs';

/**
 * Carrega ODAs da API backend, migrando da planilha se necessário
 */
export async function loadODAsFromDatabase(): Promise<ODAFromExcel[]> {
  try {
    // Verificar status do banco
    const status = await getMigrationStatus();

    // Se não houver dados no banco, migrar da planilha
    if (status.totalODAs === 0) {
      console.log('📦 Banco de dados vazio. Iniciando migração da planilha...');
      
      try {
        const migrationResult = await migrateExcel(false);
        
        if (migrationResult.success) {
          console.log(`✅ Migração concluída: ${migrationResult.imported} ODAs importados`);
        } else {
          console.warn('⚠️ Migração falhou:', migrationResult.errors);
        }
      } catch (migrationError) {
        console.error('Erro na migração:', migrationError);
        // Continuar tentando carregar mesmo se a migração falhar
      }
    }

    // Carregar ODAs da API
    const odas = await fetchAllODAs();
    
    // Converter para formato do frontend
    return odas.map(apiODAToFrontend);
  } catch (error) {
    console.error('Erro ao carregar ODAs da API:', error);
    // Fallback: tentar carregar da planilha diretamente
    try {
      const { importODAsOnly } = await import('./importODAs');
      return await importODAsOnly();
    } catch (fallbackError) {
      console.error('Erro ao carregar da planilha também:', fallbackError);
      return [];
    }
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

