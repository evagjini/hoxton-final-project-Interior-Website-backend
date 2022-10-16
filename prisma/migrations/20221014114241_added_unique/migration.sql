-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Designer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT 'String',
    "password" TEXT NOT NULL DEFAULT 'String',
    "blogId" INTEGER NOT NULL
);
INSERT INTO "new_Designer" ("blogId", "fullName", "id") SELECT "blogId", "fullName", "id" FROM "Designer";
DROP TABLE "Designer";
ALTER TABLE "new_Designer" RENAME TO "Designer";
CREATE UNIQUE INDEX "Designer_email_key" ON "Designer"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
