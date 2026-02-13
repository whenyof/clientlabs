-- CreateTable
CREATE TABLE "InvoiceReminderLog" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "ruleKey" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceReminderLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvoiceReminderLog_invoiceId_idx" ON "InvoiceReminderLog"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceReminderLog_sentAt_idx" ON "InvoiceReminderLog"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceReminderLog_invoiceId_ruleKey_key" ON "InvoiceReminderLog"("invoiceId", "ruleKey");

-- AddForeignKey
ALTER TABLE "InvoiceReminderLog" ADD CONSTRAINT "InvoiceReminderLog_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
