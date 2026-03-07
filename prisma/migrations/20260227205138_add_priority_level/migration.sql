/*
  Warnings:

  - A unique constraint covering the columns `[publicKey]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `monthlyRevenueTarget` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "companyDomain" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "companySize" TEXT,
ADD COLUMN     "enrichedAt" TIMESTAMP(3),
ADD COLUMN     "enrichmentSource" TEXT,
ADD COLUMN     "enrichmentStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "priorityLevel" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "LeadEvent" ADD COLUMN     "eventSource" TEXT NOT NULL DEFAULT 'api',
ADD COLUMN     "scoreDelta" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "publicKey" TEXT,
ALTER COLUMN "monthlyRevenueTarget" SET NOT NULL,
ALTER COLUMN "monthlyRevenueTarget" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "LeadEnrichmentLog" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "rawResponse" JSONB,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "fieldsUpdated" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadEnrichmentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreRule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "scoreDelta" INTEGER NOT NULL,
    "label" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoreRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationRule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "triggerValue" JSONB NOT NULL,
    "conditions" JSONB NOT NULL DEFAULT '[]',
    "actions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationExecution" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadEnrichmentLog_leadId_idx" ON "LeadEnrichmentLog"("leadId");

-- CreateIndex
CREATE INDEX "LeadEnrichmentLog_userId_idx" ON "LeadEnrichmentLog"("userId");

-- CreateIndex
CREATE INDEX "LeadEnrichmentLog_createdAt_idx" ON "LeadEnrichmentLog"("createdAt");

-- CreateIndex
CREATE INDEX "ScoreRule_userId_idx" ON "ScoreRule"("userId");

-- CreateIndex
CREATE INDEX "ScoreRule_eventType_idx" ON "ScoreRule"("eventType");

-- CreateIndex
CREATE INDEX "ScoreRule_active_idx" ON "ScoreRule"("active");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreRule_userId_eventType_key" ON "ScoreRule"("userId", "eventType");

-- CreateIndex
CREATE INDEX "AutomationRule_userId_idx" ON "AutomationRule"("userId");

-- CreateIndex
CREATE INDEX "AutomationRule_isActive_idx" ON "AutomationRule"("isActive");

-- CreateIndex
CREATE INDEX "AutomationRule_triggerType_idx" ON "AutomationRule"("triggerType");

-- CreateIndex
CREATE INDEX "AutomationRule_userId_isActive_idx" ON "AutomationRule"("userId", "isActive");

-- CreateIndex
CREATE INDEX "AutomationExecution_automationId_idx" ON "AutomationExecution"("automationId");

-- CreateIndex
CREATE INDEX "AutomationExecution_leadId_idx" ON "AutomationExecution"("leadId");

-- CreateIndex
CREATE INDEX "AutomationExecution_executedAt_idx" ON "AutomationExecution"("executedAt");

-- CreateIndex
CREATE INDEX "AutomationExecution_automationId_leadId_idx" ON "AutomationExecution"("automationId", "leadId");

-- CreateIndex
CREATE INDEX "Lead_priorityLevel_idx" ON "Lead"("priorityLevel");

-- CreateIndex
CREATE INDEX "Lead_enrichmentStatus_idx" ON "Lead"("enrichmentStatus");

-- CreateIndex
CREATE INDEX "LeadEvent_eventSource_idx" ON "LeadEvent"("eventSource");

-- CreateIndex
CREATE UNIQUE INDEX "User_publicKey_key" ON "User"("publicKey");

-- AddForeignKey
ALTER TABLE "LeadEnrichmentLog" ADD CONSTRAINT "LeadEnrichmentLog_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreRule" ADD CONSTRAINT "ScoreRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationRule" ADD CONSTRAINT "AutomationRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationExecution" ADD CONSTRAINT "AutomationExecution_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "AutomationRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
