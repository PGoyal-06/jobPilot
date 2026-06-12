-- ============================================================
-- profiles
-- One row per user. id = auth.users(id).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           text,
  email               text,
  phone               text,
  location            text,
  current_title       text,
  experience_level    text,
  years_experience    integer,
  skills              text[]      NOT NULL DEFAULT '{}',
  industries          text[]      NOT NULL DEFAULT '{}',
  work_experience     jsonb       NOT NULL DEFAULT '[]',
  education           jsonb       NOT NULL DEFAULT '{}',
  job_titles_seeking  text[]      NOT NULL DEFAULT '{}',
  remote_preference   text,
  preferred_locations text[]      NOT NULL DEFAULT '{}',
  salary_expectation  text,
  cover_letter_tone   text,
  linkedin_url        text,
  portfolio_url       text,
  work_authorization  text,
  resume_pdf_url      text,
  is_complete         boolean     NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE TO authenticated
  USING (id = (SELECT auth.uid()));

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;


-- ============================================================
-- agent_runs
-- One record per job-search run triggered by the user.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_runs (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status              text        NOT NULL DEFAULT 'running',
  job_title_searched  text,
  location_searched   text,
  jobs_found          integer     NOT NULL DEFAULT 0,
  started_at          timestamptz NOT NULL DEFAULT now(),
  completed_at        timestamptz
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_user_id ON public.agent_runs(user_id);

ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_runs_select" ON public.agent_runs
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "agent_runs_insert" ON public.agent_runs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "agent_runs_update" ON public.agent_runs
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "agent_runs_delete" ON public.agent_runs
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_runs TO authenticated;


-- ============================================================
-- jobs
-- One row per discovered job. run_id is null for URL-sourced jobs.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id              uuid        REFERENCES public.agent_runs(id) ON DELETE SET NULL,
  user_id             uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source              text        NOT NULL,
  source_url          text,
  external_apply_url  text,
  title               text,
  company             text,
  location            text,
  salary              text,
  job_type            text,
  about_role          text,
  responsibilities    text[]      NOT NULL DEFAULT '{}',
  requirements        text[]      NOT NULL DEFAULT '{}',
  nice_to_have        text[]      NOT NULL DEFAULT '{}',
  benefits            text[]      NOT NULL DEFAULT '{}',
  about_company       text,
  match_score         integer,
  match_reason        text,
  matched_skills      text[]      NOT NULL DEFAULT '{}',
  missing_skills      text[]      NOT NULL DEFAULT '{}',
  company_research    jsonb,
  found_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_run_id ON public.jobs(run_id);
CREATE INDEX IF NOT EXISTS idx_jobs_match_score ON public.jobs(match_score);
CREATE INDEX IF NOT EXISTS idx_jobs_found_at ON public.jobs(found_at);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jobs_select" ON public.jobs
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "jobs_insert" ON public.jobs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "jobs_update" ON public.jobs
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "jobs_delete" ON public.jobs
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;


-- ============================================================
-- agent_logs
-- Structured log entries emitted during agent runs.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id      uuid        REFERENCES public.agent_runs(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message     text        NOT NULL,
  level       text        NOT NULL DEFAULT 'info',
  job_id      uuid        REFERENCES public.jobs(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_logs_user_id ON public.agent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_run_id ON public.agent_logs(run_id);

ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_logs_select" ON public.agent_logs
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "agent_logs_insert" ON public.agent_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "agent_logs_update" ON public.agent_logs
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "agent_logs_delete" ON public.agent_logs
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_logs TO authenticated;
