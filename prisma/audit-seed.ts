import { PrismaClient } from "@prisma/client";
import {
  GOOGLE_WORKSPACE_SCOPES,
  MS_GRAPH_SCOPES,
  CATEGORY_THEME_MAP,
} from "./scope-catalog";

const ALL_SCOPES = [...GOOGLE_WORKSPACE_SCOPES, ...MS_GRAPH_SCOPES];

export async function seedControlAudits(prisma: PrismaClient): Promise<void> {
  console.log("Starting control audit seed...");

  console.log("Deleting existing ControlAudit records...");
  await prisma.controlAudit.deleteMany();

  const controls = await prisma.control.findMany({
    include: { framework: { select: { name: true } } },
  });
  console.log("Found " + controls.length + " controls for audit seeding.");

  let updated = 0;
  for (const control of controls) {
    const audit = buildAuditGuide(control.theme, control.framework.name);
    await prisma.control.update({
      where: { id: control.id },
      data: {
        auditProcedure: audit.auditProcedure,
        evidenceRequired: audit.evidenceRequired,
        auditTestRef: audit.auditTestRef,
      },
    });
    await prisma.controlAudit.create({
      data: {
        controlId: control.id,
        status: "notstarted",
      },
    });
    updated += 1;
  }

  console.log("Seeded audit guidance + default audits for " + updated + " controls.");
}

export function matchAuditArea(theme: string): { area: string; keywords: number } {
  const t = theme.toLowerCase();
  let best: { area: string; keywords: number } = { area: "Security Governance", keywords: 0 };
  for (const map of CATEGORY_THEME_MAP) {
    const hits = map.keywords.filter((kw) => t.includes(kw.toLowerCase())).length;
    if (hits > best.keywords) {
      best = { area: map.category, keywords: hits };
    }
  }
  return best;
}

export async function seedControlScopeRefs(prisma: PrismaClient): Promise<void> {
  console.log("Starting control scope refs seed...");

  console.log("Deleting existing ControlScopeRef records...");
  await prisma.controlScopeRef.deleteMany();

  const controls = await prisma.control.findMany();
  console.log("Found " + controls.length + " controls for scope ref mapping.");

  let refs = 0;
  let updated = 0;
  for (const control of controls) {
    const { area } = matchAuditArea(control.theme);

    const matchingScopes = ALL_SCOPES.filter((s) => s.category === area);
    const providers = [...new Set(matchingScopes.map((s) => s.provider))];
    const auditScope = describeAuditScope(area, providers);

    if (matchingScopes.length > 0) {
      await prisma.control.update({
        where: { id: control.id },
        data: {
          auditArea: area,
          auditScope,
        },
      });
      await prisma.controlScopeRef.createMany({
        data: matchingScopes.map((s) => ({
          controlId: control.id,
          provider: s.provider,
          scopeId: s.scopeId,
          displayName: s.displayName,
        })),
      });
      refs += matchingScopes.length;
      updated += 1;
    }
  }

  console.log("Seeded " + refs + " scope refs across " + updated + " controls.");
}

export function describeAuditScope(area: string, providers: string[]): string {
  const providerNames = providers
    .map((p) => (p === "google" ? "Google Workspace" : "Microsoft 365 / Graph"))
    .filter(Boolean);
  const unique = [...new Set(providerNames)];
  if (unique.length === 0) return area;
  if (unique.length === 1) return area + " (" + unique[0] + ")";
  return area + " (Google Workspace + Microsoft 365 / Graph)";
}

export function buildAuditGuide(
  theme: string,
  frameworkName: string,
): { auditProcedure: string; evidenceRequired: string; auditTestRef: string } {
  const t = theme.toLowerCase();

  if (/\baccess|authentication|authorization|identity|privilege|mfa|iam\b/.test(t)) {
    return {
      auditProcedure:
        "Verify access control policies are documented and enforced. Sample the user access review process, confirm role-based access and least privilege, and validate that authentication (including MFA where required) is active for all privileged accounts.",
      evidenceRequired:
        "Access control policy; user access review records; user/role permission matrix; MFA enforcement screenshot; privileged access management report.",
      auditTestRef: "Access review register + IAM audit log",
    };
  }
  if (/\bencrypt|cryptograph|key|tls|data at rest|data in transit\b/.test(t)) {
    return {
      auditProcedure:
        "Confirm encryption is applied to sensitive data at rest and in transit. Review cryptographic key management processes, certificate inventory, and TLS configuration for production endpoints.",
      evidenceRequired:
        "Encryption policy; key management procedure + key inventory; TLS/certificate inventory; data classification table showing encrypted assets.",
      auditTestRef: "Key management log + certificate inventory",
    };
  }
  if (/\bbackup|availability|continuity|disaster|recovery|resilience\b/.test(t)) {
    return {
      auditProcedure:
        "Verify backup and business continuity arrangements. Review backup schedules, RTO/RPO targets, and test restore results. Confirm continuity plans cover key business processes and are exercised.",
      evidenceRequired:
        "Backup policy + schedule; restore test results; BCP/DRP documents; continuity exercise minutes; RTO/RPO metrics.",
      auditTestRef: "BC/DR test register + backup monitoring",
    };
  }
  if (/\bincident|response|handling|detection|event|monitoring|alert\b/.test(t)) {
    return {
      auditProcedure:
        "Verify incident detection and response capability. Review monitoring coverage, SIEM/alerting, incident response plan, and evidence of incident handling (tickets, timelines, communications).",
      evidenceRequired:
        "Incident response plan; monitoring/SIEM configuration; sample incident tickets; alert-to-close metrics; post-incident review minutes.",
      auditTestRef: "Incident register + monitoring dashboard",
    };
  }
  if (/\baudit|log|record|logging|retention|monitor\b/.test(t)) {
    return {
      auditProcedure:
        "Confirm audit logging is enabled for key systems and that logs are protected, retained per policy, and reviewable. Verify log sources, retention periods, and access to audit records.",
      evidenceRequired:
        "Logging policy + enabled-log inventory; retention schedule; audit log review evidence; log integrity/access-control configuration.",
      auditTestRef: "Audit log review register + retention schedule",
    };
  }
  if (/\brisk|assess|treatment|accept|register\b/.test(t)) {
    return {
      auditProcedure:
        "Verify a risk management process operates. Review the risk register, assessments, risk treatment decisions, and evidence that risks are reviewed periodically and escalated to management.",
      evidenceRequired:
        "Risk management policy; current risk register; risk assessment reports; risk treatment/acceptance records; review meeting minutes.",
      auditTestRef: "Risk register + risk review cycle",
    };
  }
  if (/\btraining|awareness|competence|personnel|human|hr\b/.test(t)) {
    return {
      auditProcedure:
        "Verify security awareness and competence programs. Review the training curriculum, completion records, and evidence that personnel understand their security responsibilities.",
      evidenceRequired:
        "Security training policy; training completion reports; awareness campaign evidence; role-based competence assessments.",
      auditTestRef: "Training completion register + policy acknowledgement",
    };
  }
  if (/\bchange|config|baseline|hardening|patch|vulnerab|weakne\b/.test(t)) {
    return {
      auditProcedure:
        "Verify change management, secure configuration, and vulnerability management. Review change approvals, configuration baselines, patch status, and vulnerability scan results with remediation tracking.",
      evidenceRequired:
        "Change management policy + change records; configuration baseline docs; vulnerability scan reports; patch status report; remediation plan.",
      auditTestRef: "Change register + vulnerability scan history",
    };
  }
  if (/\bsupply|third.party|vendor|outsourc\b/.test(t)) {
    return {
      auditProcedure:
        "Verify supply chain and third-party risk is managed. Review vendor inventory, due-diligence assessments, contractual security provisions, and ongoing monitoring of vendors.",
      evidenceRequired:
        "Third-party risk policy; vendor inventory; due-diligence assessments; contracts with security clauses; vendor monitoring evidence.",
      auditTestRef: "Vendor risk register + contracts list",
    };
  }
  if (/\bphysical|facilit|premis|on.site\b/.test(t)) {
    return {
      auditProcedure:
        "Verify physical security of facilities and assets. Review physical access controls, visitor management, environmental protections, and evidence that physical security is maintained and tested.",
      evidenceRequired:
        "Physical security policy; access control records; visitor logs; CCTV/environmental system records; physical security test results.",
      auditTestRef: "Physical access register + facility inspections",
    };
  }
  if (/\bnetwork|firewall|segment|perimeter|dns|endpoint\b/.test(t)) {
    return {
      auditProcedure:
        "Verify network and endpoint security. Review firewall rules, network segmentation, endpoint protection coverage, and monitoring of network traffic for anomalies.",
      evidenceRequired:
        "Network security policy; firewall/rule inventory; segmentation diagram; endpoint protection coverage report; anomaly detection evidence.",
      auditTestRef: "Network device audit + endpoint report",
    };
  }
  return {
    auditProcedure:
      "Review the control within the " + frameworkName + " framework against documented evidence. Confirm the control is implemented, operating effectively, and that supporting records are retained and reviewable.",
    evidenceRequired:
      "Control implementation records; supporting policy/procedure; sample transactional evidence; management review confirmation.",
    auditTestRef: "Control evidence file + implementation records",
  };
}

export async function seedControlAuditsStandalone(): Promise<void> {
  const client = new PrismaClient();
  try {
    await seedControlAudits(client);
    await seedControlScopeRefs(client);
  } finally {
    await client.$disconnect();
  }
}

if (require.main === module) {
  seedControlAuditsStandalone().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}