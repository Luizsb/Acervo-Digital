import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import path from 'path';
import BetterSqlite3 from 'better-sqlite3';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // 1. Verificar e migrar BNCC
    const bnccCount = await (prisma as any).bNCC.count();
    if (bnccCount === 0) {
      console.log('📊 Nenhum dado BNCC encontrado. Migrando BNCC...');
      await migrateBNCC();
    } else {
      console.log(`✅ ${bnccCount} habilidades BNCC já estão no banco`);
    }

    // 2. Verificar e migrar ODAs
    const odasCount = await prisma.oDA.count();
    if (odasCount === 0) {
      console.log('📊 Nenhum ODA encontrado. Migrando ODAs...');
      await migrateODAs();
    } else {
      console.log(`✅ ${odasCount} ODAs já estão no banco`);
    }

    console.log('✅ Seed do banco de dados concluído!');
  } catch (error: any) {
    console.error('❌ Erro no seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function migrateBNCC() {
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'bncc.db'),
    path.join(process.cwd(), '..', 'public', 'bncc.db'),
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
    console.warn('⚠️ Banco BNCC não encontrado. Pulando migração BNCC.');
    return;
  }

  const db = new BetterSqlite3(dbPath);
  db.pragma('journal_mode = WAL');

  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  if (tables.length === 0) {
    db.close();
    return;
  }

  const tableName = (tables[0] as any).name;
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const columnNames = columns.map((col: any) => col.name);

  const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
  
  const codigoIndex = columnNames.findIndex((col: string) => 
    col.toLowerCase().includes('codigo') || col.toLowerCase().includes('code')
  );
  const habilidadeIndex = columnNames.findIndex((col: string) => 
    col.toLowerCase().includes('habilidade') || col.toLowerCase().includes('skill')
  );
  const descricaoIndex = columnNames.findIndex((col: string) => 
    col.toLowerCase().includes('descricao') || col.toLowerCase().includes('description')
  );
  const componenteIndex = columnNames.findIndex((col: string) => 
    col.toLowerCase().includes('componente') || col.toLowerCase().includes('component')
  );
  const anoIndex = columnNames.findIndex((col: string) => 
    col.toLowerCase().includes('ano') || col.toLowerCase().includes('year')
  );

  let imported = 0;
  for (let i = 0; i < rows.length; i++) {
    try {
      const row = rows[i];
      const getValue = (index: number): string => {
        const key = columnNames[index];
        return key ? String((row as any)[key] || '').trim() : '';
      };
      
      const codigo = codigoIndex >= 0 ? getValue(codigoIndex) : '';
      if (!codigo) continue;

      const bnccData: any = {
        codigo,
        habilidade: habilidadeIndex >= 0 ? getValue(habilidadeIndex) || null : null,
        descricao: descricaoIndex >= 0 ? getValue(descricaoIndex) || null : null,
        componente: componenteIndex >= 0 ? getValue(componenteIndex) || null : null,
        ano: anoIndex >= 0 ? getValue(anoIndex) || null : null,
      };

      await (prisma as any).bNCC.upsert({
        where: { codigo },
        update: bnccData,
        create: bnccData,
      });

      imported++;
    } catch (error: any) {
      console.error(`Erro ao migrar BNCC linha ${i + 1}:`, error.message);
    }
  }

  db.close();
  console.log(`✅ ${imported} habilidades BNCC importadas`);
}

async function migrateODAs() {
  const possiblePaths = [
    path.join(process.cwd(), '..', 'public', 'ObjetosDigitais.xlsx'),
    path.join(process.cwd(), 'public', 'ObjetosDigitais.xlsx'),
    path.join(__dirname, '..', '..', 'public', 'ObjetosDigitais.xlsx'),
  ];

  let finalPath: string | null = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      finalPath = p;
      break;
    }
  }

  if (!finalPath) {
    console.warn('⚠️ Planilha Excel não encontrada. Pulando migração ODAs.');
    return;
  }

  const workbook = XLSX.readFile(finalPath);
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  if (jsonData.length === 0) {
    return;
  }

  // Buscar códigos BNCC válidos
  const existingBnccCodes = await (prisma as any).bNCC.findMany({
    select: { codigo: true }
  });
  const validBnccCodes = new Set(existingBnccCodes.map((b: any) => b.codigo));

  const findColumn = (row: any, possibleNames: string[]): string => {
    for (const name of possibleNames) {
      if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
        return String(row[name]).trim();
      }
    }
    return '';
  };

  const getTagColor = (tag: string): string => {
    const colors: Record<string, string> = {
      'Língua Portuguesa': 'bg-blue-600',
      'Matemática': 'bg-yellow-600',
      'Ciências': 'bg-green-600',
      'História': 'bg-purple-600',
      'Geografia': 'bg-amber-600',
      'Arte': 'bg-pink-600',
      'Inglês': 'bg-indigo-600',
      'Educação Física': 'bg-lime-600',
    };
    return colors[tag] || 'bg-gray-600';
  };

  let imported = 0;
  for (let i = 0; i < jsonData.length; i++) {
    try {
      const row = jsonData[i] as any;
      const title = findColumn(row, ['Título recurso', 'Titulo recurso', 'Título', 'Titulo', 'Nome']);
      if (!title) continue;

      const rowKeys = Object.keys(row);
      let bnccKey = rowKeys.find((key) => {
        const normalized = key.trim();
        return normalized === 'BNCC' || normalized === 'Bncc' || normalized === 'bncc';
      });
      if (!bnccKey) {
        bnccKey = rowKeys.find((key) => key.trim().toLowerCase().includes('bncc')) || '';
      }

      let bnccCode = '';
      if (bnccKey) {
        const value = row[bnccKey];
        if (value !== null && value !== undefined && value !== '') {
          bnccCode = String(value).trim();
          if (bnccCode === '' || bnccCode === 'undefined' || bnccCode === 'null') {
            bnccCode = '';
          }
        }
      }

      // Validar código BNCC
      if (bnccCode && !validBnccCodes.has(bnccCode)) {
        bnccCode = '';
      }

      const codigoODA = findColumn(row, ['Código', 'Codigo', 'ID', 'Id']);
      const getThumbPath = (codigo: string): string | null => {
        if (!codigo || codigo.trim() === '') return null;
        let normalizedCode = String(codigo).trim();
        normalizedCode = normalizedCode.replace(/\.(webp|jpg|jpeg|png)$/i, '');
        return `/thumbs/${normalizedCode}.webp`;
      };

      const thumbPath = codigoODA ? getThumbPath(codigoODA) : null;
      const DEFAULT_ODA_IMAGE = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
      const image = thumbPath || DEFAULT_ODA_IMAGE;

      const tag = findColumn(row, ['Componente curricular', 'Componente Curricular', 'Componente', 'Matéria', 'Disciplina']);
      const location = findColumn(row, ['Ano/Série', 'Ano/Série', 'Ano', 'Série']);
      const videoUrl = findColumn(row, ['Link', 'Link repositório', 'Link Repositório', 'Link do ODA', 'Link ODA', 'URL', 'Url']);

      const odaData: any = {
        codigoOda: codigoODA || null,
        titulo: title,
        componenteCurricular: tag || null,
        tags: tag ? JSON.stringify([tag]) : null,
        tagColor: getTagColor(tag),
        anoSerie: location || null,
        imagem: image,
        linkRepositorio: videoUrl || null,
        codigoBncc: bnccCode || null,
        tipoConteudo: 'OED' as const,
      };

      const existing = odaData.codigoOda
        ? await prisma.oDA.findUnique({ where: { codigoOda: odaData.codigoOda } })
        : await prisma.oDA.findFirst({ where: { titulo: odaData.titulo } });

      if (existing) {
        await prisma.oDA.update({
          where: { id: existing.id },
          data: odaData,
        });
      } else {
        await prisma.oDA.create({ data: odaData });
      }

      imported++;
    } catch (error: any) {
      console.error(`Erro ao migrar ODA linha ${i + 1}:`, error.message);
    }
  }

  console.log(`✅ ${imported} ODAs importados`);
}

// Executar seed
seedDatabase()
  .then(() => {
    console.log('✅ Script de seed finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });

