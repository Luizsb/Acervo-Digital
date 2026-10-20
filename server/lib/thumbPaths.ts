/**
 * Caminho público da capa de um recurso: /thumbs/{pasta da marca}/{arquivo}.webp.
 * Espelho de src/utils/thumbPaths.ts: mudanças de regra vão nos dois arquivos.
 */
export const THUMBS_PUBLIC_PREFIX = '/thumbs';
export const THUMB_FOLDER_WITHOUT_BRAND = 'sem-marca';

/** Códigos da Conquista começam com IMP/; na planilha, parte deles vem com a marca em branco. */
const BRAND_BY_CODE_PREFIX: { pattern: RegExp; folder: string }[] = [
  { pattern: /^IMP\//i, folder: 'conquista' },
];

function slug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Pasta da marca, sempre em minúsculas: o Windows não diferencia caixa e a Vercel
 * diferencia, então "Conquista" e "conquista" precisam cair na mesma pasta.
 */
export function thumbBrandFolder(marca: string | null | undefined, codigo: string): string {
  const fromBrand = slug(marca || '');
  if (fromBrand) return fromBrand;
  const byPrefix = BRAND_BY_CODE_PREFIX.find(({ pattern }) => pattern.test(codigo.trim()));
  return byPrefix?.folder ?? THUMB_FOLDER_WITHOUT_BRAND;
}

/**
 * Nome do arquivo a partir do código. Barras do código (IMP/63/ALA19/) não podem
 * virar subpasta nem deixar o arquivo sem nome (".webp").
 */
export function thumbFileName(codigo: string): string {
  const base = codigo
    .trim()
    .replace(/\.(webp|jpg|jpeg|png)$/i, '')
    .replace(/[^A-Za-z0-9._-]+/g, '_')
    .replace(/^[_.]+|[_.]+$/g, '');
  return `${base}.webp`;
}

/** Caminho relativo a public/thumbs, com "/" como separador. */
export function thumbRelativePath(codigo: string, marca: string | null | undefined): string {
  return `${thumbBrandFolder(marca, codigo)}/${thumbFileName(codigo)}`;
}

export function thumbPublicPath(codigo: string, marca: string | null | undefined): string {
  return `${THUMBS_PUBLIC_PREFIX}/${thumbRelativePath(codigo, marca)}`;
}
