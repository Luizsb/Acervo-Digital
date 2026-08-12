-- CreateTable
CREATE TABLE "audiovisual" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT,
    "marca" TEXT,
    "segmento" TEXT,
    "ano_serie_modulo" TEXT,
    "volume" TEXT,
    "componente" TEXT,
    "capitulo" TEXT,
    "nome_capitulo" TEXT,
    "categoria_video" TEXT,
    "vestibular" TEXT,
    "enunciado" TEXT,
    "link" TEXT,
    "imagem" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audiovisual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "reset_token" TEXT,
    "reset_token_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_favorites" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "audiovisual_codigo_key" ON "audiovisual"("codigo");

-- CreateIndex
CREATE INDEX "audiovisual_marca_idx" ON "audiovisual"("marca");

-- CreateIndex
CREATE INDEX "audiovisual_segmento_idx" ON "audiovisual"("segmento");

-- CreateIndex
CREATE INDEX "audiovisual_ano_serie_modulo_idx" ON "audiovisual"("ano_serie_modulo");

-- CreateIndex
CREATE INDEX "audiovisual_componente_idx" ON "audiovisual"("componente");

-- CreateIndex
CREATE INDEX "audiovisual_volume_idx" ON "audiovisual"("volume");

-- CreateIndex
CREATE INDEX "audiovisual_categoria_video_idx" ON "audiovisual"("categoria_video");

-- CreateIndex
CREATE INDEX "audiovisual_vestibular_idx" ON "audiovisual"("vestibular");

-- CreateIndex
CREATE INDEX "audiovisual_capitulo_idx" ON "audiovisual"("capitulo");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_favorites_user_id_project_id_key" ON "user_favorites"("user_id", "project_id");

-- CreateIndex
CREATE INDEX "user_favorites_user_id_idx" ON "user_favorites"("user_id");

-- AddForeignKey
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
