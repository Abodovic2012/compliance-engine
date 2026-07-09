export interface SubPolicy {
  id: string;
  name: string;
  domain: string;
  domainIndex: number;
  order: number;
  purpose: string;
  keywords: string[];
}

const domains = [
  "1. Master Governance",
  "2. Risk & Vendor Management",
  "3. Human Resources & End-User Security",
  "4. Identity & Access Management",
  "5. Asset & Data Management",
  "6. Engineering & IT Operations",
  "7. Incident Response & Resilience",
  "8. Physical Security",
];

const policies: SubPolicy[] = [
  // 2. Risk & Vendor Management
  {
    id: "risk-management",
    name: "Risk Management Policy",
    domain: domains[1],
    domainIndex: 1,
    order: 1,
    purpose:
      "This policy defines the methodology for identifying, assessing, scoring, and treating information security risks. It establishes the risk appetite, risk assessment cadence, and the risk treatment process that shall be followed across the Organization.",
    keywords: [
      "risk assessment",
      "risk management",
      "risk response",
      "risk mitigation",
      "cyber risk",
      "risk culture",
      "risk framework",
      "risk policy",
      "fraud risk",
      "risk treatment",
      "risk",
    ],
  },
  {
    id: "third-party-risk",
    name: "Third-Party & Vendor Risk Management Policy",
    domain: domains[1],
    domainIndex: 1,
    order: 2,
    purpose:
      "This policy defines the security requirements for assessing, onboarding, monitoring, and offboarding third-party vendors, suppliers, and cloud service providers. All vendors with access to Organization data shall be subject to these controls.",
    keywords: [
      "supplier",
      "vendor",
      "third party",
      "third-party",
      "cloud service",
      "cloud security",
      "ba contract",
      "external",
      "procurement",
    ],
  },

  // 3. Human Resources & End-User Security
  {
    id: "acceptable-use",
    name: "Acceptable Use Policy (AUP)",
    domain: domains[2],
    domainIndex: 2,
    order: 1,
    purpose:
      "This policy defines the acceptable use of the Organization's information technology resources, including laptops, email, internet access, and corporate data. All employees, contractors, and authorized users shall comply with these rules.",
    keywords: [
      "acceptable use",
      "rules of behavior",
      "workstation use",
    ],
  },
  {
    id: "personnel-security",
    name: "Personnel Security Policy",
    domain: domains[2],
    domainIndex: 2,
    order: 2,
    purpose:
      "This policy defines the security requirements for the employee lifecycle, including hiring, background screening, security training and awareness, disciplinary processes, and termination procedures.",
    keywords: [
      "personnel",
      "hr security",
      "training",
      "awareness",
      "security awareness",
      "termination",
      "post-employment",
      "employment",
      "screening",
      "disciplinary",
      "competence",
      "codes of conduct",
      "whistleblower",
      "staff training",
    ],
  },
  {
    id: "mobile-device",
    name: "Mobile Device & BYOD Policy",
    domain: domains[2],
    domainIndex: 2,
    order: 3,
    purpose:
      "This policy defines the security requirements for using personal and company-issued mobile devices (smartphones, tablets, laptops) to access Organization data and systems.",
    keywords: [
      "mobile device",
      "byod",
      "portable",
    ],
  },
  {
    id: "remote-work",
    name: "Remote Work Policy",
    domain: domains[2],
    domainIndex: 2,
    order: 4,
    purpose:
      "This policy defines the security requirements for working from home or remote locations, including VPN usage, Wi-Fi security, and the protection of Organization data outside corporate premises.",
    keywords: [
      "remote work",
      "remote working",
      "remote access",
      "off-premises",
    ],
  },
  {
    id: "clean-desk",
    name: "Clean Desk & Clear Screen Policy",
    domain: domains[2],
    domainIndex: 2,
    order: 5,
    purpose:
      "This policy requires all personnel to secure sensitive information by locking screens when unattended, clearing desks of confidential documents at the end of the day, and properly storing physical media.",
    keywords: [
      "clear desk",
      "clean desk",
      "session lock",
      "auto logoff",
      "workstation security",
    ],
  },

  // 4. Identity & Access Management
  {
    id: "access-control",
    name: "Access Control Policy",
    domain: domains[3],
    domainIndex: 3,
    order: 1,
    purpose:
      "This policy defines the rules for granting, reviewing, and revoking system and data access based on the principle of least privilege. It covers identity management, account lifecycle, privileged access, and segregation of duties.",
    keywords: [
      "access control",
      "access management",
      "access right",
      "access authorization",
      "access review",
      "identity management",
      "federation",
      "user identification",
      "unique user id",
      "least privilege",
      "segregation of duties",
      "account management",
      "account inventory",
      "account permission",
      "service account",
      "authorization",
      "privileged access",
      "logical access",
      "system access",
      "group plan",
      "access agreement",
    ],
  },
  {
    id: "password-auth",
    name: "Password & Authentication Policy",
    domain: domains[3],
    domainIndex: 3,
    order: 2,
    purpose:
      "This policy defines the technical requirements for password length, complexity, rotation, and the mandatory use of Multi-Factor Authentication (MFA) for accessing Organization systems and data.",
    keywords: [
      "password",
      "authentication",
      "mfa",
      "multi-factor",
      "authenticator",
      "auth supervision",
      "re-auth",
      "unsuccessful login",
      "unsuccessful logon",
      "strong authentication",
      "sensitive authentication",
    ],
  },

  // 5. Asset & Data Management
  {
    id: "asset-management",
    name: "Asset Management Policy",
    domain: domains[4],
    domainIndex: 4,
    order: 1,
    purpose:
      "This policy requires the Organization to maintain a complete and accurate inventory of all hardware, software, cloud infrastructure, and information assets throughout their lifecycle.",
    keywords: [
      "asset management",
      "asset inventory",
      "asset identification",
      "asset ownership",
      "asset tagging",
      "system inventory",
      "software inventory",
      "ict asset",
    ],
  },
  {
    id: "data-classification",
    name: "Data Classification Policy",
    domain: domains[4],
    domainIndex: 4,
    order: 2,
    purpose:
      "This policy defines the data classification scheme (e.g., Public, Internal, Confidential, Restricted) and establishes requirements for labelling, handling, and protecting information based on its classification level.",
    keywords: [
      "classification",
      "labelling",
    ],
  },
  {
    id: "data-handling",
    name: "Data Handling & Protection Policy",
    domain: domains[4],
    domainIndex: 4,
    order: 3,
    purpose:
      "This policy defines the rules for storing, sharing, transmitting, and processing data based on its classification. It covers data leakage prevention, confidentiality, integrity, and the protection of personal and sensitive information.",
    keywords: [
      "data protection",
      "data handling",
      "data leakage",
      "dlp",
      "data masking",
      "confidentiality",
      "integrity",
      "transmission security",
      "information transfer",
      "media storage",
      "data monitoring",
      "privacy",
      "pii",
      "special categories",
      "data security",
      "data minimisation",
      "data portability",
    ],
  },
  {
    id: "data-retention",
    name: "Data Retention & Disposal Policy",
    domain: domains[4],
    domainIndex: 4,
    order: 4,
    purpose:
      "This policy establishes the legal and regulatory timelines for retaining data and defines the approved methods for permanently destroying information when it is no longer required.",
    keywords: [
      "retention",
      "disposal",
      "secure disposal",
      "storage limitation",
      "deletion",
      "information deletion",
      "right to erasure",
      "right of access",
      "right to rectification",
      "records",
      "documentation",
    ],
  },
  {
    id: "cryptography",
    name: "Cryptography & Encryption Policy",
    domain: domains[4],
    domainIndex: 4,
    order: 5,
    purpose:
      "This policy defines the approved cryptographic algorithms, key management practices, and encryption requirements for protecting data at rest and in transit across the Organization.",
    keywords: [
      "cryptograph",
      "encryption",
      "key management",
      "certificate management",
      "tx confidentiality",
    ],
  },

  // 6. Engineering & IT Operations
  {
    id: "change-management",
    name: "Change Management Policy",
    domain: domains[5],
    domainIndex: 5,
    order: 1,
    purpose:
      "This policy defines the approval workflows, testing requirements, and documentation standards that shall be followed before deploying changes to production systems, configurations, and infrastructure.",
    keywords: [
      "change management",
      "change control",
      "change risk",
      "configuration management",
      "baseline config",
      "secure config",
      "network and security configuration",
    ],
  },
  {
    id: "sdlc",
    name: "Secure Software Development Lifecycle (SDLC) Policy",
    domain: domains[5],
    domainIndex: 5,
    order: 2,
    purpose:
      "This policy defines the security gates, code review requirements, application security testing, and secure coding standards that shall be integrated into the software development lifecycle.",
    keywords: [
      "secure development",
      "sdlc",
      "app security testing",
      "code review",
      "source code",
      "secure coding",
      "test environment",
      "input validation",
      "ai lifecycle",
      "ai audit",
      "ai documentation",
      "software integrity",
      "software allowlist",
      "product security documentation",
    ],
  },
  {
    id: "vulnerability-patch",
    name: "Vulnerability & Patch Management Policy",
    domain: domains[5],
    domainIndex: 5,
    order: 3,
    purpose:
      "This policy defines the required frequency for vulnerability scanning, the SLAs for applying security patches based on severity, and the process for remediating identified vulnerabilities across all systems.",
    keywords: [
      "vulnerability",
      "patch management",
      "flaw remediation",
      "penetration testing",
      "malware",
      "anti-malware",
      "malicious code",
      "ransomware",
      "scanning",
    ],
  },
  {
    id: "logging-monitoring",
    name: "Logging & Monitoring Policy",
    domain: domains[5],
    domainIndex: 5,
    order: 4,
    purpose:
      "This policy defines the requirements for what system events must be logged, how long logs are retained, who reviews them, and the security monitoring controls required to detect and respond to threats.",
    keywords: [
      "logging",
      "monitoring",
      "log management",
      "log review",
      "log retention",
      "log storage",
      "audit log",
      "audit event",
      "audit generation",
      "audit review",
      "siem",
      "event analysis",
      "event correlation",
      "event reporting",
      "detection",
      "alert",
      "continuous monitoring",
      "time sync",
      "timestamp",
    ],
  },

  // 7. Incident Response & Resilience
  {
    id: "incident-response",
    name: "Incident Response Policy",
    domain: domains[6],
    domainIndex: 6,
    order: 1,
    purpose:
      "This policy defines the step-by-step process for detecting, classifying, containing, investigating, communicating, and recovering from security incidents. It assigns roles, escalation paths, and reporting obligations.",
    keywords: [
      "incident response",
      "incident handling",
      "incident reporting",
      "breach",
      "evidence collection",
      "forensics",
      "lessons learned",
      "incident testing",
      "incident response assistance",
      "communication",
      "notification",
      "cyber incident",
    ],
  },
  {
    id: "bcdr",
    name: "Business Continuity & Disaster Recovery (BCDR) Policy",
    domain: domains[6],
    domainIndex: 6,
    order: 2,
    purpose:
      "This policy defines the strategies, plans, and procedures for maintaining critical business operations during major disruptions, including natural disasters, cyber attacks, and infrastructure failures.",
    keywords: [
      "business continuity",
      "bcdr",
      "disaster recovery",
      "contingency",
      "alternate site",
      "availability",
      "redundancy",
      "capacity management",
      "resilience",
      "tabletop",
      "tlpt",
      "ict readiness",
    ],
  },
  {
    id: "backup",
    name: "Backup & Restore Policy",
    domain: domains[6],
    domainIndex: 6,
    order: 3,
    purpose:
      "This policy defines the required frequencies for system and data backups, the retention periods for backup copies, and the schedule for testing data restoration to ensure recoverability.",
    keywords: [
      "backup",
      "restore",
      "restoration",
      "system recovery",
      "controlled recovery",
    ],
  },

  // 8. Physical Security
  {
    id: "physical-security",
    name: "Physical & Environmental Security Policy",
    domain: domains[7],
    domainIndex: 7,
    order: 1,
    purpose:
      "This policy defines the physical access controls, visitor management procedures, and environmental protections (fire, water, climate) required to secure the Organization's offices, data centers, and equipment.",
    keywords: [
      "physical security",
      "physical access",
      "physical entry",
      "physical perimeter",
      "physical monitoring",
      "visitor",
      "facility",
      "secure area",
      "equipment",
      "utilities",
      "cabling",
      "emergency power",
      "environmental threat",
      "offices",
    ],
  },

  // 1. Master Governance (last = lowest priority, checked after all other policies)
  {
    id: "governance",
    name: "Information Security Governance Policy",
    domain: domains[0],
    domainIndex: 0,
    order: 99,
    purpose:
      "This policy establishes the overarching governance framework for information security within the Organization. It defines the authority of the CISO, the structure of the security organization, and the executive-level commitment required to protect the Organization's information assets.",
    keywords: [
      "isms",
      "governance framework",
      "executive oversight",
      "information security policy",
      "roles and responsibilities",
      "management review",
      "internal audit",
      "audit program",
      "documented information",
      "continual improvement",
      "corrective action",
      "interested parties",
      "independent review",
      "policy framework",
      "central contact",
      "competent authorities",
      "supervisory cooperation",
    ],
  },
];

const governancePolicy: SubPolicy = {
  id: "governance",
  name: "Information Security Governance Policy",
  domain: domains[0],
  domainIndex: 0,
  order: 0,
  purpose:
    "This policy establishes the overarching governance framework for information security within the Organization. It defines the authority of the CISO, the structure of the security organization, and the executive-level commitment required to protect the Organization's information assets.",
  keywords: [],
};

function classifyControl(theme: string): SubPolicy {
  const t = theme.toLowerCase();

  for (const policy of policies) {
    for (const kw of policy.keywords) {
      if (t.includes(kw.toLowerCase())) {
        return policy;
      }
    }
  }

  return governancePolicy;
}

export function classifyControls<T extends { theme: string }>(
  controls: T[]
): Map<string, T[]> {
  const map = new Map<string, T[]>();

  for (const policy of policies) {
    map.set(policy.id, []);
  }

  for (const c of controls) {
    const policy = classifyControl(c.theme);
    const list = map.get(policy.id)!;
    list.push(c);
  }

  return map;
}

export { policies, governancePolicy, domains };
