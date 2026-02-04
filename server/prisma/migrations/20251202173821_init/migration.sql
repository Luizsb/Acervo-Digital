-- CreateTable
CREATE TABLE "odas" (
    "id" SERIAL NOT NULL,
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "odas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "odas_codigo_oda_key" ON "odas"("codigo_oda");

-- CreateIndex
CREATE INDEX "odas_tipo_conteudo_idx" ON "odas"("tipo_conteudo");

-- CreateIndex
CREATE INDEX "odas_componente_curricular_idx" ON "odas"("componente_curricular");

-- CreateIndex
CREATE INDEX "odas_ano_serie_idx" ON "odas"("ano_serie");

-- CreateIndex
CREATE INDEX "odas_codigo_bncc_idx" ON "odas"("codigo_bncc");

-- CreateIndex
CREATE INDEX "odas_marca_idx" ON "odas"("marca");

-- CreateIndex
CREATE INDEX "odas_segmento_idx" ON "odas"("segmento");
