# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Profile Page
**Last completed:** 08 Resume PDF Generation from Profile
**Next:** 09 Find Jobs Page — Full UI

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

- [ ] 09 Find Jobs Page — Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

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
- 2026-06-11 — Feature 07 complete. app/api/resume/extract/route.ts: POST route, downloads resume from private InsForge storage, extracts text with pdf-parse (v1, pinned — v2 has a class-based API), calls GPT-4o (json_object mode, temp 0.1), returns structured ProfileFormData JSON. pdf-parse loaded via createRequire(import.meta.url) inside the handler to avoid Turbopack module-init interop issues. components/profile/ProfilePageClient.tsx: thin client wrapper around ResumeSection + ProfileForm, holds extractedData state and wires onExtract callback. ResumeSection gains "Extract from Resume" button (Wand2 icon, visible when hasResume, shows loading/success/error states). ProfileForm gains extractedData prop and useEffect that merges non-empty extracted values (merge strategy A: GPT-4o wins on non-empty fields, existing values survive if GPT-4o returns nothing). TagInput redesigned: tags now render below the text input instead of inside it, for readability. pdf-parse added to serverExternalPackages in next.config.ts.

---

## Notes

- 2026-06-09 — `npm run build` requires network access the first time because `next/font` fetches and self-hosts Inter during build.
- 2026-06-09 — A dev server was already running for this repo on `http://localhost:3000` during verification.
- 2026-06-10 — InsForge backend metadata confirms Google and GitHub OAuth providers are enabled. End-to-end OAuth still depends on the deployment/local URL being allowed by the provider/backend redirect configuration.
- 2026-06-10 — PostHog production build verification was blocked by sandboxed Google Fonts access; `npm run lint` and `npx tsc --noEmit` passed.
