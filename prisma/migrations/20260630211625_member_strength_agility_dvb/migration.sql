-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campId" TEXT NOT NULL,
    "squadId" TEXT,
    "code" TEXT NOT NULL,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,
    "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
    "physicalScore" REAL NOT NULL DEFAULT 0,
    "mentalScore" REAL NOT NULL DEFAULT 0,
    "lastName" TEXT,
    "firstName" TEXT,
    "middleName" TEXT,
    "dateOfBirth" DATETIME,
    "gender" TEXT,
    "residenceType" TEXT,
    "photoUrl" TEXT,
    "childPhone" TEXT,
    "guardianName" TEXT,
    "parentsPhone" TEXT,
    "additionalContact" TEXT,
    "instagram" TEXT,
    "telegram" TEXT,
    "otherSocial" TEXT,
    "address" TEXT,
    "height" TEXT,
    "build" TEXT,
    "strength" TEXT,
    "agilitySeconds" REAL,
    "creativity" INTEGER,
    "communication" INTEGER,
    "isFromBelievingFamily" BOOLEAN NOT NULL DEFAULT false,
    "allergies" TEXT,
    "medicalRestrictions" TEXT,
    "physicalRestrictions" TEXT,
    "medicalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Member_campId_fkey" FOREIGN KEY ("campId") REFERENCES "Camp" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Member_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "Squad" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("additionalContact", "address", "allergies", "build", "campId", "childPhone", "code", "communication", "createdAt", "creativity", "dateOfBirth", "firstName", "gender", "guardianName", "height", "id", "instagram", "isLeader", "isProfileComplete", "lastName", "medicalNotes", "medicalRestrictions", "mentalScore", "middleName", "otherSocial", "parentsPhone", "photoUrl", "physicalRestrictions", "physicalScore", "residenceType", "squadId", "telegram", "updatedAt") SELECT "additionalContact", "address", "allergies", "build", "campId", "childPhone", "code", "communication", "createdAt", "creativity", "dateOfBirth", "firstName", "gender", "guardianName", "height", "id", "instagram", "isLeader", "isProfileComplete", "lastName", "medicalNotes", "medicalRestrictions", "mentalScore", "middleName", "otherSocial", "parentsPhone", "photoUrl", "physicalRestrictions", "physicalScore", "residenceType", "squadId", "telegram", "updatedAt" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE INDEX "Member_campId_idx" ON "Member"("campId");
CREATE INDEX "Member_squadId_idx" ON "Member"("squadId");
CREATE UNIQUE INDEX "Member_campId_code_key" ON "Member"("campId", "code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

