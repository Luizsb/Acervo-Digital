-- CreateTable
CREATE TABLE "audit_events" (
    "id" SERIAL NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "actor" TEXT,
    "target" TEXT,
    "origin" TEXT NOT NULL,
    "ip" TEXT,
    "details" JSONB,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_events_occurred_at_idx" ON "audit_events"("occurred_at");

-- CreateIndex
CREATE INDEX "audit_events_action_occurred_at_idx" ON "audit_events"("action", "occurred_at");

-- Sem política de RLS: nenhum papel da Data API do Supabase lê ou escreve.
-- O dono da tabela (Prisma) e as funções SECURITY DEFINER continuam gravando.
ALTER TABLE "audit_events" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON TABLE "audit_events" FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON TABLE "audit_events" FROM authenticated';
  END IF;
END $$;

-- Mudança de papel na tabela de usuários do backend Express, por qualquer caminho.
CREATE OR REPLACE FUNCTION "audit_users_role_change"() RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW."role" IS DISTINCT FROM OLD."role" THEN
    INSERT INTO "audit_events" ("action", "actor", "target", "origin", "details")
    VALUES (
      'auth.role_changed',
      current_user,
      NEW."email",
      'banco',
      jsonb_build_object('de', OLD."role", 'para', NEW."role")
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "users_role_change_audit"
AFTER UPDATE OF "role" ON "users"
FOR EACH ROW EXECUTE FUNCTION "audit_users_role_change"();
