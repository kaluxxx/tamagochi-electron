-- AlterTable
ALTER TABLE "Action" ADD COLUMN "coinsEarned" INTEGER;

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coins" INTEGER NOT NULL DEFAULT 100,
    "lastPassiveGain" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MinigameScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameType" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "coinsEarned" INTEGER NOT NULL,
    "playedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "hungerBoost" INTEGER NOT NULL DEFAULT 0,
    "happinessBoost" INTEGER NOT NULL DEFAULT 0,
    "healthBoost" INTEGER NOT NULL DEFAULT 0,
    "energyBoost" INTEGER NOT NULL DEFAULT 0,
    "energyCost" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL DEFAULT 10,
    "emoji" TEXT NOT NULL,
    "description" TEXT NOT NULL
);
INSERT INTO "new_Item" ("description", "emoji", "energyBoost", "energyCost", "happinessBoost", "healthBoost", "hungerBoost", "id", "name", "type") SELECT "description", "emoji", "energyBoost", "energyCost", "happinessBoost", "healthBoost", "hungerBoost", "id", "name", "type" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
