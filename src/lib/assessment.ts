import {
  ScopeWithData,
  ScopeFrameworkRef,
  AssessmentMode,
  buildScorecard,
  ScorecardResult,
} from "@/lib/scoring";
import { prisma } from "@/lib/prisma";

interface ScopeRow {
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
  assessment: { state: string; notes: string | null; evidence: string | null } | null;
  mappings: {
    riskLevel: string;
    control: {
      frameworkId: string;
      framework: { name: string; version: string; region: string };
    };
  }[];
}

const RISK_RANK: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

function worstRisk(a: string, b: string): string {
  const ai = RISK_RANK[a.toLowerCase()] ?? 0;
  const bi = RISK_RANK[b.toLowerCase()] ?? 0;
  return ai >= bi ? a : b;
}

export function toScopeWithData(scope: ScopeRow): ScopeWithData {
  const frameworkMap = new Map<string, ScopeFrameworkRef>();
  for (const m of scope.mappings) {
    const fwId = m.control.frameworkId;
    const fw = m.control.framework;
    const existing = frameworkMap.get(fwId);
    if (existing) {
      existing.riskLevel = worstRisk(existing.riskLevel, m.riskLevel);
      existing.controls += 1;
    } else {
      frameworkMap.set(fwId, {
        frameworkId: fwId,
        frameworkName: fw.name,
        version: fw.version,
        region: fw.region,
        riskLevel: m.riskLevel,
        controls: 1,
      });
    }
  }

  return {
    id: scope.id,
    provider: scope.provider,
    scopeId: scope.scopeId,
    displayName: scope.displayName,
    category: scope.category,
    accessLevel: scope.accessLevel,
    adminConsentRequired: scope.adminConsentRequired,
    testProcedure: scope.testProcedure,
    evidenceRequired: scope.evidenceRequired,
    testReference: scope.testReference,
    assessment: scope.assessment,
    frameworks: [...frameworkMap.values()],
  };
}

export async function fetchAssessmentScopes(mode: AssessmentMode): Promise<ScopeWithData[]> {
  const scopes = await prisma.scope.findMany({
    include: {
      assessments: {
        where: { mode },
        select: { state: true, notes: true, evidence: true },
      },
      mappings: {
        select: {
          riskLevel: true,
          control: {
            select: {
              frameworkId: true,
              framework: { select: { name: true, version: true, region: true } },
            },
          },
        },
      },
    },
    orderBy: [{ provider: "asc" }, { scopeId: "asc" }],
  });

  return scopes.map((s) =>
    toScopeWithData({
      ...s,
      assessment: s.assessments[0] ?? null,
    }),
  );
}

export async function buildAssessmentReport(mode: AssessmentMode): Promise<ScorecardResult> {
  const scopes = await fetchAssessmentScopes(mode);
  return buildScorecard(scopes, mode);
}