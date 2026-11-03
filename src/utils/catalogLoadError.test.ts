import { describe, expect, it } from 'vitest';
import {
  catalogLoadMessage,
  classifyCatalogLoadError,
  loginConnectionMessage,
  type CatalogLoadErrorKind,
} from './catalogLoadError';

const KINDS: CatalogLoadErrorKind[] = ['backend-offline', 'session', 'unavailable', 'paused'];

describe('mensagens para quem usa o Acervo', () => {
  it('login sem conexão usa o texto simples', () => {
    expect(loginConnectionMessage(new TypeError('Failed to fetch'), false)).toBe(
      'Não foi possível conectar ao Acervo. Pode ser a internet ou o ambiente de teste. Tente de novo em alguns minutos. Se continuar, avise o time de Interações Digitais.'
    );
    expect(loginConnectionMessage(new Error('Invalid login credentials'), false)).toBeNull();
  });

  it('galeria com banco pausado fala em indisponibilidade temporária', () => {
    expect(catalogLoadMessage('paused', false).text).toBe(
      'O Acervo está temporariamente indisponível (ambiente de teste). Tente novamente ou avise o time de Interações Digitais.'
    );
  });

  it('nenhuma mensagem fora do modo local cita fornecedor ou plano', () => {
    const texts = [
      ...KINDS.flatMap((kind) => Object.values(catalogLoadMessage(kind, false))),
      loginConnectionMessage(new Error('Project is paused'), false) ?? '',
    ];
    for (const text of texts) {
      expect(text).not.toMatch(/supabase|plano gratuito/i);
    }
  });
});

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

  it('reconhece o banco pausado por falta de uso', () => {
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
