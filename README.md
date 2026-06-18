# Compliance Mapping Engine

A production-ready multi-framework compliance mapping and evaluation platform. Map 134 security data items across 12 frameworks (610 controls, 922 cross-mappings) and instantly evaluate compliance posture with automated gap analysis.

Built by **MSc. Eng. Abdul Rahman Hawa**.

---

## Features

- **12 Compliance Frameworks** — ISO 27001, NIST SP 800-53, CIS Controls, PCI DSS, GDPR, SOC 2, HIPAA, DORA, NIS2, NIST CSF, UAE IA, ISO 42001
- **134 Data Items** across 18 security domains (Identity, Network, Endpoint, Data Protection, Cloud, AI Security, OT/IoT, and more)
- **922 Pre-built Mappings** — each data item linked to relevant controls with severity, SLA thresholds, remediation guidance, and evidence requirements
- **Evaluate** — select a data item and value; API computes compliance status per framework
- **Compliance Reports** — summary view across all frameworks with real coverage percentages
- **Gap Analysis** — identify missing controls and prioritize remediation
- **Local-first** — SQLite database, zero external dependencies to run
- **Dashboard** — at-a-glance stats and quick actions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| Language | TypeScript |
| ORM | Prisma 5.22 |
| Database | SQLite |
| Runtime | Node.js 20+ |

---

## Getting Started

```bash
# Install dependencies (also generates Prisma client)
npm install

# Create database and seed with all frameworks, controls, items, mappings
npm run db:reset

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the application.

---

## Usage

| Page | Description |
|---|---|
| **Dashboard** | Overview stats: frameworks, controls, data items, mappings |
| **Data Items** | Browse 134 items across 18 domains; click for detail with mappings |
| **Frameworks** | View all 12 frameworks; click to see controls |
| **Mappings** | Filterable view of all 922 cross-mappings |
| **Evaluate** | Select a data item + value to check compliance per framework |
| **Reports** | Compliance coverage summary + gap analysis across all frameworks |

---

## Frameworks

| # | Framework | Region | Controls |
|---|---|---|---|
| 1 | ISO/IEC 27001:2022 | GLB | 93 |
| 2 | NIST SP 800-53 Rev.5 | US-FED | 72 |
| 3 | CIS Controls v8 | GLB | 68 |
| 4 | PCI DSS 4.0 | GLB | 49 |
| 5 | GDPR | EU | 48 |
| 6 | NIST CSF 2.0 | GLB-NIST | 48 |
| 7 | SOC 2 (TSC) | GLB | 48 |
| 8 | UAE IA Standards | UAE | 45 |
| 9 | HIPAA Security Rule | US | 42 |
| 10 | DORA (EU 2022/2554) | EU | 40 |
| 11 | NIS2 (EU 2022/2555) | EU | 37 |
| 12 | ISO/IEC 42001:2023 | GLB | 20 |

---

## Domains

| # | Domain | Items | Mappings |
|---|---|---|---|
| 1 | Identity & Access | 10 | 72 |
| 2 | Data Protection | 10 | 67 |
| 3 | Network Security | 9 | 60 |
| 4 | Endpoint Security | 9 | 58 |
| 5 | Logging & Monitoring | 9 | 56 |
| 6 | Authentication | 8 | 50 |
| 7 | Cloud Security | 8 | 47 |
| 8 | Application Security | 8 | 46 |
| 9 | Vulnerability Management | 8 | 46 |
| 10 | Compliance Governance | 7 | 41 |
| 11 | Supply Chain / Third Party | 7 | 39 |
| 12 | HR / Personnel | 6 | 40 |
| 13 | Business Continuity | 6 | 38 |
| 14 | AI Security | 6 | 37 |
| 15 | OT/IoT Security | 6 | 37 |
| 16 | Database Security | 6 | 36 |
| 17 | Physical Security | 6 | 33 |
| 18 | Email Security | 5 | 28 |

---

## Project Structure

```
compliance-engine/
├── prisma/
│   ├── schema.prisma        # DataItem, Framework, Control, Mapping
│   ├── seed.ts              # 12 frameworks, 610 controls, 134 items, 922 mappings
│   └── migrations/          # Database migrations
├── src/
│   ├── app/
│   │   ├── page.tsx          # Dashboard
│   │   ├── nav.tsx           # Sidebar navigation
│   │   ├── layout.tsx        # Root layout
│   │   ├── data-items/      # List + detail pages
│   │   ├── frameworks/      # List + detail pages
│   │   ├── mappings/        # Mapping overview
│   │   ├── evaluate/        # Compliance evaluation tool
│   │   ├── reports/         # Compliance + gap reports
│   │   └── api/             # REST API routes
│   ├── lib/
│   │   ├── prisma.ts        # Prisma singleton
│   │   └── logger.ts        # JSON logger
│   └── globals.css          # Tailwind styles
├── public/
│   ├── data/                # SQLite database (auto-created)
│   └── logo.png             # Application logo
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/api/data-items` | List all data items |
| GET | `/api/data-items/[id]` | Data item detail with mappings |
| GET | `/api/frameworks` | List all frameworks |
| GET | `/api/frameworks/[id]/controls` | Controls for a framework |
| GET | `/api/mappings` | List mappings (filterable) |
| POST | `/api/evaluate` | Evaluate a data item against frameworks |
| GET | `/api/reports/compliance` | Compliance summary |
| GET | `/api/reports/gap` | Gap analysis |

---

## Deployment

Deploy to any Node.js hosting platform:

```bash
npm run build
npm start
```

Recommended: [Vercel](https://vercel.com) (one-click import from GitHub).

---

## License

MIT &copy; 2026 MSc. Eng. Abdul Rahman Hawa
