-- CreateTable
CREATE TABLE "bncc" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "habilidade" TEXT,
    "descricao" TEXT,
    "componente" TEXT,
    "ano" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bncc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bncc_codigo_key" ON "bncc"("codigo");

-- CreateIndex
CREATE INDEX "bncc_codigo_idx" ON "bncc"("codigo");

-- CreateIndex
CREATE INDEX "bncc_componente_idx" ON "bncc"("componente");

-- CreateIndex
CREATE INDEX "bncc_ano_idx" ON "bncc"("ano");

-- AddForeignKey (PostgreSQL: add FK to existing odas table)
ALTER TABLE "odas" ADD CONSTRAINT "odas_codigo_bncc_fkey" FOREIGN KEY ("codigo_bncc") REFERENCES "bncc"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;
