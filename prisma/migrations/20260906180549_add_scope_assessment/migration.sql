-- AlterTable
ALTER TABLE "Scope" ADD COLUMN "evidenceRequired" TEXT;
ALTER TABLE "Scope" ADD COLUMN "testProcedure" TEXT;
ALTER TABLE "Scope" ADD COLUMN "testReference" TEXT;

-- CreateTable
CREATE TABLE "ScopeAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scopeId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "notes" TEXT,
    "evidence" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScopeAssessment_scopeId_fkey" FOREIGN KEY ("scopeId") REFERENCES "Scope" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ScopeAssessment_scopeId_mode_key" ON "ScopeAssessment"("scopeId", "mode");
