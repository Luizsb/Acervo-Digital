-- AlterTable
ALTER TABLE "odas" ADD COLUMN "colecao" TEXT;
ALTER TABLE "odas" ADD COLUMN "livro" TEXT;
ALTER TABLE "odas" ADD COLUMN "envio_escola" TEXT;
ALTER TABLE "odas" ADD COLUMN "bloco_capitulo" TEXT;
ALTER TABLE "odas" ADD COLUMN "ano_producao" TEXT;
ALTER TABLE "odas" ADD COLUMN "macroformato" TEXT;
ALTER TABLE "odas" ADD COLUMN "palavras_chave" TEXT;
ALTER TABLE "odas" ADD COLUMN "codigo_bncc_secundaria" TEXT;
ALTER TABLE "odas" ADD COLUMN "descricao_bncc_secundaria" TEXT;
ALTER TABLE "odas" ADD COLUMN "tempo_medio_estimado" TEXT;
ALTER TABLE "odas" ADD COLUMN "usuario_principal" TEXT;
ALTER TABLE "odas" ADD COLUMN "ambiente_uso" TEXT;

-- CreateIndex
CREATE INDEX "odas_macroformato_idx" ON "odas"("macroformato");
