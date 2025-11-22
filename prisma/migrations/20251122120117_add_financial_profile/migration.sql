-- CreateTable
CREATE TABLE "financial_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "happyPurchase" TEXT,
    "regretPurchase" TEXT,
    "financialFear" TEXT,
    "savingGoal" TEXT,
    "moneyFeeling" TEXT,
    "riskTolerance" TEXT NOT NULL DEFAULT 'MODERATE',
    "spendingStyle" TEXT NOT NULL DEFAULT 'BALANCED',
    "regretThreshold" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "emotionalTriggers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "approvedDecisions" INTEGER NOT NULL DEFAULT 0,
    "rejectedDecisions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "financial_profiles_userId_key" ON "financial_profiles"("userId");

-- CreateIndex
CREATE INDEX "financial_profiles_userId_idx" ON "financial_profiles"("userId");

-- AddForeignKey
ALTER TABLE "financial_profiles" ADD CONSTRAINT "financial_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
