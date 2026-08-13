import { describe, expect, it } from 'vitest';
import { galleryGridColumns, galleryPageSize } from './galleryLayout';

describe('galleryPageSize', () => {
  it('preenche 3 linhas completas em cada breakpoint da grade', () => {
    expect(galleryPageSize('grid', 500)).toBe(3);
    expect(galleryPageSize('grid', 800)).toBe(6);
    expect(galleryPageSize('grid', 1100)).toBe(9);
    expect(galleryPageSize('grid', 1400)).toBe(12);
    expect(galleryPageSize('grid', 1600)).toBe(15);
  });

  it('usa 4 colunas em xl, não 5', () => {
    expect(galleryGridColumns(1440)).toBe(4);
    expect(galleryPageSize('grid', 1440)).toBe(12);
  });
});
