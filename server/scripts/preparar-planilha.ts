/**
 * Prepara a planilha baixada do Drive do NDE para a importação: mantém só a aba de recursos,
 * grava apenas valores (sem fórmulas, comentários nem metadados do arquivo original) e
 * remove as colunas com dado pessoal. O resultado vai para data/ com o nome oficial.
 *
 * Uso: npm run planilha:preparar -- "caminho/da/planilha-baixada.xlsx"
 *      Sem argumento, prepara a planilha que já está em data/.
 */
import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import { readWorksheetMatrix } from '../lib/excel';
import { workbookPath, writableWorkbookPath } from '../lib/acervoPaths';
import { DATA_START_ROW, HEADER_ROW, PERSONAL_DATA_COLUMNS, SHEET_NAME } from '../lib/planilhaLayout';

function resolveInput(): string {
  const arg = process.argv[2];
  if (!arg) return workbookPath();
  // O script raiz faz `cd server`; INIT_CWD preserva a pasta de onde o npm foi chamado.
  return path.resolve(process.env.INIT_CWD || process.cwd(), arg);
}

function isEmpty(value: unknown): boolean {
  return value === '' || value === null || value === undefined;
}

async function main() {
  const input = resolveInput();
  if (!fs.existsSync(input)) {
    throw new Error(`Planilha não encontrada: ${input}`);
  }
  const inputBytes = fs.statSync(input).size;

  const { rows, sheetNames } = await readWorksheetMatrix(input, SHEET_NAME);
  const headers = (rows[HEADER_ROW] || []).map((h) => String(h ?? '').trim());
  const droppedIndexes = new Set(
    headers.flatMap((header, index) => (PERSONAL_DATA_COLUMNS.includes(header) ? [index] : []))
  );

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Acervo Digital';
  const sheet = workbook.addWorksheet(SHEET_NAME);
  rows.forEach((line, rowIndex) => {
    const kept = line.filter((_, columnIndex) => !droppedIndexes.has(columnIndex));
    const row = sheet.getRow(rowIndex + 1);
    kept.forEach((value, columnIndex) => {
      if (!isEmpty(value)) row.getCell(columnIndex + 1).value = value as ExcelJS.CellValue;
    });
  });

  const output = writableWorkbookPath();
  const temp = `${output}.tmp`;
  await workbook.xlsx.writeFile(temp);
  fs.renameSync(temp, output);

  const discardedSheets = sheetNames.filter((name) => name !== SHEET_NAME);
  const droppedColumns = [...droppedIndexes].map((index) => headers[index]);
  console.log(`📥 Origem:  ${input}`);
  console.log(`📦 Destino: ${output}`);
  console.log(`   aba mantida: ${SHEET_NAME} (${Math.max(rows.length - DATA_START_ROW, 0)} linhas de dados)`);
  console.log(`   abas descartadas: ${discardedSheets.length}`);
  console.log(
    `   colunas pessoais removidas: ${droppedColumns.length ? droppedColumns.join(', ') : 'nenhuma encontrada'}`
  );
  console.log(
    `   tamanho: ${(inputBytes / 1024 / 1024).toFixed(1)} MB → ${(fs.statSync(output).size / 1024 / 1024).toFixed(1)} MB`
  );
  console.log('\nPróximo passo: npm run diff:planilha');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
