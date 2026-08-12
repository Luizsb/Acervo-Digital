import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import BetterSqlite3 from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const DEMO_EMAIL = 'demo@acervo.local';
const DEMO_PASSWORD = 'demo1234';

function findBnccDatabase(): string | null {
  const candidates = [
    path.join(process.cwd(), '..', 'public', 'bncc.db'),
    path.join(process.cwd(), 'public', 'bncc.db'),
    path.join(__dirname, '..', '..', 'public', 'bncc.db'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

async function seedBncc() {
  const existingCount = await prisma.bNCC.count();
  if (existingCount > 0) {
    console.log(`BNCC já carregada: ${existingCount} registros.`);
    return;
  }

  const databasePath = findBnccDatabase();
  if (!databasePath) {
    console.warn('public/bncc.db não encontrado; importação BNCC ignorada.');
    return;
  }

  const database = new BetterSqlite3(databasePath, { readonly: true });
  try {
    const table = database
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name LIMIT 1"
      )
      .get() as { name?: string } | undefined;
    if (!table?.name) {
      console.warn('Nenhuma tabela encontrada em public/bncc.db.');
      return;
    }

    const escapedTableName = table.name.replace(/"/g, '""');
    const columns = database
      .prepare(`PRAGMA table_info("${escapedTableName}")`)
      .all() as Array<{ name: string }>;
    const rows = database
      .prepare(`SELECT * FROM "${escapedTableName}"`)
      .all() as Array<Record<string, unknown>>;
    const columnNames = columns.map((column) => column.name);

    const column = (...patterns: string[]) =>
      columnNames.find((name) =>
        patterns.some((pattern) => name.toLowerCase().includes(pattern))
      );
    const codigoColumn = column('codigo', 'code');
    const habilidadeColumn = column('habilidade', 'skill');
    const descricaoColumn = column('descricao', 'description', 'desc');
    const componenteColumn = column('componente', 'component');
    const anoColumn = column('ano', 'year', 'serie');

    if (!codigoColumn) {
      throw new Error('Coluna de código não encontrada em public/bncc.db.');
    }

    let imported = 0;
    for (const row of rows) {
      const text = (columnName?: string) => {
        if (!columnName) return null;
        const value = String(row[columnName] ?? '').trim();
        return value || null;
      };
      const codigo = text(codigoColumn);
      if (!codigo) continue;

      const data = {
        codigo,
        habilidade: text(habilidadeColumn),
        descricao: text(descricaoColumn),
        componente: text(componenteColumn),
        ano: text(anoColumn),
      };
      await prisma.bNCC.upsert({
        where: { codigo },
        update: data,
        create: data,
      });
      imported += 1;
    }

    console.log(`BNCC importada: ${imported} registros.`);
  } finally {
    database.close();
  }
}

async function seedDemoUser() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      passwordHash,
      name: 'Usuário Demo',
      role: 'admin',
    },
    create: {
      email: DEMO_EMAIL,
      passwordHash,
      name: 'Usuário Demo',
      role: 'admin',
    },
  });
  console.log(`Usuário demo disponível: ${DEMO_EMAIL}`);
}

async function main() {
  try {
    console.log('Iniciando seed local...');
    await seedBncc();
    await seedDemoUser();
    console.log('Seed local concluído.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Falha no seed local:', error);
  process.exit(1);
});
