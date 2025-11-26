-- CreateTable
CREATE TABLE "FishSpecies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "baseValue" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "minSize" INTEGER NOT NULL,
    "maxSize" INTEGER NOT NULL,
    "locations" TEXT NOT NULL,
    "baitPreference" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "FishCatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "speciesId" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "coinsEarned" INTEGER NOT NULL,
    "isFirstCatch" BOOLEAN NOT NULL DEFAULT false,
    "caughtAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locationId" TEXT NOT NULL,
    "rodId" TEXT NOT NULL,
    "baitId" TEXT,
    CONSTRAINT "FishCatch_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "FishSpecies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FishingRod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "reelZoneBonus" REAL NOT NULL DEFAULT 0,
    "catchRateBonus" REAL NOT NULL DEFAULT 0,
    "rarityBonus" REAL NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "isOwned" BOOLEAN NOT NULL DEFAULT false,
    "isEquipped" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "FishingBait" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "catchRateBonus" REAL NOT NULL DEFAULT 0,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "targetRarity" TEXT,
    "targetSpecies" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "FishingLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "unlockCost" INTEGER NOT NULL,
    "difficulty" REAL NOT NULL DEFAULT 1.0,
    "availableFish" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlockOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "FishingUpgrade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FishingProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "totalFishCaught" INTEGER NOT NULL DEFAULT 0,
    "largestFishId" TEXT,
    "largestFishSize" INTEGER,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "bestStreak" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "FishSpecies_name_key" ON "FishSpecies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FishingRod_name_key" ON "FishingRod"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FishingBait_name_key" ON "FishingBait"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FishingLocation_name_key" ON "FishingLocation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FishingUpgrade_type_key" ON "FishingUpgrade"("type");
