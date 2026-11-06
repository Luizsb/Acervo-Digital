/**
 * Carga de demonstração: o catálogo visível na galeria e a BNCC, sem nenhum dado de
 * pessoa. Serve para quem clona o repositório ver o Acervo funcionando sem a planilha.
 * O arquivo é gerado por `npm run db:exportar-demo` e só é versionado no repositório
 * corporativo (privado). Leitura e caminho do arquivo ficam em `demoCatalogFile.ts`.
 */
export interface DemoCatalog<Oda = Record<string, unknown>, Bncc = Record<string, unknown>> {
  geradoEm: string;
  criterio: string;
  bncc: Bncc[];
  odas: Oda[];
}

/** Campos que só fazem sentido no banco de origem. */
type SourceOnlyField = 'id' | 'createdAt' | 'updatedAt';
type SourceRow = Record<SourceOnlyField, unknown>;

export function withoutSourceFields<T extends SourceRow>(row: T): Omit<T, SourceOnlyField> {
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...data } = row;
  return data;
}

/** Recurso para a carga: sem id nem datas do banco de origem, e com os contadores zerados. */
export function toDemoOda<T extends SourceRow & { pageViewCount: number; openViewCount: number }>(
  row: T
): Omit<T, SourceOnlyField> {
  return { ...withoutSourceFields(row), pageViewCount: 0, openViewCount: 0 };
}
