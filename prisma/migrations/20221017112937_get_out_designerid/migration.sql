/*
  Warnings:

  - You are about to drop the column `blogId` on the `Designer` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Designer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);
INSERT INTO "new_Designer" ("email", "id", "lastName", "name", "password") SELECT "email", "id", "lastName", "name", "password" FROM "Designer";
DROP TABLE "Designer";
ALTER TABLE "new_Designer" RENAME TO "Designer";
CREATE UNIQUE INDEX "Designer_email_key" ON "Designer"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
