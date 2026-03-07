-- AlterTable
ALTER TABLE "SdkInstallation" ADD COLUMN     "sdkVersion" TEXT,
ADD COLUMN     "environment" TEXT,
ADD COLUMN     "eventCount" INTEGER DEFAULT 0;
