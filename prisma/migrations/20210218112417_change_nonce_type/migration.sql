-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shop" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shopOrigin" TEXT NOT NULL,
    "token" TEXT,
    "nonce" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Shop" ("id", "shopOrigin", "token", "createdAt", "updatedAt", "nonce") SELECT "id", "shopOrigin", "token", "createdAt", "updatedAt", "nonce" FROM "Shop";
DROP TABLE "Shop";
ALTER TABLE "new_Shop" RENAME TO "Shop";
CREATE UNIQUE INDEX "Shop.shopOrigin_unique" ON "Shop"("shopOrigin");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
