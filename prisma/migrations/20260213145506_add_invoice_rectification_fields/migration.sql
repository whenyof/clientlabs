-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "isRectification" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rectificationReason" TEXT,
ADD COLUMN     "rectifiesInvoiceId" TEXT;

-- CreateIndex
CREATE INDEX "Invoice_rectifiesInvoiceId_idx" ON "Invoice"("rectifiesInvoiceId");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_rectifiesInvoiceId_fkey" FOREIGN KEY ("rectifiesInvoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
