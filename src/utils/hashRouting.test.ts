import { describe, it, expect } from 'vitest';
import { getInitialPageFromHash, getHashFromPage, type PageKey } from './hashRouting';

describe('hashRouting', () => {
  describe('getInitialPageFromHash', () => {
    it('retorna "home" para hash vazio ou #', () => {
      expect(getInitialPageFromHash('')).toBe('home');
      expect(getInitialPageFromHash('#')).toBe('home');
      expect(getInitialPageFromHash('#/')).toBe('home');
    });

    it('mapeia hash para página correta', () => {
      expect(getInitialPageFromHash('#/acervo')).toBe('gallery');
      expect(getInitialPageFromHash('#acervo')).toBe('gallery');
      expect(getInitialPageFromHash('#/conta')).toBe('settings');
      expect(getInitialPageFromHash('#/favoritos')).toBe('favorites');
      expect(getInitialPageFromHash('#/login')).toBe('login');
      expect(getInitialPageFromHash('#/registro')).toBe('register');
    });

    it('retorna "home" para hash desconhecido', () => {
      expect(getInitialPageFromHash('#/pagina-inexistente')).toBe('home');
    });
  });

  describe('getHashFromPage', () => {
    const cases: { page: PageKey; expected: string }[] = [
      { page: 'home', expected: '#' },
      { page: 'gallery', expected: '#/acervo' },
      { page: 'settings', expected: '#/conta' },
      { page: 'favorites', expected: '#/favoritos' },
      { page: 'login', expected: '#/login' },
      { page: 'register', expected: '#/registro' },
    ];

    it('retorna hash correto para cada página', () => {
      cases.forEach(({ page, expected }) => {
        expect(getHashFromPage(page)).toBe(expected);
      });
    });
  });

  describe('round-trip', () => {
    it('getHashFromPage + getInitialPageFromHash restaura a página', () => {
      const pages: PageKey[] = ['home', 'gallery', 'settings', 'favorites', 'login', 'register'];
      pages.forEach((page) => {
        const hash = getHashFromPage(page);
        const restored = getInitialPageFromHash(hash);
        expect(restored).toBe(page);
      });
    });
  });
});
