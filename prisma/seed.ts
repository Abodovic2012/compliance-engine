import { PrismaClient } from "@prisma/client";
import { guidanceData } from "./guidance-data";

const prisma = new PrismaClient();

const iso27001 = {
  slug: "iso27001",
  name: "ISO 27001:2022",
  description: "Information security, cybersecurity and privacy protection — 93 controls across 4 themes",
  domains: [
    {
      code: "A.5",
      name: "Organizational Controls",
      description: "37 controls covering governance, policies, roles, supplier management, and legal compliance",
      sortOrder: 1,
      controls: [
        { code: "5.1", name: "Policies for information security", description: "Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and reviewed at planned intervals." },
        { code: "5.2", name: "Information security roles and responsibilities", description: "Information security roles and responsibilities shall be assigned and coordinated." },
        { code: "5.3", name: "Segregation of duties", description: "Conflicting duties and areas of responsibility shall be segregated to reduce opportunities for unauthorized or unintentional modification or misuse of assets." },
        { code: "5.4", name: "Management responsibilities", description: "Management shall require all personnel to apply information security in accordance with the established policy." },
        { code: "5.5", name: "Contact with governmental authorities", description: "The organization shall establish and maintain appropriate contacts with relevant governmental authorities." },
        { code: "5.6", name: "Contact with special interest groups", description: "The organization shall establish and maintain appropriate contacts with special interest groups or other forums." },
        { code: "5.7", name: "Threat intelligence", description: "Information relating to information security threats shall be collected and analyzed to produce threat intelligence." },
        { code: "5.8", name: "Information security in project management", description: "Information security shall be integrated into project management." },
        { code: "5.9", name: "Inventory of information and other associated assets", description: "An inventory of information and other associated assets shall be maintained." },
        { code: "5.10", name: "Acceptable use of information and other associated assets", description: "Rules for the acceptable use and procedures for handling information and other associated assets shall be identified and documented." },
        { code: "5.11", name: "Return of assets", description: "Personnel and other interested parties shall return all organizational assets in their possession upon termination of employment, contract, or agreement." },
        { code: "5.12", name: "Classification of information", description: "Information shall be classified according to the information security needs of the organization." },
        { code: "5.13", name: "Labelling of information", description: "An appropriate set of procedures for information labelling shall be developed and implemented." },
        { code: "5.14", name: "Information transfer", description: "Rules, procedures, or agreements for information transfer shall be in place." },
        { code: "5.15", name: "Access control", description: "Rules to control physical and logical access to information and other associated assets shall be established and implemented." },
        { code: "5.16", name: "Identity management", description: "The full lifecycle of identities shall be managed." },
        { code: "5.17", name: "Authentication information", description: "Allocation and management of authentication information shall be controlled by a management process." },
        { code: "5.18", name: "Access rights", description: "Access rights to information and other associated assets shall be provisioned, reviewed, modified, and removed." },
        { code: "5.19", name: "Information security in supplier relationships", description: "Processes and procedures shall be defined to manage information security risks associated with suppliers." },
        { code: "5.20", name: "Addressing information security within supplier agreements", description: "Information security requirements shall be established and agreed with each supplier." },
        { code: "5.21", name: "Managing information security in the ICT supply chain", description: "Processes shall be defined to manage ICT supply chain risks." },
        { code: "5.22", name: "Monitoring, review and change management of supplier services", description: "The organization shall regularly monitor, review, evaluate, and manage change in supplier services." },
        { code: "5.23", name: "Information security for use of cloud services", description: "Processes for acquisition, use, management, and exit from cloud services shall be established." },
        { code: "5.24", name: "Information security incident management planning and preparation", description: "The organization shall plan and prepare for information security incidents." },
        { code: "5.25", name: "Assessment and decision on information security events", description: "Information security events shall be assessed and decisions made on whether they are classified as incidents." },
        { code: "5.26", name: "Response to information security incidents", description: "Information security incidents shall be responded to in accordance with documented procedures." },
        { code: "5.27", name: "Learning from information security incidents", description: "Knowledge gained from information security incidents shall be used to strengthen controls." },
        { code: "5.28", name: "Collection of evidence", description: "The organization shall establish procedures for evidence collection and preservation." },
        { code: "5.29", name: "Information security during disruption", description: "The organization shall plan how to maintain information security at an appropriate level during disruption." },
        { code: "5.30", name: "ICT readiness for business continuity", description: "ICT readiness shall be planned, implemented, maintained, and tested." },
        { code: "5.31", name: "Legal, statutory, regulatory and contractual requirements", description: "Legal, statutory, regulatory, and contractual requirements shall be identified and documented." },
        { code: "5.32", name: "Intellectual property rights", description: "The organization shall implement procedures to protect intellectual property rights." },
        { code: "5.33", name: "Protection of records", description: "Records shall be protected from loss, destruction, falsification, unauthorized access, and unauthorized release." },
        { code: "5.34", name: "Privacy and protection of PII", description: "The organization shall identify and meet privacy and PII protection requirements." },
        { code: "5.35", name: "Independent review of information security", description: "The organization's approach to managing information security shall be reviewed independently at planned intervals." },
        { code: "5.36", name: "Compliance with policies, rules and standards", description: "Compliance with organizational policies, rules, and standards shall be reviewed." },
        { code: "5.37", name: "Documented operating procedures", description: "Operating procedures for information processing facilities shall be documented and available." },
      ],
    },
    {
      code: "A.6",
      name: "People Controls",
      description: "8 controls covering screening, awareness, employment terms, and remote working",
      sortOrder: 2,
      controls: [
        { code: "6.1", name: "Screening", description: "Background verification checks shall be carried out prior to employment." },
        { code: "6.2", name: "Terms and conditions of employment", description: "Employment contracts shall state responsibilities for information security." },
        { code: "6.3", name: "Information security awareness, education and training", description: "Personnel shall receive appropriate awareness, education, and training." },
        { code: "6.4", name: "Disciplinary process", description: "A disciplinary process shall be defined for information security violations." },
        { code: "6.5", name: "Responsibilities after termination or change of employment", description: "Information security responsibilities shall remain after termination or change." },
        { code: "6.6", name: "Confidentiality or non-disclosure agreements", description: "Confidentiality agreements shall be identified, documented, and reviewed." },
        { code: "6.7", name: "Remote working", description: "Security measures shall be implemented for remote working." },
        { code: "6.8", name: "Information security event reporting", description: "Personnel shall report observed security events promptly." },
      ],
    },
    {
      code: "A.7",
      name: "Physical Controls",
      description: "14 controls covering secure areas, equipment protection, and physical access",
      sortOrder: 3,
      controls: [
        { code: "7.1", name: "Physical security perimeters", description: "Security perimeters shall be defined and used to protect areas that contain information and assets." },
        { code: "7.2", name: "Physical entry", description: "Secure areas shall be protected by appropriate entry controls." },
        { code: "7.3", name: "Securing offices, rooms and facilities", description: "Physical security for offices, rooms, and facilities shall be designed and implemented." },
        { code: "7.4", name: "Physical security monitoring", description: "Premises shall be continuously monitored for unauthorized physical access." },
        { code: "7.5", name: "Protecting against physical and environmental threats", description: "Protection against physical and environmental threats shall be designed and implemented." },
        { code: "7.6", name: "Working in secure areas", description: "Procedures for working in secure areas shall be designed and implemented." },
        { code: "7.7", name: "Clear desk and clear screen", description: "Clear desk rules for papers and removable media and clear screen rules shall be adopted." },
        { code: "7.8", name: "Equipment siting and protection", description: "Equipment shall be sited and protected to reduce risks from environmental threats and unauthorized access." },
        { code: "7.9", name: "Security of assets off-premises", description: "Off-premises assets shall be protected." },
        { code: "7.10", name: "Storage media", description: "Storage media shall be managed through their lifecycle." },
        { code: "7.11", name: "Supporting utilities", description: "Supporting utilities shall be protected against failures." },
        { code: "7.12", name: "Cabling security", description: "Cables shall be protected against interception, interference, or damage." },
        { code: "7.13", name: "Equipment maintenance", description: "Equipment shall be maintained correctly to ensure availability and integrity." },
        { code: "7.14", name: "Secure disposal or re-use of equipment", description: "Equipment shall be securely disposed of or re-used." },
      ],
    },
    {
      code: "A.8",
      name: "Technological Controls",
      description: "34 controls covering access control, cryptography, operations, development, and vulnerability management",
      sortOrder: 4,
      controls: [
        { code: "8.1", name: "User endpoint devices", description: "Information stored on user endpoint devices shall be protected." },
        { code: "8.2", name: "Privileged access rights", description: "Privileged access rights shall be controlled and managed." },
        { code: "8.3", name: "Information access restriction", description: "Access to information and application functions shall be restricted." },
        { code: "8.4", name: "Access to source code", description: "Access to source code shall be managed." },
        { code: "8.5", name: "Secure authentication", description: "Secure authentication methods shall be implemented." },
        { code: "8.6", name: "Capacity management", description: "Capacity shall be managed to meet performance requirements." },
        { code: "8.7", name: "Protection against malware", description: "Protection against malware shall be implemented and maintained." },
        { code: "8.8", name: "Management of technical vulnerabilities", description: "Technical vulnerabilities shall be managed." },
        { code: "8.9", name: "Configuration management", description: "Configurations shall be established, documented, implemented, monitored, and audited." },
        { code: "8.10", name: "Information deletion", description: "Information shall be deleted when no longer required." },
        { code: "8.11", name: "Data masking", description: "Data masking shall be used to protect PII and sensitive data." },
        { code: "8.12", name: "Data leakage prevention", description: "Data leakage prevention measures shall be applied to systems and networks." },
        { code: "8.13", name: "Information backup", description: "Backup copies of information shall be maintained and tested." },
        { code: "8.14", name: "Redundancy of information processing facilities", description: "Information processing facilities shall be implemented with redundancy." },
        { code: "8.15", name: "Logging", description: "Logs that record events shall be produced, stored, and protected." },
        { code: "8.16", name: "Monitoring activities", description: "Networks and systems shall be monitored for anomalous behavior." },
        { code: "8.17", name: "Clock synchronisation", description: "Clocks shall be synchronised to agreed time sources." },
        { code: "8.18", name: "Use of privileged utility programs", description: "Use of utility programs that could bypass system controls shall be restricted." },
        { code: "8.19", name: "Installation of software on operational systems", description: "Installation of software on operational systems shall be controlled." },
        { code: "8.20", name: "Networks security", description: "Networks shall be managed and controlled to protect information." },
        { code: "8.21", name: "Security of network services", description: "Security mechanisms and service levels for network services shall be identified." },
        { code: "8.22", name: "Segregation of networks", description: "Groups of information services, users, and systems shall be segregated." },
        { code: "8.23", name: "Web filtering", description: "Access to external websites shall be managed to reduce exposure to malicious content." },
        { code: "8.24", name: "Use of cryptography", description: "Cryptographic controls shall be defined and implemented." },
        { code: "8.25", name: "Secure development lifecycle", description: "Rules for secure development of software shall be established." },
        { code: "8.26", name: "Application security requirements", description: "Security requirements shall be identified for new or enhanced applications." },
        { code: "8.27", name: "Secure system architecture and engineering principles", description: "Secure system architecture and engineering principles shall be established and applied." },
        { code: "8.28", name: "Secure coding", description: "Secure coding principles shall be applied." },
        { code: "8.29", name: "Security testing in development and acceptance", description: "Security testing shall be carried out in development and acceptance processes." },
        { code: "8.30", name: "Outsourced development", description: "Outsourced development shall be supervised and monitored." },
        { code: "8.31", name: "Separation of development, test and production environments", description: "Development, test, and production environments shall be separated." },
        { code: "8.32", name: "Change management", description: "Changes shall be assessed, approved, implemented, and reviewed." },
        { code: "8.33", name: "Test information", description: "Test information shall be appropriately selected, protected, and managed." },
        { code: "8.34", name: "Protection of information systems during audit testing", description: "Audit tests shall be planned and agreed to minimize disruptions." },
      ],
    },
  ],
};

const soc2 = {
  slug: "soc2",
  name: "SOC 2",
  description: "Trust Service Criteria — Security, Availability, Processing Integrity, Confidentiality, Privacy",
  domains: [
    {
      code: "CC1",
      name: "Control Environment",
      description: "Management's tone at the top, ethics, organizational structure, and accountability",
      sortOrder: 1,
      controls: [
        { code: "CC1.1", name: "Commitment to integrity and ethical values", description: "Management demonstrates commitment to integrity and ethical values through policies and actions." },
        { code: "CC1.2", name: "Board independence and oversight", description: "The board of directors demonstrates independence and exercises oversight of internal control." },
        { code: "CC1.3", name: "Organizational structure and authority", description: "Management establishes appropriate organizational structure and reporting lines." },
        { code: "CC1.4", name: "Commitment to competence", description: "The organization demonstrates commitment to recruiting and retaining competent personnel." },
        { code: "CC1.5", name: "Accountability and enforcement", description: "The organization holds individuals accountable for their internal control responsibilities." },
      ],
    },
    {
      code: "CC2",
      name: "Communication and Information",
      description: "Information quality, communication of objectives, roles, and external reporting",
      sortOrder: 2,
      controls: [
        { code: "CC2.1", name: "Information and communication systems", description: "The organization obtains or generates and uses relevant information to support internal control." },
        { code: "CC2.2", name: "Internal communication of objectives and responsibilities", description: "The organization communicates internal control information to all personnel." },
        { code: "CC2.3", name: "External communication of incidents and concerns", description: "The organization communicates with external parties regarding matters affecting internal control." },
      ],
    },
    {
      code: "CC3",
      name: "Risk Assessment",
      description: "Risk identification, analysis, fraud risk, and change management",
      sortOrder: 3,
      controls: [
        { code: "CC3.1", name: "Risk identification and analysis", description: "The organization identifies and analyzes risks to achieving objectives." },
        { code: "CC3.2", name: "Risk assessment process", description: "The organization assesses changes from external and internal sources that could impact objectives." },
        { code: "CC3.3", name: "Fraud risk assessment", description: "The organization considers potential fraud when assessing risks." },
      ],
    },
    {
      code: "CC4",
      name: "Monitoring Activities",
      description: "Ongoing evaluations, separate evaluations, and deficiency reporting",
      sortOrder: 4,
      controls: [
        { code: "CC4.1", name: "Ongoing and separate evaluations", description: "The organization selects and develops monitoring activities to assess control effectiveness." },
        { code: "CC4.2", name: "Reporting of deficiencies", description: "Internal control deficiencies are communicated to responsible parties and management." },
      ],
    },
    {
      code: "CC5",
      name: "Control Activities",
      description: "Control selection, IT general controls, and policy implementation",
      sortOrder: 5,
      controls: [
        { code: "CC5.1", name: "Selection and development of control activities", description: "The organization selects control activities that address risks to achieving objectives." },
        { code: "CC5.2", name: "Technology general controls", description: "The organization selects technology controls to support achievement of objectives." },
        { code: "CC5.3", name: "Control activities through policies", description: "The organization deploys control activities through policies that establish expectations and procedures." },
      ],
    },
    {
      code: "CC6",
      name: "Logical and Physical Access Controls",
      description: "Access management, authentication, authorization, and physical security",
      sortOrder: 6,
      controls: [
        { code: "CC6.1", name: "Logical access security", description: "Logical access security software and hardware are configured to enforce access controls." },
        { code: "CC6.2", name: "User registration and authorization", description: "New users are registered and authorized before gaining access." },
        { code: "CC6.3", name: "Access modification and removal", description: "Access rights are modified or removed in a timely manner upon change or termination." },
        { code: "CC6.4", name: "Physical access restrictions", description: "Physical access to facilities and systems is restricted to authorized personnel." },
        { code: "CC6.5", name: "Protection against external threats", description: "The organization protects against malicious external threats such as malware and attacks." },
        { code: "CC6.6", name: "System boundaries and entry points", description: "System boundaries and entry points are identified and monitored." },
        { code: "CC6.7", name: "Data transmission restrictions", description: "Data transmission is restricted to authorized parties and encrypted where appropriate." },
        { code: "CC6.8", name: "Unauthorized or malicious software prevention", description: "The organization prevents or detects introduction of unauthorized or malicious software." },
      ],
    },
    {
      code: "CC7",
      name: "System Operations",
      description: "System monitoring, incident detection, response, and recovery",
      sortOrder: 7,
      controls: [
        { code: "CC7.1", name: "System monitoring and detection", description: "The organization monitors system operations and detects security events." },
        { code: "CC7.2", name: "Incident identification and classification", description: "Security events are identified and classified as incidents for response." },
        { code: "CC7.3", name: "Incident response and escalation", description: "Incidents are responded to, escalated, and communicated appropriately." },
        { code: "CC7.4", name: "Incident recovery and continuity", description: "The organization implements recovery procedures to restore system operations." },
        { code: "CC7.5", name: "Post-incident review and improvement", description: "Post-incident reviews are conducted to improve security controls." },
      ],
    },
    {
      code: "CC8",
      name: "Change Management",
      description: "Change authorization, testing, documentation, and approval",
      sortOrder: 8,
      controls: [
        { code: "CC8.1", name: "Change authorization and documentation", description: "Changes are authorized, documented, and approved before implementation." },
        { code: "CC8.2", name: "Change testing and validation", description: "Changes are tested and validated before deployment to production." },
      ],
    },
    {
      code: "CC9",
      name: "Risk Mitigation",
      description: "Vendor risk management, third-party oversight, and risk response",
      sortOrder: 9,
      controls: [
        { code: "CC9.1", name: "Vendor and third-party risk assessment", description: "The organization identifies and assesses risks from vendors and business partners." },
        { code: "CC9.2", name: "Vendor monitoring and oversight", description: "The organization monitors vendor compliance with security requirements." },
      ],
    },
    {
      code: "A1",
      name: "Availability",
      description: "System uptime, disaster recovery, and business continuity",
      sortOrder: 10,
      controls: [
        { code: "A1.1", name: "Availability objectives and planning", description: "The organization maintains availability objectives and capacity planning." },
        { code: "A1.2", name: "Environmental protections", description: "Environmental protections are in place to maintain system availability." },
        { code: "A1.3", name: "Recovery procedures", description: "Recovery procedures are documented, tested, and maintained." },
      ],
    },
    {
      code: "C1",
      name: "Confidentiality",
      description: "Protection of confidential information throughout its lifecycle",
      sortOrder: 11,
      controls: [
        { code: "C1.1", name: "Confidential information identification and protection", description: "Confidential information is identified, classified, and protected throughout its lifecycle." },
        { code: "C1.2", name: "Disposal of confidential information", description: "Confidential information is securely disposed of when no longer needed." },
      ],
    },
    {
      code: "PI1",
      name: "Processing Integrity",
      description: "Completeness, accuracy, timeliness, and authorization of processing",
      sortOrder: 12,
      controls: [
        { code: "PI1.1", name: "Processing completeness", description: "Processing is complete and no data is omitted or duplicated." },
        { code: "PI1.2", name: "Processing accuracy", description: "Processing is accurate and produces expected outputs." },
        { code: "PI1.3", name: "Processing timeliness", description: "Processing is performed within expected timeframes." },
        { code: "PI1.4", name: "Processing authorization", description: "Processing is authorized and validated." },
        { code: "PI1.5", name: "Processing integrity monitoring", description: "Processing integrity is monitored and exceptions are handled." },
      ],
    },
    {
      code: "P1",
      name: "Privacy — Notice and Communication",
      description: "Privacy notice, choice, consent, and communication",
      sortOrder: 13,
      controls: [
        { code: "P1.1", name: "Privacy notice", description: "The organization provides notice about its privacy practices." },
        { code: "P1.2", name: "Choice and consent", description: "The organization communicates choices and obtains consent for PII collection and use." },
      ],
    },
    {
      code: "P2",
      name: "Privacy — Collection and Processing",
      description: "PII collection, use, retention, and disposal",
      sortOrder: 14,
      controls: [
        { code: "P2.1", name: "Collection and processing limitations", description: "PII collection is limited to specified purposes with consent." },
        { code: "P2.2", name: "Data quality and minimization", description: "PII is accurate, complete, and relevant for the purposes collected." },
        { code: "P2.3", name: "Retention and disposal", description: "PII is retained only as long as necessary and disposed of securely." },
      ],
    },
    {
      code: "P3",
      name: "Privacy — Access and Correction",
      description: "Individual access to PII and correction rights",
      sortOrder: 15,
      controls: [
        { code: "P3.1", name: "Individual access to PII", description: "Individuals can access their PII held by the organization." },
        { code: "P3.2", name: "Correction of PII", description: "Individuals can request correction of inaccurate PII." },
      ],
    },
    {
      code: "P4",
      name: "Privacy — Disclosure and Notification",
      description: "PII disclosure, third-party sharing, and breach notification",
      sortOrder: 16,
      controls: [
        { code: "P4.1", name: "Disclosure to third parties", description: "PII disclosure to third parties is governed by contracts and agreements." },
        { code: "P4.2", name: "Breach notification", description: "Individuals are notified of breaches involving their PII." },
      ],
    },
    {
      code: "P5",
      name: "Privacy — Quality and Monitoring",
      description: "Privacy program oversight and monitoring",
      sortOrder: 17,
      controls: [
        { code: "P5.1", name: "Privacy program oversight", description: "The organization assigns responsibility for privacy program oversight." },
        { code: "P5.2", name: "Privacy monitoring and enforcement", description: "Privacy practices are monitored and enforced." },
      ],
    },
  ],
};

async function main() {
  for (const data of [iso27001, soc2]) {
    const framework = await prisma.framework.upsert({
      where: { slug: data.slug },
      update: { name: data.name, description: data.description },
      create: { slug: data.slug, name: data.name, description: data.description },
    });

    for (const domainData of data.domains) {
      const domain = await prisma.domain.upsert({
        where: { code_frameworkId: { code: domainData.code, frameworkId: framework.id } },
        update: { name: domainData.name, description: domainData.description, sortOrder: domainData.sortOrder },
        create: {
          code: domainData.code,
          name: domainData.name,
          description: domainData.description,
          sortOrder: domainData.sortOrder,
          frameworkId: framework.id,
        },
      });

      for (const controlData of domainData.controls) {
        const sortOrder = "sortOrder" in controlData ? (controlData as any).sortOrder : 0;
        const guidance = guidanceData[controlData.code] ?? null;
        await prisma.control.upsert({
          where: { code_domainId: { code: controlData.code, domainId: domain.id } },
          update: { name: controlData.name, description: controlData.description, sortOrder, guidance },
          create: {
            code: controlData.code,
            name: controlData.name,
            description: controlData.description,
            sortOrder,
            domainId: domain.id,
            guidance,
          },
        });
      }
    }

    const count = await prisma.control.count({
      where: { domain: { frameworkId: framework.id } },
    });
    console.log(`  ${data.name}: ${count} controls seeded`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
