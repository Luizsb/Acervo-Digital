/**
 * Move as capas de public/thumbs para as pastas por marca (regra em lib/thumbPaths.ts).
 * Lê a planilha oficial; não mexe em arquivo que a planilha não referencia.
 *
 * Uso (sem opção, só simula):
 *   npx tsx scripts/organize-thumbs.ts
 *   npx tsx scripts/organize-thumbs.ts --aplicar              copia para as pastas novas
 *   npx tsx scripts/organize-thumbs.ts --atualizar-historico  aponta import_events para os caminhos novos
 *   npx tsx scripts/organize-thumbs.ts --remover-antigas      apaga as cópias no caminho antigo
 */
import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma';
import { findWorkbook, thumbFilePath, thumbsDir } from '../lib/acervoPaths';
import { DATA_START_ROW } from '../lib/planilhaLayout';
import { thumbPublicPath } from '../lib/thumbPaths';
import { loadRows } from './import-categorizacao';
import { mapCategorizacaoRow } from '../lib/map-categorizacao';

const APPLY = process.argv.includes('--aplicar');
const UPDATE_HISTORY = process.argv.includes('--atualizar-historico');
const REMOVE_OLD = process.argv.includes('--remover-antigas');

type ThumbMove = {
  codigo: string;
  oldFile: string;
  newFile: string;
  oldPublic: string;
  newPublic: string;
};

/** Regra anterior: o código virava o caminho, com barras criando subpastas. */
function legacyRelative(codigo: string): string {
  return `${codigo.replace(/\.(webp|jpg|jpeg|png)$/i, '')}.webp`;
}

function sameFile(a: string, b: string): boolean {
  return path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();
}

function listFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full) : [full];
  });
}

function removeEmptyDirs(dir: string, root: string): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) removeEmptyDirs(path.join(dir, entry.name), root);
  }
  if (dir !== root && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
}

async function loadMoves(root: string): Promise<ThumbMove[]> {
  const rows = await loadRows(findWorkbook());
  const byCode = new Map<string, ThumbMove>();
  rows.forEach((row, i) => {
    const mapped = mapCategorizacaoRow(row, {
      metodologiaExists: () => false,
      sheetRow: i + DATA_START_ROW + 1,
    });
    if (!mapped) return;
    const codigo = mapped.codigoOda;
    // A importação fica com a última linha de um código repetido; aqui também.
    byCode.set(codigo, {
      codigo,
      oldFile: path.join(root, legacyRelative(codigo)),
      newFile: thumbFilePath(codigo, mapped.marca, root),
      oldPublic: `/thumbs/${legacyRelative(codigo)}`,
      newPublic: thumbPublicPath(codigo, mapped.marca),
    });
  });
  return [...byCode.values()];
}

function findCollisions(moves: ThumbMove[]): Map<string, string[]> {
  const byTarget = new Map<string, string[]>();
  for (const move of moves) {
    const key = path.resolve(move.newFile).toLowerCase();
    byTarget.set(key, [...(byTarget.get(key) ?? []), move.codigo]);
  }
  return new Map([...byTarget].filter(([, codes]) => codes.length > 1));
}

async function updateHistory(moves: ThumbMove[]): Promise<number> {
  const pending = moves.filter((move) => move.oldPublic !== move.newPublic);
  let updated = 0;
  for (const move of pending) {
    const result = await prisma.importEvent.updateMany({
      where: { codigo: move.codigo, imagem: move.oldPublic },
      data: { imagem: move.newPublic },
    });
    updated += result.count;
  }
  return updated;
}

async function main() {
  const root = thumbsDir();
  const moves = await loadMoves(root);

  // Hoje são linhas repetidas do mesmo recurso (IMP/24/GLA10 e IMP/24/GLA10/), que
  // devem dividir a capa. Recursos diferentes aqui sairiam com a capa trocada.
  const collisions = findCollisions(moves);
  if (collisions.size > 0) {
    console.warn(`⚠️  ${collisions.size} capas compartilhadas por mais de um código:`);
    for (const codes of collisions.values()) console.warn(`   ${codes.join('  |  ')}`);
  }

  const scheduled = new Set<string>();
  const toCopy = moves.filter((m) => {
    const target = path.resolve(m.newFile).toLowerCase();
    if (scheduled.has(target)) return false;
    const copy =
      !sameFile(m.oldFile, m.newFile) && fs.existsSync(m.oldFile) && !fs.existsSync(m.newFile);
    if (copy) scheduled.add(target);
    return copy;
  });
  const organized = moves.filter((m) => fs.existsSync(m.newFile));
  const toRemove = moves.filter(
    (m) => !sameFile(m.oldFile, m.newFile) && fs.existsSync(m.oldFile) && fs.existsSync(m.newFile)
  );
  const missing = moves.filter((m) => !fs.existsSync(m.oldFile) && !fs.existsSync(m.newFile));

  const referenced = new Set(
    moves.flatMap((m) => [path.resolve(m.oldFile).toLowerCase(), path.resolve(m.newFile).toLowerCase()])
  );
  const orphans = listFiles(root).filter((file) => !referenced.has(path.resolve(file).toLowerCase()));

  console.log(`📋 Códigos na planilha: ${moves.length}`);
  console.log(`   já na pasta da marca: ${organized.length}`);
  console.log(`   a copiar para a pasta da marca: ${toCopy.length}`);
  console.log(`   cópia antiga a remover: ${toRemove.length}`);
  console.log(`   sem capa em nenhum dos caminhos: ${missing.length}`);
  console.log(`   arquivos que a planilha não referencia (ficam onde estão): ${orphans.length}`);
  orphans.slice(0, 20).forEach((file) => console.log(`     · ${path.relative(root, file)}`));

  if (APPLY) {
    for (const move of toCopy) {
      fs.mkdirSync(path.dirname(move.newFile), { recursive: true });
      fs.copyFileSync(move.oldFile, move.newFile);
    }
    console.log(`✅ Copiadas: ${toCopy.length}`);
  }

  if (UPDATE_HISTORY) {
    const updated = await updateHistory(moves);
    console.log(`✅ Histórico de importação atualizado: ${updated} eventos`);
  }

  if (REMOVE_OLD) {
    for (const move of toRemove) fs.unlinkSync(move.oldFile);
    removeEmptyDirs(root, root);
    console.log(`✅ Removidas: ${toRemove.length}`);
  }

  if (!APPLY && !UPDATE_HISTORY && !REMOVE_OLD) {
    console.log('\nSimulação. Use --aplicar, --atualizar-historico ou --remover-antigas.');
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
