import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import path from 'path';
import BetterSqlite3 from 'better-sqlite3';

const prisma = new PrismaClient();

async function migrateBNCC() {
  try {
    console.log('🔍 Verificando se há dados BNCC no banco...');
    
    // Verificar se já existem dados BNCC
    const existingCount = await (prisma as any).bNCC.count();
    if (existingCount > 0) {
      console.log(`✅ Já existem ${existingCount} habilidades BNCC no banco. Pulando migração.`);
      return;
    }

    console.log('📊 Nenhum dado BNCC encontrado. Iniciando migração...');

    // Caminhos possíveis para o banco BNCC
    const possiblePaths = [
      path.join(process.cwd(), '..', 'public', 'bncc.db'),
      path.join(process.cwd(), 'public', 'bncc.db'),
      path.join(__dirname, '..', '..', 'public', 'bncc.db'),
    ];

    let dbPath: string | null = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        dbPath = p;
        break;
      }
    }

    if (!dbPath) {
      console.warn('⚠️ Banco BNCC não encontrado. Caminhos tentados:', possiblePaths);
      console.warn('⚠️ Execute a migração manualmente via API: POST /api/bncc/migrate');
      return;
    }

    console.log(`📂 Banco BNCC encontrado em: ${dbPath}`);

    // Ler banco SQLite
    const db = new BetterSqlite3(dbPath);
    db.pragma('journal_mode = WAL');

    // Descobrir o nome da tabela
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    
    if (tables.length === 0) {
      db.close();
      console.error('❌ Nenhuma tabela encontrada no banco BNCC');
      return;
    }

    const tableName = (tables[0] as any).name;
    console.log(`📊 Tabela encontrada: ${tableName}`);

    // Obter estrutura da tabela
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    const columnNames = columns.map((col: any) => col.name);
    console.log(`📋 Colunas: ${columnNames.join(', ')}`);

    // Buscar todos os registros
    const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
    
    if (rows.length === 0) {
      db.close();
      console.error('❌ Nenhum registro encontrado no banco BNCC');
      return;
    }

    console.log(`📊 Iniciando migração de ${rows.length} habilidades BNCC...`);

    // Mapear colunas
    const codigoIndex = columnNames.findIndex((col: string) => 
      col.toLowerCase().includes('codigo') || col.toLowerCase().includes('code')
    );
    const habilidadeIndex = columnNames.findIndex((col: string) => 
      col.toLowerCase().includes('habilidade') || col.toLowerCase().includes('skill')
    );
    const descricaoIndex = columnNames.findIndex((col: string) => 
      col.toLowerCase().includes('descricao') || col.toLowerCase().includes('description') || col.toLowerCase().includes('desc')
    );
    const componenteIndex = columnNames.findIndex((col: string) => 
      col.toLowerCase().includes('componente') || col.toLowerCase().includes('component')
    );
    const anoIndex = columnNames.findIndex((col: string) => 
      col.toLowerCase().includes('ano') || col.toLowerCase().includes('year') || col.toLowerCase().includes('serie')
    );

    let imported = 0;
    const errors: string[] = [];

    // Processar cada linha
    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];
        
        const getValue = (index: number): string => {
          const key = columnNames[index];
          return key ? String((row as any)[key] || '').trim() : '';
        };
        
        const codigo = codigoIndex >= 0 ? getValue(codigoIndex) : '';
        const habilidade = habilidadeIndex >= 0 ? getValue(habilidadeIndex) || null : null;
        const descricao = descricaoIndex >= 0 ? getValue(descricaoIndex) || null : null;
        const componente = componenteIndex >= 0 ? getValue(componenteIndex) || null : null;
        const ano = anoIndex >= 0 ? getValue(anoIndex) || null : null;

        if (!codigo) {
          continue;
        }

        const bnccData: any = {
          codigo,
          habilidade,
          descricao,
          componente,
          ano,
        };

        await (prisma as any).bNCC.upsert({
          where: { codigo },
          update: bnccData,
          create: bnccData,
        });

        imported++;

        if ((i + 1) % 100 === 0) {
          console.log(`✅ ${i + 1}/${rows.length} habilidades BNCC processadas...`);
        }
      } catch (error: any) {
        errors.push(`Linha ${i + 1}: ${error.message}`);
      }
    }

    db.close();

    console.log(`✅ Migração BNCC concluída: ${imported} habilidades importadas`);
    if (errors.length > 0) {
      console.warn(`⚠️ ${errors.length} erros durante a migração`);
    }
  } catch (error: any) {
    console.error('❌ Erro na migração BNCC:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração
migrateBNCC()
  .then(() => {
    console.log('✅ Script de migração BNCC finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });

