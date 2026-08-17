import fs from 'fs';
import path from 'path';
import BetterSqlite3 from 'better-sqlite3';

/** Habilidades de Educação Infantil (BNCC) ausentes em public/bncc.db. */
const EI_HABILIDADES: Record<string, string> = {
  EI01CG05:
    'Utilizar os movimentos de preensão, encaixe e lançamento, ampliando suas possibilidades de manuseio de diferentes materiais e objetos.',
  EI01ET03:
    'Explorar o ambiente pela ação e observação, manipulando, experimentando e fazendo descobertas.',
  EI01TS01: 'Explorar sons produzidos com o próprio corpo e com objetos do ambiente.',
  EI01TS03:
    'Explorar diferentes fontes sonoras e materiais para acompanhar brincadeiras cantadas, canções, músicas e melodias.',
  EI02CG05:
    'Deslocar seu corpo no espaço, orientando-se por noções como em frente, atrás, no alto, embaixo, dentro, fora etc., ao se envolver em brincadeiras e atividades de diferentes naturezas.',
  EI02ET03:
    'Compartilhar, com outras crianças, situações de cuidado de plantas e animais nos espaços da instituição e fora dela.',
  EI02ET04:
    'Identificar relações espaciais (dentro e fora, em cima, embaixo, acima, abaixo, ao lado de) e temporais (antes, durante e depois).',
  EI02ET05: 'Classificar objetos, considerando determinado atributo (tamanho, peso, cor, forma etc.).',
  EI03CG01:
    'Criar com o corpo formas diversificadas de expressão de sentimentos, sensações e emoções, tanto nas situações cotidianas quanto em brincadeiras e em práticas artísticas.',
  EI03CG02:
    'Demonstrar controle e adequação do uso de seu corpo em brincadeiras e jogos, escuta e reconto de histórias, atividades artísticas, entre outras possibilidades.',
  EI03CG03:
    'Criar movimentos, gestos, olhares e mímicas em brincadeiras, jogos e atividades artísticas com o objetivo de comunicar ideias, sentimentos e emoções.',
  EI03CG04: 'Adotar hábitos de autocuidado relacionados a higiene, alimentação, conforto e aparência.',
  EI03EF02: 'Inventar brincadeiras cantadas, poemas e canções, criando rimas, aliterações e ritmos.',
  EI03EF07:
    'Levantar hipóteses sobre temas, gêneros textuais e personagens, antes e durante a leitura/escuta de histórias.',
  EI03EF09:
    'Levantar hipóteses em relação à linguagem escrita, reconhecendo diferentes usos da escrita na sociedade.',
  EI03EO01:
    'Demonstrar empatia pelos outros, percebendo que as pessoas têm diferentes sentimentos, necessidades e maneiras de pensar e agir.',
  EI03EO02:
    'Agir de maneira independente, com confiança em suas capacidades, reconhecendo suas conquistas e limitações.',
  EI03EO03: 'Ampliar as relações interpessoais, desenvolvendo atitudes de participação e cooperação.',
  EI03EO06: 'Manifestar interesse e respeito por diferentes culturas e modos de vida.',
  EI03ET01: 'Estabelecer relações de comparação entre objetos, observando suas propriedades.',
  EI03ET02:
    'Observar e descrever mudanças em diferentes materiais, resultantes de ações sobre eles, em experimentos envolvendo fenômenos naturais e artificiais.',
  EI03ET04:
    'Registrar observações, manipulações e medidas, usando múltiplas linguagens (desenho, registro numérico, escrita, oralidade, digital etc.).',
  EI03ET05: 'Classificar objetos e figuras de acordo com suas semelhanças e diferenças.',
  EI03ET06:
    'Relatar fatos importantes sobre seu nascimento, desenvolvimento, a história dos seus familiares e da sua comunidade.',
  EI03ET07:
    'Relacionar números às suas respectivas quantidades e identificar o antes, o depois e o entre em uma sequência.',
  EI03TS01:
    'Utilizar sons produzidos por materiais, objetos e instrumentos musicais durante brincadeiras de faz de conta, encenações, criações musicais, festas.',
  EI03TS02:
    'Expressar-se livremente por meio de desenho, pintura, colagem, dobradura e escultura, criando produções bidimensionais e tridimensionais.',
  EI03TS03:
    'Reconhecer as qualidades do som (intensidade, duração, altura e timbre), utilizando-as em suas produções sonoras e ao ouvir músicas e sons.',
};

let sqliteCache: Map<string, string> | null = null;

export function looksTruncated(value?: string | null): boolean {
  return Boolean(value && /\.\.\.\s*$/.test(value.trim()));
}

function stripCodePrefix(value: string): string {
  return value.replace(/^\([^)]+\)\s*/, '').trim();
}

function findBnccDatabase(): string | null {
  const candidates = [
    path.join(process.cwd(), '..', 'public', 'bncc.db'),
    path.join(process.cwd(), 'public', 'bncc.db'),
    path.join(__dirname, '..', '..', 'public', 'bncc.db'),
    path.join(__dirname, '..', '..', '..', 'public', 'bncc.db'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function loadSqliteMap(): Map<string, string> {
  if (sqliteCache) return sqliteCache;
  sqliteCache = new Map(Object.entries(EI_HABILIDADES));
  const databasePath = findBnccDatabase();
  if (!databasePath) return sqliteCache;

  const database = new BetterSqlite3(databasePath, { readonly: true });
  try {
    const rows = database
      .prepare('SELECT codigo_bncc, habilidade FROM habilidades_bncc')
      .all() as Array<{ codigo_bncc?: string; habilidade?: string }>;
    for (const row of rows) {
      const codigo = String(row.codigo_bncc || '').trim().toUpperCase();
      const habilidade = stripCodePrefix(String(row.habilidade || ''));
      if (codigo && habilidade) sqliteCache.set(codigo, habilidade);
    }
  } finally {
    database.close();
  }
  return sqliteCache;
}

export function lookupBnccText(codigo?: string | null): string | null {
  if (!codigo) return null;
  return loadSqliteMap().get(codigo.trim().toUpperCase()) || null;
}

export function completeBnccText(codigo: string | null | undefined, current: string | null): string | null {
  const full = lookupBnccText(codigo);
  if (!full) return current;
  if (!current || looksTruncated(current)) return full;
  return current;
}

export function completeObjectiveList(
  json: string | null,
  candidates: Array<string | null | undefined>
): string | null {
  if (!json) return json;
  let items: string[];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return json;
    items = parsed.filter((item) => typeof item === 'string');
  } catch {
    return json;
  }

  const fullTexts = candidates
    .map((value) => (value || '').trim())
    .filter((value) => value.length > 0);

  const next = items.map((item) => {
    if (!looksTruncated(item)) return item;
    const prefix = item.replace(/\.\.\.\s*$/, '').trim();
    const match = fullTexts.find((text) => text.startsWith(prefix));
    return match || item;
  });

  return JSON.stringify(next);
}

