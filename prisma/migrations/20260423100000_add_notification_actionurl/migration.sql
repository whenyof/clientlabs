-- Add actionUrl to Notification model
-- Change @id to cuid default (safe: existing rows keep their IDs)
-- Rename table to "notifications" via @@map

ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "actionUrl" TEXT;
ALTER TABLE "Notification" RENAME TO "notifications";

-- Update indexes: drop old, create new compound ones
DROP INDEX IF EXISTS "Notification_createdAt_idx";
DROP INDEX IF EXISTS "Notification_read_idx";
DROP INDEX IF EXISTS "Notification_userId_idx";

CREATE INDEX IF NOT EXISTS "notifications_userId_read_idx" ON "notifications"("userId", "read");
CREATE INDEX IF NOT EXISTS "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");
