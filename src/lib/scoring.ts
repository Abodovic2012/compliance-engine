export type AssessmentMode = "checklist" | "inventory";

export interface ScopeFrameworkRef {
  frameworkId: string;
  frameworkName: string;
  version: string;
  region: string;
  riskLevel: string;
  controls: number;
}

export interface ScopeWithData {
  id: string;
  provider: string;
  scopeId: string;
  displayName: string;
  category: string;
  accessLevel: string;
  adminConsentRequired: boolean;
  testProcedure: string | null;
  evidenceRequired: string | null;
  testReference: string | null;
  assessment?: { state: string; notes: string | null; evidence: string | null } | null;
  frameworks: ScopeFrameworkRef[];
}

export interface FrameworkScore {
  frameworkId: string;
  frameworkName: string;
  version: string;
  region: string;
  mode: AssessmentMode;
  relevantScopes: number;
  assessedScopes: number;
  compliant: number;
  partial: number;
  notCompliant: number;
  percentage: number;
  status: string;
}

export interface WeakPoint {
  frameworkId: string;
  frameworkName: string;
  scopeId: string;
  provider: string;
  displayName: string;
  category: string;
  accessLevel: string;
  state: string;
  riskLevel: string;
  associatedControls: number;
}

export interface ScorecardResult {
  mode: AssessmentMode;
  generatedAt: string;
  frameworks: FrameworkScore[];
  weakPoints: WeakPoint[];
  overall: number;
}

const RISK_RANK: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

export function statusForPercentage(pct: number): string {
  if (pct >= 90) return "compliant";
  if (pct >= 70) return "partially-compliant";
  if (pct >= 40) return "at-risk";
  return "non-compliant";
}

function scoreForState(mode: AssessmentMode, state: string): number {
  if (mode === "checklist") {
    if (state === "done") return 1;
    if (state === "partial") return 0.5;
    return 0;
  }
  return state === "granted" ? 1 : 0;
}

export function buildScorecard(
  scopes: ScopeWithData[],
  mode: AssessmentMode,
): ScorecardResult {
  const frameworkMap = new Map<
    string,
    {
      frameworkId: string;
      frameworkName: string;
      version: string;
      region: string;
      relevantScopes: number;
      assessedScopes: number;
      compliantCount: number;
      partialCount: number;
      weightSum: number;
    }
  >();
  const weakPoints: WeakPoint[] = [];

  for (const scope of scopes) {
    for (const fw of scope.frameworks) {
      const entry =
        frameworkMap.get(fw.frameworkId) ??
        {
          frameworkId: fw.frameworkId,
          frameworkName: fw.frameworkName,
          version: fw.version,
          region: fw.region,
          relevantScopes: 0,
          assessedScopes: 0,
          compliantCount: 0,
          partialCount: 0,
          weightSum: 0,
        };
      entry.relevantScopes += 1;

      const state = scope.assessment?.state ?? "";
      if (state !== "") entry.assessedScopes += 1;

      const score = scoreForState(mode, state);
      entry.weightSum += score;
      if (score === 1) entry.compliantCount += 1;
      if (mode === "checklist" && state === "partial") entry.partialCount += 1;

      if (
        mode === "checklist"
          ? state !== "done"
          : state !== "granted"
      ) {
        weakPoints.push({
          frameworkId: fw.frameworkId,
          frameworkName: fw.frameworkName,
          scopeId: scope.id,
          provider: scope.provider,
          displayName: scope.displayName,
          category: scope.category,
          accessLevel: scope.accessLevel,
          state,
          riskLevel: fw.riskLevel,
          associatedControls: fw.controls,
        });
      }

      frameworkMap.set(fw.frameworkId, entry);
    }
  }

  const frameworks: FrameworkScore[] = [];
  for (const entry of frameworkMap.values()) {
    const percentage =
      entry.relevantScopes === 0
        ? 0
        : Math.round((entry.weightSum / entry.relevantScopes) * 100);
    frameworks.push({
      frameworkId: entry.frameworkId,
      frameworkName: entry.frameworkName,
      version: entry.version,
      region: entry.region,
      mode,
      relevantScopes: entry.relevantScopes,
      assessedScopes: entry.assessedScopes,
      compliant: entry.compliantCount,
      partial: entry.partialCount,
      notCompliant: entry.relevantScopes - entry.compliantCount - entry.partialCount,
      percentage,
      status: statusForPercentage(percentage),
    });
  }

  frameworks.sort(
    (a, b) =>
      a.percentage - b.percentage ||
      a.frameworkName.localeCompare(b.frameworkName),
  );

  weakPoints.sort(
    (a, b) =>
      (RISK_RANK[b.riskLevel.toLowerCase()] ?? 0) -
        (RISK_RANK[a.riskLevel.toLowerCase()] ?? 0) ||
      a.frameworkName.localeCompare(b.frameworkName),
  );

  const totalRelevant = frameworks.reduce((s, f) => s + f.relevantScopes, 0);
  const overall =
    totalRelevant === 0
      ? 0
      : Math.round(
          frameworks.reduce((s, f) => s + f.percentage * f.relevantScopes, 0) /
            totalRelevant,
        );

  return {
    mode,
    generatedAt: new Date().toISOString(),
    frameworks,
    weakPoints,
    overall,
  };
}