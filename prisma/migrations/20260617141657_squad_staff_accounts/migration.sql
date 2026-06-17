/*
  Warnings:

  - You are about to drop the column `assistantName` on the `Squad` table. All the data in the column will be lost.
  - You are about to drop the column `leaderName` on the `Squad` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Squad" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "leaderUserId" TEXT,
    "assistant1UserId" TEXT,
    "assistant2UserId" TEXT,
    "totalPhysical" REAL NOT NULL DEFAULT 0,
    "totalMental" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Squad_campId_fkey" FOREIGN KEY ("campId") REFERENCES "Camp" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Squad_leaderUserId_fkey" FOREIGN KEY ("leaderUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Squad_assistant1UserId_fkey" FOREIGN KEY ("assistant1UserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Squad_assistant2UserId_fkey" FOREIGN KEY ("assistant2UserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Squad" ("campId", "color", "createdAt", "id", "leaderUserId", "name", "totalMental", "totalPhysical", "updatedAt") SELECT "campId", "color", "createdAt", "id", "leaderUserId", "name", "totalMental", "totalPhysical", "updatedAt" FROM "Squad";
DROP TABLE "Squad";
ALTER TABLE "new_Squad" RENAME TO "Squad";
CREATE INDEX "Squad_campId_idx" ON "Squad"("campId");
CREATE INDEX "Squad_leaderUserId_idx" ON "Squad"("leaderUserId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
