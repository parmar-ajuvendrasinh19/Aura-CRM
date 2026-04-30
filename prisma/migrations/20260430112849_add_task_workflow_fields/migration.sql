/*
  Warnings:

  - The values [PARTIAL] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [TODO,REVIEW] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `notes` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentDate` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentType` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `receiptUrl` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `service` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('CLIENT', 'FINANCE', 'MARKETING', 'INTERNAL', 'ALERT');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'PAID', 'OVERDUE');
ALTER TABLE "Payment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Payment" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";
ALTER TABLE "Payment" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TaskStatus_new" AS ENUM ('PENDING', 'IN_PROGRESS', 'WAITING', 'COMPLETED', 'OVERDUE');
ALTER TABLE "Task" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "TaskStatus_old";
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_projectId_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "notes",
DROP COLUMN "paymentDate",
DROP COLUMN "paymentType",
DROP COLUMN "receiptUrl",
DROP COLUMN "service",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "invoiceNumber" TEXT,
ADD COLUMN     "paidDate" TIMESTAMP(3),
ADD COLUMN     "projectId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "clientId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "dependsOnId" TEXT,
ADD COLUMN     "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "type" "TaskType" NOT NULL DEFAULT 'INTERNAL',
ALTER COLUMN "status" SET DEFAULT 'PENDING',
ALTER COLUMN "projectId" DROP NOT NULL;

-- DropEnum
DROP TYPE "PaymentServiceType";

-- DropEnum
DROP TYPE "PaymentType";

-- CreateIndex
CREATE INDEX "Payment_projectId_idx" ON "Payment"("projectId");

-- CreateIndex
CREATE INDEX "Task_clientId_idx" ON "Task"("clientId");

-- CreateIndex
CREATE INDEX "Task_dependsOnId_idx" ON "Task"("dependsOnId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_dependsOnId_fkey" FOREIGN KEY ("dependsOnId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
