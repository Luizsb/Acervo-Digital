/**
 * Gera a carga de demonstração em server/seed/catalogo-demo.json, a partir do banco do
 * server/.env: só os recursos visíveis na galeria e a BNCC. Não leva usuários, favoritos,
 * visualizações nem auditoria, e os contadores vão zerados.
 *
 * Uso: npm run db:exportar-demo
 */
import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma';
import { catalogVisibleWhere } from '../lib/catalogVisibility';
import { toDemoOda, withoutSourceFields, type DemoCatalog } from '../lib/demoCatalog';
import { demoCatalogFile } from '../lib/demoCatalogFile';

async function main() {
  const [odas, bncc] = await Promise.all([
    prisma.oDA.findMany({ where: { ativo: true, ...catalogVisibleWhere() }, orderBy: { id: 'asc' } }),
    prisma.bNCC.findMany({ orderBy: { codigo: 'asc' } }),
  ]);

  const catalog: DemoCatalog = {
    geradoEm: new Date().toISOString(),
    criterio: 'ativo = true, status do link Funcionando e link preenchido',
    bncc: bncc.map((row) => withoutSourceFields(row)),
    odas: odas.map((row) => toDemoOda(row)),
  };

  const file = demoCatalogFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(catalog, null, 1)}\n`);

  const sizeMb = fs.statSync(file).size / 1024 / 1024;
  console.log(`📦 Carga de demonstração em ${file} (${sizeMb.toFixed(1)} MB)`);
  console.log(`   recursos visíveis: ${odas.length}`);
  console.log(`   BNCC: ${bncc.length}`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
