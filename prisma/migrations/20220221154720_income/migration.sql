-- AlterTable
ALTER TABLE "Team" ADD COLUMN "balanceByIncome" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "avgIncome" INTEGER;
