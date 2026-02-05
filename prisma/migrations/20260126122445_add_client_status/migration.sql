-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "Client_status_idx" ON "Client"("status");
