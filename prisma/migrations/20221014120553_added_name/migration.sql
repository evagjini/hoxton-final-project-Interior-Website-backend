/*
  Warnings:

  - You are about to drop the column `fullName` on the `Designer` table. All the data in the column will be lost.
  - Added the required column `lastName` to the `Designer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Designer` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Designer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "blogId" INTEGER NOT NULL
);
INSERT INTO "new_Designer" ("blogId", "email", "id", "password") SELECT "blogId", "email", "id", "password" FROM "Designer";
DROP TABLE "Designer";
ALTER TABLE "new_Designer" RENAME TO "Designer";
CREATE UNIQUE INDEX "Designer_email_key" ON "Designer"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
