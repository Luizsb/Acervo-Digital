import { describe, expect, it } from 'vitest';
import { getMarcaColor } from './curriculumColors';

describe('getMarcaColor', () => {
  it('Conquista e SAE têm cores diferentes', () => {
    expect(getMarcaColor('Conquista')).toBe('#e40657');
    expect(getMarcaColor('SAE')).toBe('#591d64');
  });

  it('sigla e nome completo dão a mesma cor, em qualquer caixa', () => {
    expect(getMarcaColor('CQT')).toBe(getMarcaColor('Conquista'));
    expect(getMarcaColor(' conquista ')).toBe('#e40657');
    expect(getMarcaColor('SAE Digital')).toBe('#591d64');
    expect(getMarcaColor('SPE')).toBe('#e94c26');
    expect(getMarcaColor('Sistema Positivo')).toBe('#e94c26');
  });

  it('marcas futuras já têm cor', () => {
    expect(getMarcaColor('COC')).toBe('#00963c');
    expect(getMarcaColor('Geekie')).toBe('#fd1747');
    expect(getMarcaColor('SAS')).toBe('#032066');
    expect(getMarcaColor('Nave')).toBe('#ee377d');
  });

  it('marca vazia ou desconhecida não tem cor', () => {
    expect(getMarcaColor(null)).toBeUndefined();
    expect(getMarcaColor('  ')).toBeUndefined();
    expect(getMarcaColor('Outra')).toBeUndefined();
  });
});
