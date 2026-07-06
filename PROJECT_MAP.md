# PROJECT_MAP — ComplyFlow

## TECH_STACK
| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Next.js | 16.2.9 | App Router, Turbopack, Server Actions |
| UI Library | React | 19.2.7 | Server Components by default |
| ORM | Prisma | 6.19.3 | SQLite default, PostgreSQL via Docker |
| Styling | Tailwind CSS | 4.3.0 | `@theme` directive, OKLCH colors, no config file |
| Components | shadcn/ui | 4.11.0 | New York style, Sonner toasts |
| Auth | Better Auth | 1.6.16 | Prisma adapter, email/password, RBAC |
| Database | SQLite | — | Default zero-config; PostgreSQL via docker-compose |
| Runtime | Node.js | 20.11.1 | Docker image |
| TypeScript | TypeScript | 5.8.3 | Strict mode |

## SYSTEM_FLOW
```
User → Browser → Next.js (Server Components) → Server Actions → Prisma → SQLite/PostgreSQL
                                                      ↓
                                                 AuditLog (async)
```

### Authentication Flow
1. POST `/api/auth/sign-up/email` → Better Auth → User + Account created
2. `databaseHooks.user.create.after` → auto-create Organization + admin OrganizationMember
3. Subsequent sign-ins → session cookie → `getSession()` → protected routes
4. Forgot-password → `/api/auth/forget-password` → `sendResetPassword` callback logs link in dev
5. Reset-password → token from query → `/api/auth/reset-password` with new password

### Assessment Flow
1. User views Framework → lists domains + controls
2. User clicks control → detail page with AssessmentForm
3. Form submits → `updateControlStatus` Server Action → upsert ControlAssessment
4. Evidence can be added per ControlAssessment (file upload, link, note)
5. All mutations logged to AuditLog via `log()` utility

### Invite Flow
1. Admin enters email on Members page → `createInvite` Server Action
2. Token saved to `InviteToken` table → invite URL logged to console in dev
3. Recipient visits `/invite?token=...` → signs in → accepts → OrganizationMember created
4. Invite token marked `usedAt` to prevent reuse

## ARCHITECTURE

### Directory Structure
```
complyflow/
├── prisma/
│   ├── schema.prisma          # 17 models: User, Session, Account, Verification,
│   │                          # Organization, OrganizationMember, InviteToken,
│   │                          # Framework, Domain, Control (+ guidance field),
│   │                          # Ref, DataItem, RefDataItem,
│   │                          # Assessment, ControlAssessment, Evidence, AuditLog
│   ├── guidance-data.ts       # Step-by-step audit guidance for all 147 controls
│   ├── seed.ts                # ISO 27001:2022 (93 controls) + SOC 2 (54 controls)
│   └── seed-refs.ts           # References + DataItems for ISO 27001 + SOC 2
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/         # Sign-in page
│   │   │   ├── register/      # Sign-up page (first user = admin)
│   │   │   ├── forgot-password/ # Request reset link
│   │   │   ├── reset-password/  # Consume reset token
│   │   │   └── invite/        # Accept org invite
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/     # Overview: total controls, assessed, compliant, activity
│   │   │   ├── frameworks/[slug]     # ISO 27001 or SOC 2 domain/control listing
│   │   │   └── refs/[code]       # Reference detail: description + data items + mappings
│   │   │   ├── controls/[id]  # Control detail + assessment form + evidence
│   │   │   ├── evidence/      # All evidence across assessments
│   │   │   ├── reports/       # Audit-ready report table + HTML download
│   │   │   ├── settings/      # Org info
│   │   │   └── settings/members/ # Team listing + invite management
│   │   ├── api/
│   │   │   ├── auth/[...all]  # Better Auth API handler
│   │   │   └── reports/[id]   # HTML report download
│   │   ├── globals.css        # Tailwind v4 theme
│   │   ├── layout.tsx         # Root layout + Toaster
│   │   └── page.tsx           # Redirect to /dashboard or /login
│   ├── components/
│   │   ├── ui/                # button, input, label, badge, card, avatar, separator,
│   │   │                      # dropdown-menu (shadcn-style)
│   │   ├── sidebar.tsx        # Navigation sidebar
│   │   ├── header.tsx         # Top bar with user menu
│   │   ├── controls-table.tsx # Reusable control list
│   │   └── assessment-badge.tsx
│   ├── lib/
│   │   ├── auth.ts            # Better Auth instance + getSession()
│   │   ├── db.ts              # Prisma singleton
│   │   ├── logger.ts          # Async AuditLog writer
│   │   └── utils.ts           # cn(), formatDate()
│   ├── server/actions/
│   │   ├── assessment.ts      # updateControlStatus
│   │   ├── evidence.ts        # addEvidence (file/link/note)
│   │   └── invite.ts          # createInvite, acceptInvite, getPendingInvites
│   └── types/index.ts
├── public/uploads/            # Evidence file storage
├── docker-compose.yml         # Postgres 16 + App
├── Dockerfile                 # Node 20, multi-stage
├── package.json               # Pinned versions
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── PROJECT_MAP.md
```

### Data Model (Core)
```
Organization ── OrganizationMember ── User
                    │           │
               InviteToken      │
                    │           │
                   Ref ── RefDataItem ── DataItem
                    │
Assessment ── ControlAssessment ── Control ── Domain ── Framework
                    │
              Evidence          AuditLog
```

- **Framework**: ISO 27001:2022 (slug: iso27001) | SOC 2 (slug: soc2)
- **Domain**: A.5, A.6, A.7, A.8 / CC1-CC9, A1, C1, PI1, P1-P5
- **Control**: 93 ISO + 54 SOC 2 main criteria
- **Assessment**: Per-org assessment run (auto-created on first status update)
- **ControlAssessment**: Status per control per assessment
- **Evidence**: File, link, or note attached to a ControlAssessment
- **InviteToken**: Email + token for inviting new members (expires 7 days)
- **Ref**: External reference standard (GDPR, NIST CSF, PCI DSS, COBIT, etc.) linked to a framework
- **DataItem**: Audit evidence item / document that can be mapped to multiple references
- **RefDataItem**: Junction table linking Refs to DataItems
- **AuditLog**: Async log of all mutations

## IMPLEMENTED FEATURES
- [x] Email/password auth with Better Auth
- [x] Auto-admin on first signup
- [x] Password reset flow (console-printed in dev)
- [x] Dashboard with metrics + audit log
- [x] ISO 27001:2022 framework (93 controls across A.5–A.8)
- [x] SOC 2 framework (54 controls across CC1–CC9, A1, C1, PI1, P1–P5)
- [x] Control detail page with assessment form
- [x] Step-by-step implementation guidance for every control (ISO + SOC2)
- [x] Guidance data: 147 entries with actionable audit steps + evidence collection
- [x] Framework References (Refs): GDPR, NIST CSF, PCI DSS, COBIT, ITIL, etc.
- [x] Data Items: 20 audit evidence documents with descriptions
- [x] Ref → DataItem mappings (70 mappings across both frameworks)
- [x] Reference detail page: description + all related data items + item mappings
- [x] Evidence file upload (stored to `public/uploads/`)
- [x] Evidence link/note support
- [x] Evidence delete
- [x] Audit report page with HTML download
- [x] Invite members by email (token-based)
- [x] Members management page (list roles, invite form, pending invites)

## FUTURE (OUT OF SCOPE)
- [ ] Multi-organization switching
- [ ] Stripe billing integration
- [ ] Dark mode toggle
- [ ] Control search/filter
- [ ] SOC 2 ↔ ISO 27001 cross-mapping
- [ ] Email notifications for assigned controls
- [ ] E2E tests with Playwright
