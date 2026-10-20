import { describe, expect, it } from 'vitest';
import { roleFromUser } from './supabaseApi';

describe('roleFromUser', () => {
  it('reconhece admin em app_metadata', () => {
    expect(roleFromUser({ app_metadata: { role: 'admin' } })).toBe('admin');
  });

  it('ignora role em user_metadata, que o próprio usuário pode editar', () => {
    const user = { user_metadata: { role: 'admin' }, app_metadata: {} };
    expect(roleFromUser(user)).toBe('user');
  });

  it('trata usuário sem metadados como user', () => {
    expect(roleFromUser({})).toBe('user');
  });
});
