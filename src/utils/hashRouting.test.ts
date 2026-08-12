import { describe, it, expect } from 'vitest';
import { getInitialPageFromHash, getHashFromPage, type PageKey } from './hashRouting';

describe('hashRouting', () => {
  describe('getInitialPageFromHash', () => {
    it('retorna "login" para hash vazio ou # (entrada do Lançamento 1)', () => {
      expect(getInitialPageFromHash('')).toBe('login');
      expect(getInitialPageFromHash('#')).toBe('login');
      expect(getInitialPageFromHash('#/')).toBe('login');
    });

    it('redireciona a landing legada para o login', () => {
      expect(getInitialPageFromHash('#/home')).toBe('login');
      expect(getInitialPageFromHash('#home')).toBe('login');
    });

    it('mapeia hash para página correta', () => {
      expect(getInitialPageFromHash('#/acervo')).toBe('gallery');
      expect(getInitialPageFromHash('#acervo')).toBe('gallery');
      expect(getInitialPageFromHash('#/conta')).toBe('settings');
      expect(getInitialPageFromHash('#/favoritos')).toBe('favorites');
      expect(getInitialPageFromHash('#/login')).toBe('login');
      expect(getInitialPageFromHash('#/registro')).toBe('register');
      expect(getInitialPageFromHash('#/esqueci-senha')).toBe('forgot');
      expect(getInitialPageFromHash('#/redefinir-senha')).toBe('reset');
    });

    it('ignora query string ao mapear página', () => {
      expect(getInitialPageFromHash('#/redefinir-senha?token=abc123')).toBe('reset');
    });

    it('retorna "login" para hash desconhecido', () => {
      expect(getInitialPageFromHash('#/pagina-inexistente')).toBe('login');
    });
  });

  describe('getHashFromPage', () => {
    const cases: { page: PageKey; expected: string }[] = [
      { page: 'gallery', expected: '#/acervo' },
      { page: 'settings', expected: '#/conta' },
      { page: 'favorites', expected: '#/favoritos' },
      { page: 'login', expected: '#/login' },
      { page: 'register', expected: '#/registro' },
      { page: 'forgot', expected: '#/esqueci-senha' },
      { page: 'reset', expected: '#/redefinir-senha' },
    ];

    it('retorna hash correto para cada página', () => {
      cases.forEach(({ page, expected }) => {
        expect(getHashFromPage(page)).toBe(expected);
      });
    });
  });

  describe('round-trip', () => {
    it('getHashFromPage + getInitialPageFromHash restaura a página', () => {
      const pages: PageKey[] = ['gallery', 'settings', 'favorites', 'login', 'register', 'forgot', 'reset'];
      pages.forEach((page) => {
        const hash = getHashFromPage(page);
        const restored = getInitialPageFromHash(hash);
        expect(restored).toBe(page);
      });
    });
  });
});
