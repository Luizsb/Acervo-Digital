-- CreateTable
CREATE TABLE "import_events" (
    "id" SERIAL NOT NULL,
    "synced_at" TIMESTAMP(3) NOT NULL,
    "codigo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "imagem" TEXT,
    "status" TEXT,

    CONSTRAINT "import_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "import_events_synced_at_idx" ON "import_events"("synced_at");

-- CreateIndex
CREATE INDEX "import_events_kind_idx" ON "import_events"("kind");
