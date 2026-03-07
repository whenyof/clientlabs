-- AlterTable
ALTER TABLE "LeadEvent" ADD COLUMN     "sessionId" TEXT;

-- CreateIndex
CREATE INDEX "LeadEvent_sessionId_idx" ON "LeadEvent"("sessionId");
