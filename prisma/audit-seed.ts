import { PrismaClient } from "@prisma/client";
import {
  GOOGLE_WORKSPACE_SCOPES,
  MS_GRAPH_SCOPES,
  CATEGORY_THEME_MAP,
} from "./scope-catalog";

const ALL_SCOPES = [...GOOGLE_WORKSPACE_SCOPES, ...MS_GRAPH_SCOPES];

export async function seedControlAudits(prisma: PrismaClient): Promise<void> {
  console.log("Starting control audit seed...");

  const controls = await prisma.control.findMany({
    include: { framework: { select: { name: true } } },
  });
  console.log("Found " + controls.length + " controls for audit seeding.");

  const existing = await prisma.controlAudit.findMany({ select: { controlId: true } });
  const existingIds = new Set(existing.map((e) => e.controlId));

  let created = 0;
  let kept = 0;
  for (const control of controls) {
    const audit = buildAuditGuide(control.theme, control.framework.name);
    await prisma.control.update({
      where: { id: control.id },
      data: {
        auditProcedure: audit.auditProcedure,
        evidenceRequired: audit.evidenceRequired,
        auditTestRef: audit.auditTestRef,
        scope: audit.scope,
        remediation: audit.remediation,
      },
    });
    if (!existingIds.has(control.id)) {
      await prisma.controlAudit.create({
        data: {
          controlId: control.id,
          status: demoStatusFor(control.ref, control.theme),
        },
      });
      created += 1;
    } else {
      kept += 1;
    }
  }

  console.log(
    "Created " + created + " demo audits, kept existing " + kept + " audits. Guidance updated for " +
      controls.length + " controls."
  );
}

export function demoStatusFor(
  ref: string,
  theme: string
): "compliant" | "partial" | "noncompliant" | "notstarted" {
  let h = 0;
  const seed = ref + ":" + theme;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const r = h % 100;
  if (r < 45) return "compliant";
  if (r < 70) return "partial";
  if (r < 85) return "noncompliant";
  return "notstarted";
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
): { auditProcedure: string; evidenceRequired: string; auditTestRef: string; scope: string; remediation: string } {
  const t = theme.toLowerCase();

  if (/\baccess|authentication|authorization|identity|privilege|mfa|iam\b/.test(t)) {
    return {
      auditProcedure:
        "Verify access control policies are documented and enforced. Sample the user access review process, confirm role-based access and least privilege, and validate that authentication (including MFA where required) is active for all privileged accounts.",
      evidenceRequired:
        "Access control policy; user access review records; user/role permission matrix; MFA enforcement screenshot; privileged access management report.",
      auditTestRef: "Access review register + IAM audit log",
      scope:
        "We need to verify that all user and admin accounts have access controls enforced and that authentication (including Multi-Factor Authentication where required) is active and actively enforced. Confirm role-based access and least privilege are applied. To pass, 100% of active accounts, especially privileged accounts, must enforce MFA without exceptions and follow approved role assignments.",
      remediation:
        "Enforce conditional access policies in Microsoft 365, Google Workspace, or your identity provider to make MFA mandatory for all users and admins; remove or correct any accounts flagged as non-compliant, revoke excessive privileges, and re-run the access review to confirm 100% coverage.",
    };
  }
  if (/\bencrypt|cryptograph|key|tls|data at rest|data in transit\b/.test(t)) {
    return {
      auditProcedure:
        "Confirm encryption is applied to sensitive data at rest and in transit. Review cryptographic key management processes, certificate inventory, and TLS configuration for production endpoints.",
      evidenceRequired:
        "Encryption policy; key management procedure + key inventory; TLS/certificate inventory; data classification table showing encrypted assets.",
      auditTestRef: "Key management log + certificate inventory",
      scope:
        "We need to verify that sensitive data is encrypted at rest and in transit using approved algorithms and current keys. Review key/certificate management and TLS configuration. To pass, 100% of in-scope data stores and endpoints must use approved encryption with valid, non-expired keys and certificates.",
      remediation:
        "Enable encryption for all in-scope data stores, rotate or renew expired keys and certificates, enforce TLS 1.2 or higher on all endpoints, and update the key inventory to reflect the changes.",
    };
  }
  if (/\bbackup|availability|continuity|disaster|recovery|resilience\b/.test(t)) {
    return {
      auditProcedure:
        "Verify backup and business continuity arrangements. Review backup schedules, RTO/RPO targets, and test restore results. Confirm continuity plans cover key business processes and are exercised.",
      evidenceRequired:
        "Backup policy + schedule; restore test results; BCP/DRP documents; continuity exercise minutes; RTO/RPO metrics.",
      auditTestRef: "BC/DR test register + backup monitoring",
      scope:
        "We need to verify that backups run per schedule and that business continuity and disaster recovery plans are tested. Confirm RTO/RPO targets are met. To pass, 100% of in-scope systems must have a successful recent restore test and a documented, exercised continuity plan.",
      remediation:
        "Fix failed or missing backups, restore RTO/RPO to target, schedule and evidence a restore test, and update the BC/DR plan for any gaps identified.",
    };
  }
  if (/\bincident|response|handling|detection|event|monitoring|alert\b/.test(t)) {
    return {
      auditProcedure:
        "Verify incident detection and response capability. Review monitoring coverage, SIEM/alerting, incident response plan, and evidence of incident handling (tickets, timelines, communications).",
      evidenceRequired:
        "Incident response plan; monitoring/SIEM configuration; sample incident tickets; alert-to-close metrics; post-incident review minutes.",
      auditTestRef: "Incident register + monitoring dashboard",
      scope:
        "We need to verify that incident detection and response is operating. Review monitoring coverage, alerting, the incident response plan, and confirm incidents were handled and closed. To pass, 100% of in-scope systems must be monitored and all high-severity incidents must have documented response and closure within SLA.",
      remediation:
        "Close monitoring gaps, tune alerting, remediate open incidents within SLA, and update the incident response plan and post-incident actions to prevent recurrence.",
    };
  }
  if (/\baudit|log|record|logging|retention|monitor\b/.test(t)) {
    return {
      auditProcedure:
        "Confirm audit logging is enabled for key systems and that logs are protected, retained per policy, and reviewable. Verify log sources, retention periods, and access to audit records.",
      evidenceRequired:
        "Logging policy + enabled-log inventory; retention schedule; audit log review evidence; log integrity/access-control configuration.",
      auditTestRef: "Audit log review register + retention schedule",
      scope:
        "We need to verify that audit logging is enabled and protected on key systems and that logs are retained per policy and reviewable. To pass, 100% of in-scope systems must emit protected logs retained for the required period, with evidence of periodic review.",
      remediation:
        "Enable logging on systems missing coverage, extend retention to the required period, restrict access to log stores, and start and evidence regular log reviews.",
    };
  }
  if (/\brisk|assess|treatment|accept|register\b/.test(t)) {
    return {
      auditProcedure:
        "Verify a risk management process operates. Review the risk register, assessments, risk treatment decisions, and evidence that risks are reviewed periodically and escalated to management.",
      evidenceRequired:
        "Risk management policy; current risk register; risk assessment reports; risk treatment/acceptance records; review meeting minutes.",
      auditTestRef: "Risk register + risk review cycle",
      scope:
        "We need to verify that the risk management process operates. Review the risk register, assessments, and treatment decisions. To pass, 100% of identified risks must be assessed, have an owner and a documented treatment decision, and be reviewed on the defined cycle.",
      remediation:
        "Assess unassessed risks, assign owners and treatment plans, record acceptance decisions, and complete the overdue risk reviews.",
    };
  }
  if (/\btraining|awareness|competence|personnel|human|hr\b/.test(t)) {
    return {
      auditProcedure:
        "Verify security awareness and competence programs. Review the training curriculum, completion records, and evidence that personnel understand their security responsibilities.",
      evidenceRequired:
        "Security training policy; training completion reports; awareness campaign evidence; role-based competence assessments.",
      auditTestRef: "Training completion register + policy acknowledgement",
      scope:
        "We need to verify that security awareness and competence programs are effective. Review the curriculum, completion records, and role-based competence. To pass, 100% of in-scope personnel must complete required training and acknowledge policies within the defined period.",
      remediation:
        "Assign and track overdue training, deliver awareness campaigns, assess role-based competence, and record policy acknowledgements for all personnel.",
    };
  }
  if (/\bchange|config|baseline|hardening|patch|vulnerab|weakne\b/.test(t)) {
    return {
      auditProcedure:
        "Verify change management, secure configuration, and vulnerability management. Review change approvals, configuration baselines, patch status, and vulnerability scan results with remediation tracking.",
      evidenceRequired:
        "Change management policy + change records; configuration baseline docs; vulnerability scan reports; patch status report; remediation plan.",
      auditTestRef: "Change register + vulnerability scan history",
      scope:
        "We need to verify that change management, secure configuration, and vulnerability management are operating. Review change approvals, baselines, patch status, and scans. To pass, 100% of in-scope systems must meet the approved baseline with critical vulnerabilities patched within SLA.",
      remediation:
        "Apply pending patches, remediate critical and high findings, restore systems to the approved baseline, and enforce change approval for all modifications.",
    };
  }
  if (/\bsupply|third.party|vendor|outsourc\b/.test(t)) {
    return {
      auditProcedure:
        "Verify supply chain and third-party risk is managed. Review vendor inventory, due-diligence assessments, contractual security provisions, and ongoing monitoring of vendors.",
      evidenceRequired:
        "Third-party risk policy; vendor inventory; due-diligence assessments; contracts with security clauses; vendor monitoring evidence.",
      auditTestRef: "Vendor risk register + contracts list",
      scope:
        "We need to verify that supply chain and third-party risk is managed. Review the vendor inventory, due diligence, contracts, and monitoring. To pass, 100% of active vendors must have a completed risk assessment, security clauses in contract, and current monitoring.",
      remediation:
        "Complete overdue vendor assessments, add missing security clauses to contracts, and establish ongoing monitoring for flagged suppliers.",
    };
  }
  if (/\bphysical|facilit|premis|on.site\b/.test(t)) {
    return {
      auditProcedure:
        "Verify physical security of facilities and assets. Review physical access controls, visitor management, environmental protections, and evidence that physical security is maintained and tested.",
      evidenceRequired:
        "Physical security policy; access control records; visitor logs; CCTV/environmental system records; physical security test results.",
      auditTestRef: "Physical access register + facility inspections",
      scope:
        "We need to verify the physical security of facilities and assets. Review physical access controls, visitor management, and environmental protections. To pass, 100% of in-scope facilities must enforce access control with accurate records and tested protections.",
      remediation:
        "Remediate unsecured access points, update visitor and access logs, repair environmental controls, and re-test physical protections.",
    };
  }
  if (/\bnetwork|firewall|segment|perimeter|dns|endpoint\b/.test(t)) {
    return {
      auditProcedure:
        "Verify network and endpoint security. Review firewall rules, network segmentation, endpoint protection coverage, and monitoring of network traffic for anomalies.",
      evidenceRequired:
        "Network security policy; firewall/rule inventory; segmentation diagram; endpoint protection coverage report; anomaly detection evidence.",
      auditTestRef: "Network device audit + endpoint report",
      scope:
        "We need to verify network and endpoint security. Review firewall rules, segmentation, endpoint protection coverage, and traffic monitoring. To pass, 100% of in-scope hosts must run approved endpoint protection and follow approved firewall and segmentation rules.",
      remediation:
        "Close firewall and segmentation gaps, deploy endpoint protection to uncovered hosts, remove risky rules, and enable anomaly monitoring.",
    };
  }
  return {
    auditProcedure:
      "Review the control within the " + frameworkName + " framework against documented evidence. Confirm the control is implemented, operating effectively, and that supporting records are retained and reviewable.",
    evidenceRequired:
      "Control implementation records; supporting policy/procedure; sample transactional evidence; management review confirmation.",
    auditTestRef: "Control evidence file + implementation records",
    scope:
      "We need to verify that this control is implemented and operating effectively in line with " + frameworkName + ". Confirm the supporting records exist and are retained. To pass, the control must be fully implemented with current, reviewable evidence covering the full assessment period.",
    remediation:
      "Implement the missing control elements, produce and retain the required evidence, assign a control owner, and confirm effectiveness at the next review.",
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