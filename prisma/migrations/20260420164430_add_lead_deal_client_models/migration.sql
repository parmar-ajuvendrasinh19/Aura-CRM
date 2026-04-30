/*
  Warnings:

  - The values [LEAD,CONTACTED,PROPOSAL_SENT] on the enum `DealStage` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `organizationId` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `company` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `expectedCloseDate` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `probability` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `dealId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `organization` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `companyName` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerName` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `Client` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `leadId` to the `Deal` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'INTERESTED', 'LOST');

-- AlterEnum
BEGIN;
CREATE TYPE "DealStage_new" AS ENUM ('NEW', 'DISCUSSION', 'PROPOSAL', 'WON', 'LOST');
ALTER TABLE "Deal" ALTER COLUMN "stage" DROP DEFAULT;
ALTER TABLE "Deal" ALTER COLUMN "stage" TYPE "DealStage_new" USING ("stage"::text::"DealStage_new");
ALTER TYPE "DealStage" RENAME TO "DealStage_old";
ALTER TYPE "DealStage_new" RENAME TO "DealStage";
DROP TYPE "DealStage_old";
ALTER TABLE "Deal" ALTER COLUMN "stage" SET DEFAULT 'NEW';
COMMIT;

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_dealId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_organizationId_fkey";

-- DropIndex
DROP INDEX "Activity_organizationId_idx";

-- DropIndex
DROP INDEX "Client_organizationId_idx";

-- DropIndex
DROP INDEX "Deal_clientId_idx";

-- DropIndex
DROP INDEX "Deal_organizationId_idx";

-- DropIndex
DROP INDEX "Deal_projectId_key";

-- DropIndex
DROP INDEX "Payment_organizationId_idx";

-- DropIndex
DROP INDEX "Project_dealId_idx";

-- DropIndex
DROP INDEX "Project_dealId_key";

-- DropIndex
DROP INDEX "Project_organizationId_idx";

-- DropIndex
DROP INDEX "User_organizationId_idx";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "company",
DROP COLUMN "name",
DROP COLUMN "organizationId",
DROP COLUMN "updatedAt",
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "ownerName" TEXT NOT NULL,
ADD COLUMN     "website" TEXT,
ALTER COLUMN "phone" SET NOT NULL;

-- AlterTable
ALTER TABLE "Deal" DROP COLUMN "clientId",
DROP COLUMN "description",
DROP COLUMN "expectedCloseDate",
DROP COLUMN "organizationId",
DROP COLUMN "probability",
DROP COLUMN "projectId",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
ADD COLUMN     "expectedDate" TIMESTAMP(3),
ADD COLUMN     "leadId" TEXT NOT NULL,
ALTER COLUMN "stage" SET DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "dealId",
DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "organizationId";

-- DropTable
DROP TABLE "organization";

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "source" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Deal_leadId_idx" ON "Deal"("leadId");

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
