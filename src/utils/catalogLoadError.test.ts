import { describe, expect, it } from 'vitest';
import { classifyCatalogLoadError } from './catalogLoadError';

describe('classifyCatalogLoadError', () => {
  it('reconhece servidor fora do ar', () => {
    expect(classifyCatalogLoadError(new TypeError('Failed to fetch'))).toBe('backend-offline');
    expect(classifyCatalogLoadError(new Error('net::ERR_CONNECTION_REFUSED'))).toBe(
      'backend-offline'
    );
    const expressOffline = Object.assign(new Error('Não foi possível conectar'), {
      name: 'ConnectionError',
    });
    expect(classifyCatalogLoadError(expressOffline)).toBe('backend-offline');
    expect(classifyCatalogLoadError(new Error('TypeError: Failed to fetch'))).toBe(
      'backend-offline'
    );
  });

  it('reconhece sessão vencida', () => {
    expect(classifyCatalogLoadError(new Error('JWT expired'))).toBe('session');
    expect(classifyCatalogLoadError(new Error('Não autorizado'))).toBe('session');
  });

  it('reconhece o banco pausado do plano gratuito', () => {
    expect(classifyCatalogLoadError(new Error('Project is paused'))).toBe('paused');
    expect(classifyCatalogLoadError({ message: 'Service Unavailable', code: '540' })).toBe(
      'paused'
    );
  });

  it('trata o resto, inclusive o relógio adiantado que sobrou da nova tentativa, como indisponível', () => {
    expect(classifyCatalogLoadError(new Error('JWT issued at future'))).toBe('unavailable');
    expect(classifyCatalogLoadError(new Error('relation "odas" does not exist'))).toBe(
      'unavailable'
    );
    expect(classifyCatalogLoadError(null)).toBe('unavailable');
  });
});
