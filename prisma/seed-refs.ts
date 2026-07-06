import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Data Items (shared across frameworks)
const dataItems = [
  { code: "DI-001", name: "Information Security Policy", description: "Organization-wide policy document defining information security objectives, principles, and responsibilities." },
  { code: "DI-002", name: "Access Control Policy", description: "Policy governing logical and physical access to information assets and systems." },
  { code: "DI-003", name: "Risk Assessment Report", description: "Documented assessment of information security risks, including identified threats, vulnerabilities, likelihood, and impact." },
  { code: "DI-004", name: "Risk Treatment Plan", description: "Plan detailing selected risk treatment options, responsibilities, and timelines." },
  { code: "DI-005", name: "Statement of Applicability", description: "Document listing all applicable controls and justification for inclusions or exclusions." },
  { code: "DI-006", name: "Incident Response Plan", description: "Step-by-step procedure for detecting, reporting, assessing, and responding to security incidents." },
  { code: "DI-007", name: "Business Continuity Plan", description: "Plan for maintaining or restoring business operations during and after a disruption." },
  { code: "DI-008", name: "Data Processing Agreement", description: "Contractual agreement with data processors defining data handling, security, and privacy obligations." },
  { code: "DI-009", name: "Vendor Assessment Report", description: "Security assessment report for third-party vendors and service providers." },
  { code: "DI-010", name: "Training and Awareness Records", description: "Records of information security awareness training completion by all personnel." },
  { code: "DI-011", name: "Internal Audit Report", description: "Report documenting findings from internal audits of the ISMS or security controls." },
  { code: "DI-012", name: "Management Review Minutes", description: "Minutes from management review meetings covering ISMS performance, findings, and improvement decisions." },
  { code: "DI-013", name: "Asset Inventory", description: "Register of all information assets including classification, owner, and location." },
  { code: "DI-014", name: "Change Management Records", description: "Records of all changes to systems, applications, and infrastructure including approval and testing evidence." },
  { code: "DI-015", name: "User Access Review Reports", description: "Periodic review reports of user access rights with manager sign-offs." },
  { code: "DI-016", name: "Penetration Test Report", description: "Report from penetration testing engagements covering scope, methodology, findings, and remediation." },
  { code: "DI-017", name: "Vulnerability Scan Reports", description: "Regular vulnerability scanning results and remediation tracking." },
  { code: "DI-018", name: "Backup and Restoration Test Records", description: "Evidence of regular backup and restoration testing including success/failure logs." },
  { code: "DI-019", name: "Physical Security Access Logs", description: "Logs of physical access to secure areas and server rooms." },
  { code: "DI-020", name: "Incident Response Test Results", description: "Results from tabletop exercises or simulated incident response drills." },
];

// ISO 27001 References
const isoRefs = [
  { code: "GDPR", name: "General Data Protection Regulation", description: "EU regulation on data protection and privacy affecting any organization processing personal data of EU residents. Maps to controls 5.34, 5.31, 5.33, 8.11, 8.12." },
  { code: "NIST-CSF", name: "NIST Cybersecurity Framework", description: "US framework of cybersecurity standards, guidelines, and best practices. Provides cross-reference for risk management, access control, and incident response controls." },
  { code: "PCI-DSS", name: "Payment Card Industry Data Security Standard", description: "Security standard for organizations handling payment card data. Maps to access control, cryptography, and network security controls." },
  { code: "COBIT", name: "COBIT 2019", description: "Governance framework for enterprise IT. Provides process references for governance, risk management, and control objectives aligned with ISO 27001." },
  { code: "ITIL", name: "ITIL 4", description: "IT service management framework. Maps to change management, capacity management, and service continuity controls." },
  { code: "HIPAA", name: "Health Insurance Portability and Accountability Act", description: "US healthcare privacy and security regulation. Relevant for organizations handling protected health information (PHI)." },
  { code: "SOX", name: "Sarbanes-Oxley Act", description: "US law on financial reporting and internal controls. Maps to access controls, audit logging, and change management." },
  { code: "ISO-27701", name: "ISO 27701 Privacy Extension", description: "Extension to ISO 27001 for privacy information management. Maps to privacy-related controls 5.34, 5.33, and PII handling." },
];

// SOC 2 References
const soc2Refs = [
  { code: "COSO", name: "COSO Internal Control — Integrated Framework", description: "Foundational framework for internal control design and assessment. SOC 2 is built upon COSO principles for control environment and risk assessment." },
  { code: "AICPA-TSP", name: "AICPA Trust Services Principles", description: "The underlying principles defining SOC 2 trust service criteria: Security, Availability, Processing Integrity, Confidentiality, and Privacy." },
  { code: "NIST-CSF", name: "NIST Cybersecurity Framework", description: "Provides cross-mapping between SOC 2 criteria and NIST CSF functions (Identify, Protect, Detect, Respond, Recover)." },
  { code: "ISO-27001", name: "ISO 27001:2022", description: "International information security standard. Many SOC 2 controls map directly to ISO 27001 controls, enabling dual compliance." },
  { code: "COBIT", name: "COBIT 2019", description: "Governance framework that aligns with SOC 2 control criteria for IT governance and management processes." },
];

// Data Item to Reference mappings for ISO 27001
const isoRefDataItems: Record<string, string[]> = {
  GDPR: ["DI-001", "DI-008", "DI-010", "DI-011", "DI-003", "DI-005"],
  "NIST-CSF": ["DI-003", "DI-004", "DI-006", "DI-016", "DI-017", "DI-020"],
  "PCI-DSS": ["DI-002", "DI-014", "DI-015", "DI-016", "DI-017", "DI-009"],
  COBIT: ["DI-011", "DI-012", "DI-004", "DI-005", "DI-013"],
  ITIL: ["DI-014", "DI-007", "DI-018", "DI-012"],
  HIPAA: ["DI-001", "DI-008", "DI-010", "DI-011", "DI-003", "DI-019"],
  SOX: ["DI-002", "DI-014", "DI-015", "DI-011", "DI-005"],
  "ISO-27701": ["DI-001", "DI-008", "DI-003", "DI-005", "DI-010"],
};

// Data Item to Reference mappings for SOC 2
const soc2RefDataItems: Record<string, string[]> = {
  COSO: ["DI-001", "DI-011", "DI-012", "DI-003"],
  "AICPA-TSP": ["DI-001", "DI-005", "DI-011", "DI-012"],
  "NIST-CSF": ["DI-003", "DI-004", "DI-006", "DI-016", "DI-017", "DI-020"],
  "ISO-27001": ["DI-001", "DI-002", "DI-003", "DI-005", "DI-006", "DI-007", "DI-013", "DI-014", "DI-015"],
  COBIT: ["DI-011", "DI-012", "DI-004", "DI-005"],
};

async function main() {
  // 1. Upsert all DataItems
  const dataItemMap = new Map<string, string>();
  for (const di of dataItems) {
    const created = await prisma.dataItem.upsert({
      where: { code: di.code },
      update: { name: di.name, description: di.description },
      create: { code: di.code, name: di.name, description: di.description },
    });
    dataItemMap.set(di.code, created.id);
  }
  console.log(`  DataItems: ${dataItems.length} seeded`);

  // 2. Get both frameworks
  const isoFramework = await prisma.framework.findUnique({ where: { slug: "iso27001" } });
  const soc2Framework = await prisma.framework.findUnique({ where: { slug: "soc2" } });

  // 3. Seed ISO 27001 refs
  if (isoFramework) {
    for (const ref of isoRefs) {
      const created = await prisma.ref.upsert({
        where: { code_frameworkId: { code: ref.code, frameworkId: isoFramework.id } },
        update: { name: ref.name, description: ref.description },
        create: { code: ref.code, name: ref.name, description: ref.description, frameworkId: isoFramework.id },
      });
      // Upsert data item mappings
      const diCodes = isoRefDataItems[ref.code] ?? [];
      for (const diCode of diCodes) {
        const dataItemId = dataItemMap.get(diCode);
        if (dataItemId) {
          await prisma.refDataItem.upsert({
            where: { refId_dataItemId: { refId: created.id, dataItemId } },
            update: {},
            create: { refId: created.id, dataItemId },
          });
        }
      }
    }
    const isoRefCount = await prisma.ref.count({ where: { frameworkId: isoFramework.id } });
    console.log(`  ISO 27001 Refs: ${isoRefCount} seeded`);
  }

  // 4. Seed SOC 2 refs
  if (soc2Framework) {
    for (const ref of soc2Refs) {
      const created = await prisma.ref.upsert({
        where: { code_frameworkId: { code: ref.code, frameworkId: soc2Framework.id } },
        update: { name: ref.name, description: ref.description },
        create: { code: ref.code, name: ref.name, description: ref.description, frameworkId: soc2Framework.id },
      });
      const diCodes = soc2RefDataItems[ref.code] ?? [];
      for (const diCode of diCodes) {
        const dataItemId = dataItemMap.get(diCode);
        if (dataItemId) {
          await prisma.refDataItem.upsert({
            where: { refId_dataItemId: { refId: created.id, dataItemId } },
            update: {},
            create: { refId: created.id, dataItemId },
          });
        }
      }
    }
    const soc2RefCount = await prisma.ref.count({ where: { frameworkId: soc2Framework.id } });
    console.log(`  SOC 2 Refs: ${soc2RefCount} seeded`);
  }

  // 5. Log total mappings
  const totalMappings = await prisma.refDataItem.count();
  console.log(`  RefDataItem mappings: ${totalMappings} seeded`);
  console.log("Ref seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
