-- CreateTable
CREATE TABLE "oda_view_daily" (
    "oda_id" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "viewed_on" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "oda_view_daily_pkey" PRIMARY KEY ("oda_id","kind","viewed_on")
);

-- CreateIndex
CREATE INDEX "oda_view_daily_kind_viewed_on_idx" ON "oda_view_daily"("kind", "viewed_on");

-- AddForeignKey
ALTER TABLE "oda_view_daily" ADD CONSTRAINT "oda_view_daily_oda_id_fkey" FOREIGN KEY ("oda_id") REFERENCES "odas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Totais diários a partir do histórico individual: Express (oda_view_events) e Supabase
-- (auth_view_events, criada pelo rls.sql e ausente no Postgres local).
INSERT INTO "oda_view_daily" ("oda_id", "kind", "viewed_on", "count")
SELECT "oda_id", "kind", "viewed_on", COUNT(*)::int
FROM "oda_view_events"
GROUP BY "oda_id", "kind", "viewed_on"
ON CONFLICT ("oda_id", "kind", "viewed_on")
DO UPDATE SET "count" = "oda_view_daily"."count" + EXCLUDED."count";

DO $$
BEGIN
  IF to_regclass('public.auth_view_events') IS NOT NULL THEN
    EXECUTE '
      INSERT INTO "oda_view_daily" ("oda_id", "kind", "viewed_on", "count")
      SELECT oda_id, kind, viewed_on, COUNT(*)::int
      FROM public.auth_view_events
      GROUP BY oda_id, kind, viewed_on
      ON CONFLICT ("oda_id", "kind", "viewed_on")
      DO UPDATE SET "count" = "oda_view_daily"."count" + EXCLUDED."count"';
  END IF;
END $$;

-- O registro individual só serve para contar uma visita por pessoa por dia: o de dias
-- anteriores é apagado (decisão de 2026-11-04, alinhada ao mapeamento da DPO).
DELETE FROM "oda_view_events"
WHERE "viewed_on" < (timezone('America/Sao_Paulo', now()))::date;

DO $$
BEGIN
  IF to_regclass('public.auth_view_events') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.auth_view_events
             WHERE viewed_on < (timezone(''America/Sao_Paulo'', now()))::date';
  END IF;
END $$;

-- Sem acesso direto pela Data API do Supabase: o ranking do admin usa uma função.
ALTER TABLE "oda_view_daily" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON TABLE "oda_view_daily" FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON TABLE "oda_view_daily" FROM authenticated';
  END IF;
END $$;
