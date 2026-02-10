-- AlterEnum
ALTER TYPE "ProviderTimelineEventType" ADD VALUE 'FILE';

-- AlterTable
ALTER TABLE "ProviderTimelineEvent" ADD COLUMN     "fileId" TEXT;

-- AddForeignKey
ALTER TABLE "ProviderTimelineEvent" ADD CONSTRAINT "ProviderTimelineEvent_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "ProviderFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
