/*
  Warnings:

  - The `type` column on the `ApiKey` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ApiKeyType" AS ENUM ('secret', 'public', 'webhook');

-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN     "domain" TEXT,
ALTER COLUMN "scope" DROP NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "ApiKeyType" NOT NULL DEFAULT 'secret';

-- CreateIndex
CREATE INDEX "ApiKey_domain_idx" ON "ApiKey"("domain");
