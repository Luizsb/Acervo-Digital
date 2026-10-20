import { describe, expect, it } from 'vitest';
import * as front from './thumbPaths';
import * as server from '../../server/lib/thumbPaths';

const { brandFromCode, thumbBrandFolder, thumbFileName, thumbPublicPath, thumbRelativePath } = front;

describe('brandFromCode', () => {
  it('código IMP é da Conquista, com ou sem barra no fim', () => {
    expect(brandFromCode('IMP/63/ALA19')).toBe('Conquista');
    expect(brandFromCode(' imp/63/ALA19/ ')).toBe('Conquista');
  });

  it('sem prefixo conhecido não deduz marca', () => {
    expect(brandFromCode('EF21_8_MAT_L1_U1_01_OD1')).toBeUndefined();
    expect(brandFromCode(null)).toBeUndefined();
    expect(brandFromCode('')).toBeUndefined();
  });
});

describe('thumbBrandFolder', () => {
  it('usa a marca em minúsculas, sem acento e sem espaço', () => {
    expect(thumbBrandFolder('SAE', 'EF21_8_MAT_L1_U1_01_OD1')).toBe('sae');
    expect(thumbBrandFolder('Conquista', 'IMP/61/ALA3')).toBe('conquista');
    expect(thumbBrandFolder(' conquista ', 'IMP/61/ALA3')).toBe('conquista');
    expect(thumbBrandFolder('Sistema Positivo Ensino', 'X1')).toBe('sistema-positivo-ensino');
    expect(thumbBrandFolder('Educação', 'X1')).toBe('educacao');
  });

  it('qualquer caixa da mesma marca cai na mesma pasta', () => {
    for (const marca of ['Conquista', 'conquista', 'CONQUISTA', 'CoNqUiStA', ' Conquista ']) {
      expect(thumbBrandFolder(marca, 'IMP/61/ALA3')).toBe('conquista');
    }
    expect(thumbBrandFolder('sae', 'X1')).toBe(thumbBrandFolder('SAE', 'X1'));
  });

  it('código IMP sem marca vai para a Conquista', () => {
    expect(thumbBrandFolder(null, 'IMP/63/ALA19/')).toBe('conquista');
    expect(thumbBrandFolder('', 'imp/63/ALA19')).toBe('conquista');
  });

  it('sem marca e sem prefixo conhecido vai para sem-marca', () => {
    expect(thumbBrandFolder(null, 'EF21_8_MAT_L1_U1_01_OD1')).toBe('sem-marca');
    expect(thumbBrandFolder('  ', 'SAE26_X')).toBe('sem-marca');
  });
});

describe('thumbFileName', () => {
  it('mantém o código comum', () => {
    expect(thumbFileName('EF21_8_ING_L2_U3_01_od1')).toBe('EF21_8_ING_L2_U3_01_od1.webp');
  });

  it('troca barras por _ e não deixa o arquivo sem nome', () => {
    expect(thumbFileName('IMP/61/ALA3')).toBe('IMP_61_ALA3.webp');
    expect(thumbFileName('IMP/63/ALA19/')).toBe('IMP_63_ALA19.webp');
    expect(thumbFileName('IMP/64/HLA10/index_.html')).toBe('IMP_64_HLA10_index_.html.webp');
  });

  it('remove extensão de imagem já presente no código', () => {
    expect(thumbFileName('CAPA_01.webp')).toBe('CAPA_01.webp');
    expect(thumbFileName('CAPA_01.PNG')).toBe('CAPA_01.webp');
  });
});

describe('thumbPublicPath', () => {
  it('monta o caminho público com a pasta da marca', () => {
    expect(thumbRelativePath('IMP/63/ALA19/', 'Conquista')).toBe('conquista/IMP_63_ALA19.webp');
    expect(thumbPublicPath('EF21_8_MAT_L1_U1_01_OD1', 'SAE')).toBe(
      '/thumbs/sae/EF21_8_MAT_L1_U1_01_OD1.webp'
    );
  });
});

describe('espelho do servidor', () => {
  it('server/lib/thumbPaths.ts dá o mesmo resultado', () => {
    const casos: [string, string | null][] = [
      ['EF21_8_MAT_L1_U1_01_OD1', 'SAE'],
      ['IMP/63/ALA19/', null],
      ['IMP/64/HLA10/index_.html', 'Conquista'],
      ['SAE26_X', ''],
      ['X1', 'Educação Infantil'],
    ];
    for (const [codigo, marca] of casos) {
      expect(server.thumbPublicPath(codigo, marca)).toBe(front.thumbPublicPath(codigo, marca));
      expect(server.brandFromCode(codigo)).toBe(front.brandFromCode(codigo));
    }
    expect(server.THUMB_FOLDER_WITHOUT_BRAND).toBe(front.THUMB_FOLDER_WITHOUT_BRAND);
  });
});
