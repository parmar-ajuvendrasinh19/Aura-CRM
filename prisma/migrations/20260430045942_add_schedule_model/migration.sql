-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('MEETING', 'TASK');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ScheduleType" NOT NULL,
    "clientId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Schedule_clientId_idx" ON "Schedule"("clientId");

-- CreateIndex
CREATE INDEX "Schedule_date_idx" ON "Schedule"("date");

-- CreateIndex
CREATE INDEX "Schedule_status_idx" ON "Schedule"("status");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
