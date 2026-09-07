# Compliance Mapping Engine - PROJECT MAP

> Generated: 2026-06-18 | Updated: 2026-09-07 | Status: **PRODUCTION-READY**

---

## [TECH_STACK]

| Layer | Technology | Version | Status |
|---|---|---|---|
| Runtime | Node.js | 20.11.1 LTS | Active |
| Framework | Next.js | 16.2.9 | Production Build |
| UI Library | React | 19.2.4 | Latest |
| ORM | Prisma | 5.22.0 | Migrated + Seeded |
| Database | SQLite | (built-in) | `dev.db` |
| Language | TypeScript | 5.x | Type-checked |
| CSS | Tailwind CSS | v4 | |

---

## [SYSTEM_FLOW]

```
Browser (Next.js SSR)
      |
      +----> Next.js Pages <----> API Routes
      |         - Dashboard        - /api/data-items
      |         - Data Items       - /api/frameworks
      |         - Frameworks       - /api/mappings
      |         - Mappings         - /api/evaluate
      |         - Evaluate         - /api/reports/*
      |         - Audit            - /api/audit
      |         - Scorecard        - /api/audit/report
      |         - Reports
      |
      v
   Prisma ORM (SQLite)
   134 Data Items
   667 Controls
   922 Mappings
   667 ControlAudits (audit status per control)
   5,519 ControlScopeRefs (permission-name context per control, across 381 controls / 12 audit areas)
```

### Data Flow
1. **Browse** - User navigates data items / frameworks / mappings
2. **Evaluate** - User selects item + value, API computes compliance per framework
3. **Report** - Compliance summary + gap analysis generated
4. **Audit** - User assesses each control (compliant/partial/noncompliant/notstarted) + collects evidence; API computes per-framework %, weak points, breakdown
5. **Scorecard** - Read-only overall score + per-framework health + weak controls from audit data

---

## [ARCHITECTURE]

### File Structure
```
compliance-app/
|- prisma/
|  |- schema.prisma          # DataItem, Framework, Control (+audit fields), Mapping, ControlAudit, ControlScopeRef
|  |- seed.ts                # 15 frameworks, 667 controls, 134 items, 922 mappings (+ calls seedControlAudits + seedControlScopeRefs)
|  |- audit-seed.ts          # Per-control audit guidance + idempotent audit seeding (demo baseline; preserves saved statuses) + scope ref mapping (5,519 refs)
|  |- scope-catalog.ts       # Permission-name catalog (Google Workspace + Microsoft Graph) + category/theme keyword map
|  |- dev.db                 # SQLite database (seeded)
|- src/
|  |- lib/
|  |  |- prisma.ts              # Singleton client
|  |  |- logger.ts              # Async JSON logger
|  |  |- policy-taxonomy.ts     # 18 sub-policies, keyword classification
|  |  |- audit-scoring.ts       # Audit scorecard engine: % per framework, weak points, overall (compliant/partial/noncompliant/notstarted)
|  |  |- audit-coverage.ts      # Per-framework breakdown: mapping coverage %, categories, weak controls, risk dist, audit scopes + OAuth scopes
|  |  |- audit-report.ts        # Control row -> scorecard/breakdown input mapping + DB pulls
|  |- components/
|  |  |- print-button.tsx       # Client-side print button
|  |  |- audit-viz.tsx          # Donut / segmented donut / animated bar visualisations
|  |- app/
|  |  |- layout.tsx             # Root layout + sidebar nav
|  |  |- nav.tsx                # Navigation component
|  |  |- audit/
|  |  |  |- page.tsx            # Audit assessment: By control (filter by framework/area/theme/status, scope-name chips) + Framework breakdown tab (per-framework audit + OAuth scopes)
|  |  |- assessment/
|  |  |  |- page.tsx            # Scorecard: overall donut, per-framework %, weak points, expandable breakdown
|  |  |- globals.css            # Tailwind + custom styles
|  |  |- page.tsx               # Dashboard (stats + quick actions)
|  |  |- data-items/
|  |  |  |- page.tsx            # List + filter by domain
|  |  |  |- [id]/page.tsx       # Detail with mappings
|  |  |- frameworks/
|  |  |  |- page.tsx            # Grid of all frameworks
|  |  |  |- [id]/page.tsx       # Controls list
|  |  |- controls/
|  |  |  |- [id]/page.tsx       # Control detail: stats, data items table, mappings
|  |  |- mappings/page.tsx      # Overview by framework + severity
|  |  |- evaluate/page.tsx      # Client-side evaluation tool
|  |  |- generate/
|  |  |  |- page.tsx            # Company info form + framework selector
|  |  |  |- [id]/page.tsx       # Sub-policy navigation + preview
|  |  |- policies/
|  |  |  |- page.tsx            # Policy generator - framework selection
|  |  |  |- [id]/page.tsx       # Generated policy document from controls
|  |  |- reports/page.tsx       # Compliance + gap analysis
|  |  |- api/
|  |     |- data-items/route.ts          # GET/POST
|  |     |- data-items/[id]/route.ts     # GET/DELETE
|  |     |- frameworks/route.ts          # GET
|  |     |- frameworks/[id]/controls/    # GET (framework + controls)
|  |     |- mappings/route.ts            # GET (filterable)
|  |     |- audit/route.ts               # GET (controls + audit state + audit areas) / PUT (upsert audit status/evidence/notes)
|  |     |- audit/report/route.ts        # GET (scorecard + framework breakdown)
|  |     |- evaluate/route.ts            # POST (compliance check)
|  |     |- generate/
|  |     |  |- docx/route.ts            # POST (DOCX generation)
|  |     |- reports/
|  |        |- compliance/route.ts      # Compliance summary
|  |        |- gap/route.ts             # Gap analysis
|- package.json
|- PROJECT_MAP.md
```

### Database Schema
```
DataItem (id, key, label, description, category, domain)
Framework (id, name, version, region)
Control (id, frameworkId, ref, theme, description, auditProcedure,
         evidenceRequired, auditTestRef, auditArea, auditScope)
ControlScopeRef (id, controlId, provider, scopeId, displayName)
Mapping (id, dataItemId, controlId, justification, severity,
         slaThreshold, findingType, remediation, evidenceRequired,
         region, supplyChainFlag, kevOverride, testId)
ControlAudit (id, controlId (unique), status [compliant/partial/noncompliant/notstarted],
              evidence, notes, assessedBy, assessedAt, createdAt)
```

---

## [FRAMEWORKS LOADED]

| # | Framework | Version | Controls |
|---|---|---|---|
| 1 | ISO/IEC 27001:2022 | 2022 | 93 |
| 2 | NIST SP 800-53 Rev.5 | Rev.5 | 72 |
| 3 | CIS Controls v8 | v8 | 68 |
| 4 | PCI DSS 4.0 | 4.0 | 49 |
| 5 | GDPR | EU 2016/679 | 48 |
| 6 | NIST CSF 2.0 | 2.0 | 48 |
| 7 | SOC 2 (TSC) | TSC 2023 | 48 |
| 8 | UAE IA Standards | ECSCC/NIA | 45 |
| 9 | HIPAA Security Rule | 45 CFR 164 | 42 |
| 10 | DORA (EU 2022/2554) | 2022 | 40 |
| 11 | NIS2 (EU 2022/2555) | 2022 | 37 |
| 12 | ISO/IEC 42001:2023 | 2023 | 20 |
| 13 | **IMO Resolution MSC.428(98)** | MSC-FAL.1/Circ.3 Rev.3 | **12** |
| 14 | **IACS UR E26 Rev.1** | Rev.1 Nov 2023 | **20** |
| 15 | **IACS UR E27 Rev.1** | Rev.1 Sep 2023 | **25** |

## [DOMAINS LOADED]

| # | Domain | Data Items | Mappings |
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

## [ORPHANS & PENDING]

| Item | Status | Notes |
|---|---|---|
| All content seeded | DONE | 15 frameworks, 667 controls, 134 data items, 922 mappings + 667 default control audits |
| All APIs built | DONE | CRUD + evaluate + compliance + gap reports |
| Frontend complete | DONE | 9 pages: Dashboard, Data Items, Frameworks, Mappings, Evaluate, Audit, Scorecard, Generate, Reports |
| Build passes | DONE | `npm run build` - compiled + type-checked |
| Audit-based scoring | DONE | Replace OAuth scopes: per-control audit status + evidence leads to framework % + weak points |
| Framework breakdown | DONE | Per-framework mapping coverage %, categories, weak controls, risk distribution |
| OAuth scopes removed | DONE | Scope/ScopeMapping/ScopeAssessment models, seeds, APIs, and pages fully removed |
| Audit scopes restored | DONE | Permission names per control restored as reference context + audit area / audit scope fields + area filter (5,519 refs) |
| Auth / SSO | Phase 2 | Not in MVP scope |
| Multi-tenant | Phase 2 | Row-level security ready in schema |
| Connectors (IdP, CSP) | Phase 2 | API-first design allows connectors |
| CI/CD | Phase 2 | GitHub Actions |
| Deployment | Phase 2 | Docker / Vercel ready |

---

## [MILESTONES COMPLETED]

| M | Milestone | Status |
|---|---|---|
| **M1** | Data Schema + DB | Prisma schema + SQLite + seed data |
| **M2** | Core Mapping Engine | Evaluate API with compliance logic |
| **M3** | CRUD APIs | All REST endpoints functional |
| **M4** | Frontend Baseline | 6 pages with Tailwind CSS |
| **M5** | Full Content | 18 domains, 15 frameworks, 134 items, 922 mappings |
| **M6** | Reporting | Compliance summary + gap analysis |
| **M7** | Policy Generator | Company-specific policy suite with 18 sub-policies per framework |
| **M8** | DOCX Export | Server-side .docx generation via `docx` package |
| **M9** | Audit-based Scoring | Rebuilt feature: per-control audit status + evidence, framework %, weak points (replaces OAuth scopes) |
| **M10** | Compliance Scorecard | Overall donut + per-framework health + weak controls, powered by audit data |
| **M11** | Framework Breakdown | Per-framework mapping coverage %, categories, weak controls, risk distribution |
| **M12** | OAuth Scopes Removed | Scope/ScopeMapping/ScopeAssessment models, seeds, APIs, and pages fully removed |
| **M13** | Audit Scopes Restored | Permission names per control as reference context + audit area/scope fields + area filter (5,519 refs) |
| **M14** | Non-destructive rebuilds | Idempotent seed + demo baseline; `npm run build` no longer wipes saved audit statuses |
| **M15** | Auth + Multi-tenant | Phase 2 |

---

## [HOW TO RUN]

```bash
cd compliance-app
npm install          # already done
npx prisma generate  # already done
npx prisma db seed   # already done
npm run dev          # -> http://localhost:3000
npm run build        # production build (applies migrations, idempotent seed, does NOT wipe audit data)
npm run db:reset     # full DB reset (wipes audit data + reseeds demo baseline)
npm start            # production server
```