-- CreateTable
CREATE TABLE "import_issues" (
    "id" SERIAL NOT NULL,
    "synced_at" TIMESTAMP(3) NOT NULL,
    "kind" TEXT NOT NULL,
    "linha" INTEGER NOT NULL,
    "codigo" TEXT,
    "titulo" TEXT,
    "status" TEXT,
    "link_repositorio" TEXT,
    "vigente" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "import_issues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "import_issues_kind_idx" ON "import_issues"("kind");

-- A leitura pelo admin no Supabase é liberada em scripts/supabase/rls.sql.
ALTER TABLE "import_issues" ENABLE ROW LEVEL SECURITY;
