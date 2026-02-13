-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN "paymentMethod" TEXT,
ADD COLUMN "iban" TEXT,
ADD COLUMN "bic" TEXT,
ADD COLUMN "paymentReference" TEXT;
