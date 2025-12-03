import express from 'express';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import path from 'path';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/bncc/:codigo - Buscar habilidade BNCC por código
router.get('/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const bncc = await (prisma as any).bNCC.findUnique({
      where: { codigo },
    });

    if (!bncc) {
      return res.status(404).json({ error: 'Habilidade BNCC não encontrada' });
    }

    res.json(bncc);
  } catch (error: any) {
    console.error('Error fetching BNCC:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/bncc - Listar todas as habilidades BNCC
router.get('/', async (req, res) => {
  try {
    const { search, componente, ano, limit, offset } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { codigo: { contains: search as string, mode: 'insensitive' } },
        { habilidade: { contains: search as string, mode: 'insensitive' } },
        { descricao: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (componente) {
      where.componente = componente as string;
    }

    if (ano) {
      where.ano = ano as string;
    }

    const bnccs = await (prisma as any).bNCC.findMany({
      where,
      orderBy: { codigo: 'asc' },
      take: limit ? parseInt(limit as string) : undefined,
      skip: offset ? parseInt(offset as string) : undefined,
    });

    const total = await (prisma as any).bNCC.count({ where });

    res.json({
      data: bnccs,
      total,
      limit: limit ? parseInt(limit as string) : null,
      offset: offset ? parseInt(offset as string) : null,
    });
  } catch (error: any) {
    console.error('Error fetching BNCCs:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/bncc/migrate - Migrar dados do banco bncc.db
router.post('/migrate', async (req, res) => {
  try {
    const { clearExisting = false } = req.body;

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
      return res.status(404).json({
        error: 'Banco BNCC não encontrado',
        triedPaths: possiblePaths,
      });
    }

    // Limpar dados existentes se solicitado
    if (clearExisting) {
      await (prisma as any).bNCC.deleteMany({});
      console.log('🗑️ Dados BNCC existentes removidos');
    }

    // Ler banco SQLite usando better-sqlite3
    const BetterSqlite3 = require('better-sqlite3');
    const db = new BetterSqlite3(dbPath);
    db.pragma('journal_mode = WAL');

    // Tentar descobrir o nome da tabela
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    
    if (tables.length === 0) {
      db.close();
      return res.status(400).json({ error: 'Nenhuma tabela encontrada no banco BNCC' });
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
      return res.status(400).json({ error: 'Nenhum registro encontrado no banco BNCC' });
    }
    console.log(`📊 Iniciando migração de ${rows.length} habilidades BNCC...`);

    const errors: string[] = [];
    let imported = 0;

    // Mapear colunas para campos do Prisma
    // Assumindo estrutura comum: codigo, habilidade, descricao, componente, ano
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

    // Processar cada linha
    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];
        
        // better-sqlite3 retorna objetos, não arrays
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
          errors.push(`Linha ${i + 1}: código vazio, pulando...`);
          continue;
        }

        // Verificar se já existe
        const existing = await (prisma as any).bNCC.findUnique({ where: { codigo } });

        const bnccData: any = {
          codigo,
          habilidade,
          descricao,
          componente,
          ano,
        };

        if (existing) {
          // Atualizar existente
          await (prisma as any).bNCC.update({
            where: { codigo },
            data: bnccData,
          });
        } else {
          // Criar novo
          await (prisma as any).bNCC.create({ data: bnccData });
        }

        imported++;

        if ((i + 1) % 100 === 0) {
          console.log(`✅ ${i + 1}/${rows.length} habilidades BNCC processadas...`);
        }
      } catch (error: any) {
        const errorMsg = `Erro ao migrar linha ${i + 1}: ${error.message}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log(`✅ Migração BNCC concluída: ${imported} habilidades importadas`);

    res.json({
      success: imported > 0,
      imported,
      total: rows.length,
      errors: errors.slice(0, 10), // Limitar a 10 erros
    });
  } catch (error: any) {
    console.error('Error in BNCC migration:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

