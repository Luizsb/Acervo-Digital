/**
 * Rotas por hash usadas na navegação da aplicação.
 * Exportado para permitir testes unitários.
 */
export type PageKey = "home" | "gallery" | "settings" | "favorites" | "login" | "register" | "forgot" | "reset";

const HASH_TO_PAGE: Record<string, PageKey> = {
  home: "home",
  acervo: "gallery",
  conta: "settings",
  favoritos: "favorites",
  login: "login",
  registro: "register",
  "esqueci-senha": "forgot",
  "redefinir-senha": "reset",
};

const PAGE_TO_PATH: Record<PageKey, string> = {
  home: "/",
  gallery: "/acervo",
  settings: "/conta",
  favorites: "/favoritos",
  login: "/login",
  register: "/registro",
  forgot: "/esqueci-senha",
  reset: "/redefinir-senha",
};

/**
 * Retorna a página atual a partir do hash da URL.
 * @param hashOverride - Se informado, usa este valor em vez de window.location.hash (útil para testes).
 */
export function getInitialPageFromHash(hashOverride?: string): PageKey {
  if (typeof window === "undefined") return "home";
  let raw = (hashOverride !== undefined ? hashOverride : window.location.hash)
    .replace(/^#?\/?|\/+$/g, "")
    .trim();
  const qIndex = raw.indexOf("?");
  if (qIndex !== -1) raw = raw.slice(0, qIndex).trim();
  const path = raw === "" ? "home" : raw;
  return HASH_TO_PAGE[path] ?? "home";
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
