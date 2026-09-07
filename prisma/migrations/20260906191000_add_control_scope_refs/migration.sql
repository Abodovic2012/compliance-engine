-- AlterTable
ALTER TABLE "Control" ADD COLUMN "auditArea" TEXT;
ALTER TABLE "Control" ADD COLUMN "auditScope" TEXT;

-- CreateTable
CREATE TABLE "ControlScopeRef" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "controlId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "scopeId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    CONSTRAINT "ControlScopeRef_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ControlScopeRef_controlId_scopeId_key" ON "ControlScopeRef"("controlId", "scopeId");
