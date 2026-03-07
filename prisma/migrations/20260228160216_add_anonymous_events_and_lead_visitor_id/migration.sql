/*
  Warnings:

  - A unique constraint covering the columns `[visitorId]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "visitorId" TEXT;

-- CreateTable
CREATE TABLE "AnonymousEvent" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnonymousEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnonymousEvent_visitorId_idx" ON "AnonymousEvent"("visitorId");

-- CreateIndex
CREATE INDEX "AnonymousEvent_accountId_idx" ON "AnonymousEvent"("accountId");

-- CreateIndex
CREATE INDEX "AnonymousEvent_visitorId_accountId_idx" ON "AnonymousEvent"("visitorId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_visitorId_key" ON "Lead"("visitorId");

-- CreateIndex
CREATE INDEX "Lead_visitorId_idx" ON "Lead"("visitorId");
