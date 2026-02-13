-- AlterTable Invoice: add pdfUrl and pdfGeneratedAt for stored PDF
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "pdfGeneratedAt" TIMESTAMP(3);
