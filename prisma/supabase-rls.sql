-- ─────────────────────────────────────────────────────────────
-- Supabase Row Level Security (defense in depth)
--
-- CVForge enforces ownership in the server/API layer for every CV operation
-- (authenticatedUser.id === cv.userId). These policies add a second, database
-- level guarantee for the production Supabase path: even a direct query with a
-- user's access token can only ever read or write that user's own records.
--
-- Run this once against your Supabase database (SQL editor) AFTER applying the
-- Prisma migrations. Prisma itself connects with the privileged Postgres role
-- and is unaffected by RLS; these policies protect the anon/authenticated
-- roles used by the Supabase client.
--
-- Assumes Profile.id equals the Supabase auth user id (auth.uid()).
-- ─────────────────────────────────────────────────────────────

alter table "Profile"        enable row level security;
alter table "CV"             enable row level security;
alter table "Experience"     enable row level security;
alter table "Education"      enable row level security;
alter table "Skill"          enable row level security;
alter table "Project"        enable row level security;
alter table "Certification"  enable row level security;
alter table "Language"       enable row level security;

-- Profile: a user can see and edit only their own profile row.
create policy "own profile" on "Profile"
  for all using (auth.uid()::text = id) with check (auth.uid()::text = id);

-- CV: a user can access only CVs they own.
create policy "own cvs" on "CV"
  for all using (auth.uid()::text = "userId")
  with check (auth.uid()::text = "userId");

-- Child sections: access allowed only when the parent CV belongs to the user.
create policy "own experiences" on "Experience"
  for all using (exists (select 1 from "CV" where "CV".id = "Experience"."cvId" and "CV"."userId" = auth.uid()::text))
  with check (exists (select 1 from "CV" where "CV".id = "Experience"."cvId" and "CV"."userId" = auth.uid()::text));

create policy "own educations" on "Education"
  for all using (exists (select 1 from "CV" where "CV".id = "Education"."cvId" and "CV"."userId" = auth.uid()::text))
  with check (exists (select 1 from "CV" where "CV".id = "Education"."cvId" and "CV"."userId" = auth.uid()::text));

create policy "own skills" on "Skill"
  for all using (exists (select 1 from "CV" where "CV".id = "Skill"."cvId" and "CV"."userId" = auth.uid()::text))
  with check (exists (select 1 from "CV" where "CV".id = "Skill"."cvId" and "CV"."userId" = auth.uid()::text));

create policy "own projects" on "Project"
  for all using (exists (select 1 from "CV" where "CV".id = "Project"."cvId" and "CV"."userId" = auth.uid()::text))
  with check (exists (select 1 from "CV" where "CV".id = "Project"."cvId" and "CV"."userId" = auth.uid()::text));

create policy "own certifications" on "Certification"
  for all using (exists (select 1 from "CV" where "CV".id = "Certification"."cvId" and "CV"."userId" = auth.uid()::text))
  with check (exists (select 1 from "CV" where "CV".id = "Certification"."cvId" and "CV"."userId" = auth.uid()::text));

create policy "own languages" on "Language"
  for all using (exists (select 1 from "CV" where "CV".id = "Language"."cvId" and "CV"."userId" = auth.uid()::text))
  with check (exists (select 1 from "CV" where "CV".id = "Language"."cvId" and "CV"."userId" = auth.uid()::text));

-- ─────────────────────────────────────────────────────────────
-- Sprint 4 tables
-- ─────────────────────────────────────────────────────────────

alter table "CoverLetter"      enable row level security;
alter table "Application"      enable row level security;
alter table "ApplicationEmail" enable row level security;

create policy "own cover letters" on "CoverLetter"
  for all using (auth.uid()::text = "userId")
  with check (auth.uid()::text = "userId");

create policy "own applications" on "Application"
  for all using (auth.uid()::text = "userId")
  with check (auth.uid()::text = "userId");

create policy "own application emails" on "ApplicationEmail"
  for all using (auth.uid()::text = "userId")
  with check (auth.uid()::text = "userId");

-- ─────────────────────────────────────────────────────────────
-- Sprint 5 billing tables (server-written via Prisma; these policies protect
-- any direct client reads with the anon/authenticated role).
-- ─────────────────────────────────────────────────────────────

alter table "Subscription" enable row level security;
alter table "Payment"      enable row level security;
alter table "Usage"        enable row level security;

create policy "own subscription" on "Subscription"
  for all using (auth.uid()::text = "userId")
  with check (auth.uid()::text = "userId");

create policy "own payments" on "Payment"
  for all using (auth.uid()::text = "userId")
  with check (auth.uid()::text = "userId");

create policy "own usage" on "Usage"
  for all using (auth.uid()::text = "userId")
  with check (auth.uid()::text = "userId");

-- ─────────────────────────────────────────────────────────────
-- Sprint 7 admin audit log — locked to server access only.
-- RLS enabled with NO policy => no anon/authenticated client can read or write
-- it. Admin reads happen server-side via Prisma (privileged connection).
-- ─────────────────────────────────────────────────────────────

alter table "AdminAuditLog" enable row level security;
