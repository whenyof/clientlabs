-- CreateTable
CREATE TABLE "MonthlyGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyGoal_userId_idx" ON "MonthlyGoal"("userId");

-- CreateIndex
CREATE INDEX "MonthlyGoal_month_year_idx" ON "MonthlyGoal"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyGoal_userId_month_year_key" ON "MonthlyGoal"("userId", "month", "year");

-- AddForeignKey
ALTER TABLE "MonthlyGoal" ADD CONSTRAINT "MonthlyGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
