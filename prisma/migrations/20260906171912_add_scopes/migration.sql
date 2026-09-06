-- CreateTable
CREATE TABLE "Scope" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "scopeId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "adminConsentRequired" BOOLEAN NOT NULL DEFAULT false,
    "accessLevel" TEXT NOT NULL DEFAULT 'read',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ScopeMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scopeId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScopeMapping_scopeId_fkey" FOREIGN KEY ("scopeId") REFERENCES "Scope" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ScopeMapping_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Scope_provider_scopeId_key" ON "Scope"("provider", "scopeId");

-- CreateIndex
CREATE UNIQUE INDEX "ScopeMapping_scopeId_controlId_key" ON "ScopeMapping"("scopeId", "controlId");
