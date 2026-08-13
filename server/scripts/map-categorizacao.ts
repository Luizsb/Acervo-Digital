export type CategorizacaoRow = Record<string, unknown>;

export type MappedODA = {
  codigoOda: string;
  titulo: string;
  componenteCurricular: string | null;
  tags: string | null;
  tagColor: string;
  anoSerie: string | null;
  imagem: string | null;
  linkRepositorio: string | null;
  codigoBncc: string | null;
  descricaoBncc: string | null;
  categoria: string | null;
  duracao: string | null;
  volume: string | null;
  segmento: string | null;
  marca: string | null;
  tipoConteudo: 'Audiovisual' | 'OED';
  escalaSamr: string | null;
  tipoObjeto: string | null;
  categoriaVideo: string | null;
  descricao: string | null;
  objetivosAprendizagem: string | null;
  recursosPedagogicos: string | null;
  requisitosTecnicos: string | null;
  urlMetodologiaPdf: string | null;
  status: string | null;
  colecao: string | null;
  livro: string | null;
  envioEscola: string | null;
  blocoCapitulo: string | null;
  anoProducao: string | null;
  macroformato: string | null;
  palavrasChave: string | null;
  codigoBnccSecundaria: string | null;
  descricaoBnccSecundaria: string | null;
  tempoMedioEstimado: string | null;
  usuarioPrincipal: string | null;
  ambienteUso: string | null;
};

const TAG_COLORS: Record<string, string> = {
  'Língua Portuguesa': 'bg-blue-600',
  Matemática: 'bg-yellow-600',
  Ciências: 'bg-green-600',
  História: 'bg-purple-600',
  Geografia: 'bg-amber-600',
  Arte: 'bg-pink-600',
  Inglês: 'bg-indigo-600',
  'Educação Física': 'bg-lime-600',
};

export function cell(row: CategorizacaoRow, ...names: string[]): string {
  const keys = Object.keys(row);
  for (const name of names) {
    const exact = keys.find((k) => k.trim() === name);
    if (exact) {
      const value = row[exact];
      if (value !== null && value !== undefined && String(value).trim() !== '') {
        return String(value).trim();
      }
    }
  }
  const lowered = names.map((n) => n.trim().toLowerCase());
  for (const key of keys) {
    if (lowered.includes(key.trim().toLowerCase())) {
      const value = row[key];
      if (value !== null && value !== undefined && String(value).trim() !== '') {
        return String(value).trim();
      }
    }
  }
  return '';
}

export function shortLabel(value: string): string {
  if (!value) return '';
  const cut = value.split(':')[0].trim();
  return cut || value.trim();
}

const BNCC_CODE_RE = /\b((?:EI|EF|EM)\d{2}[A-Z]{2,4}\d{2,3}[A-Z0-9]*)\b/i;

export function extractBnccCode(value: string): string {
  if (!value) return '';
  const trimmed = value.trim();
  const beforePipe = trimmed.split('|')[0].trim();
  const match = beforePipe.match(BNCC_CODE_RE) || trimmed.match(BNCC_CODE_RE);
  if (match?.[1]) return match[1].toUpperCase();
  if (beforePipe && !/\s/.test(beforePipe) && beforePipe.length <= 16) {
    return beforePipe.toUpperCase();
  }
  return '';
}

export function extractBnccDescription(value: string, fallback = ''): string {
  if (fallback.trim()) return fallback.trim();
  if (!value) return '';
  const pipe = value.indexOf('|');
  if (pipe >= 0) return value.slice(pipe + 1).trim();
  const code = extractBnccCode(value);
  if (!code) return value.trim();
  return value
    .replace(new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '')
    .replace(/^[|\-–:\s]+/, '')
    .trim();
}

function padTime(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatExcelDuration(value: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/[a-zà-ú]/i.test(trimmed) && /min|hora|seg|\bh\b/i.test(trimmed)) return trimmed;
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) return trimmed;

  const n = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return trimmed || null;

  if (n > 0 && n < 24 && (n < 1 || trimmed.includes('.'))) {
    const totalSeconds = Math.round(n * 24 * 60 * 60);
    if (totalSeconds <= 0) return null;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}h ${padTime(m)}min`;
    if (m > 0) return `${m} min`;
    return `${s} s`;
  }

  return trimmed;
}

export function deriveSegmento(anoSerie: string): string | null {
  if (!anoSerie) return null;
  const a = anoSerie.trim().toUpperCase();
  if (/^G\d/.test(a) || a.includes('INFANTIL')) return 'EI';
  if (a.includes('MÉDIO') || a.includes('MEDIO') || /\bEM\b/.test(a)) return 'EM';
  const num = parseInt(a.replace(/[^\d]/g, ''), 10);
  if (!Number.isNaN(num) && num >= 1 && num <= 5) return 'AI';
  if (!Number.isNaN(num) && num >= 6 && num <= 9) return 'AF';
  return null;
}

function isAffirmative(value: string): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  if (
    /^n[aã]o\b/.test(v) ||
    ['n/a', 'na', '-', '0', 'false'].includes(v)
  ) {
    return false;
  }
  return true;
}

function jsonList(items: string[]): string | null {
  const clean = items.map((i) => i.trim()).filter(Boolean);
  return clean.length > 0 ? JSON.stringify(clean) : null;
}

export function buildDescricao(row: CategorizacaoRow): string | null {
  const complemento = cell(row, 'Complemento pedagógico manual');
  if (complemento) return complemento;
  const parts = [
    shortLabel(cell(row, 'Tipo principal')),
    cell(row, 'Natureza pedagógica'),
    cell(row, 'Finalidade pedagógica'),
    cell(row, 'Observação BNCC'),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join('. ') : null;
}

export function buildObjetivos(row: CategorizacaoRow): string | null {
  const items = [
    cell(row, 'Descrição habilidade BNCC principal'),
    cell(row, 'Descrição habilidade BNCC secundária'),
  ];
  const finalidade = cell(row, 'Finalidade pedagógica');
  if (finalidade && !items.some((i) => i.toLowerCase() === finalidade.toLowerCase())) {
    items.push(finalidade);
  }
  return jsonList(items);
}

export function buildRecursos(row: CategorizacaoRow): string | null {
  const items: string[] = [];
  const mecanica = cell(row, 'Mecânica principal');
  const usuario = cell(row, 'Usuário principal do recurso');
  const ambiente = cell(row, 'Ambiente de uso recomendado');
  const colecao = cell(row, 'Coleção');
  const livro = cell(row, 'Livro');
  const bloco = cell(row, 'Bloco/Capítulo');
  if (mecanica) items.push(mecanica);
  if (usuario) items.push(`Usuário: ${usuario}`);
  if (ambiente) items.push(`Ambiente: ${ambiente}`);
  const local = [colecao, livro, bloco].filter(Boolean).join(' · ');
  if (local) items.push(`Material: ${local}`);
  return jsonList(items);
}

export function buildRequisitos(row: CategorizacaoRow): string | null {
  const checks: Array<[string[], string]> = [
    [['Solicita identificação do aluno?'], 'Solicita identificação do aluno'],
    [['Solicita envio de resposta ou arquivo?'], 'Solicita envio de resposta ou arquivo'],
    [['Captura imagem ou voz do aluno?'], 'Captura imagem ou voz do aluno'],
    [['Usa histórico, perfil ou progresso individual?'], 'Usa histórico, perfil ou progresso individual'],
  ];
  const lines: string[] = [];

  const camera = cell(row, 'Precisa de câmera/microfone/sensor para funcionar?');
  if (/^n[aã]o\s+requer\b/i.test(camera)) {
    lines.push('Não requer câmera, microfone ou sensores');
  } else if (isAffirmative(camera)) {
    lines.push(/^sim$/i.test(camera) ? 'Requer câmera, microfone ou sensor' : camera);
  }

  for (const [names, label] of checks) {
    const value = cell(row, ...names);
    if (isAffirmative(value)) {
      lines.push(/^sim$/i.test(value) ? label : `${label}: ${value}`);
    }
  }

  const toque = cell(row, 'Usabilidade em tela menor/toque');
  if (/^alta:/i.test(toque)) {
    lines.push('Compatível com telas menores e interação por toque');
  } else if (/^m[eé]dia:/i.test(toque)) {
    lines.push('Compatibilidade parcial com telas menores e interação por toque');
  } else if (/^baixa:/i.test(toque)) {
    lines.push('Tela maior recomendada; controles por toque podem ser difíceis');
  } else if (/^cr[ií]tica:/i.test(toque)) {
    lines.push('Tela maior necessária; o uso em telas menores compromete a experiência');
  } else if (toque && !/^n[aã]o se aplica:/i.test(toque)) {
    lines.push(`Compatibilidade com telas menores e toque: ${toque}`);
  }

  const orientacao = cell(row, 'Orientação de tela mais adequada');
  if (/^paisagem:/i.test(orientacao)) {
    lines.push('Orientação recomendada: paisagem');
  } else if (/^retrato:/i.test(orientacao)) {
    lines.push('Orientação recomendada: retrato');
  } else if (/^tanto faz:/i.test(orientacao)) {
    lines.push('Compatível com as orientações retrato e paisagem');
  } else if (/^tela maior recomendada:/i.test(orientacao)) {
    if (!lines.some((line) => line.startsWith('Tela maior'))) {
      lines.push('Tela maior recomendada');
    }
  } else if (orientacao && !/^n[aã]o se aplica:/i.test(orientacao)) {
    lines.push(`Orientação de tela: ${orientacao}`);
  }

  const uniqueLines = [...new Set(lines)];
  return uniqueLines.length > 0 ? uniqueLines.join('\n') : null;
}

function normalizeKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function textLooksAudiovisual(value: string): boolean {
  const key = normalizeKey(value);
  return (
    key.includes('video') ||
    key.includes('playlist') ||
    key.includes('audio') ||
    key.includes('podcast')
  );
}

/** Códigos SAE/SPE de vídeo-aula: ..._VA1, ..._VA2 */
export function isVideoAulaCodigo(codigo: string): boolean {
  return /_VA\d+/i.test(codigo);
}

export function isAudiovisualRecord(
  macroformato: string | null,
  tipoPrincipal: string,
  codigoOda: string
): boolean {
  return (
    textLooksAudiovisual(macroformato || '') ||
    textLooksAudiovisual(tipoPrincipal) ||
    isVideoAulaCodigo(codigoOda)
  );
}

export function mapCategorizacaoRow(
  row: CategorizacaoRow,
  options: { metodologiaExists: (codigo: string) => boolean }
): MappedODA | null {
  const titulo = cell(row, 'Título do recurso');
  const codigoOda = cell(row, 'Código do recurso');
  if (!titulo || !codigoOda) return null;

  const componente = cell(row, 'Componente/campo de experiência');
  const anoSerie = cell(row, 'Ano/série');
  const tipoPrincipal = cell(row, 'Tipo principal');
  const tipoCurto = shortLabel(tipoPrincipal);
  const habilidadeRaw = cell(row, 'Habilidade BNCC principal');
  const codigoBncc = extractBnccCode(habilidadeRaw);
  const descricaoBncc = extractBnccDescription(
    habilidadeRaw,
    cell(row, 'Descrição habilidade BNCC principal')
  );
  const habilidadeSecRaw = cell(row, 'Habilidade BNCC secundária');
  const codigoBnccSecundaria = extractBnccCode(habilidadeSecRaw);
  const descricaoBnccSecundaria = extractBnccDescription(
    habilidadeSecRaw,
    cell(row, 'Descrição habilidade BNCC secundária')
  );
  const keywords = [
    cell(row, 'Palavra-chave 1'),
    cell(row, 'Palavra-chave 2'),
    cell(row, 'Palavra-chave 3'),
  ].filter(Boolean);

  const duracaoMidia = cell(row, 'Duração da mídia');
  const tempoMedio = cell(row, 'Tempo médio estimado');
  const macroformatoRaw = cell(row, 'Macroformato') || null;
  const isAudiovisual = isAudiovisualRecord(macroformatoRaw, tipoPrincipal, codigoOda);
  const macroformato =
    macroformatoRaw || (isAudiovisual && isVideoAulaCodigo(codigoOda) ? 'Vídeo' : null);
  const tipoResolvido = tipoCurto || macroformatoRaw || (isAudiovisual ? 'Vídeo' : null);

  return {
    codigoOda,
    titulo,
    componenteCurricular: componente || null,
    tags: componente ? JSON.stringify([componente]) : null,
    tagColor: TAG_COLORS[componente] || 'bg-gray-600',
    anoSerie: anoSerie || null,
    imagem: `/thumbs/${codigoOda.replace(/\.(webp|jpg|jpeg|png)$/i, '')}.webp`,
    linkRepositorio: cell(row, 'Link do recurso') || null,
    codigoBncc: codigoBncc || null,
    descricaoBncc: descricaoBncc || null,
    categoria: tipoResolvido,
    duracao: formatExcelDuration(duracaoMidia || tempoMedio),
    volume: cell(row, 'Volume') || null,
    segmento: deriveSegmento(anoSerie),
    marca: cell(row, 'Marca') || null,
    tipoConteudo: isAudiovisual ? 'Audiovisual' : 'OED',
    escalaSamr: cell(row, 'Escala SAMR') || null,
    tipoObjeto: tipoResolvido,
    categoriaVideo: isAudiovisual ? tipoResolvido || macroformato || 'Audiovisual' : null,
    descricao: buildDescricao(row),
    objetivosAprendizagem: buildObjetivos(row),
    recursosPedagogicos: buildRecursos(row),
    requisitosTecnicos: buildRequisitos(row),
    urlMetodologiaPdf: options.metodologiaExists(codigoOda) ? `/metodologia/${codigoOda}.pdf` : null,
    status: cell(row, 'Status do link') || null,
    colecao: cell(row, 'Coleção') || null,
    livro: cell(row, 'Livro') || null,
    envioEscola: cell(row, 'Envio para escola') || null,
    blocoCapitulo: cell(row, 'Bloco/Capítulo') || null,
    anoProducao: cell(row, 'Ano de produção') || null,
    macroformato,
    palavrasChave: jsonList(keywords),
    codigoBnccSecundaria: codigoBnccSecundaria || null,
    descricaoBnccSecundaria: descricaoBnccSecundaria || null,
    tempoMedioEstimado: formatExcelDuration(tempoMedio),
    usuarioPrincipal: cell(row, 'Usuário principal do recurso') || null,
    ambienteUso: cell(row, 'Ambiente de uso recomendado') || null,
  };
}
