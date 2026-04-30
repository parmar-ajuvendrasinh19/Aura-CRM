/*
  Warnings:

  - The values [NEW,DISCUSSION,PROPOSAL] on the enum `DealStage` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `website` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `expectedDate` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `leadId` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Lead` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[projectId]` on the table `Deal` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dealId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `Deal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Deal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DealStage_new" AS ENUM ('LEAD', 'CONTACTED', 'PROPOSAL_SENT', 'WON', 'LOST');
ALTER TABLE "Deal" ALTER COLUMN "stage" DROP DEFAULT;
ALTER TABLE "Deal" ALTER COLUMN "stage" TYPE "DealStage_new" USING ("stage"::text::"DealStage_new");
ALTER TYPE "DealStage" RENAME TO "DealStage_old";
ALTER TYPE "DealStage_new" RENAME TO "DealStage";
DROP TYPE "DealStage_old";
ALTER TABLE "Deal" ALTER COLUMN "stage" SET DEFAULT 'LEAD';
COMMIT;

-- DropForeignKey
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_leadId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_organizationId_fkey";

-- DropIndex
DROP INDEX "Deal_leadId_idx";

-- DropIndex
DROP INDEX "User_organizationId_idx";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "website",
ADD COLUMN     "services" TEXT[];

-- AlterTable
ALTER TABLE "Deal" DROP COLUMN "expectedDate",
DROP COLUMN "leadId",
ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "expectedCloseDate" TIMESTAMP(3),
ADD COLUMN     "probability" INTEGER,
ADD COLUMN     "projectId" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "stage" SET DEFAULT 'LEAD';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "dealId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "organizationId";

-- DropTable
DROP TABLE "Lead";

-- DropTable
DROP TABLE "Organization";

-- DropTable
DROP TABLE "Product";

-- DropEnum
DROP TYPE "LeadStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Deal_projectId_key" ON "Deal"("projectId");

-- CreateIndex
CREATE INDEX "Deal_clientId_idx" ON "Deal"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_dealId_key" ON "Project"("dealId");

-- CreateIndex
CREATE INDEX "Project_dealId_idx" ON "Project"("dealId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
