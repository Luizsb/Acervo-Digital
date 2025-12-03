import express from 'express';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

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
    volume: volume || null,
    segmento: segmento || null,
    marca: marca || null,
    tipoConteudo: 'OED' as const,
    escalaSamr: samr || null,
    tipoObjeto: tipoObjeto || null,
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

    // Processar cada linha
    for (let i = 0; i < jsonData.length; i++) {
      try {
        const row = jsonData[i] as any;
        const odaData = mapRowToODA(row, i);

        if (!odaData || !odaData.titulo) {
          errors.push(`Linha ${i + 1}: título vazio, pulando...`);
          continue;
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
  try {
    const count = await prisma.oDA.count();
    res.json({
      totalODAs: count,
      databaseExists: true,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

