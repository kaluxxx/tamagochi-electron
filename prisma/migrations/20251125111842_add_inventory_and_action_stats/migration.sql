-- AlterTable
ALTER TABLE "Action" ADD COLUMN "energyAfter" INTEGER;
ALTER TABLE "Action" ADD COLUMN "energyBefore" INTEGER;
ALTER TABLE "Action" ADD COLUMN "happinessAfter" INTEGER;
ALTER TABLE "Action" ADD COLUMN "happinessBefore" INTEGER;
ALTER TABLE "Action" ADD COLUMN "healthAfter" INTEGER;
ALTER TABLE "Action" ADD COLUMN "healthBefore" INTEGER;
ALTER TABLE "Action" ADD COLUMN "hungerAfter" INTEGER;
ALTER TABLE "Action" ADD COLUMN "hungerBefore" INTEGER;

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Inventory_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_itemId_key" ON "Inventory"("itemId");
