-- AlterTable
ALTER TABLE "budgets" ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "insights" ADD COLUMN     "action" TEXT;
