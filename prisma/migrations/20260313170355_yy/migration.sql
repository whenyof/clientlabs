/*
  Warnings:

  - You are about to drop the column `category` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `product` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `tax` on the `Sale` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Sale_category_idx";

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "category",
DROP COLUMN "price",
DROP COLUMN "product",
DROP COLUMN "quantity",
DROP COLUMN "tax",
ALTER COLUMN "discount" DROP DEFAULT,
ALTER COLUMN "subtotal" DROP DEFAULT,
ALTER COLUMN "taxTotal" DROP DEFAULT;
