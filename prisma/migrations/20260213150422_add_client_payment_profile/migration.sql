-- CreateTable
CREATE TABLE "ClientPaymentProfile" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "averageDelayDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lateRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unpaidAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "lastPaymentAt" TIMESTAMP(3),
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "totalHistoricalBilled" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalHistoricalPaid" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientPaymentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientPaymentProfile_clientId_key" ON "ClientPaymentProfile"("clientId");

-- CreateIndex
CREATE INDEX "ClientPaymentProfile_clientId_idx" ON "ClientPaymentProfile"("clientId");

-- CreateIndex
CREATE INDEX "ClientPaymentProfile_riskScore_idx" ON "ClientPaymentProfile"("riskScore");

-- CreateIndex
CREATE INDEX "ClientPaymentProfile_updatedAt_idx" ON "ClientPaymentProfile"("updatedAt");

-- AddForeignKey
ALTER TABLE "ClientPaymentProfile" ADD CONSTRAINT "ClientPaymentProfile_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
