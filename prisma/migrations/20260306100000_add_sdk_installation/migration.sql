-- CreateTable: SdkInstallation (verification status per userId + domain)
CREATE TABLE "SdkInstallation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_INSTALLED',
    "firstSeenAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "lastEventAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SdkInstallation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SdkInstallation_userId_domain_key" ON "SdkInstallation"("userId", "domain");
CREATE INDEX "SdkInstallation_apiKey_idx" ON "SdkInstallation"("apiKey");
CREATE INDEX "SdkInstallation_userId_idx" ON "SdkInstallation"("userId");
CREATE INDEX "SdkInstallation_domain_idx" ON "SdkInstallation"("domain");

ALTER TABLE "SdkInstallation" ADD CONSTRAINT "SdkInstallation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
