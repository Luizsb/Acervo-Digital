/**
 * Compara a planilha atual com a versão do Git (HEAD) e lista códigos sem thumb em disco.
 * Não precisa do Postgres.
 *
 * Uso: npx tsx scripts/diff-planilha.ts [caminho-planilha-antiga]
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createHash } from 'crypto';
import { readWorksheetMatrix } from '../lib/excel';
import { mapCategorizacaoRow, type CategorizacaoRow } from './map-categorizacao';
import { isVisibleInCatalog } from '../lib/catalogVisibility';

const SHEET_NAME = 'Recursos Digitais';
const HEADER_ROW = 1;
const DATA_START_ROW = 4;

function findWorkbook(): string {
  const candidates = [
    path.join(process.cwd(), '..', 'public', 'Categorização_Recursos Digitais_Terceiros.xlsx'),
    path.join(process.cwd(), 'public', 'Categorização_Recursos Digitais_Terceiros.xlsx'),
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) throw new Error('Planilha atual não encontrada em public/');
  return found;
}

function thumbsDirFromWorkbook(workbook: string): string {
  return path.join(path.dirname(workbook), 'thumbs');
}

function thumbPath(thumbsDir: string, codigo: string): string {
  return path.join(thumbsDir, `${codigo.replace(/\.(webp|jpg|jpeg|png)$/i, '')}.webp`);
}

function sourceHash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

async function loadMapped(filePath: string) {
  const { rows: matrix } = await readWorksheetMatrix(filePath, SHEET_NAME);
  const headers = (matrix[HEADER_ROW] || []).map((h) => String(h).trim());
  const pdfDir = path.join(path.dirname(filePath), 'metodologia');
  const byCode = new Map<
    string,
    {
      hash: string;
      titulo: string;
      status: string | null;
      imagem: string | null;
      linkRepositorio: string | null;
    }
  >();
  let skipped = 0;

  for (let i = DATA_START_ROW; i < matrix.length; i++) {
    const line = matrix[i];
    const row: CategorizacaoRow = {};
    headers.forEach((header, idx) => {
      if (header) row[header] = line[idx];
    });
    const mapped = mapCategorizacaoRow(row, {
      metodologiaExists: (codigo) => fs.existsSync(path.join(pdfDir, `${codigo}.pdf`)),
      sheetRow: i + 1,
    });
    if (!mapped) {
      skipped += 1;
      continue;
    }
    byCode.set(mapped.codigoOda, {
      hash: sourceHash(mapped),
      titulo: mapped.titulo,
      status: mapped.status,
      imagem: mapped.imagem,
      linkRepositorio: mapped.linkRepositorio,
    });
  }

  return { byCode, skipped, rows: matrix.length - DATA_START_ROW };
}

function extractHeadWorkbook(dest: string): boolean {
  try {
    const blob = execSync('git show "HEAD:public/Categorização_Recursos Digitais_Terceiros.xlsx"', {
      maxBuffer: 30 * 1024 * 1024,
      encoding: 'buffer',
    }) as Buffer;
    fs.writeFileSync(dest, blob);
    return blob.length > 1000;
  } catch {
    return false;
  }
}

async function main() {
  const current = findWorkbook();
  const thumbsDir = thumbsDirFromWorkbook(current);
  const oldArg = process.argv[2];
  const oldPath = oldArg || path.join(process.cwd(), '.tmp-planilha-head.xlsx');

  if (!oldArg) {
    const ok = extractHeadWorkbook(oldPath);
    if (!ok) {
      console.error('Não foi possível ler a planilha do HEAD no Git.');
      process.exit(1);
    }
  }

  console.log(`Atual: ${current}`);
  console.log(`Base:  ${oldPath}`);

  const [now, before] = await Promise.all([loadMapped(current), loadMapped(oldPath)]);

  const created: string[] = [];
  const updated: string[] = [];
  const removed: string[] = [];

  for (const [code, item] of now.byCode) {
    const prev = before.byCode.get(code);
    if (!prev) created.push(code);
    else if (prev.hash !== item.hash) updated.push(code);
  }
  for (const code of before.byCode.keys()) {
    if (!now.byCode.has(code)) removed.push(code);
  }

  const missingThumbs: {
    codigo: string;
    titulo: string;
    status: string | null;
    linkRepositorio: string | null;
  }[] = [];
  for (const [codigo, item] of now.byCode) {
    const file = thumbPath(thumbsDir, codigo);
    if (!fs.existsSync(file)) {
      missingThumbs.push({
        codigo,
        titulo: item.titulo,
        status: item.status,
        linkRepositorio: item.linkRepositorio,
      });
    }
  }

  const missingPublic = missingThumbs.filter((m) =>
    isVisibleInCatalog(m.status, m.linkRepositorio)
  );
  const statusCounts = new Map<string, number>();
  for (const item of now.byCode.values()) {
    const key = (item.status || '(em branco)').trim() || '(em branco)';
    statusCounts.set(key, (statusCounts.get(key) || 0) + 1);
  }

  console.log('\n=== Diff planilha (vs HEAD) ===');
  console.log(`Linhas úteis agora: ${now.byCode.size} (puladas: ${now.skipped})`);
  console.log(`Linhas úteis antes: ${before.byCode.size}`);
  console.log(`Novos códigos:      ${created.length}`);
  console.log(`Alterados:          ${updated.length}`);
  console.log(`Removidos:          ${removed.length}`);

  if (created.length) {
    console.log('\nNovos (até 30):');
    created.slice(0, 30).forEach((c) => {
      const t = now.byCode.get(c)!;
      console.log(`  + ${c} — ${t.titulo} [${t.status || 'sem status'}]`);
    });
    if (created.length > 30) console.log(`  ... +${created.length - 30} mais`);
  }

  if (updated.length) {
    console.log('\nAlterados (até 30):');
    updated.slice(0, 30).forEach((c) => {
      const t = now.byCode.get(c)!;
      console.log(`  ~ ${c} — ${t.titulo} [${t.status || 'sem status'}]`);
    });
    if (updated.length > 30) console.log(`  ... +${updated.length - 30} mais`);
  }

  console.log('\n=== Status na planilha atual ===');
  [...statusCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([status, count]) => console.log(`  ${status}: ${count}`));

  console.log('\n=== Thumbs ===');
  console.log(`Pasta: ${thumbsDir}`);
  console.log(`Sem arquivo .webp: ${missingThumbs.length} (público/Funcionando: ${missingPublic.length})`);
  if (missingPublic.length) {
    console.log('Sem thumb (Funcionando, até 40):');
    missingPublic.slice(0, 40).forEach((m) => console.log(`  ! ${m.codigo} — ${m.titulo}`));
    if (missingPublic.length > 40) console.log(`  ... +${missingPublic.length - 40} mais`);
  }

  if (!oldArg && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
