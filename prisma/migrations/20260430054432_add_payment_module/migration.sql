/*
  Warnings:

  - The values [OVERDUE] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `description` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceNumber` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paidDate` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the `Schedule` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `paymentType` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Made the column `clientId` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('UPI', 'BANK', 'CASH');

-- CreateEnum
CREATE TYPE "PaymentServiceType" AS ENUM ('WEBSITE', 'MARKETING');

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'PAID', 'PARTIAL');
ALTER TABLE "Payment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Payment" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";
ALTER TABLE "Payment" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_clientId_fkey";

-- DropIndex
DROP INDEX "Payment_projectId_idx";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "description",
DROP COLUMN "invoiceNumber",
DROP COLUMN "paidDate",
DROP COLUMN "projectId",
DROP COLUMN "updatedAt",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentType" "PaymentType" NOT NULL,
ADD COLUMN     "receiptUrl" TEXT,
ADD COLUMN     "service" "PaymentServiceType" NOT NULL,
ALTER COLUMN "clientId" SET NOT NULL;

-- DropTable
DROP TABLE "Schedule";

-- DropEnum
DROP TYPE "ScheduleStatus";

-- DropEnum
DROP TYPE "ScheduleType";

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
