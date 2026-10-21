import { REVIEW_GROUP_LABELS, REVIEW_GROUP_ORDER, type ReviewGroup } from './catalogVisibility';

export type NdeReportItem = {
  group: ReviewGroup;
  codigo: string | null;
  titulo: string;
  status: string | null;
  linkRepositorio: string | null;
  /** Linha da planilha, conhecida só nos problemas da planilha (sem código, repetido). */
  linha: number | null;
  /** Código repetido: true na linha que ficou valendo. */
  vigente: boolean | null;
};

export type NdeReportRow = {
  problema: string;
  oQueFazer: string;
  linha: number | null;
  codigo: string;
  titulo: string;
  statusAtual: string;
  link: string;
  observacao: string;
};

const ACTIONS: Record<ReviewGroup, string> = {
  'sem-codigo': 'Preencher a coluna "Código do recurso". Se a linha não for um recurso, apagar.',
  'codigo-repetido': 'Manter uma linha por código: apagar a cópia ou dar código próprio, se for outro recurso.',
  'sem-link': 'Preencher o "Link do recurso".',
  quebrado: 'Corrigir o link ou o recurso e mudar o status para Funcionando.',
  incorreto: 'Corrigir o que a avaliação apontou e mudar o status para Funcionando.',
  'acesso-restrito': 'Liberar o acesso ao link ou trocar por um link aberto, e mudar o status.',
  'nao-avaliado': 'Avaliar o recurso e preencher o status.',
  'em-cadastro': 'Preencher o "Status do link".',
  duvida: 'Resolver a dúvida e definir o status.',
  outro: 'Revisar o status: o valor não é um dos previstos.',
};

function observation(item: NdeReportItem): string {
  if (item.group !== 'codigo-repetido') return '';
  return item.vigente
    ? 'Esta linha é a que vale hoje no Acervo.'
    : 'Esta linha foi ignorada na importação.';
}

/** Linhas do relatório para o NDE, na ordem da fila de revisão e, dentro do grupo, por código. */
export function buildNdeReportRows(items: NdeReportItem[]): NdeReportRow[] {
  const rank = (group: ReviewGroup) => REVIEW_GROUP_ORDER.indexOf(group);
  return [...items]
    .sort(
      (a, b) =>
        rank(a.group) - rank(b.group) ||
        (a.codigo ?? '').localeCompare(b.codigo ?? '') ||
        (a.linha ?? 0) - (b.linha ?? 0)
    )
    .map((item) => ({
      problema: REVIEW_GROUP_LABELS[item.group],
      oQueFazer: ACTIONS[item.group],
      linha: item.linha,
      codigo: item.codigo ?? '',
      titulo: item.titulo,
      statusAtual: item.status ?? '',
      link: item.linkRepositorio ?? '',
      observacao: observation(item),
    }));
}

/** Quantidade por problema, na ordem da fila, sem os grupos vazios. */
export function countByProblem(rows: NdeReportRow[]): { problema: string; total: number }[] {
  return REVIEW_GROUP_ORDER.map((group) => ({
    problema: REVIEW_GROUP_LABELS[group],
    total: rows.filter((row) => row.problema === REVIEW_GROUP_LABELS[group]).length,
  })).filter((entry) => entry.total > 0);
}
