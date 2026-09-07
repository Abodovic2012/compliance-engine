export interface ControlBreakdownInput {
  id: string;
  ref: string;
  theme: string;
  description: string;
  frameworkId: string;
  framework: { name: string; version: string; region: string };
  audit: { status: string; evidence: string | null; notes: string | null } | null;
  mappings: { severity: string; findingType: string; dataItem: { name: string } }[];
}

export interface CategoryBreakdown {
  theme: string;
  totalControls: number;
  compliant: number;
  partial: number;
  noncompliant: number;
  notstarted: number;
  assessedPercent: number;
}

export interface RiskDistribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface TopWeakControl {
  controlId: string;
  ref: string;
  theme: string;
  status: string;
  severity: string;
  evidenceMissing: boolean;
}

export interface FrameworkAuditBreakdown {
  frameworkId: string;
  frameworkName: string;
  version: string;
  region: string;
  totalControls: number;
  controlsWithMappings: number;
  controlsWithoutMappings: number;
  mappingCoveragePercent: number;
  totalMappings: number;
  totalDataItems: number;
  compliant: number;
  partial: number;
  noncompliant: number;
  notstarted: number;
  assessedPercent: number;
  auditPercent: number;
  categories: CategoryBreakdown[];
  topWeakControls: TopWeakControl[];
  riskDistribution: RiskDistribution;
}

export interface AuditBreakdownReport {
  generatedAt: string;
  totals: {
    frameworks: number;
    totalControls: number;
    assessedControls: number;
    overallAuditPercent: number;
    overallMappingCoveragePercent: number;
    totalMappings: number;
  };
  frameworks: FrameworkAuditBreakdown[];
}

function riskKey(v: string): keyof RiskDistribution {
  const k = v.toLowerCase().trim();
  if (k === "critical" || k === "high" || k === "medium") return k;
  return "low";
}

export function buildAuditBreakdown(controls: ControlBreakdownInput[]): AuditBreakdownReport {
  const grouped = new Map<string, ControlBreakdownInput[]>();
  for (const c of controls) {
    const list = grouped.get(c.frameworkId) ?? [];
    list.push(c);
    grouped.set(c.frameworkId, list);
  }

  const frameworks: FrameworkAuditBreakdown[] = [];

  for (const [frameworkId, fwControls] of grouped.entries()) {
    if (fwControls.length === 0) continue;
    const first = fwControls[0];

    let withMappings = 0;
    let totalMappings = 0;
    const dataItems = new Set<string>();
    const categories = new Map<string, CategoryBreakdown>();
    const riskDist: RiskDistribution = { critical: 0, high: 0, medium: 0, low: 0 };

    for (const c of fwControls) {
      if (c.mappings.length > 0) withMappings += 1;
      totalMappings += c.mappings.length;
      for (const m of c.mappings) dataItems.add(m.dataItem.name);

      const status = c.audit?.status ?? "notstarted";
      const cat = categories.get(c.theme) ?? {
        theme: c.theme,
        totalControls: 0,
        compliant: 0,
        partial: 0,
        noncompliant: 0,
        notstarted: 0,
        assessedPercent: 0,
      };
      cat.totalControls += 1;
      if (status === "compliant") cat.compliant += 1;
      else if (status === "partial") cat.partial += 1;
      else if (status === "noncompliant") cat.noncompliant += 1;
      else cat.notstarted += 1;
      categories.set(c.theme, cat);

      if (status !== "notstarted") {
        for (const m of c.mappings) {
          riskDist[riskKey(m.severity)] += 1;
        }
      }
    }

    let compliant = 0;
    let partial = 0;
    let noncompliant = 0;
    let notstarted = 0;
    for (const c of fwControls) {
      const status = c.audit?.status ?? "notstarted";
      if (status === "compliant") compliant += 1;
      else if (status === "partial") partial += 1;
      else if (status === "noncompliant") noncompliant += 1;
      else notstarted += 1;
    }

    const catList = [...categories.values()].map((cat) => ({
      ...cat,
      assessedPercent:
        cat.totalControls === 0
          ? 0
          : Math.round(
              ((cat.compliant + cat.partial + cat.noncompliant) / cat.totalControls) * 100,
            ),
    }));

    const topWeakControls: TopWeakControl[] = fwControls
      .filter((c) => (c.audit?.status ?? "notstarted") !== "compliant")
      .map((c) => {
        const status = c.audit?.status ?? "notstarted";
        const worst = c.mappings
          .map((m) => riskKey(m.severity))
          .reduce((a, b) => {
            const rank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
            return rank[b] > rank[a] ? b : a;
          }, "low");
        return {
          controlId: c.id,
          ref: c.ref,
          theme: c.theme,
          status,
          severity: worst,
          evidenceMissing: !c.audit?.evidence,
        };
      })
      .sort(
        (a, b) =>
          Number(b.evidenceMissing) - Number(a.evidenceMissing) ||
          a.status.localeCompare(b.status),
      )
      .slice(0, 8);

    const total = fwControls.length;
    const assessed = compliant + partial + noncompliant;
    frameworks.push({
      frameworkId,
      frameworkName: first.framework.name,
      version: first.framework.version,
      region: first.framework.region,
      totalControls: total,
      controlsWithMappings: withMappings,
      controlsWithoutMappings: total - withMappings,
      mappingCoveragePercent: Math.round((withMappings / total) * 100),
      totalMappings,
      totalDataItems: dataItems.size,
      compliant,
      partial,
      noncompliant,
      notstarted,
      assessedPercent: Math.round((assessed / total) * 100),
      auditPercent: Math.round(
        ((compliant + partial * 0.5) / total) * 100,
      ),
      categories: catList.sort(
        (a, b) => b.totalControls - a.totalControls || a.theme.localeCompare(b.theme),
      ),
      topWeakControls,
      riskDistribution: riskDist,
    });
  }

  frameworks.sort(
    (a, b) => a.auditPercent - b.auditPercent || a.frameworkName.localeCompare(b.frameworkName),
  );

  const totalControls = frameworks.reduce((s, f) => s + f.totalControls, 0);
  const assessedControls = frameworks.reduce((s, f) => s + f.compliant + f.partial + f.noncompliant, 0);
  const withMappings = frameworks.reduce((s, f) => s + f.controlsWithMappings, 0);
  const totalMappings = frameworks.reduce((s, f) => s + f.totalMappings, 0);

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      frameworks: frameworks.length,
      totalControls,
      assessedControls,
      overallAuditPercent:
        totalControls === 0
          ? 0
          : Math.round(
              (frameworks.reduce(
                (s, f) => s + (f.compliant + f.partial * 0.5),
                0,
              ) /
                totalControls) *
                100,
            ),
      overallMappingCoveragePercent:
        totalControls === 0 ? 0 : Math.round((withMappings / totalControls) * 100),
      totalMappings,
    },
    frameworks,
  };
}