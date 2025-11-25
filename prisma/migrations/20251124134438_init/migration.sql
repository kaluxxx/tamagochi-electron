-- CreateTable
CREATE TABLE "AnimalType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "hungerDecayRate" REAL NOT NULL DEFAULT 2.0,
    "happinessDecayRate" REAL NOT NULL DEFAULT 1.5,
    "energyDecayRate" REAL NOT NULL DEFAULT 1.0,
    "healthDecayRate" REAL NOT NULL DEFAULT 3.0,
    "emoji" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "hunger" INTEGER NOT NULL DEFAULT 100,
    "happiness" INTEGER NOT NULL DEFAULT 100,
    "health" INTEGER NOT NULL DEFAULT 100,
    "energy" INTEGER NOT NULL DEFAULT 100,
    "age" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isAlive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Animal_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "AnimalType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "animalId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "itemId" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Action_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Action_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "hungerBoost" INTEGER NOT NULL DEFAULT 0,
    "happinessBoost" INTEGER NOT NULL DEFAULT 0,
    "healthBoost" INTEGER NOT NULL DEFAULT 0,
    "energyBoost" INTEGER NOT NULL DEFAULT 0,
    "energyCost" INTEGER NOT NULL DEFAULT 0,
    "emoji" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AnimalType_name_key" ON "AnimalType"("name");
