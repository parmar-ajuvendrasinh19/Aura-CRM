/*
  Warnings:

  - The values [PENDING,WAITING,OVERDUE] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [CLIENT,FINANCE,MARKETING] on the enum `TaskType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `dependsOnId` on the `Task` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TaskStatus_new" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED');
ALTER TABLE "Task" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "TaskStatus_old";
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'TODO';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TaskType_new" AS ENUM ('MEETING', 'FOLLOW_UP', 'FEEDBACK', 'ONBOARDING', 'PAYMENT_REMINDER', 'INVOICE', 'SUBSCRIPTION', 'CAMPAIGN', 'CONTENT', 'DEVELOPMENT', 'DESIGN', 'INTERNAL', 'ALERT');
ALTER TABLE "Task" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "type" TYPE "TaskType_new" USING ("type"::text::"TaskType_new");
ALTER TYPE "TaskType" RENAME TO "TaskType_old";
ALTER TYPE "TaskType_new" RENAME TO "TaskType";
DROP TYPE "TaskType_old";
ALTER TABLE "Task" ALTER COLUMN "type" SET DEFAULT 'INTERNAL';
COMMIT;

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_dependsOnId_fkey";

-- DropIndex
DROP INDEX "Task_dependsOnId_idx";

-- DropIndex
DROP INDEX "Task_status_idx";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "dependsOnId",
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "status" SET DEFAULT 'TODO';

-- CreateIndex
CREATE INDEX "Task_type_idx" ON "Task"("type");

-- CreateIndex
CREATE INDEX "Task_priority_idx" ON "Task"("priority");
