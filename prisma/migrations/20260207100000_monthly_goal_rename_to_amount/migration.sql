-- AlterTable (only if column was created as targetRevenue; safe to run: no-op if amount already exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'MonthlyGoal' AND column_name = 'targetRevenue'
  ) THEN
    ALTER TABLE "MonthlyGoal" RENAME COLUMN "targetRevenue" TO "amount";
  END IF;
END $$;
