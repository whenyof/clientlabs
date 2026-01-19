/*
  Warnings:

  - The `sector` column on the `BusinessProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "BusinessProfile_sector_idx";

-- DropIndex
DROP INDEX "BusinessProfile_type_idx";

-- DropIndex
DROP INDEX "BusinessProfile_userId_idx";

-- AlterTable
ALTER TABLE "BusinessProfile" DROP COLUMN "sector",
ADD COLUMN     "sector" TEXT,
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;
