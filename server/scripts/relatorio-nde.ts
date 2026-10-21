/**
 * Gera a planilha de pendências para o NDE: o que está cadastrado fora da galeria
 * (quebrado, incorreto, sem link...) e os problemas da planilha da última importação
 * (sem código, código repetido), com o que fazer em cada um.
 *
 * Não tem dado pessoal: só código, título, status e link dos recursos.
 * Grava em data/relatorio-nde-AAAAMMDD.xlsx.
 *
 * Uso: npm run relatorio:nde
 */
import path from 'path';
import ExcelJS from 'exceljs';
import prisma from '../lib/prisma';
import { workbookDir } from '../lib/acervoPaths';
import { catalogReviewWhere, reviewGroupFor, type ReviewGroup } from '../lib/catalogVisibility';
import { buildNdeReportRows, countByProblem, type NdeReportItem } from '../lib/ndeReport';

const COLUMNS: { header: string; key: string; width: number }[] = [
  { header: 'Problema', key: 'problema', width: 18 },
  { header: 'O que fazer', key: 'oQueFazer', width: 60 },
  { header: 'Linha na planilha', key: 'linha', width: 12 },
  { header: 'Código do recurso', key: 'codigo', width: 30 },
  { header: 'Título', key: 'titulo', width: 50 },
  { header: 'Status atual', key: 'statusAtual', width: 16 },
  { header: 'Link do recurso', key: 'link', width: 50 },
  { header: 'Observação', key: 'observacao', width: 36 },
];

async function loadItems(): Promise<{ items: NdeReportItem[]; importedAt: Date | null }> {
  const odas = await prisma.oDA.findMany({
    where: catalogReviewWhere(),
    select: { codigoOda: true, titulo: true, status: true, linkRepositorio: true },
  });
  const issues = await prisma.importIssue.findMany();
  const items: NdeReportItem[] = [
    ...odas.map((oda) => ({
      group: reviewGroupFor(oda),
      codigo: oda.codigoOda,
      titulo: oda.titulo,
      status: oda.status,
      linkRepositorio: oda.linkRepositorio,
      linha: null,
      vigente: null,
    })),
    ...issues.map((issue) => ({
      group: issue.kind as ReviewGroup,
      codigo: issue.codigo,
      titulo: issue.titulo || `Linha ${issue.linha} sem título`,
      status: issue.status,
      linkRepositorio: issue.linkRepositorio,
      linha: issue.linha,
      vigente: issue.vigente,
    })),
  ];
  return { items, importedAt: issues[0]?.syncedAt ?? null };
}

function styleHeader(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF012451' } };
  row.alignment = { vertical: 'middle', wrapText: true };
}

async function main() {
  const { items, importedAt } = await loadItems();
  const rows = buildNdeReportRows(items);
  const counts = countByProblem(rows);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Acervo Digital';

  const readme = workbook.addWorksheet('Leia-me');
  readme.columns = [
    { key: 'a', width: 34 },
    { key: 'b', width: 90 },
  ];
  const generatedAt = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const imported = importedAt
    ? importedAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    : 'sem registro';
  const intro: [string, string][] = [
    ['Pendências do Acervo Digital para o NDE', ''],
    ['Gerado em', generatedAt],
    ['Planilha importada em', imported],
    ['Total de pendências', String(rows.length)],
    ['', ''],
    ['Como usar', 'Corrija na planilha oficial do Drive. Os itens saem desta lista na próxima importação.'],
    ['Sem código / Código repetido', 'Problemas da planilha: use a coluna "Linha na planilha" para achar a linha.'],
    ['Demais problemas', 'Recurso cadastrado mas fora da vitrine: procure pelo "Código do recurso".'],
    ['O que entra na vitrine', 'Status do link "Funcionando", link preenchido e código do recurso preenchido.'],
    ['', ''],
    ['Problema', 'Quantidade'],
    ...counts.map(({ problema, total }): [string, string] => [problema, String(total)]),
  ];
  intro.forEach(([a, b]) => readme.addRow({ a, b }));
  readme.getRow(1).font = { bold: true, size: 14, color: { argb: 'FF012451' } };
  styleHeader(readme.getRow(11));

  const sheet = workbook.addWorksheet('Pendências', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = COLUMNS;
  rows.forEach((row) => sheet.addRow(row));
  styleHeader(sheet.getRow(1));
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: COLUMNS.length } };
  sheet.eachRow((row, index) => {
    if (index > 1) row.alignment = { vertical: 'top', wrapText: true };
  });

  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const output = path.join(workbookDir(), `relatorio-nde-${stamp}.xlsx`);
  await workbook.xlsx.writeFile(output);

  console.log(`📄 ${output}`);
  console.log(`   pendências: ${rows.length}`);
  counts.forEach(({ problema, total }) => console.log(`   ${problema}: ${total}`));
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
