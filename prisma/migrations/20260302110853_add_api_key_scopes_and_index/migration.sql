/*
  Warnings:

  - You are about to drop the column `active` on the `ApiKey` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `ApiKey` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ApiKey` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[keyHash]` on the table `ApiKey` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `keyHash` to the `ApiKey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `ApiKey` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `ApiKey` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ApiKeyScope" AS ENUM ('ingest', 'read', 'admin');

-- DropIndex
DROP INDEX "ApiKey_active_idx";

-- DropIndex
DROP INDEX "ApiKey_key_idx";

-- DropIndex
DROP INDEX "ApiKey_key_key";

-- AlterTable
ALTER TABLE "ApiKey" DROP COLUMN "active",
DROP COLUMN "key",
DROP COLUMN "updatedAt",
ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "keyHash" TEXT NOT NULL,
ADD COLUMN     "revoked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scope" "ApiKeyScope" NOT NULL DEFAULT 'ingest',
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_expiryDate_idx" ON "ApiKey"("expiryDate");
