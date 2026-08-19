-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 1000,
    "level" TEXT NOT NULL DEFAULT 'Beginner',
    "duration" TEXT,
    "thumbnail" TEXT,
    "whatYouLearn" TEXT NOT NULL DEFAULT '[]',
    "requirements" TEXT NOT NULL DEFAULT '[]',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "lessons" TEXT NOT NULL DEFAULT '[]',
    "mentorId" TEXT NOT NULL,
    "mentorName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Course" ("category", "createdAt", "description", "id", "lessons", "mentorId", "mentorName", "price", "published", "title") SELECT "category", "createdAt", "description", "id", "lessons", "mentorId", "mentorName", "price", "published", "title" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
