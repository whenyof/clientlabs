-- AlterTable Invoice: add legal snapshot fields and issuedAt
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "issuedCompanySnapshot" JSONB;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "issuedClientSnapshot" JSONB;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "issuedItemsSnapshot" JSONB;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "issuedTotalsSnapshot" JSONB;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "issuedAt" TIMESTAMP(3);
