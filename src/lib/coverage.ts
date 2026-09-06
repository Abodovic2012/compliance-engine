export interface MappingControlRef {
  id: string;
  frameworkId: string;
  framework: { name: string; version: string; region: string };
}

export interface FrameworkCoverage {
  frameworkId: string;
  frameworkName: string;
  version: string;
  region: string;
  controlsCovered: number;
  totalControls: number;
  percentage: number;
  shareOfPlatform: number;
}

export interface ScopeCoverage {
  totalControls: number;
  totalFrameworks: number;
  frameworks: FrameworkCoverage[];
}

export function computeScopeCoverage(
  mappings: { control: MappingControlRef }[],
  frameworkControlTotals: Map<string, number>,
): ScopeCoverage {
  const covered = new Map<string, number>();
  const totalControlIds = new Set<string>();

  for (const m of mappings) {
    const control = m.control;
    totalControlIds.add(control.id);
    covered.set(control.frameworkId, (covered.get(control.frameworkId) ?? 0) + 1);
  }

  const frameworks: FrameworkCoverage[] = [];
  for (const [frameworkId, controlsCovered] of covered.entries()) {
    const first = mappings.find(
      (m) => m.control.frameworkId === frameworkId,
    );
    const framework = first ? first.control.framework : null;
    const totalControls = frameworkControlTotals.get(frameworkId) ?? 0;
    frameworks.push({
      frameworkId,
      frameworkName: framework?.name ?? frameworkId,
      version: framework?.version ?? "",
      region: framework?.region ?? "",
      controlsCovered,
      totalControls,
      percentage: totalControls === 0 ? 0 : Math.round((controlsCovered / totalControls) * 100),
      shareOfPlatform: totalControlIds.size === 0 ? 0 : controlsCovered / totalControlIds.size,
    });
  }

  frameworks.sort(
    (a, b) =>
      b.percentage - a.percentage ||
      a.frameworkName.localeCompare(b.frameworkName),
  );

  return {
    totalControls: totalControlIds.size,
    totalFrameworks: frameworks.length,
    frameworks,
  };
}