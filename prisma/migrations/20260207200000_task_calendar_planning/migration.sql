-- Add optional planning window for calendar (startAt/endAt). Backward compatible.
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "startAt" TIMESTAMP(3);
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "endAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "Task_startAt_idx" ON "Task"("startAt");
CREATE INDEX IF NOT EXISTS "Task_endAt_idx" ON "Task"("endAt");
