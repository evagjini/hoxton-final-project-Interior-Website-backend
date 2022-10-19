-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Favorites" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "blogId" INTEGER NOT NULL,
    CONSTRAINT "Favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Favorites_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Favorites" ("blogId", "id", "userId") SELECT "blogId", "id", "userId" FROM "Favorites";
DROP TABLE "Favorites";
ALTER TABLE "new_Favorites" RENAME TO "Favorites";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
