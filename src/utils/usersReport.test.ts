import { describe, expect, it } from 'vitest';
import { roleLabel, usersToCsv } from './usersReport';

describe('usersToCsv', () => {
  it('gera cabeçalho, perfis traduzidos e último acesso vazio quando não há', () => {
    const csv = usersToCsv([
      { email: 'admin@acervo.local', papel: 'admin', criadoEm: 'x', ultimoAcesso: null },
    ]);
    const [header, row] = csv.replace('\uFEFF', '').split('\r\n');
    expect(header).toBe('E-mail;Perfil;Criado em;Último acesso');
    expect(row).toBe('admin@acervo.local;Administrador;x;');
  });

  it('começa com BOM para o Excel reconhecer UTF-8', () => {
    expect(usersToCsv([]).startsWith('\uFEFF')).toBe(true);
  });

  it('neutraliza fórmula e escapa separador e aspas', () => {
    const csv = usersToCsv([
      { email: '=HYPERLINK("x")', papel: 'a;b', criadoEm: '', ultimoAcesso: null },
    ]);
    const row = csv.split('\r\n')[1];
    expect(row).toBe(`"'=HYPERLINK(""x"")";"a;b";;`);
  });
});

describe('roleLabel', () => {
  it('traduz os papéis conhecidos e mantém os outros', () => {
    expect(roleLabel('admin')).toBe('Administrador');
    expect(roleLabel('user')).toBe('Leitor');
    expect(roleLabel('editor')).toBe('editor');
  });
});
