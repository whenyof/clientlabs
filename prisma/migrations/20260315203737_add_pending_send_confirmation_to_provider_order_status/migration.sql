-- AlterEnum
ALTER TYPE "ProviderOrderStatus" ADD VALUE 'PENDING_SEND_CONFIRMATION';

-- AlterTable
ALTER TABLE "ProviderOrder" ADD COLUMN     "sentAt" TIMESTAMP(3);
