-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'LEADER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Camp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "description" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Squad" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "leaderUserId" TEXT,
    "leaderName" TEXT,
    "assistantName" TEXT,
    "totalPhysical" REAL NOT NULL DEFAULT 0,
    "totalMental" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Squad_campId_fkey" FOREIGN KEY ("campId") REFERENCES "Camp" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Squad_leaderUserId_fkey" FOREIGN KEY ("leaderUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campId" TEXT NOT NULL,
    "squadId" TEXT,
    "code" TEXT NOT NULL,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,
    "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
    "physicalScore" REAL NOT NULL DEFAULT 0,
    "mentalScore" REAL NOT NULL DEFAULT 0,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
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
    "height" INTEGER,
    "build" TEXT,
    "doesSports" BOOLEAN NOT NULL DEFAULT false,
    "sportType" TEXT,
    "agility" INTEGER,
    "strength" INTEGER,
    "allergies" TEXT,
    "medicalRestrictions" TEXT,
    "physicalRestrictions" TEXT,
    "medicalNotes" TEXT,
    "firstTimeAtCamp" BOOLEAN NOT NULL DEFAULT false,
    "isExceptional" BOOLEAN NOT NULL DEFAULT false,
    "panicAttacks" BOOLEAN NOT NULL DEFAULT false,
    "personalityType" TEXT,
    "drawing" INTEGER,
    "isMusician" BOOLEAN NOT NULL DEFAULT false,
    "instruments" TEXT,
    "poetry" INTEGER,
    "englishLevel" INTEGER,
    "generalLevel" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Member_campId_fkey" FOREIGN KEY ("campId") REFERENCES "Camp" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Member_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "Squad" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScheduleEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScheduleEntry_campId_fkey" FOREIGN KEY ("campId") REFERENCES "Camp" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Squad_campId_idx" ON "Squad"("campId");

-- CreateIndex
CREATE INDEX "Squad_leaderUserId_idx" ON "Squad"("leaderUserId");

-- CreateIndex
CREATE INDEX "Member_campId_idx" ON "Member"("campId");

-- CreateIndex
CREATE INDEX "Member_squadId_idx" ON "Member"("squadId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_campId_code_key" ON "Member"("campId", "code");

-- CreateIndex
CREATE INDEX "ScheduleEntry_campId_date_idx" ON "ScheduleEntry"("campId", "date");
