# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 5 — Dashboard (Complete)
**Last completed:** 17 Analytics Charts — Real Data
**Next:** Phase 6 (TBD)

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [x] 06 Profile Save Logic
- [x] 07 AI Profile Extraction from Resume
- [x] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [x] 09 Find Jobs Page — Full UI
- [x] 10 Adzuna Job Discovery
- [x] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [x] 12 Job Details Page — Full UI
- [x] 13 Company Research Agent

### Phase 5 — Dashboard

- [x] 14 Dashboard Page — Full UI
- [x] 15 Stats Bar — Real Data
- [x] 16 Recent Activity — Real Data
- [x] 17 Analytics Charts — Real Data

---

## Decisions Made During Build

- 2026-06-09 — Homepage was built as server-rendered App Router components using local `public/` bitmap assets for the dashboard preview, jobs list, agent log, user avatar, and logo.
- 2026-06-09 — Root layout now uses Inter via `next/font/google` with the project `--font-sans` variable, matching `ui-rules.md`.
- 2026-06-09 — Pastel hero/CTA wash and diagonal section dividers were added as token-backed CSS utilities in `app/globals.css` so components avoid raw color values.
- 2026-06-10 — Auth uses `@insforge/sdk` with the SDK SSR helpers from `@insforge/sdk/ssr`; Next.js 16 route protection is implemented in `proxy.ts` because `middleware.ts` is deprecated.
- 2026-06-10 — OAuth callback exchange runs in the browser to access InsForge's PKCE verifier, then persists the returned access/refresh tokens through `/api/auth/session` so server components and proxy can read app-domain auth cookies.
- 2026-06-10 — Google OAuth no longer sends `prompt=select_account`, reducing the chance that Google forces a passkey QR flow before returning to JobPilot.
- 2026-06-10 — Authenticated pages now expose sign out in the navbar; `/api/auth/signout` clears InsForge SSR auth cookies.
- 2026-06-10 — After Google still forced passkey verification before callback, the login flow now recommends GitHub first and labels Google as secondary.
- 2026-06-10 — Login page was restyled to match the approved split-card reference, using the new slogan "Sign in and let JobPilot find the signal."
- 2026-06-10 — The approved login reference puts Google first visually, so Google remains the first provider while GitHub stays available as the fallback if Google passkey verification blocks the callback.
- 2026-06-10 — `/api/auth/session` now verifies OAuth session tokens with InsForge before writing SSR auth cookies.
- 2026-06-10 — PostHog initialization now runs through a small root client provider, with typed client/server capture helpers limited to the four approved events.
- 2026-06-10 — PostHog auth handling identifies authenticated users on protected pages and resets identity on sign out; non-approved wizard events were removed from auth and homepage interactions.
- 2026-06-10 — PostHog env lookup prefers `NEXT_PUBLIC_POSTHOG_KEY` and falls back to `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` so the current local wizard env remains compatible.
- 2026-06-11 — Database schema created via InsForge CLI migration (20260611011257_create-schema.sql). Four tables: profiles, agent_runs, jobs, agent_logs. RLS enabled on all four with 16 policies (SELECT/INSERT/UPDATE/DELETE per table, scoped to auth.uid()). profiles.updated_at wired to system.update_updated_at() trigger. resumes storage bucket created as private. InsForge project linked as "JobPilot" (523q4wu5.us-east).
- 2026-06-10 — Profile page (Feature 05) built as UI-only with mock data. CompletionBanner (SVG ring + missing-field chips), ResumeSection (drag-drop upload zone), and ProfileForm (all five sections: Personal Info, Professional Info, Work Experience, Education, Job Preferences) wired into app/profile/page.tsx. lucide-react installed; --color-warning-light token added to globals.css.
- 2026-06-10 — Profile Save Logic (Feature 06) complete. actions/profile.ts introduces saveProfile (upsert to profiles table, is_complete flag, profile_completed PostHog event on first completion) and uploadResume (immediate upload to resumes bucket, URL persisted to profiles.resume_pdf_url). ProfileForm.tsx now pre-fills from existing profile, has isPending state and inline success/error feedback. ResumeSection.tsx uploads immediately on file selection with loading/success/error states. CompletionBanner and ResumeSection now receive real data from page.tsx server query. InsForge SDK database access uses insforge.database.from() and storage upload uses a Blob (no options arg).
- 2026-06-10 — Post-Feature 06 UI fixes: CompletionBanner now shows a green checkmark + "Profile complete" state at 100% instead of the warning state. DateInput in ProfileForm uses type="text" (free typing, original design) paired with a hidden type="date" input whose showPicker() is triggered by the Calendar icon button — this gives a native calendar picker without the double-icon and garbled-value problems caused by using type="date" directly on the visible input.
- 2026-06-12 — Feature 08 complete. app/api/resume/generate/route.ts: POST route fetches profile from DB, calls GPT-4o (json_object, temp 0.3) to generate professional summary + polished work experience bullets, renders full PDF via @react-pdf/renderer renderToBuffer() (header, summary, experience, skills, education sections), uploads buffer to InsForge Storage, stores uploadData.key (actual assigned key) in resume_pdf_url — InsForge auto-increments filenames on conflict so the requested path and actual key can differ. actions/profile.ts uploadResume fixed with same pattern (stores uploadData.key). app/api/resume/view/route.ts fixed to read resume_pdf_url from profiles table and download by that key instead of hardcoding ${userId}/resume.pdf. ResumeSection wired: handleGenerate handler, isGenerating/generateStatus/generateMessage states, router.refresh() on success. @react-pdf/renderer added to serverExternalPackages in next.config.ts. Buffer cast to Uint8Array for Blob compatibility. Buffer size guard added (< 100 bytes = error).
- 2026-06-13 — Feature 13 complete + reviewed. components/find-jobs/CompanyResearchCard.tsx: client component, three states (empty/loading/dossier), calls POST /api/agent/research with jobId, sets research state from response directly (setResearch(data.research)), then calls router.refresh() for cache coherence. Renders 9-field dossier. app/api/agent/research/route.ts: auth check, loads job + profile from DB, derives company homepage via fetch redirect follow (fallback: www.{slug}.com), creates Browserbase session + Stagehand, homepage extraction with Zod schema, sub-page links filtered to http URLs only (Stagehand a11y snapshot returns node IDs otherwise), up to 3 sub-pages (priority: about → engineering → product → blog → team → other → careers), GPT-4o synthesis (temp 0.4, max_tokens 800, json_object), saves dossier and returns it in response body, fires company_researched PostHog event. Browserbase/Stagehand always closed in finally block. Two bugs fixed post-review: (1) dossier not appearing — useState(initialResearch) only reads on mount; fixed by returning dossier from API and calling setResearch() directly. (2) sub-pages never visited — Stagehand a11y snapshot returns node IDs not URLs; fixed by filtering to http-only links. @browserbasehq/sdk, @browserbasehq/stagehand, zod installed; both packages added to serverExternalPackages in next.config.ts.
- 2026-06-13 — Feature 17 complete. Three chart components converted from hardcoded mock data to real DB-derived data. posthog-node is capture-only (no query API); chart data derived from InsForge tables instead — same source of truth, no new secrets. jobsFoundChartData(): 30-day window from agent_runs.jobs_found summed per day. matchScoreChartData(): jobs.match_score bucketed into five ranges (50-60% through 90-100%). researchChartData(): 7-day window of jobs where company_research != null, counted per day. agent_runs query updated: removed .limit(8), added .gte("completed_at", thirtyDaysAgo) so all runs in the last 30 days are fetched (activity list still takes first 8). All three chart components accept typed data prop, remove hardcoded mock, add "No data yet" empty state when all values are zero. YAxis ticks removed — auto-scaled with allowDecimals={false}. JobsFoundChart XAxis uses interval={4} to prevent label crowding over 30 days. npx tsc --noEmit passes clean.
- 2026-06-13 — Feature 16 complete. ActivityList converted from hardcoded mock to prop-driven: accepts ActivityEntry[] with dot type "run" (info blue) or "research" (success green). Empty state shown when no activities. Dashboard page fetches agent_runs (status=complete, order by completed_at desc, limit 8) in parallel with existing queries. Added "company" column to jobs select. Merged run activities ("Found N jobs for [title]") and research activities ("Researched [company]") from researched jobs, sorted by timestamp desc, sliced to 8 entries. relativeTime() helper formats timestamps: "Just now" / "N mins ago" / "N hours ago" / "Yesterday" / "N days ago" / "Mon DD".
- 2026-06-13 — Feature 15 complete. Dashboard page now fetches `match_score, company_research, found_at` from jobs table in parallel with the profile query. Four stats computed in JS: totalJobs (array length), avgMatchRate (mean of non-null match_score, rounded), companiesResearched (filter company_research != null), jobsThisWeek (filter found_at >= 7 days ago). Trend badges removed — all four stat cards now use subtitle variant since week-over-week trend requires PostHog data (Feature 17). avgMatchRate shows "—" when no scored jobs exist.
- 2026-06-13 — Feature 14 complete. app/dashboard/page.tsx rebuilt with full UI: 4 stat cards (284 Total Jobs Found, 82% Avg Match Rate, 35 Companies Researched, 28 Jobs This Week), Recent Activity list (5 entries with colored ring dots: purple/blue/green per activity type), Company Research Activity bar chart (blue, Mon-Sun), Jobs Found Over Time area chart (purple gradient, Mon-Sun), Match Score Distribution bar chart (green, 50-60% to 90-100% ranges). Recharts installed. Incomplete profile banner shown when is_complete is false. All chart components are client components in components/dashboard/.
- 2026-06-13 — Feature 12 complete. app/find-jobs/[id]/page.tsx: server component, async params (Promise<{id}>), fetches full job row from DB scoped to user_id. Sections: Back to Jobs link, Job Header card (company icon + title + match score badge + View Job Post button), 2×4 info cards grid (Salary/Location/Job Type/Date Found each with colored icon), AI Match Reasoning card (Sparkles icon), Required Skills vs Your Profile card (green CheckCircle badges for matched, purple XCircle badges for missing), Job Description card (ClipboardList icon, whitespace-pre-line), Company Research empty state (Building2 icon, disabled Research Company button — wired in Feature 13), full-width Apply Now button. JobsTable rows now navigate to /find-jobs/[id] via useRouter onClick with cursor-pointer.
- 2026-06-13 — Feature 11 complete. Pagination added to JobsTable: PAGE_SIZE=20, page state resets on any filter change, getPageNumbers() renders windowed page buttons (first, last, ±1 around current, ellipsis for gaps). Sort by Match Score (descending) added as third sort option. page.tsx limit(20) removed so all user jobs are fetched and paginated client-side.
- 2026-06-13 — Feature 10 complete. lib/utils.ts created with MATCH_THRESHOLD=70. lib/adzuna.ts: AdzunaJob type, detectCountry (regex-based, defaults to 'us'), searchJobs (category: 'it-jobs' always, where omitted if location empty). app/api/agent/find/route.ts: POST route — auth check, job_search_started PostHog, Adzuna call, agent_runs insert, per-job GPT-4o scoring (temp 0.3, max_tokens 300, json_object), jobs table insert, job_found PostHog per job, agent_runs update to 'complete'. SearchControls wired: controlled inputs, loading/error/result state, success banner shows real total + strong count.
- 2026-06-13 — Feature 09 complete. NavLinks client component (components/layout/NavLinks.tsx) added: active state = border-b-2 border-accent text-accent, icons (LayoutGrid/Search/User) before each label, h-16 links that span full header height so underline sits at bottom of header. Navbar updated to use NavLinks, removing the hardcoded nav items. SearchControls (components/find-jobs/SearchControls.tsx): JOB TITLE input with left search icon, LOCATION input, Find Jobs button (bg-accent), success banner (bg-success-lightest, Sparkles icon). JobsTable (components/find-jobs/JobsTable.tsx): filter row (search input + All Matches + Match Score dropdowns), table with COMPANY/ROLE/MATCH SCORE/SALARY EST./DATE FOUND columns, MatchScoreBar (h-1 w-20 track, fill: ≥90% bg-success, ≥75% bg-info, else bg-warning), CompanyIcon placeholder (Building2 in bg-surface-secondary rounded-lg), pagination row (Showing 1–6 of 24, Previous disabled, page buttons 1–3 + ... + 8 + Next). Score thresholds adjusted to match design: ≥90% green, ≥75% blue, <75% orange.
- 2026-06-11 — Feature 07 complete. app/api/resume/extract/route.ts: POST route, downloads resume from private InsForge storage, extracts text with pdf-parse (v1, pinned — v2 has a class-based API), calls GPT-4o (json_object mode, temp 0.1), returns structured ProfileFormData JSON. pdf-parse loaded via createRequire(import.meta.url) inside the handler to avoid Turbopack module-init interop issues. components/profile/ProfilePageClient.tsx: thin client wrapper around ResumeSection + ProfileForm, holds extractedData state and wires onExtract callback. ResumeSection gains "Extract from Resume" button (Wand2 icon, visible when hasResume, shows loading/success/error states). ProfileForm gains extractedData prop and useEffect that merges non-empty extracted values (merge strategy A: GPT-4o wins on non-empty fields, existing values survive if GPT-4o returns nothing). TagInput redesigned: tags now render below the text input instead of inside it, for readability. pdf-parse added to serverExternalPackages in next.config.ts.

---

## Notes

- 2026-06-09 — `npm run build` requires network access the first time because `next/font` fetches and self-hosts Inter during build.
- 2026-06-09 — A dev server was already running for this repo on `http://localhost:3000` during verification.
- 2026-06-10 — InsForge backend metadata confirms Google and GitHub OAuth providers are enabled. End-to-end OAuth still depends on the deployment/local URL being allowed by the provider/backend redirect configuration.
- 2026-06-10 — PostHog production build verification was blocked by sandboxed Google Fonts access; `npm run lint` and `npx tsc --noEmit` passed.
