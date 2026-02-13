-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('CUSTOMER', 'VENDOR');

-- AlterTable: add type (default CUSTOMER) and providerId
ALTER TABLE "Invoice" ADD COLUMN "type" "InvoiceType" NOT NULL DEFAULT 'CUSTOMER';
ALTER TABLE "Invoice" ADD COLUMN "providerId" TEXT;

-- AlterTable: make clientId nullable (for vendor invoices)
ALTER TABLE "Invoice" ALTER COLUMN "clientId" DROP NOT NULL;

-- CreateIndex: unique (userId, saleId) to prevent duplicate invoices per sale
CREATE UNIQUE INDEX "Invoice_userId_saleId_key" ON "Invoice"("userId", "saleId");

-- CreateIndex: providerId for vendor invoice lookups
CREATE INDEX "Invoice_providerId_idx" ON "Invoice"("providerId");

-- AddForeignKey: providerId -> Provider
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
