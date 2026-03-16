-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProviderOrderStatus" ADD VALUE 'PREPARED';
ALTER TYPE "ProviderOrderStatus" ADD VALUE 'SENT';

-- AlterTable
ALTER TABLE "ProviderOrder" ADD COLUMN     "emailBody" TEXT,
ADD COLUMN     "emailSubject" TEXT,
ADD COLUMN     "emailTo" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "orderNumber" TEXT,
ADD COLUMN     "templateId" TEXT;

-- AlterTable
ALTER TABLE "ProviderProduct" ADD COLUMN     "category" TEXT,
ADD COLUMN     "notes" TEXT;

-- CreateTable
CREATE TABLE "ProviderOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "codeSnapshot" TEXT NOT NULL,
    "nameSnapshot" TEXT NOT NULL,
    "unitSnapshot" TEXT,
    "unitPriceSnapshot" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderEmailTemplate" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderEmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProviderOrderItem_orderId_idx" ON "ProviderOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "ProviderOrderItem_productId_idx" ON "ProviderOrderItem"("productId");

-- CreateIndex
CREATE INDEX "ProviderEmailTemplate_providerId_idx" ON "ProviderEmailTemplate"("providerId");

-- CreateIndex
CREATE INDEX "ProviderEmailTemplate_userId_idx" ON "ProviderEmailTemplate"("userId");

-- CreateIndex
CREATE INDEX "ProviderEmailTemplate_isDefault_idx" ON "ProviderEmailTemplate"("isDefault");

-- CreateIndex
CREATE INDEX "ProviderOrder_templateId_idx" ON "ProviderOrder"("templateId");

-- AddForeignKey
ALTER TABLE "ProviderOrder" ADD CONSTRAINT "ProviderOrder_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ProviderEmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderOrderItem" ADD CONSTRAINT "ProviderOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ProviderOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderOrderItem" ADD CONSTRAINT "ProviderOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProviderProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderEmailTemplate" ADD CONSTRAINT "ProviderEmailTemplate_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderEmailTemplate" ADD CONSTRAINT "ProviderEmailTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
