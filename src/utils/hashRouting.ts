/**
 * Rotas por hash usadas na navegação da aplicação.
 * Exportado para permitir testes unitários.
 */
export type PageKey = "home" | "gallery" | "settings" | "favorites" | "login" | "register";

const HASH_TO_PAGE: Record<string, PageKey> = {
  home: "home",
  acervo: "gallery",
  conta: "settings",
  favoritos: "favorites",
  login: "login",
  registro: "register",
};

const PAGE_TO_PATH: Record<PageKey, string> = {
  home: "/",
  gallery: "/acervo",
  settings: "/conta",
  favorites: "/favoritos",
  login: "/login",
  register: "/registro",
};

/**
 * Retorna a página atual a partir do hash da URL.
 * @param hashOverride - Se informado, usa este valor em vez de window.location.hash (útil para testes).
 */
export function getInitialPageFromHash(hashOverride?: string): PageKey {
  if (typeof window === "undefined") return "home";
  const raw = (hashOverride !== undefined ? hashOverride : window.location.hash)
    .replace(/^#?\/?|\/+$/g, "")
    .trim();
  const path = raw === "" ? "home" : raw;
  return HASH_TO_PAGE[path] ?? "home";
}

/**
 * Retorna o hash da URL para a página informada.
 */
export function getHashFromPage(page: PageKey): string {
  const path = PAGE_TO_PATH[page];
  return path === "/" ? "#" : `#${path}`;
}
