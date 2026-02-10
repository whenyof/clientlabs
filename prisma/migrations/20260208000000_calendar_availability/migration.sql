-- CreateTable
CREATE TABLE "UserWorkingHours" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWorkingHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTimeOff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "UserTimeOff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarBlock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "CalendarBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserWorkingHours_userId_weekday_idx" ON "UserWorkingHours"("userId", "weekday");

-- CreateIndex
CREATE INDEX "UserTimeOff_userId_idx" ON "UserTimeOff"("userId");

-- CreateIndex
CREATE INDEX "CalendarBlock_userId_idx" ON "CalendarBlock"("userId");

-- AddForeignKey
ALTER TABLE "UserWorkingHours" ADD CONSTRAINT "UserWorkingHours_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTimeOff" ADD CONSTRAINT "UserTimeOff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarBlock" ADD CONSTRAINT "CalendarBlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
