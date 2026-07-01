import { readFileSync, writeFileSync } from "fs";

const content = readFileSync("prisma/seed.ts", "utf-8");
const lines = content.split("\n");

const enrichedLines = lines.map((line) => {
  const trimmed = line.trim();
  if (!trimmed.startsWith('["')) return line;

  // Find the full array entry: starts with [" and ends with ], (or ], if last)
  const match = trimmed.match(/^(\s*)\[.*\](\s*,\s*)$/);
  if (!match) return line;

  // Parse the 11 fields manually
  const raw = trimmed;
  const fields: string[] = [];
  let i = raw.indexOf("[") + 1;
  const end = raw.lastIndexOf("]");

  let current = "";
  let inStr = false;
  while (i < end) {
    const ch = raw[i];
    if (ch === '"') { inStr = !inStr; current += ch; }
    else if (ch === "," && !inStr) { fields.push(current); current = ""; }
    else { current += ch; }
    i++;
  }
  if (current.trim()) fields.push(current.trim());
  // fields should have 11 entries

  if (fields.length !== 11) return line;

  const diKey = fields[0].slice(1, -1); // remove quotes
  const fw = fields[1].slice(1, -1);
  const ctrl = fields[2].slice(1, -1);
  const sev = fields[3].slice(1, -1);
  const findingType = fields[5].slice(1, -1);
  const region = fields[9].slice(1, -1);
  const scFlag = fields[10]; // "true" or "false"

  // Generate enriched fields
  const sla = genSla(diKey, fw, sev, findingType);
  const remediation = genRemediation(diKey, fw, sev, findingType);
  const evidence = genEvidence(diKey, fw, sev, findingType);
  const justification = fields[8]; // keep as-is (already in quotes)

  // Rebuild with same quoting style
  const quote = '"';
  const delim = `","`;
  const lineIndent = raw.match(/^\s*/)?.[0] || "    ";

  return `${lineIndent}[${quote}${diKey}${delim}${fw}${delim}${ctrl}${delim}${sev}${delim}${sla}${delim}${findingType}${delim}${remediation}${delim}${evidence}${delim}${justification.slice(1, -1)}${delim}${region}${quote},${scFlag === "true" ? "true" : "false"}],`;
});

function genSla(diKey: string, fw: string, sev: string, findingType: string): string {
  const fwName = fwShort(fw);
  const nf = fwNorm(fw);

  if (diKey.includes("password_last_changed")) {
    if (nf === "nist80053") return `Max password age 60 days for privileged, 90 days for standard users per ${fwName} IA-5(1)(d); password history of 24 previous passwords enforced; automated notification at 14, 7, and 3 days before expiry; accounts exceeding max age force-reset on next logon`;
    if (nf === "pcidss") return `Maximum password age 90 days per ${fwName} Req. 8.4.1; minimum 4-character password change enforced between rotations; password history of minimum 4 previous passwords; automated expiry enforcement at directory level`;
    if (nf === "nis2") return `Password rotation <= 90 days per ${fwName} Art.18(2)(a); stale password detection with automated alerts at 80% of max age; credential hygiene reporting in quarterly risk registers per NIS2 supply chain security Art.20`;
    if (nf === "soc2") return `Password expiry <= 90 days per ${fwName} CC6.1 logical access criteria; password rotation validated by sampling minimum 20 accounts during readiness assessments; password history of 4+ enforced via directory policy`;
    if (nf === "dora") return `Password max age <= 90 days for ICT system access per ${fwName} Art.10(1); automated alerts for accounts approaching 80% of max age; monthly compliance reporting to ICT risk committee`;
    return `Password max age <= 90 days for all user accounts; password history minimum 4 previous passwords; automated notification 14, 7, and 3 days before expiry; exceptions require documented risk acceptance per ${fwName}`;
  }
  if (diKey.includes("mfa")) {
    if (nf === "pcidss") return `MFA enforced for all administrative access to CDE per ${fwName} Req. 8.3.1 and 8.3.2; MFA for all remote network access; coverage validated quarterly via access log review; exceptions limited to documented service accounts`;
    if (nf === "dora") return `MFA enforced for all ICT system access per ${fwName} Art.10(4); phishing-resistant MFA (FIDO2/smart card) for privileged ICT access; MFA coverage >= 99% of interactive logons; exceptions require ICT risk acceptance`;
    if (nf === "nis2") return `MFA deployed across all network and information systems per ${fwName} Art.18(2)(b); MFA required for administrative, remote, and critical system access; phishing-resistant MFA prioritized for privileged accounts`;
    if (nf === "nist80053") return `MFA for all privileged access per ${fwName} IA-2(1) and IA-2(2); FIPS 140-3 validated authenticators required; PIV/CAC preferred for federal systems per HSPD-12`;
    return `MFA enforced for all users with at least two factors; required for privileged, remote, and external-facing access; phishing-resistant methods (FIDO2, smart card, biometrics) preferred; coverage audit quarterly with remediation SLAs per ${fwName}`;
  }
  return genGenericSla(fw, sev, findingType);
}

function genRemediation(diKey: string, fw: string, sev: string, findingType: string): string {
  const fwName = fwShort(fw);
  const nf = fwNorm(fw);

  if (diKey.includes("password_last_changed")) {
    if (nf === "iso27001") return `Enforce password max age <= 90 days through domain group policy (GPO) or IdP directory (Entra ID, Okta); configure automated forced password reset for accounts exceeding the limit per A.5.16; update access control policy (A.5.15) to document password lifecycle requirements; implement automated pre-expiry notification at 14, 7, and 3 days via IdP messaging; establish quarterly reconciliation of password age reports against directory exports for audit evidence`;
    if (nf === "nistcsf") return `Configure password expiry policies in enterprise identity provider (Entra ID conditional access, Okta password policy) with 90-day max; set automated alerts for accounts approaching or exceeding limits; enforce rotation consistently across IdP-connected apps and OS-level accounts for in-scope systems per PR.AA-01 identity management requirements`;
    if (nf === "nist80053") return `Implement policy-driven password expiration per IA-5(1)(d) with 60-day max age for privileged, 90-day for standard users; configure password history of 24 previous passwords; document interval rationale and exceptions in system security plan (SSP); verify through automated compliance scanning (SCAP, Nessus)`;
    if (nf === "pcidss") return `Set password rotation to 90-day max on all CDE in-scope systems per PCI DSS Req. 8.4.1; enforce via Active Directory GPO, IdP CA policies, and system security policies; validate through quarterly account aging reports on minimum 20 accounts; configure password history of 4 to prevent rotation back to recent passwords`;
    if (nf === "soc2") return `Configure password expiration via centralized IdP; validate rotation by sampling minimum 20 accounts during SOC 2 readiness assessments and Type II audits; maintain evidence of policy config and account age sampling in SOC 2 evidence package per CC6.1 criteria`;
    if (nf === "nis2") return `Implement NIS2-aligned credential hygiene policy with 90-day max password age per Art.18(2)(a); enforce through IdP and directory service policies; monitor stale password counts and compliance % in quarterly cyber hygiene reports and risk registers`;
    if (nf === "dora") return `Enforce password max age <= 90 days per DORA Art.10(1) for all ICT system access via central IdP; report compliance metrics monthly to ICT risk management; escalate accounts exceeding max age to system owners with 7-day remediation window before automated disablement by IdP policies`;
    if (nf === "gdpr") return `Implement technical measures for password lifecycle management per Art.5(1)(f); ensure rotation aligns with risk assessment; document password procedures in record of processing activities (Art.30) and data protection policy`;
    return `Implement password expiry policy with max age defined per risk assessment; enforce via enterprise IdP and directory services; enable pre-expiry notification; conduct quarterly compliance reporting on password age adherence per ${fwName}`;
  }
  if (diKey.includes("orphan_accounts")) {
    return `Identify orphaned accounts through automated HR-IdP reconciliation (Workday/SAP to Entra ID/Okta SCIM provisioning); disable orphaned accounts within 48 hours; implement automated deprovisioning trigger on employee termination date from HRIS; establish quarterly account review with business owner attestation; maintain audit trail of identification, disablement, and permanent removal per identity lifecycle procedures`;
  }
  if (diKey.includes("privileged_access")) {
    return `Inventory all privileged accounts using PAM solution (CyberArk, BeyondTrust, Delinea); implement JIT elevation with approval workflows, automatic expiry, and session recording; enforce least privilege by removing unnecessary admin rights; conduct quarterly privileged access review with business owner sign-off; deploy PAM covering server, cloud, app, and database privileged access per ${fwName}`;
  }
  if (diKey.includes("mfa")) {
    if (nf === "pcidss") return `Enable MFA for all non-console admin access via IdP conditional access per PCI DSS Req. 8.3.1; enforce MFA for all remote network access per 8.3.2; configure emergency break-glass accounts with separate MFA, logging, and quarterly review; implement phishing-resistant MFA (FIDO2 security keys) for privileged CDE admin accounts`;
    if (nf === "dora") return `Deploy MFA across all ICT systems per DORA Art.10(4) using FIDO2, TOTP, or certificate-based auth; enforce for all interactive logons via CA policies; configure service account and emergency access procedures with compensating controls; report MFA coverage monthly to ICT risk; phase out SMS MFA per EBA guidelines`;
    if (nf === "nis2") return `Implement MFA across NIS2 in-scope systems per Art.18(2)(b); prioritize FIDO2 WebAuthn or smart card MFA for privileged users per ENISA; enforce for admin, remote, and inter-system interfaces; configure break-glass accounts with controls; report adoption metrics as part of annual NIS2 obligations`;
    if (nf === "nist80053") return `Implement MFA for all privileged access per IA-2(1) using FIPS 140-3 validated authenticators; MFA for all external network access per IA-2(2); prefer PIV/CAC for federal systems per HSPD-12; document exceptions for non-person entities in SSP`;
    return `Enable MFA via IdP CA policies; enforce for all privileged, remote, and external-facing access; implement phishing-resistant MFA (FIDO2, passkeys, cert-based) for high-risk access; configure break-glass accounts with monitoring and quarterly review; report coverage metrics quarterly per ${fwName}`;
  }
  return genGenericRemediation(fw, sev, findingType);
}

function genEvidence(diKey: string, fw: string, sev: string, findingType: string): string {
  const fwName = fwShort(fw);
  const nf = fwNorm(fw);

  if (diKey.includes("password_last_changed")) {
    if (nf === "iso27001") return `IdP directory export (Microsoft Graph /users endpoint with signInActivity, Okta /api/v1/users API response) showing passwordLastChanged timestamp, signInActivity, and account status for all accounts; password policy config screenshot showing max age (90 days), history count, and min age; access control policy (A.5.15, A.5.16) extract with password lifecycle sections; account age distribution report from IdP or PAM reports module`;
    if (nf === "pcidss") return `AD GPO or IdP policy config showing password max age 90 days per PCI DSS 8.4.1; quarterly account age sampling report with minimum 20 accounts showing last-changed dates and compliance; password policy documentation with history (4+) section; system-specific security config screenshots for all CDE in-scope systems`;
    if (nf === "soc2") return `IdP policy config (Entra ID password policy, Okta policy) showing max age <= 90 days; SOC 2 evidence pack with password age sample minimum 20 accounts across application portfolio; logical access control narrative (CC6.1) with password lifecycle description; auditor walkthrough evidence of config screens and reporting capability`;
    if (nf === "nis2") return `IAM directory export/API output (Microsoft Graph /users, LDAP query) attached to NIS2 risk management documentation; cyber hygiene dashboard or SIEM report showing password age distribution and threshold exceedances; NIS2 compliance register with credential hygiene metrics and remediation status; quarterly risk register extract showing password-related risk treatment`;
    return `IdP or directory service (Active Directory, Entra ID, Okta) config showing password expiry policy; password age report with last-changed timestamps for 10% sample of accounts; evidence of pre-expiry notification (email/IdP messaging logs); access control policy extract with password lifecycle requirements per ${fwName}`;
  }
  if (diKey.includes("orphan_accounts")) {
    return `IdP user account list with last logon timestamp, account status, and manager attribute from HR integration; HR-IdP reconciliation report showing active employees vs accounts with discrepancies; account disablement/removal audit log showing accounts disabled due to inactivity or termination; quarterly account review sign-off with business owner attestation; SCIM provisioning logs showing automated deprovisioning integration between HRIS and IdP`;
  }
  if (diKey.includes("privileged_access")) {
    return `PAM solution (CyberArk/BeyondTrust/Delinea) privileged account inventory report with names, users, last usage, and approval status; quarterly privileged access review sign-offs with business owner attestation; JIT elevation audit logs showing requests, approvals, durations, and auto de-elevation; PAM config showing approval workflows, session recording, and credential rotation; least privilege role-based access model documentation`;
  }
  if (diKey.includes("mfa")) {
    return `IdP MFA CA policy config (Entra ID CA, Okta) showing enforcement rules, excluded locations, and allowed methods; MFA adoption/coverage report from IdP showing enrollment rate and enforcement %; phishing-resistant MFA deployment evidence (FIDO2 key registration logs, WHfB config) for privileged accounts; break-glass account config, usage logs, and quarterly review; SOC screenshots of MFA challenges and auth telemetry; MFA exception register with compensating controls`;
  }
  return genGenericEvidence(fw, sev, findingType);
}

// Helper functions
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
  if (fw.includes("IMO Resolution")) return "imo";
  if (fw.includes("IACS E26")) return "e26";
  if (fw.includes("IACS E27")) return "e27";
  return "generic";
}

function fwShort(fw: string): string {
  const map: Record<string, string> = {
    "ISO/IEC 27001:2022": "ISO 27001:2022",
    "ISO/IEC 42001:2023": "ISO/IEC 42001:2023",
    "NIST CSF 2.0": "NIST CSF 2.0",
    "NIST SP 800-53 Rev.5": "NIST SP 800-53 Rev.5",
    "SOC 2 (TSC)": "SOC 2 (TSC)",
    "PCI DSS 4.0": "PCI DSS v4.0",
    "DORA (EU 2022/2554)": "DORA (EU 2022/2554)",
    "NIS2 (EU 2022/2555)": "NIS2 (EU 2022/2555)",
    "GDPR": "GDPR",
    "HIPAA Security Rule": "HIPAA Security Rule",
    "CIS Controls v8": "CIS Controls v8",
    "UAE IA Standards": "UAE IA Standards",
    "IMO Resolution MSC.428(98)": "IMO MSC.428(98)",
    "IACS E26": "IACS UR E26",
    "IACS E27": "IACS UR E27",
  };
  return map[fw] || fw;
}

function genGenericSla(fw: string, sev: string, ft: string): string {
  const fwName = fwShort(fw);
  const nf = fwNorm(fw);
  const s = sev.toLowerCase();
  const months = s === "critical" ? "6" : s === "high" ? "12" : "18";
  const effPct = s === "critical" ? "99" : s === "high" ? "95" : "90";
  const freq = s === "critical" ? "weekly" : s === "high" ? "monthly" : "quarterly";
  const ig = s === "critical" ? "IG3" : s === "high" ? "IG2" : "IG1";

  if (ft === "Architecture Gap") {
    switch (nf) {
      case "iso27001": return `Target ISMS architecture aligned with Annex A controls (A.5-A.8) per ${fwName}; implementation within ${months} months through change management (A.8.32); architecture reviewed during management review (A.5.1); risk treatment plan updated per A.6.2`;
      case "nistcsf": return `Target architecture aligned with NIST CSF 2.0 Functions (Govern-Identify-Protect-Detect-Respond-Recover) per ${fwName}; implementation within ${months} months with current/target profile comparison; tier advancement plan documented; ${freq} progress reporting`;
      case "nist80053": return `Target architecture mapped to NIST SP 800-53 Rev.5 moderate baseline controls per ${fwName}; implementation within ${months} months with control enhancements; SSP updated with architecture changes; annual control assessment per CA-2`;
      case "pcidss": return `Target architecture within CDE scope boundary per ${fwName} Req. 2.1; implementation within ${months} months; quarterly scope validation per Req. 12.5; network diagram maintained with CDE boundary per Req. 1.1`;
      case "soc2": return `Target architecture supporting SOC 2 Trust Services Criteria per ${fwName}; implementation within ${months} months; readiness assessment before Type II window; design documentation maintained for auditor walkthrough`;
      case "dora": return `Target architecture aligned with DORA ICT risk management framework per ${fwName} Art.6; implementation within ${months} months; resilience testing schedule per Art.24; architecture reviewed during ICT risk assessments per Art.8`;
      case "nis2": return `Target architecture aligned with NIS2 risk management measures per ${fwName} Art.18; implementation within ${months} months; supply chain security architecture per Art.20; architecture documented in risk management framework`;
      case "gdpr": return `Target architecture supporting GDPR data protection principles per Art.5; implementation within ${months} months with DPIA per Art.35; data protection by design per Art.25; ROPA updated per Art.30`;
      case "hipaa": return `Target architecture aligned with HIPAA Security Rule safeguards per 45 CFR 164.306; implementation within ${months} months; risk analysis per 164.308(a)(1) before deployment; architecture documented in security management framework`;
      case "cis": return `Target architecture aligned with CIS Controls v8 per ${fwName}; implementation within ${months} months following ${ig} safeguard priority sequence; architecture reviewed against CIS benchmarks; ${freq} CIS compliance validation`;
      case "uae": return `Target architecture aligned with UAE IA Standards maturity requirements per ${fwName}; implementation within ${months} months per national framework milestones; architecture reviewed for NESA compliance reporting`;
      case "iso42001": return `Target AI architecture aligned with ISO/IEC 42001 AI management system per ${fwName}; implementation within ${months} months with AI risk assessment per A.6.3; AI system inventory maintained per A.6.13; architecture reviewed during AI ethics review per A.6.4`;
      default: return `Target architecture designed and aligned with ${fwName} requirements; implementation within ${months} months with documented roadmap; architecture reviewed and updated at least annually`;
    }
  }

  if (ft === "Process Gap") {
    switch (nf) {
      case "iso27001": return `Process documented and operating effectively >= ${effPct}% per ${fwName} ISMS; documentation reviewed before annual management review (A.5.1); effectiveness tested via internal audit (A.8.31) minimum 15 samples; process owners assigned with defined KPIs`;
      case "nistcsf": return `Process aligned with NIST CSF 2.0 and operating effectively >= ${effPct}%; process reviewed ${freq} against risk appetite; implementation tier progression tracked; documented in risk management framework`;
      case "nist80053": return `Process documented per ${fwName} operating effectively >= ${effPct}%; control assessment per CA-2 annually with minimum 15 sample points; POA&M items tracked for remediation; process documented in SSP`;
      case "pcidss": return `Process documented per ${fwName} requirements; operating effectively >= ${effPct}% validated with minimum 25 samples quarterly; evidence retained per Req. 12.3; quarterly validation reporting maintained`;
      case "soc2": return `Process documented per SOC 2 Trust Services Criteria; operating effectively >= ${effPct}% tested via minimum 25 sample points; control activities and monitoring procedures maintained for Type II auditor walkthrough`;
      case "dora": return `Process documented per ${fwName} Art.6-8 ICT risk management framework; operating effectively >= ${effPct}%; ICT risk management reporting to management per Art.10; incident response procedures per Art.19`;
      case "nis2": return `Process documented per ${fwName} Art.18 risk management measures; operating effectively >= ${effPct}%; incident reporting chain per Art.21 tested quarterly; supply chain risk assessment per Art.20 integrated`;
      case "gdpr": return `Process documented in ROPA per GDPR Art.30; operating effectively >= ${effPct}% through annual DPO review; data subject request handling per Art.12-22 tested quarterly; DPIA process per Art.35 maintained`;
      case "hipaa": return `Process documented per HIPAA 45 CFR 164.308; operating effectively >= ${effPct}%; BAA management per 164.308(b); workforce training tracked per 164.308(a)(5); minimum 15 sample points`;
      case "cis": return `Process documented per CIS Controls v8 safeguards; operating effectively >= ${effPct}% verified ${freq}; CIS benchmark validation integrated in process; process updated per IG progression`;
      case "uae": return `Process documented per UAE IA Standards maturity requirements; operating effectively >= ${effPct}% measured ${freq}; NESA compliance reporting readiness maintained; controls maturity assessed per IA levels`;
      case "iso42001": return `Process documented per ISO/IEC 42001 AI governance framework; operating effectively >= ${effPct}%; AI ethics review per A.6.4 conducted within each cycle; AI risk assessment per A.6.3 integrated in procedures`;
      default: return `Process documented, implemented, and operating effectively >= ${effPct}% of the time per ${fwName}; documentation reviewed annually; operating effectiveness tested through sample verification (minimum 15 samples); process owners assigned and trained`;
    }
  }

  switch (nf) {
    case "iso27001": return `Technical control operating effectively >= ${effPct}% measured ${freq}; automated scanning aligned with Annex A; exceptions reviewed quarterly per A.5.26; nonconformity triggers corrective action per A.6.1`;
    case "nistcsf": return `Technical control operating effectively >= ${effPct}% measured ${freq}; control effectiveness mapped to Protect/Detect functions; automated monitoring and alerting configured; ${freq} reporting to risk management`;
    case "nist80053": return `Technical control operating effectively >= ${effPct}% measured ${freq}; automated assessment per CA-2 using SCAP scanning; control enhancements verified; findings documented in POA&M`;
    case "pcidss": return `Technical control operating effectively >= ${effPct}% validated quarterly per ${fwName} Req. 10/11; ASV scan compliance maintained; quarterly file integrity monitoring (Req. 11.5) and logging review (Req. 10.4)`;
    case "soc2": return `Technical control operating effectively >= ${effPct}% monitored continuously; evidence collected for SOC 2 Type II audit window; control activities and monitoring per TSC criteria with alerting and escalation`;
    case "dora": return `Technical control operating effectively >= ${effPct}% measured ${freq} per ${fwName} Art.10; ICT risk indicators monitored per Art.8; resilience testing integrated per Art.24; reporting to management`;
    case "nis2": return `Technical control operating effectively >= ${effPct}% measured ${freq} per ${fwName} Art.18; supply chain security verification included; incident detection controls tested per Art.21 reporting requirements`;
    case "gdpr": return `Technical control operating effectively >= ${effPct}% measured ${freq} per GDPR Art.32 security of processing; data protection measures logged; breach detection procedures per Art.33 tested quarterly`;
    case "hipaa": return `Technical control operating effectively >= ${effPct}% measured ${freq} per HIPAA 45 CFR 164.312; access controls (164.312(a)), audit controls (164.312(b)), and integrity controls (164.312(c)) verified`;
    case "cis": return `Technical control operating effectively >= ${effPct}% validated ${freq} per CIS Controls v8 benchmarks; automated CIS compliance scanning; implementation group progression tracked per ${ig} priority`;
    case "uae": return `Technical control operating effectively >= ${effPct}% measured ${freq} per UAE IA Standards; NESA compliance reporting maintained; maturity level progression documented`;
    case "iso42001": return `Technical control operating effectively >= ${effPct}% measured ${freq} per ISO/IEC 42001; AI system monitoring per A.6.6 with automated alerts; model performance and bias metrics tracked ${freq}`;
    default: return `Control operating effectively >= ${effPct}% measured ${freq}; automated verification with alerting; quarterly management review; deviation triggers incident response per ${fwName}`;
  }
}

function genGenericRemediation(fw: string, sev: string, ft: string): string {
  const fwName = fwShort(fw);
  const nf = fwNorm(fw);
  const s = sev.toLowerCase();
  const ig = s === "critical" ? "IG3" : s === "high" ? "IG2" : "IG1";
  const freq = s === "critical" ? "weekly" : s === "high" ? "monthly" : "quarterly";

  if (ft === "Architecture Gap") {
    switch (nf) {
      case "iso27001": return `Design target ISMS architecture per ${fwName} with Annex A coverage (A.5-A.8); implement through CAB-approved changes per A.8.32; test via internal audit (A.8.31) and management review (A.5.1); document architecture in ISMS scope; transition to operations with monitoring and KPIs`;
      case "nistcsf": return `Design target architecture mapped to NIST CSF 2.0 Functions; implement per current-to-target profile plan; verify through self-assessment and tier evaluation; document in risk management framework; establish continuous monitoring per Protect/Detect functions`;
      case "nist80053": return `Design target architecture per ${fwName} moderate baseline with enhancements; implement through CM process (CM-3, CM-6); verify via automated SCAP and manual assessment (CA-2); update SSP and POA&M; establish monitoring and continuous verification`;
      case "pcidss": return `Design target architecture within CDE scope per ${fwName} Req. 1.1 and 2.1; implement through change management with segmentation validation; verify via quarterly network scan (Req. 11.4) and scope documentation (Req. 12.5); maintain network diagrams`;
      case "soc2": return `Design target architecture aligned with SOC 2 Trust Services Criteria; implement through SDLC with control integration; verify via readiness assessment and control testing; document architecture for auditor walkthrough; establish monitoring per TSC`;
      case "dora": return `Design target architecture per ${fwName} ICT risk management framework (Art.6); implement with resilience requirements per Art.24; verify via TLPT and vulnerability assessments; document in ICT risk register; establish monitoring with reporting to management per Art.10`;
      case "nis2": return `Design target architecture per ${fwName} risk management measures (Art.18); implement with supply chain security per Art.20; verify via incident detection testing and business continuity exercises; document in risk management framework; establish reporting per Art.21`;
      case "gdpr": return `Design target architecture per GDPR data protection by design (Art.25); implement with DPIA per Art.35 and data minimization per Art.5; verify via DPO review and processing register reconciliation; document in ROPA per Art.30; establish breach detection per Art.33`;
      case "hipaa": return `Design target architecture per HIPAA Security Rule (45 CFR 164.306); implement addressing administrative, physical, and technical safeguards; verify via risk analysis per 164.308(a)(1); document in security management framework and BAAs per 164.308(b)`;
      case "cis": return `Design target architecture aligned with CIS Controls v8 safeguards; implement following ${ig} priority sequence; verify via CIS benchmark scanning and automated validation; document in security baselines; establish continuous CIS monitoring`;
      case "uae": return `Design target architecture per UAE IA Standards maturity levels; implement per national cybersecurity framework milestones; verify via NESA compliance assessment; document in IA compliance framework; establish maturity progression tracking`;
      case "iso42001": return `Design target AI architecture per ISO/IEC 42001 AI management system; implement with AI risk assessment per A.6.3 and ethical guidelines per A.6.4; verify via AI audit per A.6.12 and bias testing; document in AI governance framework; establish AI monitoring per A.6.6`;
      default: return `Design target state architecture aligned with ${fwName}; implement via CAB-approved change management; configure technical controls per security baselines; test through integration, performance, and security verification; document architecture and procedures; transition to operations with runbooks and monitoring`;
    }
  }

  if (ft === "Process Gap") {
    switch (nf) {
      case "iso27001": return `Document process per ${fwName} ISMS with roles, workflows, and KPIs per A.5.3; implement through training per A.6.5; integrate with internal audit schedule (A.8.31); management review (A.5.1) for effectiveness; initial testing on minimum 15 samples`;
      case "nistcsf": return `Document process aligned with NIST CSF 2.0 Functions; define KPIs mapped to outcomes; implement through stakeholder training; integrate with risk management process; establish ${freq} effectiveness reporting; initial testing on minimum 15 samples`;
      case "nist80053": return `Document process per ${fwName} with roles and expected outputs per control narratives; implement through training per AT-3; integrate with CA-7 continuous monitoring and annual CA-2 assessment; initial testing on minimum 15 samples`;
      case "pcidss": return `Document process per ${fwName} with evidence retention per Req. 12.3 and quarterly validation; implement through role-based training per Req. 12.6; integrate with QSA walkthrough and evidence package; initial testing on minimum 25 samples`;
      case "soc2": return `Document process per SOC 2 TSC with control narratives defining scope, procedures, and evidence; implement through training; integrate with continuous monitoring and quarterly reviews; initial testing on minimum 25 samples`;
      case "dora": return `Document process per ${fwName} ICT risk management framework (Art.6-8); include incident reporting flows per Art.19 and resilience testing per Art.24; implement through training; integrate with ICT risk register and management reporting; initial testing on minimum 15 samples`;
      case "nis2": return `Document process per ${fwName} risk management measures (Art.18); include supply chain risk assessment per Art.20 and incident reporting per Art.21; implement through training; integrate with CSIRT reporting; initial testing on minimum 15 samples`;
      case "gdpr": return `Document process in ROPA per GDPR Art.30; include data subject request handling per Art.12-22, DPIA per Art.35, and breach notification per Art.33; implement through DPO-coordinated training; initial testing on minimum 15 samples`;
      case "hipaa": return `Document process per HIPAA 45 CFR 164.308; include risk analysis procedures, BAA management (164.308(b)), workforce clearance (164.308(a)(3)), and training (164.308(a)(5)); initial testing on minimum 15 samples`;
      case "cis": return `Document process per CIS Controls v8 safeguard implementation; include IG-level requirements and benchmark validation; implement through technical team training; integrate with quarterly CIS validation cycle; initial testing on minimum 15 samples`;
      case "uae": return `Document process per UAE IA Standards maturity requirements; include NESA compliance reporting procedures; implement through stakeholder training; integrate with national authority reporting; initial testing on minimum 15 samples`;
      case "iso42001": return `Document process per ISO/IEC 42001 AI governance framework; include AI risk assessment per A.6.3, ethics review per A.6.4, and AI documentation per A.6.13; implement through AI governance committee training; initial testing on minimum 15 samples`;
      default: return `Document formal procedures per ${fwName} with roles, workflows, and escalation paths; define KPIs and metrics; implement through stakeholder training with completion tracking; establish annual review cycle; integrate with risk register and compliance calendar; initial effectiveness testing on minimum 15 samples`;
    }
  }

  switch (nf) {
    case "iso27001": return `Assess current technical state per ${fwName} Annex A; implement corrective actions per A.6.1 nonconformity process; verify via internal audit (A.8.31) and automated scanning; update SoA and risk treatment plan (A.6.2); document residual risk acceptance per A.5.26; establish ${freq} verification cadence`;
    case "nistcsf": return `Assess current state against ${fwName} target profile; implement configuration per Protect/Detect safeguards; verify via self-assessment and tool validation; update current profile and risk register; establish continuous monitoring aligned with Detect function`;
    case "nist80053": return `Assess current technical state per ${fwName} control baseline; implement configuration per CM-6 baseline settings; verify via SCAP automated scanning (CA-2, RA-5); update SSP, POA&M, and risk register; establish continuous monitoring (CA-7); ${freq} scanning`;
    case "pcidss": return `Assess current technical state per ${fwName}; implement configuration per CDE baseline; verify via quarterly ASV scan (Req. 11.4), file integrity monitoring (Req. 11.5), and logging review (Req. 10.4); update scope documentation; maintain quarterly evidence pack`;
    case "soc2": return `Assess current technical state per SOC 2 TSC criteria; implement controls meeting criteria; verify via automated monitoring, sample testing, and auditor evidence collection; update control narratives; evidence collection for Type II audit window`;
    case "dora": return `Assess current ICT systems per ${fwName} Art.6-8; implement protective measures per Art.10; verify via automated scanning and TLPT per Art.24; update ICT risk register and manage reporting per Art.10; ${freq} verification cadence`;
    case "nis2": return `Assess current state per ${fwName} risk management measures (Art.18); implement technical measures per Art.18(2); verify via automated scanning and incident detection testing; update risk register and supply chain assessment per Art.20`;
    case "gdpr": return `Assess current technical measures per GDPR Art.32; implement improvements addressing data subject risk; verify via penetration testing and vulnerability assessment; update DPIA (Art.35) and ROPA (Art.30); ${freq} testing cadence`;
    case "hipaa": return `Assess current technical state per HIPAA 45 CFR 164.312; implement technical safeguards for access (164.312(a)), audit (164.312(b)), integrity (164.312(c)), transmission (164.312(e)); verify via automated scanning; update risk analysis (164.308(a)(1))`;
    case "cis": return `Assess current state against CIS Controls v8 benchmarks; implement configuration per ${ig} safeguards; verify via automated CIS compliance scanner; update maturity documentation; ${freq} CIS benchmark scanning`;
    case "uae": return `Assess current technical state per UAE IA Standards maturity levels; implement per standard requirements; verify via NESA compliance scanning; update maturity self-assessment and evidence package; quarterly compliance reporting`;
    case "iso42001": return `Assess current AI system state per ISO/IEC 42001; implement technical controls per A.6.6-6.11 for AI security; verify via AI audit per A.6.12, bias testing, and model validation; update AI risk register and governance docs; establish AI monitoring per A.6.6`;
    default: return `Assess current state against ${fwName} via gap analysis; implement config changes per security baselines; verify through automated scanning and manual validation (10% sample); update documentation; establish continuous monitoring; document residual risks with formal acceptance`;
  }
}

function genGenericEvidence(fw: string, sev: string, ft: string): string {
  const fwName = fwShort(fw);
  const nf = fwNorm(fw);
  const s = sev.toLowerCase();
  const freq = s === "critical" ? "weekly" : s === "high" ? "monthly" : "quarterly";

  if (ft === "Architecture Gap") {
    switch (nf) {
      case "iso27001": return `ISMS scope document and architecture diagrams with Annex A control coverage; risk treatment plan (A.6.2) with decisions; SoA with control implementation status; change management records (A.8.32); internal audit reports (A.8.31) and management review minutes (A.5.1)`;
      case "nistcsf": return `Architecture diagrams mapped to NIST CSF 2.0 Functions; current vs target profile comparison; implementation roadmap with tier advancement; risk management framework with CSF mapping; ${freq} progress reporting against target architecture`;
      case "nist80053": return `SSP with architecture diagrams and control mapping to moderate baseline; CM process docs (CM-3, CM-6) with baseline config; scan results (RA-5) and assessment reports (CA-2); POA&M with remediation dates`;
      case "pcidss": return `Network diagram with CDE boundary per ${fwName} Req. 1.1; scope documentation per Req. 12.5; segmentation validation results; quarterly ASV scan reports (Req. 11.4); change management records for CDE architecture changes`;
      case "soc2": return `System architecture description supporting TSC; control design narratives per criteria; readiness assessment and gap analysis; auditor walkthrough evidence of architecture implementation and design`;
      case "dora": return `ICT architecture diagrams with critical function identification per ${fwName} Art.6; ICT risk assessment reports (Art.8); TLPT scope and results (Art.24); business continuity mapping (Art.10); resilience testing schedule`;
      case "nis2": return `Network and system architecture diagrams per ${fwName} Art.18 scope; supply chain architecture with third-party interfaces per Art.20; incident detection and reporting architecture (Art.21); business continuity architecture`;
      case "gdpr": return `Data flow diagrams per data protection by design (Art.25); DPIA (Art.35) with architecture decisions; ROPA data flow entries (Art.30); processing system architecture; data minimization and pseudonymization evidence`;
      case "hipaa": return `System architecture diagrams per HIPAA 45 CFR 164.306; risk analysis (164.308(a)(1)) with asset inventory; BAA documentation (164.308(b)) with interfaces; safeguard implementation evidence per 164.312`;
      case "cis": return `Architecture diagrams aligned with CIS Controls v8 safeguards; CIS benchmark baseline documentation; CIS compliance scan results for architecture; implementation group progression evidence; change approval records`;
      case "uae": return `System architecture diagrams per UAE IA Standards; NESA compliance assessment evidence; maturity self-assessment with architecture scoring; IA framework compliance reporting; change management records`;
      case "iso42001": return `AI system architecture diagrams per ISO/IEC 42001 AI governance framework; AI risk assessment (A.6.3) documentation; AI system inventory (A.6.13) with architecture details; AI ethics review (A.6.4) evidence; AI monitoring architecture per A.6.6`;
      default: return `Architecture design document with system and data flow diagrams showing current and target state; security control mapping to ${fwName} requirements; deployment records, change management approvals, and testing results; operational runbooks, monitoring dashboards, alert configuration screenshots, and escalation procedures`;
    }
  }

  if (ft === "Process Gap") {
    switch (nf) {
      case "iso27001": return `Process documentation with roles, workflows, and KPIs per ISMS; training records per A.6.5 with completion; internal audit reports (A.8.31) with 15+ samples; management review minutes (A.5.1); process owner sign-offs`;
      case "nistcsf": return `Process documentation aligned with NIST CSF 2.0 Functions; training records with assessment results; effectiveness testing with 15+ sample points; risk management integration evidence; ${freq} reporting dashboards`;
      case "nist80053": return `Process documentation with control narratives per ${fwName}; training records per AT-3; control assessment per CA-2 with 15+ samples; POA&M and CA-7 integration; process owner attestation`;
      case "pcidss": return `Process documentation per ${fwName} with evidence per Req. 12.3; training records per Req. 12.6; quarterly validation with 25+ samples; QSA walkthrough evidence package; monitoring and exception handling records`;
      case "soc2": return `Process narratives with roles, evidence types, and monitoring per TSC; training records; control testing with 25+ sample points; quarterly control review results; Type II evidence package`;
      case "dora": return `Process documentation per ${fwName} Art.6-8 with ICT risk flows; training records with resilience awareness; incident reporting drill evidence with 15+ scenarios; ICT risk register updates; management reporting per Art.10`;
      case "nis2": return `Process documentation per ${fwName} Art.18 measures; training records for NIS2 roles; incident reporting drill evidence per Art.21 with 15+ scenarios; supply chain risk assessment per Art.20; CSIRT reporting test evidence`;
      case "gdpr": return `ROPA per GDPR Art.30 with processing activities; training records with data protection awareness; DSAR handling test evidence per Art.12-22 with 15+ samples; DPIA records per Art.35; DPO review evidence`;
      case "hipaa": return `Process documentation per HIPAA 45 CFR 164.308; workforce training per 164.308(a)(5); BAA management evidence (164.308(b)); risk analysis updates per 164.308(a)(1); sanction policy per 164.308(a)(2); 15+ samples`;
      case "cis": return `Process documentation per CIS Controls v8 safeguards; training records with IG awareness; CIS benchmark validation with 15+ samples; quarterly validation and improvement tracking; IG progression evidence`;
      case "uae": return `Process documentation per UAE IA Standards; training records for IA roles; NESA compliance reporting readiness; maturity self-assessment with process scoring; 15+ samples for effectiveness testing`;
      case "iso42001": return `AI governance process documentation per ISO/IEC 42001 with roles and ethics triggers (A.6.4); AI training records (A.6.5); AI risk assessment evidence (A.6.3) with 15+ samples; AI audit results (A.6.12); AI inventory (A.6.13) and monitoring evidence (A.6.6)`;
      default: return `Process documentation with version history, approval signatures, roles, and workflows; training records with completion dates and assessment results; operating effectiveness testing evidence with minimum 15 sample points; review records with metrics dashboards and improvement action tracking; process owner assignment and coverage sign-offs`;
    }
  }

  switch (nf) {
    case "iso27001": return `Configuration screenshots and compliance scan reports (Qualys/Nessus/Prisma Cloud) aligned with Annex A; policy extracts for A.5.26 exception management; SoA update with control status; internal audit evidence (A.8.31); ${freq} scan and review records`;
    case "nistcsf": return `Configuration screenshots and compliance scan reports mapped to Protect/Detect functions; monitoring dashboard showing effectiveness; risk register update with ${freq} reporting; monitoring alert configuration and response records`;
    case "nist80053": return `Configuration screenshots per SCAP/CIS benchmarks; compliance scan reports per RA-5; CA-2 assessment evidence with SSP references; POA&M with findings, severity, and remediation; monitoring per CA-7 with alerting`;
    case "pcidss": return `ASV scan reports per ${fwName} Req. 11.4 (quarterly passing); CDE configuration screenshots; quarterly file integrity monitoring per Req. 11.5; logging review evidence per Req. 10.4; quarterly validation evidence pack`;
    case "soc2": return `Configuration screenshots and automated tool evidence for TSC criteria; monitoring dashboards with ${freq} reporting; control evidence for Type II window; alert configuration and response demo; evidence package with scan reports`;
    case "dora": return `Configuration screenshots per ${fwName} ICT protection (Art.10); vulnerability scan and TLPT evidence (Art.24); ICT risk indicator reporting to management (Art.8, 10); ${freq} resilience testing; monitoring for ICT continuity`;
    case "nis2": return `Configuration screenshots per ${fwName} Art.18 technical measures; vulnerability scan results; incident detection tool config and testing per Art.21; supply chain security verification per Art.20; CSIRT reporting evidence`;
    case "gdpr": return `Technical configuration screenshots per GDPR Art.32; vulnerability and penetration testing evidence; data protection monitoring tool config; breach notification test evidence (Art.33); ${freq} testing schedule and results`;
    case "hipaa": return `Configuration screenshots per HIPAA 45 CFR 164.312; access control evidence (164.312(a)); audit logging evidence (164.312(b)); integrity control evidence (164.312(c)); transmission security (164.312(e)); risk analysis updates`;
    case "cis": return `Configuration screenshots aligned with CIS Controls v8 benchmarks; CIS compliance scanner reports with pass/fail by safeguard; IG progression evidence; benchmark remediation records; ${freq} CIS scanning validation evidence`;
    case "uae": return `Configuration screenshots per UAE IA Standards; NESA compliance scan evidence; maturity assessment with technical control scoring; compliance reporting for national authority; ${freq} technical verification records`;
    case "iso42001": return `AI system configuration and monitoring screenshots per ISO/IEC 42001 A.6.6; AI model validation and bias testing evidence (A.6.10); AI audit logs per A.6.12; AI system inventory (A.6.13) with compliance status; ${freq} AI monitoring records for drift and performance`;
    default: return `Configuration screenshots or compliance scan reports (Qualys, Nessus, Prisma Cloud) showing before/after state; policy extract with updated requirements highlighted; verification evidence from automated scanning tools showing compliance; monitoring configuration showing continuous verification and deviation alerting per ${fwName}`;
  }
}

writeFileSync("prisma/seed.ts", enrichedLines.join("\n"));
console.log(`Enriched ${enrichedLines.length} lines`);
