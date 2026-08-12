import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { readWorksheetMatrix } from '../lib/excel';
import { mapCategorizacaoRow, type CategorizacaoRow } from './map-categorizacao';

const prisma = new PrismaClient();
const SHEET_NAME = 'Recursos Digitais';
const HEADER_ROW = 1;
const DATA_START_ROW = 4;

function findWorkbook(): string {
  const candidates = [
    path.join(process.cwd(), '..', 'public', 'Categorização_Recursos Digitais_Terceiros.xlsx'),
    path.join(process.cwd(), 'public', 'Categorização_Recursos Digitais_Terceiros.xlsx'),
    path.join(__dirname, '..', '..', 'public', 'Categorização_Recursos Digitais_Terceiros.xlsx'),
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) {
    throw new Error(`Planilha não encontrada. Tentou:\n${candidates.join('\n')}`);
  }
  return found;
}

function metodologiaDir(): string {
  return path.join(path.dirname(findWorkbook()), 'metodologia');
}

async function loadRows(filePath: string): Promise<CategorizacaoRow[]> {
  const { rows: matrix } = await readWorksheetMatrix(filePath, SHEET_NAME);
  const headers = (matrix[HEADER_ROW] || []).map((h) => String(h).trim());
  return matrix.slice(DATA_START_ROW).map((line) => {
    const row: CategorizacaoRow = {};
    headers.forEach((header, i) => {
      if (header) row[header] = line[i];
    });
    return row;
  });
}

async function main() {
  const clear = process.argv.includes('--clear');
  const filePath = findWorkbook();
  const pdfDir = metodologiaDir();
  console.log(`📂 Planilha: ${filePath}`);

  if (clear) {
    const deletedOdas = await prisma.oDA.deleteMany({});
    console.log(`🗑️  ${deletedOdas.count} ODAs removidos`);
  }

  const rows = await loadRows(filePath);
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const mapped = mapCategorizacaoRow(rows[i], {
      metodologiaExists: (codigo) => fs.existsSync(path.join(pdfDir, `${codigo}.pdf`)),
    });
    if (!mapped) {
      skipped += 1;
      continue;
    }

    try {
      if (mapped.codigoBncc) {
        await prisma.bNCC.upsert({
          where: { codigo: mapped.codigoBncc },
          update: {
            descricao: mapped.descricaoBncc || undefined,
            componente: mapped.componenteCurricular || undefined,
            ano: mapped.anoSerie || undefined,
          },
          create: {
            codigo: mapped.codigoBncc,
            descricao: mapped.descricaoBncc,
            componente: mapped.componenteCurricular,
            ano: mapped.anoSerie,
          },
        });
      }

      const { codigoOda, ...data } = mapped;
      await prisma.oDA.upsert({
        where: { codigoOda },
        update: data,
        create: { codigoOda, ...data },
      });
      imported += 1;
      if (imported % 100 === 0) {
        console.log(`✅ ${imported} ODAs importados...`);
      }
    } catch (err: any) {
      errors += 1;
      console.error(`❌ Linha ${i + DATA_START_ROW + 1} (${mapped.codigoOda}): ${err.message}`);
      if (mapped.codigoBncc) {
        try {
          await prisma.oDA.upsert({
            where: { codigoOda: mapped.codigoOda },
            update: { ...mapped, codigoBncc: null },
            create: { ...mapped, codigoBncc: null },
          });
          imported += 1;
          errors -= 1;
        } catch (retryErr: any) {
          console.error(`   retry falhou: ${retryErr.message}`);
        }
      }
    }
  }

  const total = await prisma.oDA.count();
  const videos = await prisma.oDA.count({ where: { tipoConteudo: 'Audiovisual' } });
  const oeds = await prisma.oDA.count({ where: { tipoConteudo: 'OED' } });
  console.log(`\n🎉 Importação L1 concluída`);
  console.log(`   importados/atualizados: ${imported}`);
  console.log(`   pulados (sem título/código): ${skipped}`);
  console.log(`   erros: ${errors}`);
  console.log(`   total ODAs no banco: ${total} (Audiovisual/Vídeo: ${videos}, OED: ${oeds})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
