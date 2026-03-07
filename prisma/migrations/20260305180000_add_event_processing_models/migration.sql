-- AlterTable: add optional apiKey and domain to Event for event processor
ALTER TABLE "Event" ADD COLUMN "apiKey" TEXT;
ALTER TABLE "Event" ADD COLUMN "domain" TEXT;

-- CreateTable: AnalyticsVisitor (userId + visitorId)
CREATE TABLE "AnalyticsVisitor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "firstSeen" TIMESTAMP(3) NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "sessionsCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsVisitor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AnalyticsVisitor_userId_visitorId_key" ON "AnalyticsVisitor"("userId", "visitorId");
CREATE INDEX "AnalyticsVisitor_userId_idx" ON "AnalyticsVisitor"("userId");
CREATE INDEX "AnalyticsVisitor_visitorId_idx" ON "AnalyticsVisitor"("visitorId");

-- CreateTable: IngestSession (userId + sessionId)
CREATE TABLE "IngestSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "pageviews" INTEGER NOT NULL DEFAULT 0,
    "eventsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngestSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "IngestSession_userId_sessionId_key" ON "IngestSession"("userId", "sessionId");
CREATE INDEX "IngestSession_userId_idx" ON "IngestSession"("userId");
CREATE INDEX "IngestSession_sessionId_idx" ON "IngestSession"("sessionId");

-- CreateTable: DailyStats
CREATE TABLE "DailyStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "pageviews" INTEGER NOT NULL DEFAULT 0,
    "visitors" INTEGER NOT NULL DEFAULT 0,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyStats_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DailyStats_userId_domain_day_key" ON "DailyStats"("userId", "domain", "day");
CREATE INDEX "DailyStats_userId_idx" ON "DailyStats"("userId");
CREATE INDEX "DailyStats_domain_idx" ON "DailyStats"("domain");
CREATE INDEX "DailyStats_day_idx" ON "DailyStats"("day");

-- CreateTable: DailyStatsVisitor
CREATE TABLE "DailyStatsVisitor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "visitorId" TEXT NOT NULL,

    CONSTRAINT "DailyStatsVisitor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DailyStatsVisitor_userId_domain_day_visitorId_key" ON "DailyStatsVisitor"("userId", "domain", "day", "visitorId");
CREATE INDEX "DailyStatsVisitor_userId_idx" ON "DailyStatsVisitor"("userId");

-- CreateTable: DailyStatsSession
CREATE TABLE "DailyStatsSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "DailyStatsSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DailyStatsSession_userId_domain_day_sessionId_key" ON "DailyStatsSession"("userId", "domain", "day", "sessionId");
CREATE INDEX "DailyStatsSession_userId_idx" ON "DailyStatsSession"("userId");

-- CreateIndex on Event for domain
CREATE INDEX "Event_domain_idx" ON "Event"("domain");

-- AddForeignKey
ALTER TABLE "AnalyticsVisitor" ADD CONSTRAINT "AnalyticsVisitor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IngestSession" ADD CONSTRAINT "IngestSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyStats" ADD CONSTRAINT "DailyStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyStatsVisitor" ADD CONSTRAINT "DailyStatsVisitor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyStatsSession" ADD CONSTRAINT "DailyStatsSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
