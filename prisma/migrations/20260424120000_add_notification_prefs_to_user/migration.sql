-- AlterTable: add notificationPrefs Json field to User model
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notificationPrefs" JSONB;
