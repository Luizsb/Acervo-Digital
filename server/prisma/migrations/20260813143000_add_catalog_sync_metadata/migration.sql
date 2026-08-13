ALTER TABLE "odas"
ADD COLUMN "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "fonte_importacao" TEXT,
ADD COLUMN "hash_fonte" TEXT,
ADD COLUMN "sincronizado_em" TIMESTAMP(3);

UPDATE "odas"
SET
  "fonte_importacao" = 'planilha-categorizacao',
  "sincronizado_em" = CURRENT_TIMESTAMP;

CREATE INDEX "odas_ativo_idx" ON "odas"("ativo");
