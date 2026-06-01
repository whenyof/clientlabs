-- Migration: add-2fa-and-sessions
-- Applied manually (Neon dev environment, no migration history)
-- Date: 2026-06-01

-- AlterTable: add 2FA and login tracking fields to User
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "lastLoginIp" TEXT,
  ADD COLUMN IF NOT EXISTS "lastLoginUserAgent" TEXT,
  ADD COLUMN IF NOT EXISTS "twoFactorBackupCodes" TEXT[],
  ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT,
  ADD COLUMN IF NOT EXISTS "twoFactorVerifiedAt" TIMESTAMP(3);

-- CreateTable: TwoFactorChallenge
CREATE TABLE IF NOT EXISTS "TwoFactorChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TwoFactorChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SessionRevocation
CREATE TABLE IF NOT EXISTS "SessionRevocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "SessionRevocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TwoFactorChallenge_token_key" ON "TwoFactorChallenge"("token");
CREATE INDEX IF NOT EXISTS "TwoFactorChallenge_userId_idx" ON "TwoFactorChallenge"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "SessionRevocation_sessionToken_key" ON "SessionRevocation"("sessionToken");
CREATE INDEX IF NOT EXISTS "SessionRevocation_userId_idx" ON "SessionRevocation"("userId");
CREATE INDEX IF NOT EXISTS "SessionRevocation_sessionToken_idx" ON "SessionRevocation"("sessionToken");

-- AddForeignKey
ALTER TABLE "TwoFactorChallenge"
  ADD CONSTRAINT "TwoFactorChallenge_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SessionRevocation"
  ADD CONSTRAINT "SessionRevocation_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
