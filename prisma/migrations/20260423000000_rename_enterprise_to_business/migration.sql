-- Rename ENTERPRISE to BUSINESS in PlanType enum
-- ADD VALUE must be committed before it can be used (PostgreSQL restriction).
-- The UPDATE runs in a separate migration to work around this.
ALTER TYPE "PlanType" ADD VALUE IF NOT EXISTS 'BUSINESS';
