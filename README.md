# CVForge

Create a professional CV in minutes.

CVForge is a modern CV and job application builder, built initially for
Cameroonian students, graduates, professionals, freelancers and job seekers.
Choose a design, add your experience, preview it instantly, and get ready to
apply.

This repository contains **Sprint 1**: the marketing site, authentication
screens, an initial dashboard, and a working CV builder with a real-time A4
preview.

## Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** for styling (custom design system)
- **Framer Motion** for tasteful scroll & micro animations
- **Prisma** schema + **Supabase** clients wired for Sprint 2 persistence
- **lucide-react** icons

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Environment variables are optional in Sprint 1 — see `.env.example`. Auth is
stubbed client-side so the full flow (sign up → dashboard → builder) is
navigable without live Supabase credentials. The Supabase clients in
`lib/supabase/*` and the Prisma schema are ready to take over in Sprint 2.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npx prisma generate` — regenerate the Prisma client

## Project structure

```
app/
  (marketing)/        landing page + legal placeholders (shared header/footer)
  login/  signup/     authentication screens
  dashboard/          authenticated dashboard
  builder/new/        CV builder (step nav + live preview)
components/
  marketing/          hero, templates, features, CTA, etc.
  builder/            builder client, section forms, repeatable items
  cv/                 CVDocument (3 templates) + auto-scaling A4Frame
  auth/  app/  ui/    shared shells, header, primitives
lib/
  cv-types.ts         CV data model + realistic sample data
  auth.ts             Sprint 1 client auth stub
  supabase/  prisma.ts  wired for Sprint 2
prisma/schema.prisma  User / CV / Experience / Education / Skill
```

## What's included in Sprint 1

- Responsive marketing landing page with sticky nav & mobile menu
- Hero with an animated, realistic A4 CV preview (scroll parallax)
- Social proof stats, interactive product preview, template showcase
- How It Works, Features, target-audience and closing CTA sections
- Sign up / log in screens consistent with the marketing site
- Dashboard with empty state and template quick-start
- CV builder: Personal Info, Summary, Experience, Education, Skills with
  add/remove and a live A4 preview in three distinct templates
  (Classic, Modern, Minimal). Projects, Certifications, Languages and
  References are present and marked as upcoming.
- Smooth, subtle animations that respect `prefers-reduced-motion`

## Not in Sprint 1 (planned later)

Payments, AI generation, real PDF export, advanced ATS analysis, and
server-side persistence.

© 2026 CVForge
