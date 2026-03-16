-- CreateEnum
CREATE TYPE "ScanSessionEntityType" AS ENUM ('PROVIDER', 'ORDER', 'PAYMENT');

-- CreateEnum
CREATE TYPE "ScanSessionStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED');

-- CreateTable
CREATE TABLE "ScanSession" (
    "id" TEXT NOT NULL,
    "entityType" "ScanSessionEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "category" "ProviderFileCategory" NOT NULL,
    "documentName" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "status" "ScanSessionStatus" NOT NULL DEFAULT 'PENDING',
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScanSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScanSession_createdByUserId_idx" ON "ScanSession"("createdByUserId");

-- CreateIndex
CREATE INDEX "ScanSession_entityType_entityId_idx" ON "ScanSession"("entityType", "entityId");
