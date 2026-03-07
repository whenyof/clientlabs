-- CreateIndex: analytics by userId + domain + createdAt (events per domain, last 24h, domain analytics)
CREATE INDEX "Event_userId_domain_createdAt_idx" ON "Event"("userId", "domain", "createdAt");
