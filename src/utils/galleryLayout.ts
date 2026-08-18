/** Alinhado ao grid da galeria: 1 / sm:2 / lg:3 / xl:4 / 2xl:5 */
export const GALLERY_GRID_ROWS = 3;
export const GALLERY_LIST_PAGE_SIZE = 12;

export function galleryGridColumns(viewportWidth: number): number {
  if (viewportWidth >= 1536) return 5;
  if (viewportWidth >= 1280) return 4;
  if (viewportWidth >= 1024) return 3;
  if (viewportWidth >= 640) return 2;
  return 1;
}

export function galleryPageSize(
  viewMode: 'grid' | 'list',
  viewportWidth: number
): number {
  if (viewMode === 'list') return GALLERY_LIST_PAGE_SIZE;
  return galleryGridColumns(viewportWidth) * GALLERY_GRID_ROWS;
}

/** Visitas à ficha primeiro; empate pela abertura do recurso e depois pelo id mais novo. */
export function compareProjectsByPopularity(
  a: { id: number; pageViewCount?: number; openViewCount?: number },
  b: { id: number; pageViewCount?: number; openViewCount?: number }
): number {
  const page = (b.pageViewCount ?? 0) - (a.pageViewCount ?? 0);
  if (page !== 0) return page;
  const open = (b.openViewCount ?? 0) - (a.openViewCount ?? 0);
  if (open !== 0) return open;
  return b.id - a.id;
}
