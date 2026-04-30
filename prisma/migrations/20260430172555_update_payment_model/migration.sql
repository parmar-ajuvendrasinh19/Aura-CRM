/*
  Warnings:

  - You are about to drop the column `description` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceNumber` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paidDate` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `type` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('WEBSITE', 'MARKETING');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'PARTIAL';

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "description",
DROP COLUMN "invoiceNumber",
DROP COLUMN "paidDate",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "type" "PaymentType" NOT NULL;

-- CreateIndex
CREATE INDEX "Payment_type_idx" ON "Payment"("type");
