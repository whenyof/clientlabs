-- Event: add receivedAt (server receipt time for clock skew / offline debugging)
ALTER TABLE "Event" ADD COLUMN "receivedAt" TIMESTAMP(3);
UPDATE "Event" SET "receivedAt" = "createdAt" WHERE "receivedAt" IS NULL;
ALTER TABLE "Event" ALTER COLUMN "receivedAt" SET NOT NULL;

-- Event: add composite index for analytics queries (userId + createdAt)
CREATE INDEX "Event_userId_createdAt_idx" ON "Event"("userId", "createdAt");

-- IngestSession: add durationSeconds (computed on update)
ALTER TABLE "IngestSession" ADD COLUMN "durationSeconds" INTEGER NOT NULL DEFAULT 0;

-- AnalyticsVisitor: change sessionsCount default to 0 (incremented when session is created)
ALTER TABLE "AnalyticsVisitor" ALTER COLUMN "sessionsCount" SET DEFAULT 0;
