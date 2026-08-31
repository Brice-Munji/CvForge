# CVForge

Create a professional CV in minutes.

CVForge is a modern CV and job application builder, built initially for
Cameroonian students, graduates, professionals, freelancers and job seekers.
Choose a design, add your experience, preview it instantly, and get ready to
apply.

**Sprint 2** turned the UI into a real application: real authentication, a
Postgres database with per-user ownership, full CRUD for CVs, autosave, and an
8-section builder with a live A4 preview.

**Sprint 3** added professional document generation: real, text-selectable,
multi-page A4 **PDF export** (server-side with `@react-pdf/renderer`) for all
three templates, a print-only view, save-before-export, validation, and a
premium download experience.

**Sprint 4** expanded CVForge into a full **job application toolkit**: a cover
letter builder (with its own PDF export), a structured application email
generator, and an application workspace — a guided create flow, a tracker with
status management, a real-data funnel/stats, search & filter, and per-user
history. CVs and cover letters are reused across the flow.

**Sprint 5** turned CVForge into a **freemium SaaS**: a Free plan and CVForge
Pro (2,500 XAF/month or 20,000 XAF/year), a full payment → server-verification
→ subscription → entitlement pipeline, a centralized plan/entitlement/limit
system, a pricing page, a billing page (with cancel/resume and payment
history), and **server-side** premium enforcement on every gated action.

**Sprint 7** adds the **admin control center** at `/admin`: real-data platform
analytics (users, revenue, CVs, applications, subscriptions), paginated
management of users/CVs/applications/subscriptions/payments, manual Pro
grant/revoke, role changes and account disable/enable — every action authorized
server-side against the `ADMIN` role and recorded in an immutable audit log.

## Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** — custom design system
- **Framer Motion** — tasteful scroll & micro animations
- **Prisma** + **PostgreSQL** — schema, migrations, typed data access
- **Supabase** — authentication (email/password + Google OAuth) in production
- **lucide-react** icons

## Authentication: two interchangeable backends

CVForge resolves every request to a `Profile` row in the same Postgres
database. The auth backend is chosen automatically from your environment:

- **Local (zero-config)** — leave the Supabase env vars blank. The app uses
  built-in email/password auth with **scrypt-hashed** passwords stored in your
  database and a **signed, HTTP-only** session cookie. No localStorage, no fake
  auth. Perfect for `npm run dev` and local VS Code development.
- **Supabase (production)** — set `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Auth is delegated to Supabase, including
  **Google OAuth** (`/auth/callback` handles the exchange). The service-role key
  is never used in this app.

Either way, the authenticated user is **always determined server-side** and
every CV operation verifies ownership (`user.id === cv.userId`). A `not-found`
is returned for both missing and other-users' CVs, so existence is never
revealed. `prisma/supabase-rls.sql` adds Row Level Security policies as
database-level defense in depth for the Supabase path.

## Getting started

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env
#    - Set DATABASE_URL to your Postgres (local or Supabase)
#    - Set a strong SESSION_SECRET
#    - (optional) Set NEXT_PUBLIC_SUPABASE_* to enable Supabase auth + Google

# 3. Create the database schema
npx prisma migrate deploy      # or: npx prisma db push

# 4. Run
npm run dev
```

Open http://localhost:3000. With no Supabase keys you can immediately sign up
with email/password and everything persists to Postgres.

To enable Supabase auth in production, also run `prisma/supabase-rls.sql` once
in the Supabase SQL editor and add `https://YOUR_DOMAIN/auth/callback` as an
OAuth redirect URL (and enable the Google provider).

## Scripts

- `npm run dev` — dev server
- `npm run build` / `npm run start` — production build & serve
- `npx prisma migrate dev` — create/apply a migration in development
- `npx prisma migrate deploy` — apply migrations (CI / production)

## API

All routes determine the user server-side and enforce ownership.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET/POST` | `/api/cv` | List / create CVs |
| `GET/PATCH/DELETE` | `/api/cv/[id]` | Load / save (full replace) / delete a CV |
| `POST` | `/api/cv/[id]/duplicate` | Duplicate a CV with all sections |
| `POST` | `/api/cv/[id]/export` | Generate & return the CV as a PDF (auth + ownership) |
| `GET/POST` | `/api/cover-letters` | List / create cover letters (starter content from a CV) |
| `GET/PATCH/DELETE` | `/api/cover-letters/[id]` | Load / autosave / delete a cover letter |
| `POST` | `/api/cover-letters/[id]/export` | Cover letter PDF (auth + ownership) |
| `GET/POST` | `/api/applications` | List / create applications |
| `GET/PATCH/DELETE` | `/api/applications/[id]` | Load / update (incl. status) / delete an application |
| `POST` | `/api/application-emails` | Create an application email (optionally linked to an application) |
| `GET/PATCH/DELETE` | `/api/application-emails/[id]` | Load / edit / delete an application email |
| `POST` | `/api/auth/{signup,login,logout}` | Local auth provider |
| `GET` | `/auth/callback` | Supabase OAuth callback |

Every route determines the user server-side and verifies ownership before any
read or write; referenced `cvId` / `coverLetterId` are validated against the
authenticated user, and missing/other-users' records return a safe `404`.

The builder autosaves the entire CV via a debounced `PATCH /api/cv/[id]`, which
updates the CV inside a transaction (scalar fields + a clean rewrite of each
section table), so a single owned, validated write keeps everything consistent.

## PDF export & print

The **same `CVData` model** drives three outputs from one source of truth:

```
CVData ──► web template renderer   (components/cv/CVDocument)  ──► live preview + print view
      └──► PDF template renderer   (components/pdf/*)          ──► @react-pdf/renderer ──► PDF
```

- **Download PDF** (builder toolbar): validates the CV → flushes any pending
  autosave → `POST /api/cv/[id]/export` → downloads a real, text-selectable A4
  PDF named `First_Last_CV.pdf`. The user stays in the builder and sees a
  success modal. Duplicate clicks are prevented.
- Server-side generation means the PDF always uses the latest **saved,
  owned** data — never stale form state and never another user's CV.
- Multi-page: content flows onto further A4 pages; entries stay together
  (`wrap={false}`) and section headings avoid orphaning (`minPresenceAhead`).
- Empty sections are omitted entirely (no bare headings).
- **Print CV** (⋯ menu) opens `/builder/[id]/print` — a print-only view that
  hides all app chrome and prints just the CV via `@media print` + `@page A4`.
- `ExportEvent` records `{ userId, cvId, template, type, createdAt }` as the
  foundation for later download analytics / free-vs-premium limits (no limits
  are enforced yet).

No new environment variables are needed — PDF generation runs entirely
server-side in the Node.js runtime with built-in fonts.

## Project structure

```
app/
  (marketing)/        landing page + legal pages
  login/  signup/     auth screens (mode-aware)
  auth/callback/      Supabase OAuth callback
  dashboard/          CV list, create/duplicate/delete
  builder/[id]/       CV builder (autosave + live preview + PDF export)
  builder/[id]/print/ print-only CV view
  builder/new/        creates a CV record, redirects to /builder/[id]
  api/                cv (incl. export) + auth route handlers
components/
  marketing/ app/ builder/ cv/ pdf/ auth/ ui/
lib/
  auth/               config, password (scrypt), session (HMAC), server + client
  server/             cv-service (ownership), cv-mapper, api helpers
  pdf/                render (react-pdf), filename, validate, download
  cv-types.ts         template-independent CV model + sample data
  supabase/           browser + server clients
  prisma.ts  validation.ts  format.ts  utils.ts
prisma/
  schema.prisma  migrations/  supabase-rls.sql
middleware.ts         route protection (both auth modes, edge-safe)
```

## Data model

`Profile` → `CV` → { `Experience`, `Education`, `Skill`, `Project`,
`Certification`, `Language` }. All child sections cascade-delete with their CV.

## Sprint 2 status

Verified end-to-end (automated browser run, 18/18 checks, no console errors):
sign up → log out → log in → create CV → fill personal / summary / experience ×2
/ education ×2 / skills / project → switch templates (content preserved) →
autosave → leave → reopen (persisted) → duplicate → delete → safe not-found for
missing and other-users' CVs (page + API return 404). Responsive with no
horizontal overflow at 375 / 390 / 414 / 768.

## Sprint 4 — job application toolkit

- **Cover letters** (`/cover-letters`, `/cover-letters/new`, `/cover-letters/[id]`):
  pick a CV to reuse your details, get structured **starter content** (a
  template filled with your real CV info — not AI prose), edit in an editor +
  live A4 preview, autosave, switch templates (Classic / Modern) and download a
  selectable-text **PDF**.
- **Application email** (`/application-email/new` and inside an application):
  structured template populated from your CV — Copy Email, Copy Subject,
  Regenerate, Edit. CVForge prepares the email; it never sends it.
- **Applications** (`/applications`, `/applications/new`, `/applications/[id]`):
  a guided 5-step create flow (Job details → CV → Cover letter → Email →
  Review), a tracker with a **table on desktop / cards on mobile**, inline
  status management (Saved · Preparing · Applied · Interview · Offer ·
  Rejected), a real-data **funnel + stats**, search, status filter and sort.
- The dashboard adds **Quick Actions** and a **Your Job Applications** summary
  with real numbers. Statuses use a labelled dot + text (never color alone). No
  "submitted" wording — the user marks an application **Applied** themselves.

Data model additions: `CoverLetter`, `Application`, `ApplicationEmail` (with
`ExportEvent` from Sprint 3). RLS policies for all three are in
`prisma/supabase-rls.sql`. No new environment variables are required.

## Sprint 7 — admin dashboard

- **Access** is gated by the `ADMIN` role stored in the DB (source of truth).
  Configure bootstrap admins via `ADMIN_EMAILS` (comma-separated) — matching
  accounts are promoted on login. Admins can also grant/revoke the role from a
  user's detail page. `/admin` pages check the role in the server layout;
  `/api/admin/*` routes call `requireAdmin()`. Non-admins are redirected (pages)
  or receive **403** (APIs); disabled accounts are blocked by `requireUser()`.
- **Overview** (`/admin`): headline stats (users, Pro users, CVs, applications,
  verified revenue, PDF downloads), user-growth & revenue charts, user/revenue/
  subscription/CV/application stat groups, system health, and a real recent-
  activity feed — all from live `COUNT`/`GROUP BY`/date-filtered queries.
- **Management** (paginated, searchable, filterable, server-side): `/admin/users`
  (+ `/admin/users/[id]` detail), `/admin/cvs`, `/admin/applications`,
  `/admin/subscriptions`, `/admin/payments`, `/admin/analytics` (7d/30d/90d/12m
  ranges via SQL `date_trunc`), `/admin/settings`. CSV export for users,
  payments and subscriptions (never any secret).
- **Actions**: grant Pro (an **administrative entitlement**, `grantType="admin"`
  — never a fake payment; it doesn't expire until revoked), revoke Pro, change
  role, disable/enable account. Each writes an `AdminAuditLog` row
  (`GRANT_PRO`/`REVOKE_PRO`/`CHANGE_ROLE`/`DISABLE_USER`/`ENABLE_USER`) with a
  reason. Admins can't demote or disable themselves. Revenue only ever counts
  `SUCCESS` payments. No passwords/tokens/secrets are ever queried or shown.
- New: `role` + `disabled` on `Profile`, `AdminAuditLog`, and
  `grantType`/`grantedByAdminId`/`grantReason` on `Subscription`, with the
  admin-relevant indexes. Migration + RLS included.

Verified end-to-end (browser + DB assertions), **19/19** (one line was an
`innerText`-uppercase test artifact, confirmed in screenshots): normal user is
denied `/admin` (redirect) and admin APIs (403); admin dashboard loads with
stats matching the DB and updating as data is created; successful payments
raise revenue while failed ones don't; grant/revoke Pro flips entitlements and
writes audit rows; role change toggles admin access; disable blocks then enable
restores; filters/pagination work; IDOR/privilege-escalation blocked; no
secrets exposed; no overflow at 768/1024/1280/1440 and mobile.

## Sprint 5 — payments & subscriptions

- **Plans & entitlements** live in `lib/plans.ts` (Free, Pro monthly/yearly —
  price, currency, interval, features, limits) and `lib/entitlements.ts`
  (`canAccess(ctx, feature)`). Nothing checks `isPremium` ad-hoc.
- **Source of truth is the server.** `lib/server/billing.ts#getPlanContext`
  resolves the effective plan from the `Subscription` row (lazily expiring a
  past-period subscription) plus live usage counts. Every gated endpoint calls
  `checkAccess` server-side: CV limit, monthly PDF-export limit, premium
  templates (Modern/Minimal), cover letters (Pro), application limit. Blocked
  requests return `403 { code: "UPGRADE_REQUIRED" }` which the UI turns into a
  polished upgrade modal — never a dead "access denied".
- **Payment pipeline** (provider-agnostic — `lib/payments/*`): `POST
  /api/payments/checkout` creates a PENDING `Payment` + provider checkout URL →
  the user pays → `POST /api/payments/verify` and `POST /api/payments/webhook`
  both call the idempotent `processTransaction`, which verifies the amount /
  currency / plan **with the provider** before activating the subscription.
  Pro is never granted from the browser reaching `/payment/success`. Duplicate
  webhooks never create duplicate subscriptions/payments (unique
  `transactionId`, single subscription per user, in-transaction re-checks).
- **Provider**: a real gateway is used when `PAYMENT_PROVIDER` +
  `PAYMENT_SECRET_KEY` are set; otherwise a built-in **sandbox** drives the full
  pipeline locally (a clearly-labelled sandbox checkout page). Secrets are
  server-only; see `.env.example`.
- **Pages**: `/pricing` (billing toggle, annual savings), `/settings/billing`
  (plan, status, dates, cancel-at-period-end / resume, usage, payment history),
  `/payment/success` (server-verified, with a pending/retry state),
  `/payment/failed`. Free users see subtle **PRO** badges, template locks, a
  usage strip, and Pro-feature landings.
- **Expiration** keeps all CV/application data — it only removes Pro
  entitlements. Data is never deleted when a subscription lapses.
- New models: `Subscription`, `Payment`, `Usage` (indexed as required; RLS in
  `prisma/supabase-rls.sql`).

Verified end-to-end (browser + DB assertions), **24/24** checks: free limits
(CV / PDF / premium template / cover letter / applications) all blocked with
upgrade prompts; checkout → sandbox pay → **server verify** → Pro active;
premium unlocked; billing + history; cancel keeps Pro until period end;
**idempotent** webhook (1 subscription, 1 successful payment on repeat);
webhook rejects a bad signature; **expiry removes Pro but keeps data**;
another user cannot verify your payment or access your CV (404); unauth
checkout 401. No console errors; no overflow at 375/390/414/768.

## Sprint 3 status

Verified with an automated browser + PDF-inspection run (poppler `pdfinfo`/
`pdftotext`): all three templates export real multi-page PDFs with selectable
text (name, experience, skills, certifications all machine-readable), empty
sections are hidden, filename is `First_Last_CV.pdf`, near-empty CVs are blocked
with a friendly message (422), and the export endpoint returns 404 for other
users' CVs and 401 when logged out. A real browser download of
`Alex_Mbarga_CV.pdf` and the success modal were confirmed end-to-end, with no
console errors and no layout overflow.

## Not yet implemented (later sprints)

Payments / subscription enforcement, AI generation, advanced ATS scoring,
cover letters.

© 2026 CVForge
