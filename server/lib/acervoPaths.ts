import fs from 'fs';
import path from 'path';
import { thumbRelativePath } from './thumbPaths';

export const WORKBOOK_FILE_NAME = 'Categorização_Recursos Digitais_Terceiros.xlsx';
const LAST_IMPORTED_FILE_NAME = 'ultima-importada.xlsx';

function repoRootCandidates(): string[] {
  return [
    path.join(process.cwd(), '..'),
    process.cwd(),
    path.join(__dirname, '..', '..'),
    path.join(__dirname, '..', '..', '..'),
  ];
}

/** Raiz do projeto: a pasta que contém `public/`. Funciona a partir da raiz, de `server/` e do build. */
export function findRepoRoot(): string {
  const candidates = repoRootCandidates();
  const found = candidates.find((dir) => fs.existsSync(path.join(dir, 'public')));
  if (!found) {
    throw new Error(`Pasta public/ não encontrada. Tentou:\n${candidates.join('\n')}`);
  }
  return found;
}

export function publicDir(): string {
  return path.join(findRepoRoot(), 'public');
}

export function thumbsDir(): string {
  return path.join(publicDir(), 'thumbs');
}

/** Arquivo da capa em disco, segundo a regra de `thumbPaths.ts`. */
export function thumbFilePath(
  codigo: string,
  marca: string | null | undefined,
  root: string = thumbsDir()
): string {
  return path.join(root, ...thumbRelativePath(codigo, marca).split('/'));
}

export function metodologiaDir(): string {
  return path.join(publicDir(), 'metodologia');
}

/**
 * A planilha fica em `data/`, fora de `public/` e fora do Git: tudo em `public/` é publicado
 * como arquivo estático sem login, e a planilha traz dados pessoais e recursos não publicáveis.
 */
export function workbookDir(): string {
  const fromEnv = process.env.ACERVO_DATA_DIR?.trim();
  return fromEnv ? path.resolve(fromEnv) : path.join(findRepoRoot(), 'data');
}

export function workbookPath(): string {
  return path.join(workbookDir(), WORKBOOK_FILE_NAME);
}

/** Planilha a ser lida: o caminho explícito, se informado, ou a planilha oficial em `data/`. */
export function findWorkbook(explicit?: string): string {
  const target = explicit || workbookPath();
  if (!fs.existsSync(target)) {
    throw new Error(
      explicit
        ? `Planilha não encontrada: ${explicit}`
        : `Planilha não encontrada em ${target}. Baixe a versão oficial e salve com esse nome na pasta data/.`
    );
  }
  return target;
}

/** Destino da planilha recebida por upload ou baixada do Google. Cria `data/` num clone novo. */
export function writableWorkbookPath(): string {
  fs.mkdirSync(workbookDir(), { recursive: true });
  return workbookPath();
}

/** Cópia da última planilha importada com sucesso; é a base de comparação do `diff:planilha`. */
export function lastImportedWorkbookPath(): string {
  return path.join(workbookDir(), LAST_IMPORTED_FILE_NAME);
}
