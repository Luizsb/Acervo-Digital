import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import odasRoutes from './routes/odas';
import migrationRoutes from './routes/migration';
import bnccRoutes from './routes/bncc';
import * as fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT) || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/odas', odasRoutes);
app.use('/api/migration', migrationRoutes);
app.use('/api/bncc', bnccRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Função auxiliar para migrar BNCC
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

// Função auxiliar para mapear linha da planilha para ODA
function mapRowToODA(row: any, index: number): any {
  const findColumn = (row: any, possibleNames: string[]): string => {
    for (const name of possibleNames) {
      if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
        return String(row[name]).trim();
      }
    }
    return '';
  };

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

// Função auxiliar para migrar ODAs
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

// Verificar e migrar dados automaticamente se necessário
async function checkAndSeedDatabase() {
  try {
    // Aguardar um pouco para garantir que o Prisma está conectado
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const bnccCount = await (prisma as any).bNCC.count();
    const odasCount = await prisma.oDA.count();
    
    if (bnccCount === 0 || odasCount === 0) {
      console.log('⚠️ Banco de dados vazio detectado. Executando seed automático...');
      
      let bnccImported = 0;
      let odasImported = 0;

      // 1. Migrar BNCC se necessário
      if (bnccCount === 0) {
        try {
          console.log('📊 Migrando BNCC...');
          const bnccResult = await migrateBNCCDirect();
          bnccImported = bnccResult.imported;
          console.log(`✅ ${bnccImported} habilidades BNCC importadas`);
        } catch (bnccError: any) {
          console.error('❌ Erro ao migrar BNCC:', bnccError.message);
          // Continua mesmo se BNCC falhar
        }
      } else {
        console.log(`✅ ${bnccCount} habilidades BNCC já estão no banco`);
      }

      // 2. Migrar ODAs se necessário
      if (odasCount === 0) {
        try {
          console.log('📊 Migrando ODAs...');
          const odasResult = await migrateODAsDirect();
          odasImported = odasResult.imported;
          console.log(`✅ ${odasImported} ODAs importados`);
        } catch (odasError: any) {
          console.error('❌ Erro ao migrar ODAs:', odasError.message);
          // Continua mesmo se ODAs falhar
        }
      } else {
        console.log(`✅ ${odasCount} ODAs já estão no banco`);
      }

      const finalBnccCount = await (prisma as any).bNCC.count();
      const finalOdasCount = await prisma.oDA.count();
      console.log(`✅ Seed automático concluído: ${finalBnccCount} BNCC e ${finalOdasCount} ODAs no banco`);
    } else {
      console.log(`✅ ${bnccCount} habilidades BNCC e ${odasCount} ODAs já estão no banco`);
    }
  } catch (error: any) {
    // Se o erro for de banco não encontrado, apenas avisar (não quebrar o servidor)
    if (error.code === 'P1001' || error.message?.includes('Unable to open')) {
      console.warn('⚠️ Banco de dados ainda não está disponível. Execute as migrations primeiro.');
      console.warn('📝 Execute: npx prisma migrate deploy');
    } else {
      console.warn('⚠️ Erro ao verificar dados:', error.message || error);
    }
  }
}

// Start server
console.log(`🔧 Starting server on port ${PORT}...`);
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Prisma connected to database`);
  console.log(`✅ Server is listening on port ${PORT}`);
  
  // Verificar dados em background (não bloquear o servidor)
  checkAndSeedDatabase().catch(console.error);
});

// Tratamento de erros do servidor
server.on('error', (error: any) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
});

// Garantir que o servidor está escutando
server.on('listening', () => {
  const addr = server.address();
  console.log(`✅ Server successfully bound to ${typeof addr === 'string' ? addr : `${addr?.address}:${addr?.port}`}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('HTTP server closed');
  });
});

export default app;

