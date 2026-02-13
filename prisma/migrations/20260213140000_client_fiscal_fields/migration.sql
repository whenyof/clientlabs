-- AlterTable Client: add optional fiscal/legal fields for Spanish invoicing (non-destructive)
ALTER TABLE "Client" ADD COLUMN "legalType" TEXT;
ALTER TABLE "Client" ADD COLUMN "taxId" TEXT;
ALTER TABLE "Client" ADD COLUMN "address" TEXT;
ALTER TABLE "Client" ADD COLUMN "postalCode" TEXT;
ALTER TABLE "Client" ADD COLUMN "city" TEXT;
ALTER TABLE "Client" ADD COLUMN "country" TEXT;
ALTER TABLE "Client" ADD COLUMN "companyName" TEXT;
ALTER TABLE "Client" ADD COLUMN "legalName" TEXT;
