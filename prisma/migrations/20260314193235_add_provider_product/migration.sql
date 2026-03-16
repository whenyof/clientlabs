-- CreateTable
CREATE TABLE "ProviderProduct" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "unit" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProviderProduct_providerId_idx" ON "ProviderProduct"("providerId");

-- CreateIndex
CREATE INDEX "ProviderProduct_userId_idx" ON "ProviderProduct"("userId");

-- CreateIndex
CREATE INDEX "ProviderProduct_isActive_idx" ON "ProviderProduct"("isActive");

-- AddForeignKey
ALTER TABLE "ProviderProduct" ADD CONSTRAINT "ProviderProduct_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderProduct" ADD CONSTRAINT "ProviderProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
