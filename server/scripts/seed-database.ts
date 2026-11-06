import bcrypt from 'bcrypt';
import type { Prisma } from '@prisma/client';
import BetterSqlite3 from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma';
import { importCategorizacao } from './import-categorizacao';
import { workbookPath } from '../lib/acervoPaths';
import { demoCatalogFile, readDemoCatalog } from '../lib/demoCatalogFile';

const DEMO_EMAIL = 'demo@acervo.local';
const DEMO_PASSWORD = 'demo1234';
const ADMIN_EMAIL = 'admin@acervo.local';
const ADMIN_PASSWORD = 'admin1234';

function findBnccDatabase(): string | null {
  const candidates = [
    path.join(process.cwd(), '..', 'public', 'bncc.db'),
    path.join(process.cwd(), 'public', 'bncc.db'),
    path.join(__dirname, '..', '..', 'public', 'bncc.db'),
    path.join(__dirname, '..', '..', '..', 'public', 'bncc.db'),
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
      role: 'user',
    },
    create: {
      email: DEMO_EMAIL,
      passwordHash,
      name: 'Usuário Demo',
      role: 'user',
    },
  });
  console.log(`Usuário demo disponível: ${DEMO_EMAIL}`);

  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      passwordHash: adminHash,
      name: 'Admin Demo',
      role: 'admin',
    },
    create: {
      email: ADMIN_EMAIL,
      passwordHash: adminHash,
      name: 'Admin Demo',
      role: 'admin',
    },
  });
  console.log(`Admin demo disponível: ${ADMIN_EMAIL}`);
}

/** Sem a planilha, carrega o catálogo de demonstração, mas só num banco sem recursos. */
async function seedDemoCatalog(): Promise<boolean> {
  const catalog = readDemoCatalog<Prisma.ODACreateManyInput, Prisma.BNCCCreateManyInput>();
  if (!catalog) return false;

  const existing = await prisma.oDA.count();
  if (existing > 0) {
    console.log(`Catálogo já carregado: ${existing} recursos. Carga de demonstração ignorada.`);
    return true;
  }

  const bncc = await prisma.bNCC.createMany({ data: catalog.bncc, skipDuplicates: true });
  const odas = await prisma.oDA.createMany({ data: catalog.odas, skipDuplicates: true });
  console.log(
    `Carga de demonstração (${catalog.geradoEm}): ${odas.count} recursos e ${bncc.count} BNCC novas.`
  );
  return true;
}

async function seedCatalog() {
  const planilha = workbookPath();
  if (fs.existsSync(planilha)) {
    console.log('Importando planilha de categorização...');
    await importCategorizacao();
    return;
  }
  if (await seedDemoCatalog()) return;
  console.warn(
    `⚠️  Planilha não encontrada em ${planilha} nem carga de demonstração em ${demoCatalogFile()}.\n` +
      '   Catálogo não importado. Salve a planilha oficial e rode npm run import:categorizacao.'
  );
}

async function main() {
  const usersOnly = process.argv.includes('--users-only');
  try {
    console.log('Iniciando seed local...');
    if (!usersOnly) {
      await seedBncc();
    }
    await seedDemoUser();
    if (!usersOnly) {
      await seedCatalog();
    }
    console.log('Seed local concluído.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Falha no seed local:', error);
  process.exit(1);
});
