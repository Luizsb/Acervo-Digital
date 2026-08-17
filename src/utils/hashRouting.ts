/**
 * Rotas por hash usadas na navegação da aplicação.
 * Exportado para permitir testes unitários.
 */
export type PageKey = "gallery" | "settings" | "favorites" | "review" | "login" | "register" | "forgot" | "reset";

const HASH_TO_PAGE: Record<string, PageKey> = {
  acervo: "gallery",
  conta: "settings",
  favoritos: "favorites",
  revisao: "review",
  login: "login",
  registro: "register",
  "esqueci-senha": "forgot",
  "redefinir-senha": "reset",
};

const PAGE_TO_PATH: Record<PageKey, string> = {
  gallery: "/acervo",
  settings: "/conta",
  favorites: "/favoritos",
  review: "/revisao",
  login: "/login",
  register: "/registro",
  forgot: "/esqueci-senha",
  reset: "/redefinir-senha",
};

/** Prefixo das URLs compartilháveis de um recurso: #/recurso/<codigo>. */
const RESOURCE_SEGMENT = "recurso";

/** Normaliza o hash para o caminho sem "#", "/" nas pontas e sem query string. */
function normalizeHashPath(hashOverride?: string): string {
  if (hashOverride === undefined && typeof window === "undefined") return "";
  let raw = (hashOverride !== undefined ? hashOverride : window.location.hash)
    .replace(/^#?\/?|\/+$/g, "")
    .trim();
  const qIndex = raw.indexOf("?");
  if (qIndex !== -1) raw = raw.slice(0, qIndex).trim();
  return raw;
}

/**
 * Retorna a página atual a partir do hash da URL.
 * @param hashOverride - Se informado, usa este valor em vez de window.location.hash (útil para testes).
 */
export function getInitialPageFromHash(hashOverride?: string): PageKey {
  if (hashOverride === undefined && typeof window === "undefined") return "login";
  const raw = normalizeHashPath(hashOverride);
  if (raw === "") return "login";
  const [segment] = raw.split("/");
  // Um recurso é aberto sobre a galeria, então a página de fundo continua sendo o acervo.
  if (segment === RESOURCE_SEGMENT) return "gallery";
  return HASH_TO_PAGE[segment] ?? "login";
}

/** Código do recurso quando a URL aponta para #/recurso/<codigo>. */
export function getResourceCodeFromHash(hashOverride?: string): string | null {
  if (hashOverride === undefined && typeof window === "undefined") return null;
  const raw = normalizeHashPath(hashOverride);
  if (raw === "") return null;
  const [segment, ...rest] = raw.split("/");
  if (segment !== RESOURCE_SEGMENT) return null;
  const code = decodeURIComponent(rest.join("/")).trim();
  return code === "" ? null : code;
}

/** Hash compartilhável de um recurso (ex.: #/recurso/SAE26_AF73_HIS_C08_VA1). */
export function getHashForResource(codigo: string): string {
  return `#/${RESOURCE_SEGMENT}/${encodeURIComponent(codigo.trim())}`;
}

/**
 * Retorna o hash da URL para a página informada.
 */
export function getHashFromPage(page: PageKey, query?: Record<string, string>): string {
  const path = PAGE_TO_PATH[page];
  const base = path === "/" ? "#" : `#${path}`;
  if (query && Object.keys(query).length > 0) {
    const qs = new URLSearchParams(query).toString();
    return `${base}?${qs}`;
  }
  return base;
}

/** Extrai parâmetros da URL a partir do hash (ex.: #/redefinir-senha?token=xxx). */
export function getHashQueryParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const hash = window.location.hash.replace(/^#?\/?/, "");
  const qIndex = hash.indexOf("?");
  if (qIndex === -1) return {};
  return Object.fromEntries(new URLSearchParams(hash.slice(qIndex)));
}
