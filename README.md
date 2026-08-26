# CVForge

Create a professional CV in minutes.

CVForge is a modern CV and job application builder, built initially for
Cameroonian students, graduates, professionals, freelancers and job seekers.
Choose a design, add your experience, preview it instantly, and get ready to
apply.

**Sprint 2** turns the UI into a real application: real authentication, a
Postgres database with per-user ownership, full CRUD for CVs, autosave, and an
8-section builder with a live A4 preview.

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
| `POST` | `/api/auth/{signup,login,logout}` | Local auth provider |
| `GET` | `/auth/callback` | Supabase OAuth callback |

The builder autosaves the entire CV via a debounced `PATCH /api/cv/[id]`, which
updates the CV inside a transaction (scalar fields + a clean rewrite of each
section table), so a single owned, validated write keeps everything consistent.

## Project structure

```
app/
  (marketing)/        landing page + legal pages
  login/  signup/     auth screens (mode-aware)
  auth/callback/      Supabase OAuth callback
  dashboard/          CV list, create/duplicate/delete
  builder/[id]/       CV builder (autosave + live preview)
  builder/new/        creates a CV record, redirects to /builder/[id]
  api/                cv + auth route handlers
components/
  marketing/ app/ builder/ cv/ auth/ ui/
lib/
  auth/               config, password (scrypt), session (HMAC), server + client
  server/             cv-service (ownership), cv-mapper, api helpers
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

## Not yet implemented (later sprints)

Payments, AI generation, real PDF export, advanced ATS analysis.

© 2026 CVForge
