import ExcelJS from 'exceljs';

function normalizeCellValue(value: ExcelJS.CellValue): unknown {
  if (value === null || value === undefined) return '';
  if (value instanceof Date || typeof value !== 'object') return value;

  if ('result' in value) {
    return normalizeCellValue(value.result as ExcelJS.CellValue);
  }
  if ('richText' in value) {
    return value.richText.map((part) => part.text).join('');
  }
  if ('text' in value) return value.text;
  if ('error' in value) return value.error;

  return String(value);
}

export async function readWorksheetMatrix(
  filePath: string,
  sheetName?: string
): Promise<{ rows: unknown[][]; sheetNames: string[] }> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = sheetName
    ? workbook.getWorksheet(sheetName)
    : workbook.worksheets[0];
  if (!worksheet) {
    throw new Error(
      sheetName
        ? `Aba "${sheetName}" não encontrada. Abas: ${workbook.worksheets
            .map((sheet) => sheet.name)
            .join(', ')}`
        : 'A planilha não possui abas.'
    );
  }

  const rows: unknown[][] = [];
  worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    const values: unknown[] = [];
    for (let column = 1; column <= worksheet.columnCount; column += 1) {
      values.push(normalizeCellValue(row.getCell(column).value));
    }
    rows[rowNumber - 1] = values;
  });

  return {
    rows,
    sheetNames: workbook.worksheets.map((sheet) => sheet.name),
  };
}
