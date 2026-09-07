export type AuditStatus = "compliant" | "partial" | "noncompliant" | "notstarted";

const AUDIT_WEIGHTS: Record<AuditStatus, number> = {
  compliant: 1,
  partial: 0.5,
  noncompliant: 0,
  notstarted: 0,
};

export function scoreForStatus(status: string): number {
  const w = AUDIT_WEIGHTS[status as AuditStatus];
  return w ?? 0;
}

export function statusForAuditPercentage(pct: number): string {
  if (pct >= 90) return "compliant";
  if (pct >= 70) return "partially-compliant";
  if (pct >= 40) return "at-risk";
  return "non-compliant";
}

export interface ControlAuditInput {
  id: string;
  ref: string;
  theme: string;
  frameworkId: string;
  framework: { name: string; version: string; region: string };
  audit: { status: string; evidence: string | null; notes: string | null } | null;
}

export interface FrameworkAuditScore {
  frameworkId: string;
  frameworkName: string;
  version: string;
  region: string;
  totalControls: number;
  assessedControls: number;
  compliant: number;
  partial: number;
  noncompliant: number;
  notstarted: number;
  percentage: number;
  status: string;
}

export interface AuditWeakPoint {
  frameworkId: string;
  frameworkName: string;
  controlId: string;
  ref: string;
  theme: string;
  status: string;
  evidenceMissing: boolean;
}

export interface AuditScorecardResult {
  generatedAt: string;
  totalControls: number;
  assessedControls: number;
  frameworks: FrameworkAuditScore[];
  weakPoints: AuditWeakPoint[];
  overall: number;
}

export function buildAuditScorecard(controls: ControlAuditInput[]): AuditScorecardResult {
  const frameworkMap = new Map<string, FrameworkAuditScore>();
  const weakPoints: AuditWeakPoint[] = [];

  for (const c of controls) {
    const status = c.audit?.status ?? "notstarted";
    const entry =
      frameworkMap.get(c.frameworkId) ??
      {
        frameworkId: c.frameworkId,
        frameworkName: c.framework.name,
        version: c.framework.version,
        region: c.framework.region,
        totalControls: 0,
        assessedControls: 0,
        compliant: 0,
        partial: 0,
        noncompliant: 0,
        notstarted: 0,
        percentage: 0,
        status: "",
      };
    entry.totalControls += 1;
    if (status !== "notstarted") entry.assessedControls += 1;

    if (status === "compliant") entry.compliant += 1;
    else if (status === "partial") {
      entry.partial += 1;
      weakPoints.push({
        frameworkId: c.frameworkId,
        frameworkName: c.framework.name,
        controlId: c.id,
        ref: c.ref,
        theme: c.theme,
        status,
        evidenceMissing: !c.audit?.evidence,
      });
    } else if (status === "noncompliant") {
      entry.noncompliant += 1;
      weakPoints.push({
        frameworkId: c.frameworkId,
        frameworkName: c.framework.name,
        controlId: c.id,
        ref: c.ref,
        theme: c.theme,
        status,
        evidenceMissing: !c.audit?.evidence,
      });
    } else {
      entry.notstarted += 1;
      weakPoints.push({
        frameworkId: c.frameworkId,
        frameworkName: c.framework.name,
        controlId: c.id,
        ref: c.ref,
        theme: c.theme,
        status,
        evidenceMissing: true,
      });
    }

    frameworkMap.set(c.frameworkId, entry);
  }

  for (const [id, entry] of frameworkMap.entries()) {
    const weightSum = controls.reduce((sum, c) => {
      if (c.frameworkId !== id) return sum;
      return sum + scoreForStatus(c.audit?.status ?? "notstarted");
    }, 0);
    entry.percentage =
      entry.totalControls === 0 ? 0 : Math.round((weightSum / entry.totalControls) * 100);
    entry.status = statusForAuditPercentage(entry.percentage);
    frameworkMap.set(id, entry);
  }

  const frameworks = [...frameworkMap.values()].sort(
    (a, b) =>
      a.percentage - b.percentage ||
      a.frameworkName.localeCompare(b.frameworkName),
  );

  weakPoints.sort(
    (a, b) =>
      Number(b.evidenceMissing) - Number(a.evidenceMissing) ||
      a.frameworkName.localeCompare(b.frameworkName) ||
      a.ref.localeCompare(b.ref),
  );

  const totalControls = controls.length;
  const overallWeight = controls.reduce(
    (s, c) => s + scoreForStatus(c.audit?.status ?? "notstarted"),
    0,
  );

  return {
    generatedAt: new Date().toISOString(),
    totalControls,
    assessedControls: controls.filter((c) => (c.audit?.status ?? "notstarted") !== "notstarted").length,
    frameworks,
    weakPoints,
    overall: totalControls === 0 ? 0 : Math.round((overallWeight / totalControls) * 100),
  };
}