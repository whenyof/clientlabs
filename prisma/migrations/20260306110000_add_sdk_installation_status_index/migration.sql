-- CreateIndex: dashboard queries by userId + status (connected/disconnected/filter by status)
CREATE INDEX "SdkInstallation_userId_status_idx" ON "SdkInstallation"("userId", "status");
