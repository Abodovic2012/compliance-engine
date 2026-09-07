-- AlterTable
ALTER TABLE "Control" ADD COLUMN "auditProcedure" TEXT;
ALTER TABLE "Control" ADD COLUMN "auditTestRef" TEXT;
ALTER TABLE "Control" ADD COLUMN "evidenceRequired" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Scope";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ScopeAssessment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ScopeMapping";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ControlAudit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "controlId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "evidence" TEXT,
    "notes" TEXT,
    "assessedBy" TEXT,
    "assessedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ControlAudit_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ControlAudit_controlId_key" ON "ControlAudit"("controlId");
