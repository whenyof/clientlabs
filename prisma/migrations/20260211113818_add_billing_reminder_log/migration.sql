-- CreateEnum
CREATE TYPE "BillingReminderType" AS ENUM ('BEFORE', 'AFTER');

-- CreateTable
CREATE TABLE "BillingReminderLog" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "type" "BillingReminderType" NOT NULL,
    "stage" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingReminderLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BillingReminderLog_invoiceId_idx" ON "BillingReminderLog"("invoiceId");

-- CreateIndex
CREATE INDEX "BillingReminderLog_sentAt_idx" ON "BillingReminderLog"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "BillingReminderLog_invoiceId_stage_key" ON "BillingReminderLog"("invoiceId", "stage");

-- AddForeignKey
ALTER TABLE "BillingReminderLog" ADD CONSTRAINT "BillingReminderLog_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "BillingInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
