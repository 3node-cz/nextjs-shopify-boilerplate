-- CreateTable
CREATE TABLE "Shop" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shopOrigin" TEXT NOT NULL,
    "token" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Shop.shopOrigin_unique" ON "Shop"("shopOrigin");
