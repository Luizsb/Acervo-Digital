import fs from 'fs';
import os from 'os';
import path from 'path';
import { createHash } from 'crypto';
import prisma from '../lib/prisma';
import { recordAuditEvent, type AuditOrigin } from '../lib/audit';
import { readWorksheetMatrix } from '../lib/excel';
import { isPlaceholderResourceCode, mapCategorizacaoRow, type CategorizacaoRow } from '../lib/map-categorizacao';
import { completeBnccText, completeObjectiveList } from '../lib/completeBnccText';
import { isVisibleInCatalog } from '../lib/catalogVisibility';
import {
  findWorkbook,
  lastImportedWorkbookPath,
  metodologiaDir,
  thumbFilePath,
  thumbsDir,
} from '../lib/acervoPaths';
import { thumbPublicPath } from '../lib/thumbPaths';
import { DATA_START_ROW, HEADER_ROW, SHEET_NAME } from '../lib/planilhaLayout';

const IMPORT_SOURCE = 'planilha-categorizacao';

export type ImportSummary = {
  filePath: string;
  processed: number;
  created: number;
  updated: number;
  unchanged: number;
  reactivated: number;
  deactivated: number;
  skipped: number;
  errors: number;
  totalActive: number;
  totalAudiovisual: number;
  totalOed: number;
  missingThumbs: {
    codigo: string;
    titulo: string;
    marca: string | null;
    status: string | null;
    linkRepositorio: string | null;
  }[];
  missingThumbsPublic: number;
  /** Recursos novos que entrariam na galeria sem capa, deixados para a próxima importação. */
  deferredWithoutThumb: number;
  changes: ChangedItem[];
};

export type ChangeKind = 'created' | 'updated' | 'reactivated' | 'deactivated';

export type ChangedItem = {
  codigo: string;
  titulo: string;
  kind: ChangeKind;
  imagem?: string | null;
  status?: string | null;
  syncedAt?: string | null;
};

export type ImportOptions = {
  clear?: boolean;
  filePath?: string;
  log?: boolean;
  /**
   * Não cria recurso novo que entraria na galeria sem capa em public/thumbs.
   * Recursos já cadastrados continuam sendo atualizados normalmente.
   */
  onlyWithThumb?: boolean;
  onProgress?: (progress: {
    phase: 'reading' | 'importing' | 'finishing';
    current: number;
    total: number;
  }) => void;
  /** Quem disparou a importação, para a trilha de auditoria. Na linha de comando, o usuário do sistema. */
  actor?: string;
  origin?: AuditOrigin;
};

function sourceHash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function rememberImportedWorkbook(filePath: string): void {
  const baseline = lastImportedWorkbookPath();
  if (path.resolve(filePath) === path.resolve(baseline)) return;
  fs.copyFileSync(filePath, baseline);
}

export async function loadRows(filePath: string): Promise<CategorizacaoRow[]> {
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

function collectMissingThumbs(items: ImportSummary['missingThumbs']): ImportSummary['missingThumbs'] {
  const root = thumbsDir();
  return items.filter((item) => !fs.existsSync(thumbFilePath(item.codigo, item.marca, root)));
}

function toChange(
  mapped: {
    codigoOda: string;
    titulo: string;
    marca: string | null;
    imagem?: string | null;
    status?: string | null;
  },
  kind: ChangeKind,
  syncedAt: Date
): ChangedItem {
  return {
    codigo: mapped.codigoOda,
    titulo: mapped.titulo,
    kind,
    imagem: mapped.imagem ?? thumbPublicPath(mapped.codigoOda, mapped.marca),
    status: mapped.status ?? null,
    syncedAt: syncedAt.toISOString(),
  };
}

function printSummary(summary: ImportSummary) {
  console.log(`\n🎉 Importação L1 concluída`);
  console.log(`   processados: ${summary.processed}`);
  console.log(`   novos: ${summary.created}`);
  console.log(`   alterados: ${summary.updated}`);
  console.log(`   sem alteração: ${summary.unchanged}`);
  console.log(`   reativados: ${summary.reactivated}`);
  console.log(`   desativados por ausência na planilha: ${summary.deactivated}`);
  console.log(`   pulados (linha vazia): ${summary.skipped}`);
  console.log(`   erros: ${summary.errors}`);
  if (summary.deferredWithoutThumb > 0) {
    console.log(`   adiados por falta de capa (--somente-com-capa): ${summary.deferredWithoutThumb}`);
  }
  console.log(
    `   total ODAs no banco: ${summary.totalActive} (Audiovisual/Vídeo: ${summary.totalAudiovisual}, OED: ${summary.totalOed})`
  );
  console.log(
    `   sem thumb: ${summary.missingThumbs.length} (público/Funcionando: ${summary.missingThumbsPublic})`
  );
  if (summary.missingThumbsPublic > 0) {
    console.log('   Sem thumb (Funcionando, até 20):');
    summary.missingThumbs
      .filter((item) => isVisibleInCatalog(item.status, item.linkRepositorio))
      .slice(0, 20)
      .forEach((item) => console.log(`     ! ${item.codigo} — ${item.titulo}`));
  }
}

function operatorName(): string {
  try {
    return process.env.ACERVO_OPERADOR || os.userInfo().username;
  } catch {
    return 'desconhecido';
  }
}

export async function importCategorizacao(options: ImportOptions = {}): Promise<ImportSummary> {
  const origin = options.origin ?? 'cli';
  const actor = options.actor ?? operatorName();
  try {
    const summary = await runImport(options);
    await recordAuditEvent({
      action: 'catalog.import',
      origin,
      actor,
      target: path.basename(summary.filePath),
      details: {
        criados: summary.created,
        atualizados: summary.updated,
        reativados: summary.reactivated,
        desativados: summary.deactivated,
        erros: summary.errors,
        adiadosSemCapa: summary.deferredWithoutThumb,
        totalAtivos: summary.totalActive,
      },
    });
    return summary;
  } catch (error) {
    await recordAuditEvent({
      action: 'catalog.import_failed',
      origin,
      actor,
      details: { erro: error instanceof Error ? error.message : String(error) },
    });
    throw error;
  }
}

async function runImport(options: ImportOptions): Promise<ImportSummary> {
  const clear = options.clear ?? process.argv.includes('--clear');
  const onlyWithThumb = options.onlyWithThumb ?? process.argv.includes('--somente-com-capa');
  const log = options.log ?? true;
  const filePath = findWorkbook(options.filePath);
  const pdfDir = metodologiaDir();
  const thumbsRoot = thumbsDir();
  if (log) console.log(`📂 Planilha: ${filePath}`);
  options.onProgress?.({ phase: 'reading', current: 0, total: 1 });

  if (clear) {
    const deletedOdas = await prisma.oDA.deleteMany({});
    if (log) console.log(`🗑️  ${deletedOdas.count} ODAs removidos`);
  }

  const rows = await loadRows(filePath);
  options.onProgress?.({ phase: 'importing', current: 0, total: rows.length });
  let processed = 0;
  let created = 0;
  let updated = 0;
  let unchanged = 0;
  let reactivated = 0;
  let skipped = 0;
  let errors = 0;
  let deferredWithoutThumb = 0;
  const seenCodes: string[] = [];
  const thumbCandidates: ImportSummary['missingThumbs'] = [];
  const changes: ChangedItem[] = [];
  const synchronizedAt = new Date();

  for (let i = 0; i < rows.length; i++) {
    const mapped = mapCategorizacaoRow(rows[i], {
      metodologiaExists: (codigo) => fs.existsSync(path.join(pdfDir, `${codigo}.pdf`)),
      sheetRow: i + DATA_START_ROW + 1,
    });
    if (!mapped) {
      skipped += 1;
      options.onProgress?.({ phase: 'importing', current: i + 1, total: rows.length });
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
      if (!isPlaceholderResourceCode(mapped.codigoOda)) {
        thumbCandidates.push({
          codigo: mapped.codigoOda,
          titulo: mapped.titulo,
          marca: mapped.marca,
          status: mapped.status,
          linkRepositorio: mapped.linkRepositorio,
        });
      }
      const hashFonte = sourceHash(mapped);
      const existing = await prisma.oDA.findUnique({
        where: { codigoOda: mapped.codigoOda },
        select: { id: true, ativo: true, hashFonte: true },
      });

      if (
        onlyWithThumb &&
        !existing &&
        isVisibleInCatalog(mapped.status, mapped.linkRepositorio) &&
        !fs.existsSync(thumbFilePath(mapped.codigoOda, mapped.marca, thumbsRoot))
      ) {
        deferredWithoutThumb += 1;
        options.onProgress?.({ phase: 'importing', current: i + 1, total: rows.length });
        continue;
      }

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
        processed += 1;
        options.onProgress?.({ phase: 'importing', current: i + 1, total: rows.length });
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
        changes.push(toChange(mapped, 'created', synchronizedAt));
      } else if (!existing.ativo) {
        reactivated += 1;
        changes.push(toChange(mapped, 'reactivated', synchronizedAt));
      } else if (existing.hashFonte === hashFonte) {
        unchanged += 1;
      } else {
        updated += 1;
        changes.push(toChange(mapped, 'updated', synchronizedAt));
      }

      processed += 1;
      if (log && processed % 100 === 0) {
        console.log(`✅ ${processed} ODAs importados...`);
      }
    } catch (err: any) {
      errors += 1;
      if (log) {
        console.error(`❌ Linha ${i + DATA_START_ROW + 1} (${mapped.codigoOda}): ${err.message}`);
      }
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
          processed += 1;
          errors -= 1;
        } catch (retryErr: any) {
          if (log) console.error(`   retry falhou: ${retryErr.message}`);
        }
      }
    }
    options.onProgress?.({ phase: 'importing', current: i + 1, total: rows.length });
  }

  options.onProgress?.({ phase: 'finishing', current: rows.length, total: rows.length });
  let deactivated = 0;
  if (errors === 0 && seenCodes.length > 0) {
    const toDeactivate = await prisma.oDA.findMany({
      where: {
        fonteImportacao: IMPORT_SOURCE,
        ativo: true,
        codigoOda: { notIn: seenCodes },
      },
      select: { codigoOda: true, titulo: true, marca: true, imagem: true, status: true },
    });
    if (toDeactivate.length > 0) {
      await prisma.oDA.updateMany({
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
      deactivated = toDeactivate.length;
      for (const item of toDeactivate) {
        if (!item.codigoOda) continue;
        changes.push({
          codigo: item.codigoOda,
          titulo: item.titulo || item.codigoOda,
          kind: 'deactivated',
          imagem: item.imagem ?? thumbPublicPath(item.codigoOda, item.marca),
          status: item.status,
          syncedAt: synchronizedAt.toISOString(),
        });
      }
    }
  }

  const totalActive = await prisma.oDA.count({ where: { ativo: true } });
  const totalAudiovisual = await prisma.oDA.count({
    where: { ativo: true, tipoConteudo: 'Audiovisual' },
  });
  const totalOed = await prisma.oDA.count({ where: { ativo: true, tipoConteudo: 'OED' } });
  const missingThumbs = collectMissingThumbs(thumbCandidates);
  const missingThumbsPublic = missingThumbs.filter((item) =>
    isVisibleInCatalog(item.status, item.linkRepositorio)
  ).length;

  const summary: ImportSummary = {
    filePath,
    processed,
    created,
    updated,
    unchanged,
    reactivated,
    deactivated,
    skipped,
    errors,
    totalActive,
    totalAudiovisual,
    totalOed,
    missingThumbs,
    missingThumbsPublic,
    deferredWithoutThumb,
    changes,
  };

  if (changes.length > 0) {
    await prisma.importEvent.createMany({
      data: changes.map((change) => ({
        syncedAt: synchronizedAt,
        codigo: change.codigo,
        titulo: change.titulo,
        kind: change.kind,
        imagem: change.imagem ?? thumbPublicPath(change.codigo, null),
        status: change.status ?? null,
      })),
    });
  }

  if (errors === 0) rememberImportedWorkbook(filePath);

  if (log) printSummary(summary);
  return summary;
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
