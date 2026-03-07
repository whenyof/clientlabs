-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN     "lastUsedIp" TEXT,
ADD COLUMN     "rateLimit" INTEGER,
ADD COLUMN     "rotationOf" TEXT;
