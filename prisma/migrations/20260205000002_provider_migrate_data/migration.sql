-- Step 2: Migrate legacy order statuses to new values
-- Now safe because enum values were committed in previous migration

-- COMPLETED → CLOSED (order is done and paid)
UPDATE "ProviderOrder" SET "status" = 'CLOSED' WHERE "status" = 'COMPLETED';

-- PAID → CLOSED (same semantics)
UPDATE "ProviderOrder" SET "status" = 'CLOSED' WHERE "status" = 'PAID';

-- DELAYED → ISSUE (delivery problem)
UPDATE "ProviderOrder" SET "status" = 'ISSUE' WHERE "status" = 'DELAYED';
