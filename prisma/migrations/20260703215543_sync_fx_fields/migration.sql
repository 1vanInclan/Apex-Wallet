/*
  Warnings:

  - You are about to drop the column `currency` on the `LedgerEntry` table. All the data in the column will be lost.
  - Added the required column `convertedAmount` to the `LedgerEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exchangeRate` to the `LedgerEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverCurrency` to the `LedgerEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderCurrency` to the `LedgerEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LedgerEntry" DROP COLUMN "currency",
ADD COLUMN     "convertedAmount" DECIMAL(18,4) NOT NULL,
ADD COLUMN     "exchangeRate" DECIMAL(18,4) NOT NULL,
ADD COLUMN     "receiverCurrency" TEXT NOT NULL,
ADD COLUMN     "senderCurrency" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "LedgerEntry_createdAt_idx" ON "LedgerEntry"("createdAt");
