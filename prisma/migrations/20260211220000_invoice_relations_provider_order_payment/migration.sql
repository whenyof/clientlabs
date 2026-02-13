-- AlterTable Invoice: add optional relations providerOrderId, providerPaymentId, linkedInvoicePaymentId
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "providerOrderId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "providerPaymentId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "linkedInvoicePaymentId" TEXT;

-- Unique constraints for one-to-one relations
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_providerOrderId_key" ON "Invoice"("providerOrderId");
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_providerPaymentId_key" ON "Invoice"("providerPaymentId");
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_linkedInvoicePaymentId_key" ON "Invoice"("linkedInvoicePaymentId");

-- Indexes for lookups
CREATE INDEX IF NOT EXISTS "Invoice_providerOrderId_idx" ON "Invoice"("providerOrderId");
CREATE INDEX IF NOT EXISTS "Invoice_providerPaymentId_idx" ON "Invoice"("providerPaymentId");

-- Foreign keys
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_providerOrderId_fkey";
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_providerOrderId_fkey" FOREIGN KEY ("providerOrderId") REFERENCES "ProviderOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_providerPaymentId_fkey";
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_providerPaymentId_fkey" FOREIGN KEY ("providerPaymentId") REFERENCES "ProviderPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_linkedInvoicePaymentId_fkey";
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_linkedInvoicePaymentId_fkey" FOREIGN KEY ("linkedInvoicePaymentId") REFERENCES "InvoicePayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
