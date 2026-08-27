# CVForge

Create a professional CV in minutes.

CVForge is a modern CV and job application builder, built initially for
Cameroonian students, graduates, professionals, freelancers and job seekers.
Choose a design, add your experience, preview it instantly, and get ready to
apply.

**Sprint 2** turned the UI into a real application: real authentication, a
Postgres database with per-user ownership, full CRUD for CVs, autosave, and an
8-section builder with a live A4 preview.

**Sprint 3** adds professional document generation: real, text-selectable,
multi-page A4 **PDF export** (server-side with `@react-pdf/renderer`) for all
three templates, a print-only view, save-before-export, validation, and a
premium download experience.

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
| `POST` | `/api/auth/{signup,login,logout}` | Local auth provider |
| `GET` | `/auth/callback` | Supabase OAuth callback |

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
