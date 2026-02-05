-- Add paymentId to ProviderFile for linking files to payments
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ProviderFile' AND column_name = 'paymentId') THEN
    ALTER TABLE "ProviderFile" ADD COLUMN "paymentId" TEXT;
    ALTER TABLE "ProviderFile" ADD CONSTRAINT "ProviderFile_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "ProviderPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS "ProviderFile_orderId_idx" ON "ProviderFile"("orderId");
CREATE INDEX IF NOT EXISTS "ProviderFile_paymentId_idx" ON "ProviderFile"("paymentId");
