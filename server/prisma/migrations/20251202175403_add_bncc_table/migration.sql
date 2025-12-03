-- CreateTable
CREATE TABLE "bncc" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "habilidade" TEXT,
    "descricao" TEXT,
    "componente" TEXT,
    "ano" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_odas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo_oda" TEXT,
    "titulo" TEXT NOT NULL,
    "componente_curricular" TEXT,
    "tags" TEXT,
    "tag_color" TEXT,
    "ano_serie" TEXT,
    "imagem" TEXT,
    "link_repositorio" TEXT,
    "codigo_bncc" TEXT,
    "descricao_bncc" TEXT,
    "categoria" TEXT,
    "duracao" TEXT,
    "volume" TEXT,
    "segmento" TEXT,
    "pagina" TEXT,
    "marca" TEXT,
    "tipo_conteudo" TEXT NOT NULL,
    "categoria_video" TEXT,
    "escala_samr" TEXT,
    "tipo_objeto" TEXT,
    "descricao" TEXT,
    "objetivos_aprendizagem" TEXT,
    "recursos_pedagogicos" TEXT,
    "requisitos_tecnicos" TEXT,
    "url_metodologia_pdf" TEXT,
    "status" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "odas_codigo_bncc_fkey" FOREIGN KEY ("codigo_bncc") REFERENCES "bncc" ("codigo") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_odas" ("ano_serie", "categoria", "categoria_video", "codigo_bncc", "codigo_oda", "componente_curricular", "created_at", "descricao", "descricao_bncc", "duracao", "escala_samr", "id", "imagem", "link_repositorio", "marca", "objetivos_aprendizagem", "pagina", "recursos_pedagogicos", "requisitos_tecnicos", "segmento", "status", "tag_color", "tags", "tipo_conteudo", "tipo_objeto", "titulo", "updated_at", "url_metodologia_pdf", "volume") SELECT "ano_serie", "categoria", "categoria_video", "codigo_bncc", "codigo_oda", "componente_curricular", "created_at", "descricao", "descricao_bncc", "duracao", "escala_samr", "id", "imagem", "link_repositorio", "marca", "objetivos_aprendizagem", "pagina", "recursos_pedagogicos", "requisitos_tecnicos", "segmento", "status", "tag_color", "tags", "tipo_conteudo", "tipo_objeto", "titulo", "updated_at", "url_metodologia_pdf", "volume" FROM "odas";
DROP TABLE "odas";
ALTER TABLE "new_odas" RENAME TO "odas";
CREATE UNIQUE INDEX "odas_codigo_oda_key" ON "odas"("codigo_oda");
CREATE INDEX "odas_tipo_conteudo_idx" ON "odas"("tipo_conteudo");
CREATE INDEX "odas_componente_curricular_idx" ON "odas"("componente_curricular");
CREATE INDEX "odas_ano_serie_idx" ON "odas"("ano_serie");
CREATE INDEX "odas_codigo_bncc_idx" ON "odas"("codigo_bncc");
CREATE INDEX "odas_marca_idx" ON "odas"("marca");
CREATE INDEX "odas_segmento_idx" ON "odas"("segmento");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "bncc_codigo_key" ON "bncc"("codigo");

-- CreateIndex
CREATE INDEX "bncc_codigo_idx" ON "bncc"("codigo");

-- CreateIndex
CREATE INDEX "bncc_componente_idx" ON "bncc"("componente");

-- CreateIndex
CREATE INDEX "bncc_ano_idx" ON "bncc"("ano");
