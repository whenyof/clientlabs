/*
  Warnings:

  - You are about to drop the column `linkedPaymentId` on the `ProviderOrder` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderId]` on the table `ProviderPayment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProviderTimelineEventType" AS ENUM ('ORDER', 'PAYMENT', 'NOTE', 'TASK');

-- AlterEnum
ALTER TYPE "ProviderOrderStatus" ADD VALUE 'PAID';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProviderOrderType" ADD VALUE 'ONE_TIME';
ALTER TYPE "ProviderOrderType" ADD VALUE 'RECURRING';

-- DropIndex
DROP INDEX "ProviderOrder_orderDate_idx";

-- AlterTable
ALTER TABLE "ProviderOrder" DROP COLUMN "linkedPaymentId",
ALTER COLUMN "orderDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ProviderPayment" ADD COLUMN     "method" TEXT,
ADD COLUMN     "orderId" TEXT;

-- DropEnum
DROP TYPE "ProviderType";

-- CreateTable
CREATE TABLE "ProviderTimelineEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "type" "ProviderTimelineEventType" NOT NULL,
    "noteId" TEXT,
    "orderId" TEXT,
    "paymentId" TEXT,
    "taskId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderTimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProviderTimelineEvent_providerId_idx" ON "ProviderTimelineEvent"("providerId");

-- CreateIndex
CREATE INDEX "ProviderTimelineEvent_userId_idx" ON "ProviderTimelineEvent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderPayment_orderId_key" ON "ProviderPayment"("orderId");

-- AddForeignKey
ALTER TABLE "ProviderPayment" ADD CONSTRAINT "ProviderPayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ProviderOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderTimelineEvent" ADD CONSTRAINT "ProviderTimelineEvent_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderTimelineEvent" ADD CONSTRAINT "ProviderTimelineEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderTimelineEvent" ADD CONSTRAINT "ProviderTimelineEvent_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "ProviderNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderTimelineEvent" ADD CONSTRAINT "ProviderTimelineEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ProviderOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderTimelineEvent" ADD CONSTRAINT "ProviderTimelineEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "ProviderPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderTimelineEvent" ADD CONSTRAINT "ProviderTimelineEvent_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ProviderTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
