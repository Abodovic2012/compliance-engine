import type { AuditScorecardResult } from "@/lib/audit-scoring";
import { buildAuditScorecard } from "@/lib/audit-scoring";
import type { AuditBreakdownReport } from "@/lib/audit-coverage";
import { buildAuditBreakdown } from "@/lib/audit-coverage";
import { prisma } from "@/lib/prisma";

export interface AuditControlRecord {
  id: string;
  ref: string;
  theme: string;
  description: string;
  auditArea: string | null;
  auditScope: string | null;
  auditProcedure: string | null;
  evidenceRequired: string | null;
  auditTestRef: string | null;
  framework: { id: string; name: string; version: string; region: string };
  audit: { status: string; evidence: string | null; notes: string | null } | null;
  mappingsCount: number;
  mappings: {
    severity: string;
    findingType: string;
    dataItem: { name: string };
  }[];
  scopeRefs: {
    provider: string;
    scopeId: string;
    displayName: string;
  }[];
}

export async function fetchAuditControls(): Promise<AuditControlRecord[]> {
  const controls = await prisma.control.findMany({
    include: {
      framework: { select: { id: true, name: true, version: true, region: true } },
      audit: true,
      scopeRefs: { select: { provider: true, scopeId: true, displayName: true } },
      mappings: {
        select: {
          severity: true,
          findingType: true,
          dataItem: { select: { label: true } },
        },
      },
    },
    orderBy: [{ framework: { name: "asc" } }, { ref: "asc" }],
  });

  return controls.map((c) => ({
    id: c.id,
    ref: c.ref,
    theme: c.theme,
    description: c.description,
    auditArea: c.auditArea,
    auditScope: c.auditScope,
    auditProcedure: c.auditProcedure,
    evidenceRequired: c.evidenceRequired,
    auditTestRef: c.auditTestRef,
    framework: c.framework,
    audit: c.audit
      ? { status: c.audit.status, evidence: c.audit.evidence, notes: c.audit.notes }
      : null,
    mappingsCount: c.mappings.length,
    mappings: c.mappings.map((m) => ({
      severity: m.severity,
      findingType: m.findingType,
      dataItem: { name: m.dataItem.label },
    })),
    scopeRefs: c.scopeRefs.map((s) => ({
      provider: s.provider,
      scopeId: s.scopeId,
      displayName: s.displayName,
    })),
  }));
}

export function toScorecardInput(records: AuditControlRecord[]): Parameters<typeof buildAuditScorecard>[0] {
  return records.map((r) => ({
    id: r.id,
    ref: r.ref,
    theme: r.theme,
    frameworkId: r.framework.id,
    framework: r.framework,
    audit: r.audit,
  }));
}

export function toBreakdownInput(records: AuditControlRecord[]): Parameters<typeof buildAuditBreakdown>[0] {
  return records.map((r) => ({
    id: r.id,
    ref: r.ref,
    theme: r.theme,
    description: r.description,
    frameworkId: r.framework.id,
    framework: r.framework,
    audit: r.audit,
    mappings: r.mappings,
    auditArea: r.auditArea,
    auditScope: r.auditScope,
    scopeRefs: r.scopeRefs,
  }));
}

export async function buildAuditReport(): Promise<
  { scorecard: AuditScorecardResult; breakdown: AuditBreakdownReport }
> {
  const records = await fetchAuditControls();
  return {
    scorecard: buildAuditScorecard(toScorecardInput(records)),
    breakdown: buildAuditBreakdown(toBreakdownInput(records)),
  };
}