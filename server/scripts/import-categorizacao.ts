import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import prisma from '../lib/prisma';
import { readWorksheetMatrix } from '../lib/excel';
import { mapCategorizacaoRow, type CategorizacaoRow } from './map-categorizacao';
import { completeBnccText, completeObjectiveList } from '../lib/completeBnccText';
const SHEET_NAME = 'Recursos Digitais';
const HEADER_ROW = 1;
const DATA_START_ROW = 4;
const IMPORT_SOURCE = 'planilha-categorizacao';

function sourceHash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function findWorkbook(): string {
  const candidates = [
    path.join(process.cwd(), '..', 'public', 'Categorização_Recursos Digitais_Terceiros.xlsx'),
    path.join(process.cwd(), 'public', 'Categorização_Recursos Digitais_Terceiros.xlsx'),
    path.join(__dirname, '..', '..', 'public', 'Categorização_Recursos Digitais_Terceiros.xlsx'),
    path.join(__dirname, '..', '..', '..', 'public', 'Categorização_Recursos Digitais_Terceiros.xlsx'),
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

export async function importCategorizacao(options: { clear?: boolean } = {}) {
  const clear = options.clear ?? process.argv.includes('--clear');
  const filePath = findWorkbook();
  const pdfDir = metodologiaDir();
  console.log(`📂 Planilha: ${filePath}`);

  if (clear) {
    const deletedOdas = await prisma.oDA.deleteMany({});
    console.log(`🗑️  ${deletedOdas.count} ODAs removidos`);
  }

  const rows = await loadRows(filePath);
  let imported = 0;
  let created = 0;
  let updated = 0;
  let unchanged = 0;
  let reactivated = 0;
  let skipped = 0;
  let errors = 0;
  const seenCodes: string[] = [];
  const synchronizedAt = new Date();

  for (let i = 0; i < rows.length; i++) {
    const mapped = mapCategorizacaoRow(rows[i], {
      metodologiaExists: (codigo) => fs.existsSync(path.join(pdfDir, `${codigo}.pdf`)),
      sheetRow: i + DATA_START_ROW + 1,
    });
    if (!mapped) {
      skipped += 1;
      continue;
    }

    mapped.descricaoBncc = completeBnccText(mapped.codigoBncc, mapped.descricaoBncc);
    mapped.descricaoBnccSecundaria = completeBnccText(
      mapped.codigoBnccSecundaria,
      mapped.descricaoBnccSecundaria
    );
    mapped.objetivosAprendizagem = completeObjectiveList(mapped.objetivosAprendizagem, [
      mapped.descricaoBncc,
      mapped.descricaoBnccSecundaria,
    ]);

    try {
      seenCodes.push(mapped.codigoOda);
      const hashFonte = sourceHash(mapped);
      const existing = await prisma.oDA.findUnique({
        where: { codigoOda: mapped.codigoOda },
        select: { id: true, ativo: true, hashFonte: true },
      });

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

      if (existing?.ativo && existing.hashFonte === hashFonte) {
        await prisma.oDA.update({
          where: { codigoOda },
          data: { sincronizadoEm: synchronizedAt },
        });
        unchanged += 1;
        imported += 1;
        continue;
      }

      await prisma.oDA.upsert({
        where: { codigoOda },
        update: {
          ...data,
          ativo: true,
          fonteImportacao: IMPORT_SOURCE,
          hashFonte,
          sincronizadoEm: synchronizedAt,
        },
        create: {
          codigoOda,
          ...data,
          ativo: true,
          fonteImportacao: IMPORT_SOURCE,
          hashFonte,
          sincronizadoEm: synchronizedAt,
        },
      });

      if (!existing) {
        created += 1;
      } else if (!existing.ativo) {
        reactivated += 1;
      } else if (existing.hashFonte === hashFonte) {
        unchanged += 1;
      } else {
        updated += 1;
      }

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
            update: {
              ...mapped,
              codigoBncc: null,
              ativo: true,
              fonteImportacao: IMPORT_SOURCE,
              hashFonte: sourceHash(mapped),
              sincronizadoEm: synchronizedAt,
            },
            create: {
              ...mapped,
              codigoBncc: null,
              ativo: true,
              fonteImportacao: IMPORT_SOURCE,
              hashFonte: sourceHash(mapped),
              sincronizadoEm: synchronizedAt,
            },
          });
          imported += 1;
          errors -= 1;
        } catch (retryErr: any) {
          console.error(`   retry falhou: ${retryErr.message}`);
        }
      }
    }
  }

  let deactivated = 0;
  if (errors === 0 && seenCodes.length > 0) {
    const result = await prisma.oDA.updateMany({
      where: {
        fonteImportacao: IMPORT_SOURCE,
        ativo: true,
        codigoOda: { notIn: seenCodes },
      },
      data: {
        ativo: false,
        sincronizadoEm: synchronizedAt,
      },
    });
    deactivated = result.count;
  }

  const total = await prisma.oDA.count({ where: { ativo: true } });
  const videos = await prisma.oDA.count({ where: { ativo: true, tipoConteudo: 'Audiovisual' } });
  const oeds = await prisma.oDA.count({ where: { ativo: true, tipoConteudo: 'OED' } });
  console.log(`\n🎉 Importação L1 concluída`);
  console.log(`   processados: ${imported}`);
  console.log(`   novos: ${created}`);
  console.log(`   alterados: ${updated}`);
  console.log(`   sem alteração: ${unchanged}`);
  console.log(`   reativados: ${reactivated}`);
  console.log(`   desativados por ausência na planilha: ${deactivated}`);
  console.log(`   pulados (linha vazia): ${skipped}`);
  console.log(`   erros: ${errors}`);
  console.log(`   total ODAs no banco: ${total} (Audiovisual/Vídeo: ${videos}, OED: ${oeds})`);
}

if (require.main === module) {
  importCategorizacao()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
