ALTER TABLE "odas"
ADD COLUMN "page_view_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "open_view_count" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "oda_view_events" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "oda_id" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "viewed_on" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oda_view_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "oda_view_events_user_id_oda_id_kind_viewed_on_key" ON "oda_view_events"("user_id", "oda_id", "kind", "viewed_on");
CREATE INDEX "oda_view_events_oda_id_kind_viewed_on_idx" ON "oda_view_events"("oda_id", "kind", "viewed_on");
CREATE INDEX "oda_view_events_kind_viewed_on_idx" ON "oda_view_events"("kind", "viewed_on");

ALTER TABLE "oda_view_events" ADD CONSTRAINT "oda_view_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "oda_view_events" ADD CONSTRAINT "oda_view_events_oda_id_fkey" FOREIGN KEY ("oda_id") REFERENCES "odas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
