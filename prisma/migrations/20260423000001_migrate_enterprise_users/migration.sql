-- Migrate existing ENTERPRISE users to BUSINESS
UPDATE "User" SET "plan" = 'BUSINESS' WHERE "plan" = 'ENTERPRISE';
