import { readFileSync, writeFileSync } from "fs";

const content = readFileSync("prisma/seed.ts", "utf-8");
const lines = content.split("\n");

const enrichedLines = lines.map((line) => {
  const trimmed = line.trim();
  if (!trimmed.startsWith(`["`)) return line;

  // Parse 4-element tuple: ["fw","ref","theme","description"]
  const fields: string[] = [];
  let current = "";
  let inStr = false;
  for (let ci = 0; ci < trimmed.length; ci++) {
    const ch = trimmed[ci];
    if (ch === '"') {
      if (inStr) { inStr = false; } else { inStr = true; }
    } else if (ch === "," && !inStr) {
      fields.push(current.trim());
      current = "";
    } else if (ch === "]" && !inStr) {
      if (current.trim()) fields.push(current.trim());
      break;
    } else if (inStr) {
      current += ch;
    }
  }
  if (fields.length !== 4) return line;

  const fw = fields[0];
  const ref = fields[1];
  const theme = fields[2];
  const origDesc = fields[3];

  const article = genControlArticle(fw, ref, theme, origDesc);
  const indent = line.match(/^\s*/)?.[0] || "    ";
  const quote = '"';
  return `${indent}[${quote}${fw}${quote},${quote}${ref}${quote},${quote}${theme}${quote},${quote}${article}${quote}],`;
});

function genControlArticle(fw: string, ref: string, theme: string, orig: string): string {
  const nf = fwNorm(fw);

  switch (nf) {
    case "iso27001": return genISO(fw, ref, theme, orig);
    case "nistcsf": return genCSF(fw, ref, theme, orig);
    case "nist80053": return genNIST(fw, ref, theme, orig);
    case "pcidss": return genPCI(fw, ref, theme, orig);
    case "soc2": return genSOC2(fw, ref, theme, orig);
    case "dora": return genDORA(fw, ref, theme, orig);
    case "nis2": return genNIS2(fw, ref, theme, orig);
    case "gdpr": return genGDPR(fw, ref, theme, orig);
    case "hipaa": return genHIPAA(fw, ref, theme, orig);
    case "cis": return genCIS(fw, ref, theme, orig);
    case "uae": return genUAE(fw, ref, theme, orig);
    case "iso42001": return genISO42(fw, ref, theme, orig);
    default: return `${orig}. Implementation should align with ${fw} requirements, with documented procedures, assigned responsibilities, and periodic review cycles. Evidence includes policies, procedures, training records, and audit results demonstrating operating effectiveness.`;
  }
}

function genISO(fw: string, ref: string, theme: string, orig: string): string {
  return `${fw} Annex A control ${ref} (${theme}) requires effective ${orig.toLowerCase()}. The organization must establish, implement, maintain, and continually improve documented procedures addressing this requirement within the ISMS scope. This includes defining roles and responsibilities per A.5.2, allocating necessary resources, ensuring personnel competence per A.6.3, maintaining documented information per A.7.4, and monitoring and measuring effectiveness per A.8.29. Implementation should integrate with the ISMS risk treatment plan (A.6.2), internal audit program (A.8.31), and management review process (A.5.1). Compliance evidence includes approved policy documents, operating procedures with version history, training and awareness records, meeting minutes from periodic reviews, process performance metrics, internal audit findings, and corrective action records (A.6.1) demonstrating continual improvement aligned with ISO 27001:2022 requirements.`;
}

function genCSF(fw: string, ref: string, theme: string, orig: string): string {
  return `${fw} control ${ref} (${theme}) addresses ${orig.toLowerCase()}. This control maps to one or more NIST CSF 2.0 Functions (Govern, Identify, Protect, Detect, Respond, Recover) and supports the organization's cybersecurity risk management outcomes. The CSF requires organizations to assess current cybersecurity posture against target profiles, determine the appropriate Implementation Tier, and develop risk-based action plans. Implementation involves establishing policies aligned with business objectives, deploying technical and administrative safeguards, and monitoring effectiveness through continuous improvement. Evidence includes the cybersecurity risk management strategy, current and target profile comparisons, risk assessment results, policy and procedure documentation, training records, monitoring dashboards, and incident response exercise outcomes demonstrating capability maturity.`;
}

function genNIST(fw: string, ref: string, theme: string, orig: string): string {
  return `${fw} control ${ref} (${theme}) requires ${orig.toLowerCase()}. As part of the NIST SP 800-53 Rev.5 control baseline (low, moderate, or high-impact), this control must be implemented with applicable enhancements per FIPS 200 and OMB A-130. Implementation follows the Risk Management Framework steps per NIST SP 800-37: categorization, selection, implementation, assessment, authorization, and continuous monitoring. The organization must document this control in the System Security Plan (SSP), assess it per NIST SP 800-53A, and address deficiencies in the POA&M. Evidence includes the SSP with control narratives, assessment results (CA-2), POA&M status, continuous monitoring reports (CA-7), and the authorization package.`;
}

function genPCI(fw: string, ref: string, theme: string, orig: string): string {
  return `${fw} Requirement ${ref} (${theme}) requires ${orig.toLowerCase()}. This PCI DSS v4.0 requirement applies to all entities that store, process, or transmit cardholder data (CHD) or sensitive authentication data (SAD) within the cardholder data environment (CDE). Implementation must follow the defined requirement and testing procedures, with applicable flexibility options (defined approach vs customized approach). The organization must document policies, implement technical controls, maintain evidence of compliance, and validate effectiveness through quarterly and annual assessments. Evidence includes network diagrams with CDE boundary, policy and procedure documentation, system configuration standards, ASV scan reports, quarterly file integrity monitoring records (Req. 11.5), logging review evidence (Req. 10.4), penetration test results (Req. 11.4), and the annual ROC or SAQ as applicable.`;
}

function genSOC2(fw: string, ref: string, theme: string, orig: string): string {
  return `${fw} Trust Services Criteria point ${ref} (${theme}) addresses ${orig.toLowerCase()}. SOC 2 engagements are based on the AICPA Trust Services Criteria (Security, Availability, Processing Integrity, Confidentiality, Privacy) and evaluate controls at a point in time (Type I) or over a period (Type II). Each criteria point defines specific control activities, monitoring procedures, and evidence requirements that service organizations must operate effectively. Implementation requires documented system descriptions, control narratives, risk assessments, monitoring activities, and remediation procedures. Evidence includes system descriptions, control activity documentation with defined owners and frequencies, evidence of control operation (screenshots, logs, reports), monitoring and escalation records, risk assessment updates, and the SOC 2 auditor report confirming effectiveness.`;
}

function genDORA(fw: string, ref: string, theme: string, orig: string): string {
  return `${fw} Article ${ref} (${theme}) requires ${orig.toLowerCase()}. DORA (EU 2022/2554) mandates that financial entities establish a comprehensive ICT risk management framework covering all ICT systems, assets, and third-party dependencies supporting critical functions. This article forms part of DORA's requirements for ICT risk management (Chapter II), incident management (Chapter III), resilience testing (Chapter IV), or third-party risk (Chapter V). Implementation requires documented policies, processes, and technical controls with defined roles, management reporting lines, resilience testing schedules, and contractual provisions for third-party services. Evidence includes ICT risk management framework documentation, incident response procedures and test results, TLPT reports (Art.24), ICT third-party register (Art.28), and management reporting demonstrating compliance with competent authority obligations (Art.10).`;
}

function genNIS2(fw: string, ref: string, theme: string, orig: string): string {
  return `${fw} Article ${ref} (${theme}) requires ${orig.toLowerCase()}. NIS2 (EU 2022/2555) establishes cybersecurity risk-management measures for essential and important entities across critical sectors in the EU. This article sets specific requirements to achieve baseline cybersecurity commensurate with risks, including technical, operational, and organizational measures to prevent and minimize incident impact. Implementation involves supply chain security (Art.20), incident notification to CSIRTs (Art.21), and management accountability. Evidence includes cybersecurity risk-management policies, technical measures deployment records (Art.18(2)), supply chain assessments (Art.20), incident notification procedures and drill records, business continuity plans, management governance minutes, and CSIRT reporting confirmations.`;
}

function genGDPR(fw: string, ref: string, theme: string, orig: string): string {
  return `${fw} Article ${ref} (${theme}) addresses ${orig.toLowerCase()}. GDPR (EU 2016/679) establishes requirements for protecting personal data of data subjects in the EU. This article forms part of the framework covering processing principles (Art.5), data subject rights (Art.12-22), data protection impact assessments (Art.35), security of processing (Art.32), breach notification (Art.33-34), and accountability (Art.24). Implementation requires technical and organizational measures appropriate to risk, with documented policies and procedures to demonstrate accountability. Evidence includes the Record of Processing Activities - ROPA (Art.30), data protection policies, DSAR handling logs (Art.12-22), DPIA reports (Art.35), breach notification records (Art.33), data processing agreements (Art.28), consent records where applicable (Art.7), and DPO oversight documentation where required (Art.37).`;
}

function genHIPAA(fw: string, ref: string, theme: string, orig: string): string {
  return `${fw} 45 CFR ${ref} (${theme}) requires ${orig.toLowerCase()}. The HIPAA Security Rule (45 CFR Part 164 Subpart C) establishes national security standards for protecting electronic protected health information (ePHI) for covered entities and business associates. This safeguard is part of administrative (164.308), physical (164.310), or technical (164.312) safeguard categories with required and addressable implementation specifications. Implementation requires a risk analysis (164.308(a)(1)), documented policies, workforce training (164.308(a)(5)), and periodic evaluation. Evidence includes the security management framework with risk analysis findings, safeguard documentation, system configuration records, access control and audit logs, BAA agreements (164.308(b)(1)), training records, facility security documentation, contingency plan test results (164.308(a)(7)), and periodic security evaluation findings per 45 CFR 164.306.`;
}

function genCIS(fw: string, ref: string, theme: string, orig: string): string {
  return `${fw} Safeguard ${ref} (${theme}) requires ${orig.toLowerCase()}. CIS Controls v8 organizes cybersecurity best practices across 18 controls with Implementation Groups (IG1, IG2, IG3) that define progressively comprehensive safeguard implementation based on organizational risk profile and resources. IG1 covers essential cyber hygiene, IG2 adds controls for complex environments, and IG3 provides advanced protection. This safeguard should be implemented per the organization's assigned IG level with appropriate scope. Evidence includes CIS benchmark compliance scanning results with pass/fail per safeguard, safeguard implementation documentation mapped to IG requirements, configuration baseline records, automated compliance scanner reports, system configuration screenshots, policy documents, training records, and quarterly CIS compliance validation reports demonstrating implementation group progression.`;
}

function genUAE(fw: string, ref: string, theme: string, orig: string): string {
  return `${fw} control ${ref} (${theme}) requires ${orig.toLowerCase()}. The UAE Information Assurance Standards, issued by the UAE Cybersecurity Council (ECSCC) and National Information Assurance authority, establish mandatory cybersecurity requirements for government entities and critical infrastructure in the UAE. Controls are organized across domains including governance, risk management, access control, cryptography, and physical security, with defined maturity levels based on entity criticality classification. Implementation requires compliance with national cybersecurity framework milestones with documented policies and controls meeting specified maturity requirements. Evidence includes the IA compliance framework, NESA compliance assessment results, maturity self-assessment scores per domain, national authority compliance reporting, system architecture documentation, policy and procedure records, technical configuration evidence, training records, and third-party assessment results demonstrating conformance to UAE IA maturity levels.`;
}

function genISO42(fw: string, ref: string, theme: string, orig: string): string {
  return `${fw} Annex A control ${ref} (${theme}) requires ${orig.toLowerCase()}. ISO/IEC 42001:2023 is the first international AI management system standard, providing a framework for organizations to manage AI system risks and opportunities. This control is part of the AI governance framework covering risk assessment (A.6.3), impact assessment (A.6.4), system lifecycle (A.6.5), data governance (A.6.6), transparency (A.6.7), human oversight (A.6.8), fairness and bias (A.6.9), performance monitoring (A.6.10), security (A.6.11), third-party management (A.6.12), documentation (A.6.13), incident management (A.6.14), competence (A.6.15), AI audit (A.6.16), change management (A.6.17), and procurement (A.6.18). Implementation requires integration with the AI management system policy, AI risk register, and AI system inventory with appropriate governance structures including ethics review and continuous monitoring. Evidence includes AI governance policy, AI risk assessment and treatment records, AI impact assessments, AI system inventory with classification, model documentation, training data provenance records, bias testing results, human oversight procedures, AI audit reports, incident procedures for AI failures, and performance monitoring dashboards demonstrating compliance with ISO/IEC 42001:2023.`;
}

function fwNorm(fw: string): string {
  if (fw.includes("ISO/IEC 27001")) return "iso27001";
  if (fw.includes("ISO/IEC 42001")) return "iso42001";
  if (fw.includes("NIST CSF")) return "nistcsf";
  if (fw.includes("NIST SP 800-53")) return "nist80053";
  if (fw.includes("PCI DSS")) return "pcidss";
  if (fw.includes("SOC 2")) return "soc2";
  if (fw.includes("DORA")) return "dora";
  if (fw.includes("NIS2")) return "nis2";
  if (fw.includes("GDPR")) return "gdpr";
  if (fw.includes("HIPAA")) return "hipaa";
  if (fw.includes("CIS Controls")) return "cis";
  if (fw.includes("UAE IA")) return "uae";
  return "generic";
}

writeFileSync("prisma/seed.ts", enrichedLines.join("\n"));
console.log(`Enriched ${enrichedLines.length} lines`);
