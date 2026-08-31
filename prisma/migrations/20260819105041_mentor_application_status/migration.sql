-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" DATETIME,
    "tokenBalance" INTEGER NOT NULL DEFAULT 30,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "hourlyRate" INTEGER NOT NULL DEFAULT 1000,
    "skills" TEXT,
    "availabilityDays" TEXT,
    "availabilitySlots" TEXT,
    "isMentorApproved" BOOLEAN NOT NULL DEFAULT false,
    "mentorApplicationStatus" TEXT NOT NULL DEFAULT 'not_submitted',
    "targetHours" TEXT,
    "interests" TEXT,
    "careerGoal" TEXT,
    "linkedinUrl" TEXT,
    "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionPlan" TEXT,
    "subscriptionStatus" TEXT,
    "subscriptionExpiry" DATETIME,
    "skillsList" TEXT NOT NULL DEFAULT '[]'
);
INSERT INTO "new_User" ("availabilityDays", "availabilitySlots", "avatarUrl", "bio", "careerGoal", "createdAt", "email", "hourlyRate", "id", "interests", "isEmailVerified", "isMentorApproved", "isOnboarded", "linkedinUrl", "name", "password", "resetPasswordExpires", "resetPasswordToken", "role", "skills", "skillsList", "subscriptionExpiry", "subscriptionPlan", "subscriptionStatus", "targetHours", "tokenBalance", "updatedAt", "verificationToken") SELECT "availabilityDays", "availabilitySlots", "avatarUrl", "bio", "careerGoal", "createdAt", "email", "hourlyRate", "id", "interests", "isEmailVerified", "isMentorApproved", "isOnboarded", "linkedinUrl", "name", "password", "resetPasswordExpires", "resetPasswordToken", "role", "skills", "skillsList", "subscriptionExpiry", "subscriptionPlan", "subscriptionStatus", "targetHours", "tokenBalance", "updatedAt", "verificationToken" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
