-- AlterTable
ALTER TABLE "InvoiceItem" ALTER COLUMN "product" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SaleItem" ALTER COLUMN "product" DROP NOT NULL;
