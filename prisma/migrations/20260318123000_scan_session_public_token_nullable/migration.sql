-- Make ScanSession.publicToken nullable so we can invalidate it after upload.
-- This prevents token reuse/abuse while keeping desktop auth-based access working.

DO $$
BEGIN
  -- If the column exists, drop NOT NULL.
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ScanSession'
      AND column_name = 'publicToken'
  ) THEN
    BEGIN
      ALTER TABLE "ScanSession" ALTER COLUMN "publicToken" DROP NOT NULL;
    EXCEPTION
      WHEN others THEN
        -- Ignore if it was already nullable or constraint name differs.
        NULL;
    END;
  ELSE
    -- If it doesn't exist, add it as nullable.
    ALTER TABLE "ScanSession" ADD COLUMN "publicToken" TEXT;
  END IF;

  -- Ensure a unique index exists for publicToken (Postgres allows multiple NULLs).
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'ScanSession_publicToken_key'
  ) THEN
    CREATE UNIQUE INDEX "ScanSession_publicToken_key"
      ON "ScanSession"("publicToken");
  END IF;
END $$;

