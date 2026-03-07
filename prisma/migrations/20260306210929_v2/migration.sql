/*
  Warnings:

  - You are about to drop the column `companyDomain` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `companySize` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `enrichedAt` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `enrichmentSource` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `enrichmentStatus` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `jobTitle` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `priorityLevel` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `sourceId` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `sourceType` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `visitorId` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `eventSource` on the `LeadEvent` table. All the data in the column will be lost.
  - You are about to drop the column `scoreDelta` on the `LeadEvent` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `LeadEvent` table. All the data in the column will be lost.
  - You are about to drop the column `allowedDomains` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `publicKey` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AnonymousEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AutomationExecution` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AutomationRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LeadEnrichmentLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LeadSource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RevenueTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScoreRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VisitorSession` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `scope` on table `ApiKey` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "AutomationExecution" DROP CONSTRAINT "AutomationExecution_automationId_fkey";

-- DropForeignKey
ALTER TABLE "AutomationRule" DROP CONSTRAINT "AutomationRule_userId_fkey";

-- DropForeignKey
ALTER TABLE "LeadEnrichmentLog" DROP CONSTRAINT "LeadEnrichmentLog_leadId_fkey";

-- DropForeignKey
ALTER TABLE "LeadSource" DROP CONSTRAINT "LeadSource_userId_fkey";

-- DropForeignKey
ALTER TABLE "ScoreRule" DROP CONSTRAINT "ScoreRule_userId_fkey";

-- DropForeignKey
ALTER TABLE "VisitorSession" DROP CONSTRAINT "VisitorSession_leadId_fkey";

-- DropForeignKey
ALTER TABLE "VisitorSession" DROP CONSTRAINT "VisitorSession_userId_fkey";

-- DropIndex
DROP INDEX "Lead_enrichmentStatus_idx";

-- DropIndex
DROP INDEX "Lead_priorityLevel_idx";

-- DropIndex
DROP INDEX "Lead_sourceId_idx";

-- DropIndex
DROP INDEX "Lead_sourceType_idx";

-- DropIndex
DROP INDEX "Lead_userId_email_key";

-- DropIndex
DROP INDEX "Lead_userId_visitorId_idx";

-- DropIndex
DROP INDEX "Lead_visitorId_idx";

-- DropIndex
DROP INDEX "Lead_visitorId_key";

-- DropIndex
DROP INDEX "LeadEvent_eventSource_idx";

-- DropIndex
DROP INDEX "LeadEvent_sessionId_idx";

-- DropIndex
DROP INDEX "User_publicKey_key";

-- AlterTable
ALTER TABLE "ApiKey" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "scope" SET NOT NULL,
ALTER COLUMN "scope" SET DEFAULT 'ingest';

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "companyDomain",
DROP COLUMN "companyName",
DROP COLUMN "companySize",
DROP COLUMN "enrichedAt",
DROP COLUMN "enrichmentSource",
DROP COLUMN "enrichmentStatus",
DROP COLUMN "industry",
DROP COLUMN "jobTitle",
DROP COLUMN "priorityLevel",
DROP COLUMN "sourceId",
DROP COLUMN "sourceType",
DROP COLUMN "visitorId";

-- AlterTable
ALTER TABLE "LeadEvent" DROP COLUMN "eventSource",
DROP COLUMN "scoreDelta",
DROP COLUMN "sessionId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "allowedDomains",
DROP COLUMN "publicKey",
ALTER COLUMN "monthlyRevenueTarget" DROP NOT NULL,
ALTER COLUMN "monthlyRevenueTarget" DROP DEFAULT;

-- DropTable
DROP TABLE "AnonymousEvent";

-- DropTable
DROP TABLE "AutomationExecution";

-- DropTable
DROP TABLE "AutomationRule";

-- DropTable
DROP TABLE "LeadEnrichmentLog";

-- DropTable
DROP TABLE "LeadSource";

-- DropTable
DROP TABLE "RevenueTransaction";

-- DropTable
DROP TABLE "ScoreRule";

-- DropTable
DROP TABLE "VisitorSession";

-- CreateTable
CREATE TABLE "SdkConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SdkConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SdkConnection_apiKey_idx" ON "SdkConnection"("apiKey");

-- CreateIndex
CREATE INDEX "SdkConnection_userId_idx" ON "SdkConnection"("userId");

-- CreateIndex
CREATE INDEX "SdkConnection_domain_idx" ON "SdkConnection"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "SdkConnection_userId_domain_apiKey_key" ON "SdkConnection"("userId", "domain", "apiKey");

-- CreateIndex
CREATE INDEX "ApiKey_keyHash_idx" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_type_idx" ON "ApiKey"("type");
