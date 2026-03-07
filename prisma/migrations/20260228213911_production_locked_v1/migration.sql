-- CreateTable
CREATE TABLE "RevenueTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "leadId" TEXT,
    "sessionId" TEXT,
    "orderId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevenueTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RevenueTransaction_userId_idx" ON "RevenueTransaction"("userId");

-- CreateIndex
CREATE INDEX "RevenueTransaction_leadId_idx" ON "RevenueTransaction"("leadId");

-- CreateIndex
CREATE INDEX "RevenueTransaction_sessionId_idx" ON "RevenueTransaction"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "RevenueTransaction_userId_orderId_key" ON "RevenueTransaction"("userId", "orderId");

-- CreateIndex
CREATE INDEX "Lead_userId_visitorId_idx" ON "Lead"("userId", "visitorId");

-- CreateIndex
CREATE INDEX "VisitorSession_utmSource_idx" ON "VisitorSession"("utmSource");
