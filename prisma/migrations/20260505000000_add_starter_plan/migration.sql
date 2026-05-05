-- Migration: Add STARTER plan tier
-- Replaces the FREE (0€) plan with STARTER (12,99€/mes)
-- Existing FREE users are migrated to STARTER; new users start on a 14-day PRO trial

-- Step 1: Add the STARTER value to the PlanType enum
ALTER TYPE "PlanType" ADD VALUE IF NOT EXISTS 'STARTER';

-- Step 2: Migrate existing FREE users to STARTER
-- (They will see the subscription prompt since they have no active Stripe subscription)
UPDATE "User" SET plan = 'STARTER' WHERE plan = 'FREE';

-- Step 3: Change the default for new rows
ALTER TABLE "User" ALTER COLUMN plan SET DEFAULT 'STARTER'::"PlanType";
