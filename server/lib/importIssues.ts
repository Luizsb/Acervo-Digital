import type { ImportIssueGroup } from './catalogVisibility';
import { findRepeatedCodes, isPlaceholderResourceCode } from './map-categorizacao';

export type ImportIssueSourceRow = {
  linha: number;
  codigo: string;
  titulo: string | null;
  status: string | null;
  linkRepositorio: string | null;
};

export type ImportIssue = {
  kind: ImportIssueGroup;
  linha: number;
  codigo: string | null;
  titulo: string | null;
  status: string | null;
  linkRepositorio: string | null;
  /** Só em código repetido: a linha que ficou valendo no banco. */
  vigente: boolean;
};

/**
 * Problemas da planilha para o NDE corrigir: linha sem código e cada linha de código
 * repetido. `appliedLineByCode` diz qual linha a importação gravou para cada código.
 */
export function buildImportIssues(
  rows: ImportIssueSourceRow[],
  appliedLineByCode: Map<string, number>
): ImportIssue[] {
  const toIssue = (row: ImportIssueSourceRow, kind: ImportIssueGroup, vigente: boolean): ImportIssue => ({
    kind,
    linha: row.linha,
    codigo: kind === 'sem-codigo' ? null : row.codigo,
    titulo: row.titulo?.trim() || null,
    status: row.status?.trim() || null,
    linkRepositorio: row.linkRepositorio?.trim() || null,
    vigente,
  });

  const withoutCode = rows
    .filter((row) => isPlaceholderResourceCode(row.codigo))
    .map((row) => toIssue(row, 'sem-codigo', false));

  const byLine = new Map(rows.map((row) => [row.linha, row]));
  const repeated = findRepeatedCodes(rows).flatMap(({ codigo, linhas }) =>
    linhas
      .map((linha) => byLine.get(linha))
      .filter((row): row is ImportIssueSourceRow => Boolean(row))
      .map((row) => toIssue(row, 'codigo-repetido', appliedLineByCode.get(codigo) === row.linha))
  );

  return [...withoutCode, ...repeated];
}
