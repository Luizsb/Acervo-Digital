import express from 'express';
import prisma from '../lib/prisma';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Função auxiliar para encontrar coluna
function findColumn(row: any, possibleNames: string[]): string {
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return String(row[name]).trim();
    }
  }
  return '';
}

// Função para mapear linha da planilha para ODA
function mapRowToODA(row: any, index: number): any {
  const title = findColumn(row, ['Título recurso', 'Titulo recurso', 'Título', 'Titulo', 'Nome']);
  const tag = findColumn(row, ['Componente curricular', 'Componente Curricular', 'Componente', 'Matéria', 'Disciplina']);
  const location = findColumn(row, ['Ano/Série', 'Ano/Série', 'Ano', 'Série']);
  const volume = findColumn(row, ['Volume', 'Vol']);
  const segmento = findColumn(row, ['Segmento', 'Segmentos']);
  const marca = findColumn(row, ['Selos', 'Selo', 'Marca', 'Editora']);
  const codigoODA = findColumn(row, ['Código', 'Codigo', 'ID', 'Id']);
  const tipoObjeto = findColumn(row, ['Tipo de Objeto Digital', 'Tipo de Objeto', 'Tipo Objeto', 'Tipo']);
  const samr = findColumn(row, ['Escala SAMR', 'SAMR', 'Escala', 'Samr']);
  const videoUrl = findColumn(row, ['Link', 'Link repositório', 'Link Repositório', 'Link do ODA', 'Link ODA', 'URL', 'Url', 'Repositório', 'Repositorio']);
  const status = findColumn(row, ['Status', 'Estado']);
  const descricao = findColumn(row, ['Descrição', 'Descricao', 'Descrição do recurso', 'Descricao do recurso', 'Descrição Recurso', 'Descricao Recurso']);
  const duracao = findColumn(row, ['Duração', 'Duracao', 'Duração (min)', 'Duracao (min)', 'Tempo', 'Tempo de duração']);
  const pagina = findColumn(row, ['Página', 'Pagina', 'Pág', 'Pag']);
  const categoriaVideo = findColumn(row, ['Categoria vídeo', 'Categoria video', 'Categoria Vídeo', 'Categoria Video', 'Categoria do vídeo']);
  const objetivosAprendizagem = findColumn(row, ['Objetivos de aprendizagem', 'Objetivos de Aprendizagem', 'Objetivos', 'Objetivo']);
  const recursosPedagogicos = findColumn(row, ['Recursos pedagógicos', 'Recursos pedagogicos', 'Recursos Pedagógicos', 'Recursos', 'Recurso pedagógico']);
  const requisitosTecnicos = findColumn(row, ['Requisitos técnicos', 'Requisitos tecnicos', 'Requisitos Técnicos', 'Requisitos', 'Requisito técnico']);
  const urlMetodologiaPdf = findColumn(row, ['URL Metodologia PDF', 'Url Metodologia PDF', 'Metodologia PDF', 'PDF Metodologia', 'Link Metodologia']);

  // Buscar BNCC
  const rowKeys = Object.keys(row);
  let bnccKey = rowKeys.find((key) => {
    const normalized = key.trim();
    return normalized === 'BNCC' || normalized === 'Bncc' || normalized === 'bncc';
  });

  if (!bnccKey) {
    bnccKey = rowKeys.find((key) => 
      key.trim().toLowerCase().includes('bncc')
    ) || '';
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

  // Gerar caminho da thumb
  const getThumbPath = (codigo: string): string | null => {
    if (!codigo || codigo.trim() === '') {
      return null;
    }
    let normalizedCode = String(codigo).trim();
    normalizedCode = normalizedCode.replace(/\.(webp|jpg|jpeg|png)$/i, '');
    return `/thumbs/${normalizedCode}.webp`;
  };

  const thumbPath = codigoODA && codigoODA.trim() !== '' ? getThumbPath(codigoODA) : null;
  const DEFAULT_ODA_IMAGE = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
  const image = thumbPath || DEFAULT_ODA_IMAGE;

  if (!title) return null;

  // Mapeamento de cores
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

  // Processar campos JSON (arrays)
  const processJsonArray = (value: string): string | null => {
    if (!value || value.trim() === '') return null;
    try {
      // Se já é um JSON válido, retornar como está
      JSON.parse(value);
      return value;
    } catch {
      // Se não é JSON, converter para array JSON
      const items = value.split(',').map(item => item.trim()).filter(item => item !== '');
      return items.length > 0 ? JSON.stringify(items) : null;
    }
  };

  return {
    codigoOda: codigoODA || null,
    titulo: title,
    componenteCurricular: tag || null,
    tags: tag ? JSON.stringify([tag]) : null,
    tagColor: getTagColor(tag),
    anoSerie: location || null,
    imagem: image,
    linkRepositorio: videoUrl || null,
    codigoBncc: bnccCode || null,
    categoria: tipoObjeto || null,
    duracao: duracao || null,
    volume: volume || null,
    segmento: segmento || null,
    pagina: pagina || null,
    marca: marca || null,
    tipoConteudo: 'OED' as const,
    categoriaVideo: categoriaVideo || null,
    escalaSamr: samr || null,
    tipoObjeto: tipoObjeto || null,
    descricao: descricao || null,
    objetivosAprendizagem: objetivosAprendizagem ? processJsonArray(objetivosAprendizagem) : null,
    recursosPedagogicos: recursosPedagogicos ? processJsonArray(recursosPedagogicos) : null,
    requisitosTecnicos: requisitosTecnicos || null,
    urlMetodologiaPdf: urlMetodologiaPdf || null,
    status: status || null,
  };
}

// POST /api/migration/excel - Migrar planilha Excel para banco
router.post('/excel', async (req, res) => {
  try {
    const { clearExisting = false } = req.body;

    // Caminho da planilha (tentar múltiplos caminhos)
    const possiblePaths = [
      path.join(process.cwd(), '..', 'public', 'ObjetosDigitais.xlsx'), // Do server para public
      path.join(process.cwd(), 'public', 'ObjetosDigitais.xlsx'), // Se public estiver em server
      path.join(__dirname, '..', '..', 'public', 'ObjetosDigitais.xlsx'), // Relativo ao arquivo
    ];
    
    let finalPath: string | null = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        finalPath = p;
        break;
      }
    }
    
    if (!finalPath) {
      return res.status(404).json({ 
        error: 'Planilha não encontrada',
        triedPaths: possiblePaths
      });
    }

    // Limpar dados existentes se solicitado
    if (clearExisting) {
      await prisma.oDA.deleteMany({});
      console.log('🗑️ Dados existentes removidos');
    }

    // Ler planilha
    const workbook = XLSX.readFile(finalPath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return res.status(400).json({ error: 'Planilha vazia' });
    }

    console.log(`📊 Iniciando migração de ${jsonData.length} registros...`);

    const errors: string[] = [];
    let imported = 0;

    // Buscar todos os códigos BNCC existentes para validação
    const existingBnccCodes = await (prisma as any).bNCC.findMany({
      select: { codigo: true }
    });
    const validBnccCodes = new Set(existingBnccCodes.map((b: any) => b.codigo));
    console.log(`📋 ${validBnccCodes.size} códigos BNCC válidos encontrados no banco`);

    // Processar cada linha
    for (let i = 0; i < jsonData.length; i++) {
      try {
        const row = jsonData[i] as any;
        const odaData = mapRowToODA(row, i);

        if (!odaData || !odaData.titulo) {
          errors.push(`Linha ${i + 1}: título vazio, pulando...`);
          continue;
        }

        // Validar código BNCC: se não existir na tabela BNCC, definir como null
        if (odaData.codigoBncc && !validBnccCodes.has(odaData.codigoBncc)) {
          console.warn(`⚠️ Linha ${i + 1}: Código BNCC "${odaData.codigoBncc}" não encontrado na tabela BNCC. Definindo como null.`);
          odaData.codigoBncc = null;
        }

        // Verificar se já existe
        const existing = odaData.codigoOda
          ? await prisma.oDA.findUnique({ where: { codigoOda: odaData.codigoOda } })
          : await prisma.oDA.findFirst({ where: { titulo: odaData.titulo } });

        if (existing) {
          // Atualizar existente
          await prisma.oDA.update({
            where: { id: existing.id },
            data: odaData,
          });
        } else {
          // Criar novo
          await prisma.oDA.create({ data: odaData });
        }

        imported++;

        if ((i + 1) % 50 === 0) {
          console.log(`✅ ${i + 1}/${jsonData.length} ODAs processados...`);
        }
      } catch (error: any) {
        const errorMsg = `Erro ao migrar linha ${i + 1}: ${error.message}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log(`✅ Migração concluída: ${imported} ODAs importados`);

    res.json({
      success: imported > 0,
      imported,
      total: jsonData.length,
      errors: errors.slice(0, 10), // Limitar a 10 erros
    });
  } catch (error: any) {
    console.error('Error in migration:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/migration/status - Verificar status da migração
router.get('/status', async (req, res) => {
  let count = 0;
  let bnccCount = 0;
  let hasError = false;
  let errorMessage = '';
  
  try {
    console.log('📊 Verificando status da migração...');
    
    // Tentar contar ODAs
    try {
      count = await prisma.oDA.count();
      console.log(`✅ ODAs count: ${count}`);
    } catch (odaError: any) {
      console.error('❌ Erro ao contar ODAs:', odaError.message);
      hasError = true;
      errorMessage += `ODAs: ${odaError.message}; `;
    }
    
    // Tentar contar BNCC
    try {
      bnccCount = await (prisma as any).bNCC.count();
      console.log(`✅ BNCC count: ${bnccCount}`);
    } catch (bnccError: any) {
      console.error('❌ Erro ao contar BNCC:', bnccError.message);
      hasError = true;
      errorMessage += `BNCC: ${bnccError.message}; `;
    }
    
    // Sempre retornar resposta, mesmo com erros parciais
    res.json({
      totalODAs: count,
      totalBNCC: bnccCount,
      databaseExists: !hasError,
      ...(hasError && { warning: errorMessage.trim() })
    });
  } catch (error: any) {
    console.error('❌ Erro crítico em /api/migration/status:', error);
    // Retornar resposta mesmo em caso de erro crítico
    res.status(200).json({ 
      totalODAs: count,
      totalBNCC: bnccCount,
      databaseExists: false,
      error: error.message || 'Erro ao verificar status'
    });
  }
});

// POST /api/migration/seed - Executar seed completo (BNCC + ODAs)
router.post('/seed', async (req, res) => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    let bnccImported = 0;
    let odasImported = 0;

    // 1. Migrar BNCC se necessário
    try {
      const bnccCount = await (prisma as any).bNCC.count();
      if (bnccCount === 0) {
        console.log('📊 Migrando BNCC...');
        const bnccResult = await migrateBNCCDirect();
        bnccImported = bnccResult.imported;
        console.log(`✅ ${bnccImported} habilidades BNCC importadas`);
      } else {
        console.log(`✅ ${bnccCount} habilidades BNCC já estão no banco`);
      }
    } catch (bnccError: any) {
      console.error('Erro ao migrar BNCC:', bnccError);
      // Continua mesmo se BNCC falhar
    }

    // 2. Migrar ODAs se necessário
    try {
      const odasCount = await prisma.oDA.count();
      if (odasCount === 0) {
        console.log('📊 Migrando ODAs...');
        const odasResult = await migrateODAsDirect();
        odasImported = odasResult.imported;
        console.log(`✅ ${odasImported} ODAs importados`);
      } else {
        console.log(`✅ ${odasCount} ODAs já estão no banco`);
      }
    } catch (odasError: any) {
      console.error('Erro ao migrar ODAs:', odasError);
      // Continua mesmo se ODAs falhar
    }

    const finalBnccCount = await (prisma as any).bNCC.count();
    const finalOdasCount = await prisma.oDA.count();

    res.json({
      success: true,
      message: 'Seed executado',
      bnccImported,
      odasImported,
      totalBNCC: finalBnccCount,
      totalODAs: finalOdasCount,
    });
  } catch (error: any) {
    console.error('Error in seed route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Função auxiliar para migrar BNCC diretamente
async function migrateBNCCDirect() {
  const BetterSqlite3 = require('better-sqlite3');
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
    throw new Error('Banco BNCC não encontrado');
  }

  const db = new BetterSqlite3(dbPath);
  db.pragma('journal_mode = WAL');

  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  if (tables.length === 0) {
    db.close();
    return { imported: 0 };
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
  return { imported };
}

// Função auxiliar para migrar ODAs diretamente
async function migrateODAsDirect() {
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
    throw new Error('Planilha Excel não encontrada');
  }

  const workbook = XLSX.readFile(finalPath);
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  if (jsonData.length === 0) {
    return { imported: 0 };
  }

  // Buscar códigos BNCC válidos
  const existingBnccCodes = await (prisma as any).bNCC.findMany({
    select: { codigo: true }
  });
  const validBnccCodes = new Set(existingBnccCodes.map((b: any) => b.codigo));

  const errors: string[] = [];
  let imported = 0;

  for (let i = 0; i < jsonData.length; i++) {
    try {
      const row = jsonData[i] as any;
      const odaData = mapRowToODA(row, i);

      if (!odaData || !odaData.titulo) {
        continue;
      }

      // Validar código BNCC
      if (odaData.codigoBncc && !validBnccCodes.has(odaData.codigoBncc)) {
        odaData.codigoBncc = null;
      }

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
      errors.push(`Linha ${i + 1}: ${error.message}`);
    }
  }

  return { imported, errors: errors.slice(0, 10) };
}

export default router;

