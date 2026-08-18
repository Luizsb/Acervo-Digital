import { describe, expect, it } from 'vitest';
import { galleryGridColumns, galleryPageSize, compareProjectsByPopularity } from './galleryLayout';

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

describe('compareProjectsByPopularity', () => {
  it('coloca mais visitas à ficha na frente', () => {
    const ranked = [
      { id: 1, pageViewCount: 2, openViewCount: 10 },
      { id: 2, pageViewCount: 8, openViewCount: 0 },
      { id: 3, pageViewCount: 8, openViewCount: 4 },
    ].sort(compareProjectsByPopularity);
    expect(ranked.map((item) => item.id)).toEqual([3, 2, 1]);
  });

  it('no empate de visitas, usa o id mais novo', () => {
    const ranked = [
      { id: 10, pageViewCount: 0, openViewCount: 0 },
      { id: 40, pageViewCount: 0, openViewCount: 0 },
    ].sort(compareProjectsByPopularity);
    expect(ranked.map((item) => item.id)).toEqual([40, 10]);
  });
});
