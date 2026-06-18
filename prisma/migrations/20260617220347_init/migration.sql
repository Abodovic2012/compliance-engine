-- CreateTable
CREATE TABLE "DataItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "defaultValue" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Framework" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "region" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Control" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "frameworkId" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "Control_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "Framework" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dataItemId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "slaThreshold" TEXT NOT NULL,
    "findingType" TEXT NOT NULL,
    "remediation" TEXT NOT NULL,
    "evidenceRequired" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "supplyChainFlag" BOOLEAN NOT NULL DEFAULT false,
    "kevOverride" TEXT NOT NULL DEFAULT 'N/A',
    "testId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Mapping_dataItemId_fkey" FOREIGN KEY ("dataItemId") REFERENCES "DataItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mapping_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DataItem_key_key" ON "DataItem"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Framework_name_key" ON "Framework"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Mapping_dataItemId_controlId_key" ON "Mapping"("dataItemId", "controlId");
