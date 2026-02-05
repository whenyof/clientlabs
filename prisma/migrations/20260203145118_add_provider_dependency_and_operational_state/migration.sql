-- CreateEnum
CREATE TYPE "ProviderContactType" AS ENUM ('EMAIL', 'CALL', 'REMINDER', 'CALENDAR', 'EXTERNAL_LINK');

-- CreateEnum
CREATE TYPE "ProviderFileCategory" AS ENUM ('INVOICE', 'ORDER', 'CONTRACT', 'OTHER');

-- CreateEnum
CREATE TYPE "ProviderStatus" AS ENUM ('ACTIVE', 'PAUSED', 'BLOCKED', 'OK', 'PENDING', 'ISSUE');

-- CreateEnum
CREATE TYPE "ProviderDependency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ProviderOperationalState" AS ENUM ('OK', 'ATTENTION', 'RISK');

-- CreateEnum
CREATE TYPE "ProviderOrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED', 'RECEIVED', 'DELAYED');

-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('SERVICE', 'PRODUCT', 'SOFTWARE', 'OTHER');

-- CreateEnum
CREATE TYPE "ProviderOrderType" AS ENUM ('MATERIAL', 'SERVICE', 'SUBSCRIPTION', 'ONE_OFF');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "clientTraits" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "riskLevel" TEXT DEFAULT 'LOW';

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "status" "ProviderStatus" NOT NULL DEFAULT 'ACTIVE',
    "dependencyLevel" "ProviderDependency" NOT NULL DEFAULT 'LOW',
    "operationalState" "ProviderOperationalState" NOT NULL DEFAULT 'OK',
    "monthlyCost" DOUBLE PRECISION,
    "monthlyBudgetLimit" DOUBLE PRECISION,
    "lastOrderDate" TIMESTAMP(3),
    "averageOrderFrequency" INTEGER,
    "estimatedConsumptionRate" DOUBLE PRECISION,
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "website" TEXT,
    "notes" TEXT,
    "reminderInterval" INTEGER,
    "lastReminderDate" TIMESTAMP(3),
    "emailTemplates" TEXT,
    "autoCreateTaskOnRisk" BOOLEAN NOT NULL DEFAULT false,
    "autoNotifyBeforeRestock" INTEGER,
    "autoSuggestOrder" BOOLEAN NOT NULL DEFAULT false,
    "aiInsightsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "ignoredInsightIds" TEXT DEFAULT '',
    "affectedArea" TEXT,
    "hasAlternative" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderFile" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" "ProviderFileCategory" NOT NULL,
    "group" TEXT,
    "notes" TEXT,
    "size" INTEGER,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderPayment" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "concept" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderTask" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderNote" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderContactLog" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contactType" "ProviderContactType" NOT NULL,
    "subject" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderContactLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderOrder" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "ProviderOrderStatus" NOT NULL DEFAULT 'PENDING',
    "orderDate" TIMESTAMP(3) NOT NULL,
    "expectedDeliveryDate" TIMESTAMP(3),
    "type" "ProviderOrderType" NOT NULL DEFAULT 'ONE_OFF',
    "description" TEXT,
    "linkedPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProviderToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Provider_userId_idx" ON "Provider"("userId");

-- CreateIndex
CREATE INDEX "Provider_status_idx" ON "Provider"("status");

-- CreateIndex
CREATE INDEX "Provider_dependencyLevel_idx" ON "Provider"("dependencyLevel");

-- CreateIndex
CREATE INDEX "Provider_operationalState_idx" ON "Provider"("operationalState");

-- CreateIndex
CREATE INDEX "Provider_isCritical_idx" ON "Provider"("isCritical");

-- CreateIndex
CREATE INDEX "Provider_lastOrderDate_idx" ON "Provider"("lastOrderDate");

-- CreateIndex
CREATE INDEX "ProviderFile_providerId_idx" ON "ProviderFile"("providerId");

-- CreateIndex
CREATE INDEX "ProviderFile_userId_idx" ON "ProviderFile"("userId");

-- CreateIndex
CREATE INDEX "ProviderFile_category_idx" ON "ProviderFile"("category");

-- CreateIndex
CREATE INDEX "ProviderPayment_providerId_idx" ON "ProviderPayment"("providerId");

-- CreateIndex
CREATE INDEX "ProviderPayment_userId_idx" ON "ProviderPayment"("userId");

-- CreateIndex
CREATE INDEX "ProviderPayment_paymentDate_idx" ON "ProviderPayment"("paymentDate");

-- CreateIndex
CREATE INDEX "ProviderTask_providerId_idx" ON "ProviderTask"("providerId");

-- CreateIndex
CREATE INDEX "ProviderTask_userId_idx" ON "ProviderTask"("userId");

-- CreateIndex
CREATE INDEX "ProviderTask_status_idx" ON "ProviderTask"("status");

-- CreateIndex
CREATE INDEX "ProviderTask_dueDate_idx" ON "ProviderTask"("dueDate");

-- CreateIndex
CREATE INDEX "ProviderNote_providerId_idx" ON "ProviderNote"("providerId");

-- CreateIndex
CREATE INDEX "ProviderNote_userId_idx" ON "ProviderNote"("userId");

-- CreateIndex
CREATE INDEX "ProviderNote_createdAt_idx" ON "ProviderNote"("createdAt");

-- CreateIndex
CREATE INDEX "ProviderContactLog_providerId_idx" ON "ProviderContactLog"("providerId");

-- CreateIndex
CREATE INDEX "ProviderContactLog_userId_idx" ON "ProviderContactLog"("userId");

-- CreateIndex
CREATE INDEX "Service_userId_idx" ON "Service"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_userId_name_key" ON "Service"("userId", "name");

-- CreateIndex
CREATE INDEX "ProviderOrder_providerId_idx" ON "ProviderOrder"("providerId");

-- CreateIndex
CREATE INDEX "ProviderOrder_userId_idx" ON "ProviderOrder"("userId");

-- CreateIndex
CREATE INDEX "ProviderOrder_status_idx" ON "ProviderOrder"("status");

-- CreateIndex
CREATE INDEX "ProviderOrder_orderDate_idx" ON "ProviderOrder"("orderDate");

-- CreateIndex
CREATE UNIQUE INDEX "_ProviderToService_AB_unique" ON "_ProviderToService"("A", "B");

-- CreateIndex
CREATE INDEX "_ProviderToService_B_index" ON "_ProviderToService"("B");

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderFile" ADD CONSTRAINT "ProviderFile_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderFile" ADD CONSTRAINT "ProviderFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderPayment" ADD CONSTRAINT "ProviderPayment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderPayment" ADD CONSTRAINT "ProviderPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderTask" ADD CONSTRAINT "ProviderTask_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderTask" ADD CONSTRAINT "ProviderTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderNote" ADD CONSTRAINT "ProviderNote_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderNote" ADD CONSTRAINT "ProviderNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderContactLog" ADD CONSTRAINT "ProviderContactLog_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderContactLog" ADD CONSTRAINT "ProviderContactLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderOrder" ADD CONSTRAINT "ProviderOrder_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderOrder" ADD CONSTRAINT "ProviderOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProviderToService" ADD CONSTRAINT "_ProviderToService_A_fkey" FOREIGN KEY ("A") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProviderToService" ADD CONSTRAINT "_ProviderToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
