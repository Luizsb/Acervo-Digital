import { fetchAllODAs, apiODAToFrontend, getMigrationStatus, migrateExcel } from './api';
import { ODAFromExcel } from './importODAs';

/**
 * Carrega ODAs da API backend, migrando da planilha se necessário
 */
export async function loadODAsFromDatabase(): Promise<ODAFromExcel[]> {
  try {
    console.log('🔄 loadODAsFromDatabase: Verificando status do banco...');
    // Verificar status do banco
    const status = await getMigrationStatus();
    console.log('📊 Status do banco:', status);

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
    console.log('🔄 loadODAsFromDatabase: Carregando ODAs da API...');
    const odas = await fetchAllODAs();
    console.log(`✅ loadODAsFromDatabase: ${odas.length} ODAs carregados da API`);
    
    // Converter para formato do frontend
    const converted = odas.map(apiODAToFrontend);
    console.log(`✅ loadODAsFromDatabase: ${converted.length} ODAs convertidos para frontend`);
    return converted;
  } catch (error) {
    console.error('❌ Erro ao carregar ODAs da API:', error);
    // Fallback: tentar carregar da planilha diretamente
    try {
      console.log('🔄 Tentando fallback: carregar da planilha...');
      const { importODAsOnly } = await import('./importODAs');
      const fallbackODAs = await importODAsOnly();
      console.log(`✅ Fallback: ${fallbackODAs.length} ODAs carregados da planilha`);
      return fallbackODAs;
    } catch (fallbackError) {
      console.error('❌ Erro ao carregar da planilha também:', fallbackError);
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

