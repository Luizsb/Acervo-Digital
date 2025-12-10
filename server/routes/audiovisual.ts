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

// Função para mapear linha da planilha para Audiovisual
function mapRowToAudiovisual(row: any): any {
  const codigo = findColumn(row, ['Código', 'Codigo', 'ID', 'Id']);
  const marca = findColumn(row, ['Marca', 'Selos', 'Selo', 'Editora']);
  const segmento = findColumn(row, ['Segmento', 'Segmentos']);
  const anoSerieModulo = findColumn(row, ['Ano/série/Módulo', 'Ano/série/Módulo', 'Ano/Série/Módulo', 'Ano/Série', 'Ano', 'Série', 'Módulo']);
  const volume = findColumn(row, ['Volume', 'Vol']);
  const componente = findColumn(row, ['Componente', 'Componente Curricular', 'Componente curricular', 'Matéria', 'Disciplina']);
  const capitulo = findColumn(row, ['Capítulo', 'Capitulo', 'Cap', 'Cap.']);
  const nomeCapitulo = findColumn(row, ['Nome do Capítulo', 'Nome do Capitulo', 'Nome Capítulo', 'Nome Capitulo', 'Nome do Cap']);
  const categoriaVideo = findColumn(row, ['Categoria de Vídeo', 'Categoria de Video', 'Categoria Vídeo', 'Categoria Video', 'Categoria do vídeo', 'Categoria']);
  const vestibular = findColumn(row, ['Vestibular']);
  const enunciado = findColumn(row, ['Enunciado', 'Questão', 'Questao']);
  const link = findColumn(row, ['Link', 'Link repositório', 'Link Repositório', 'URL', 'Url', 'Repositório', 'Repositorio']);

  // Gerar caminho da thumb baseado no código
  const getThumbPath = (codigo: string): string | null => {
    if (!codigo || codigo.trim() === '') {
      return null;
    }
    let normalizedCode = String(codigo).trim();
    normalizedCode = normalizedCode.replace(/\.(webp|jpg|jpeg|png)$/i, '');
    return `/thumbs/${normalizedCode}.webp`;
  };

  const thumbPath = codigo && codigo.trim() !== '' ? getThumbPath(codigo) : null;
  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
  const image = thumbPath || DEFAULT_IMAGE;

  // Usar nome do capítulo como título se não houver código
  const title = nomeCapitulo || codigo || 'Sem título';

  return {
    codigo: codigo || null,
    marca: marca || null,
    segmento: segmento || null,
    anoSerieModulo: anoSerieModulo || null,
    volume: volume || null,
    componente: componente || null,
    capitulo: capitulo || null,
    nomeCapitulo: nomeCapitulo || null,
    categoriaVideo: categoriaVideo || null,
    vestibular: vestibular || null,
    enunciado: enunciado || null,
    link: link || null,
    imagem: image,
  };
}

// GET /api/audiovisual - Listar todos os audiovisuais
router.get('/', async (req, res) => {
  try {
    const {
      search,
      marca,
      segmento,
      anoSerieModulo,
      volume,
      componente,
      categoriaVideo,
      vestibular,
      capitulo,
      limit,
      offset,
    } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { codigo: { contains: String(search), mode: 'insensitive' } },
        { nomeCapitulo: { contains: String(search), mode: 'insensitive' } },
        { enunciado: { contains: String(search), mode: 'insensitive' } },
        { componente: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (marca) where.marca = String(marca);
    if (segmento) where.segmento = String(segmento);
    if (anoSerieModulo) where.anoSerieModulo = String(anoSerieModulo);
    if (volume) where.volume = String(volume);
    if (componente) where.componente = String(componente);
    if (categoriaVideo) where.categoriaVideo = String(categoriaVideo);
    if (vestibular) where.vestibular = String(vestibular);
    if (capitulo) where.capitulo = String(capitulo);

    const take = limit ? parseInt(String(limit)) : undefined;
    const skip = offset ? parseInt(String(offset)) : undefined;

    const [data, total] = await Promise.all([
      prisma.audiovisual.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.audiovisual.count({ where }),
    ]);

    res.json({
      data,
      total,
      limit: take,
      offset: skip,
    });
  } catch (error: any) {
    console.error('Error fetching audiovisual:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/audiovisual/:id - Buscar por ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const audiovisual = await prisma.audiovisual.findUnique({
      where: { id },
    });

    if (!audiovisual) {
      return res.status(404).json({ error: 'Audiovisual não encontrado' });
    }

    res.json(audiovisual);
  } catch (error: any) {
    console.error('Error fetching audiovisual:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/audiovisual/migrate - Migrar planilha Excel
router.post('/migrate', async (req, res) => {
  try {
    const { clearExisting = false } = req.body;

    // Encontrar arquivo
    const possiblePaths = [
      path.join(process.cwd(), '..', 'public', 'ObjetosAudiovisual.xlsx'),
      path.join(process.cwd(), 'public', 'ObjetosAudiovisual.xlsx'),
      path.join(__dirname, '..', '..', 'public', 'ObjetosAudiovisual.xlsx'),
    ];

    let finalPath: string | null = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        finalPath = p;
        break;
      }
    }

    if (!finalPath) {
      return res.status(404).json({ error: 'Planilha ObjetosAudiovisual.xlsx não encontrada' });
    }

    console.log(`📊 Lendo planilha: ${finalPath}`);

    // Limpar dados existentes se solicitado
    if (clearExisting) {
      await prisma.audiovisual.deleteMany({});
      console.log('🗑️ Dados existentes removidos');
    }

    // Ler planilha
    const workbook = XLSX.readFile(finalPath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return res.json({
        success: false,
        imported: 0,
        total: 0,
        errors: ['Planilha vazia'],
      });
    }

    console.log(`📋 ${jsonData.length} linhas encontradas na planilha`);

    const errors: string[] = [];
    let imported = 0;

    // Processar cada linha
    for (let i = 0; i < jsonData.length; i++) {
      try {
        const row = jsonData[i] as any;
        const audiovisualData = mapRowToAudiovisual(row);

        if (!audiovisualData.codigo && !audiovisualData.nomeCapitulo) {
          errors.push(`Linha ${i + 1}: código e nome do capítulo vazios, pulando...`);
          continue;
        }

        // Verificar se já existe
        const existing = audiovisualData.codigo
          ? await prisma.audiovisual.findUnique({ where: { codigo: audiovisualData.codigo } })
          : await prisma.audiovisual.findFirst({ where: { nomeCapitulo: audiovisualData.nomeCapitulo } });

        if (existing) {
          // Atualizar existente
          await prisma.audiovisual.update({
            where: { id: existing.id },
            data: audiovisualData,
          });
        } else {
          // Criar novo
          await prisma.audiovisual.create({ data: audiovisualData });
        }

        imported++;

        if ((i + 1) % 50 === 0) {
          console.log(`✅ ${i + 1}/${jsonData.length} audiovisuais processados...`);
        }
      } catch (error: any) {
        const errorMsg = `Erro ao migrar linha ${i + 1}: ${error.message}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log(`✅ Migração concluída: ${imported} audiovisuais importados`);

    res.json({
      success: imported > 0,
      imported,
      total: jsonData.length,
      errors: errors.slice(0, 10),
    });
  } catch (error: any) {
    console.error('Error in migration:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/audiovisual/stats/count - Contar total
router.get('/stats/count', async (req, res) => {
  try {
    const count = await prisma.audiovisual.count();
    res.json({ count });
  } catch (error: any) {
    console.error('Error counting audiovisual:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

