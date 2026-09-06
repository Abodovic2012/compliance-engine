export interface ScopeMappingInput {
  id: string;
  riskLevel: string;
  scope: {
    id: string;
    provider: string;
    scopeId: string;
    displayName: string;
    category: string;
    accessLevel: string;
  };
}

export interface ControlInput {
  id: string;
  ref: string;
  frameworkId: string;
  framework: { name: string; version: string; region: string };
  scopeMappings: ScopeMappingInput[];
}

export interface CategoryBreakdown {
  category: string;
  mappings: number;
  coveredControls: number;
  sharePercent: number;
}

export interface TopScope {
  scopeId: string;
  displayName: string;
  provider: string;
  controlsCovered: number;
  coveragePercent: number;
}

export interface RiskDistribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface FrameworkCoverage {
  frameworkId: string;
  frameworkName: string;
  version: string;
  region: string;
  totalControls: number;
  controlsWithScope: number;
  controlsWithoutScope: number;
  coveragePercent: number;
  totalScopeMappings: number;
  distinctScopes: number;
  categories: CategoryBreakdown[];
  topScopes: TopScope[];
  riskDistribution: RiskDistribution;
}

export interface PlatformCoverageReport {
  generatedAt: string;
  totals: {
    frameworks: number;
    totalControls: number;
    controlsWithScope: number;
    controlsWithoutScope: number;
    overallCoveragePercent: number;
    totalScopeMappings: number;
    distinctScopes: number;
  };
  frameworks: FrameworkCoverage[];
}

function riskKey(risk: string): keyof RiskDistribution {
  const k = risk.toLowerCase().trim();
  if (k === "critical" || k === "high" || k === "medium") return k;
  return "low";
}

export function buildPlatformCoverage(controls: ControlInput[]): PlatformCoverageReport {
  const grouped = new Map<string, ControlInput[]>();
  for (const c of controls) {
    const list = grouped.get(c.frameworkId) ?? [];
    list.push(c);
    grouped.set(c.frameworkId, list);
  }

  const frameworks: FrameworkCoverage[] = [];

  for (const [frameworkId, fwControls] of grouped.entries()) {
    if (fwControls.length === 0) continue;

    const first = fwControls[0];
    let controlsWithScope = 0;
    let totalScopeMappings = 0;
    const categoryMap = new Map<string, { mappings: number; controls: Set<string> }>();
    const scopeMap = new Map<string, { controls: Set<string>; scopeId: string; displayName: string; provider: string }>();
    const riskDist: RiskDistribution = { critical: 0, high: 0, medium: 0, low: 0 };

    for (const c of fwControls) {
      const hasScope = c.scopeMappings.length > 0;
      if (hasScope) controlsWithScope += 1;
      totalScopeMappings += c.scopeMappings.length;

      for (const m of c.scopeMappings) {
        riskDist[riskKey(m.riskLevel)] += 1;

        const cat = categoryMap.get(m.scope.category) ?? { mappings: 0, controls: new Set<string>() };
        cat.mappings += 1;
        cat.controls.add(c.id);
        categoryMap.set(m.scope.category, cat);

        const sp = scopeMap.get(m.scope.id) ?? { controls: new Set<string>(), scopeId: m.scope.scopeId, displayName: m.scope.displayName, provider: m.scope.provider };
        sp.controls.add(c.id);
        scopeMap.set(m.scope.id, sp);
      }
    }

    const total = fwControls.length;
    const categories: CategoryBreakdown[] = [...categoryMap.entries()]
      .map(([category, v]) => ({
        category,
        mappings: v.mappings,
        coveredControls: v.controls.size,
        sharePercent:
          totalScopeMappings === 0
            ? 0
            : Math.round((v.mappings / totalScopeMappings) * 100),
      }))
      .sort((a, b) => b.mappings - a.mappings || a.category.localeCompare(b.category));

    const topScopes: TopScope[] = [...scopeMap.entries()]
      .map(([, v]) => ({
          scopeId: v.scopeId,
          displayName: v.displayName,
          provider: v.provider,
          controlsCovered: v.controls.size,
          coveragePercent:
            total === 0 ? 0 : Math.round((v.controls.size / total) * 100),
        }))
      .sort((a, b) => b.controlsCovered - a.controlsCovered)
      .slice(0, 8);

    frameworks.push({
      frameworkId,
      frameworkName: first.framework.name,
      version: first.framework.version,
      region: first.framework.region,
      totalControls: total,
      controlsWithScope,
      controlsWithoutScope: total - controlsWithScope,
      coveragePercent: Math.round((controlsWithScope / total) * 100),
      totalScopeMappings,
      distinctScopes: scopeMap.size,
      categories,
      topScopes,
      riskDistribution: riskDist,
    });
  }

  frameworks.sort(
    (a, b) =>
      a.coveragePercent - b.coveragePercent ||
      a.frameworkName.localeCompare(b.frameworkName),
  );

  const totalControls = frameworks.reduce((s, f) => s + f.totalControls, 0);
  const controlsWithScope = frameworks.reduce((s, f) => s + f.controlsWithScope, 0);
  const totalScopeMappings = frameworks.reduce((s, f) => s + f.totalScopeMappings, 0);
  const distinctScopes = new Set(
    controls.flatMap((c) => c.scopeMappings.map((m) => m.scope.id)),
  ).size;

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      frameworks: frameworks.length,
      totalControls,
      controlsWithScope,
      controlsWithoutScope: totalControls - controlsWithScope,
      overallCoveragePercent:
        totalControls === 0 ? 0 : Math.round((controlsWithScope / totalControls) * 100),
      totalScopeMappings,
      distinctScopes,
    },
    frameworks,
  };
}