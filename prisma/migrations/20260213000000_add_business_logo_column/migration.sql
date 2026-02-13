-- Add logoUrl to BusinessProfile if missing (safe for already-migrated DBs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'BusinessProfile' AND column_name = 'logoUrl'
  ) THEN
    ALTER TABLE "BusinessProfile" ADD COLUMN "logoUrl" TEXT;
  END IF;
END $$;
