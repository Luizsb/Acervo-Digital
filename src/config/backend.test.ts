import { describe, it, expect } from 'vitest';
import { parseBackendTarget } from './backend';

describe('parseBackendTarget', () => {
  it('usa Express quando a variável está vazia (local e EC2 atuais)', () => {
    expect(parseBackendTarget(undefined)).toBe('ec2');
    expect(parseBackendTarget('')).toBe('ec2');
    expect(parseBackendTarget('  ')).toBe('ec2');
  });

  it('aceita os dois alvos e o alias express', () => {
    expect(parseBackendTarget('ec2')).toBe('ec2');
    expect(parseBackendTarget('Express')).toBe('ec2');
    expect(parseBackendTarget('supabase')).toBe('supabase');
  });

  it('recusa valor desconhecido para não publicar um alvo silencioso', () => {
    expect(() => parseBackendTarget('firebase')).toThrow(/VITE_BACKEND/);
  });
});
