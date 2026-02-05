-- Step 1: Add new enum values and create new enum type
-- Must be committed BEFORE data migration (PostgreSQL limitation)

-- Add new ProviderOrderStatus values
ALTER TYPE "ProviderOrderStatus" ADD VALUE IF NOT EXISTS 'DRAFT';
ALTER TYPE "ProviderOrderStatus" ADD VALUE IF NOT EXISTS 'ISSUE';
ALTER TYPE "ProviderOrderStatus" ADD VALUE IF NOT EXISTS 'CLOSED';

-- Create ProviderPaymentStatus enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProviderPaymentStatus') THEN
    CREATE TYPE "ProviderPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED');
  END IF;
END $$;

-- Add status column to ProviderPayment (default PAID for existing records)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ProviderPayment' AND column_name = 'status') THEN
    ALTER TABLE "ProviderPayment" ADD COLUMN "status" "ProviderPaymentStatus" NOT NULL DEFAULT 'PAID';
  END IF;
END $$;

-- Add orderId to ProviderFile for linking files to orders
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ProviderFile' AND column_name = 'orderId') THEN
    ALTER TABLE "ProviderFile" ADD COLUMN "orderId" TEXT;
    ALTER TABLE "ProviderFile" ADD CONSTRAINT "ProviderFile_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ProviderOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Add index on payment status
CREATE INDEX IF NOT EXISTS "ProviderPayment_status_idx" ON "ProviderPayment"("status");
