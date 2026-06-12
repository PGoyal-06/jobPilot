# Memory — Feature 08: Resume PDF Generation from Profile

Last updated: 2026-06-12

## What was built

- `app/api/resume/generate/route.ts` — POST route: auth → fetch profile from DB → GPT-4o (json_object, temp 0.3) generates `{ summary, workExperience[].bullets }` → `@react-pdf/renderer` `renderToBuffer()` produces a 5-section PDF (header, summary, experience, skills, education) → upload buffer to InsForge Storage → store `uploadData.key` in `resume_pdf_url` → return `{ success: true }`
- `components/profile/ResumeSection.tsx` — wired "Generate Resume from Profile" button: `handleGenerate`, `isGenerating`/`generateStatus`/`generateMessage` states, `router.refresh()` on success, `useRouter` import added
- `app/api/resume/view/route.ts` — fixed to read `resume_pdf_url` from profiles table and download by that key (instead of hardcoding `${user.id}/resume.pdf`)
- `actions/profile.ts` → `uploadResume` — fixed to store `uploadData.key` instead of the requested `storagePath`
- `next.config.ts` — added `"@react-pdf/renderer"` to `serverExternalPackages`
- `@react-pdf/renderer` installed

## Decisions made

- **InsForge storage does not overwrite files** — when a file already exists at a path, InsForge auto-increments the filename (`resume.pdf` → `resume (10).pdf`). The `upload()` call succeeds with `error: null` but `uploadData.key` differs from the requested path. Fix: always store `uploadData.key` (the actual assigned key) in `resume_pdf_url`, never the requested path.
- **View route reads key from DB** — `app/api/resume/view/route.ts` queries `profiles.resume_pdf_url` and passes that to `storage.download()`. This keeps view and generate in sync regardless of what key InsForge assigns.
- **Same fix applied to `uploadResume`** — the `uploadResume` server action had the identical bug; fixed in the same session.
- **`@react-pdf/renderer` uses direct named import** — no `createRequire` hack needed (unlike `pdf-parse`). It's an ESM package with React as a peerDep; elements are built with `React.createElement` and passed to `renderToBuffer`.
- **Buffer size guard** — if `renderToBuffer` returns fewer than 100 bytes, the route returns a 500 before attempting upload.
- **`@google/generative-ai` is installed but unused** — installed during a Gemini detour in Feature 07. Can be removed.

## Problems solved

- **InsForge storage auto-increment bug** — upload would return `{ error: null }` with a *different* key than requested (`resume (n).pdf`). DB stored the requested path; view route used the requested path; file was at a different path → 404. Root cause confirmed by adding `console.log` of `uploadData`. Fixed by storing `uploadData.key` everywhere.
- **`remove` + `upload` pattern does not work on InsForge** — tried deleting before re-uploading (standard upsert workaround), but InsForge still auto-incremented. Abandoned in favour of using the actual assigned key.

## Current state

Phase 2 Features 01–08 fully complete. Profile page:
- Loads and pre-fills from DB on every visit
- Saves all fields on submit with success/error feedback
- Uploads resume on file selection; stores actual storage key in DB
- Shows filename + "View resume" link after upload
- "Extract from Resume" calls GPT-4o, populates form fields
- "Generate Resume from Profile" calls GPT-4o + react-pdf, produces a PDF, stores key in DB, shows success + "View resume" link
- "View resume" reads key from DB and serves the file — works for both uploaded and generated resumes

## Next session starts with

Feature 09 — Find Jobs Page Full UI. Read `context/build-plan.md` Feature 09 section first.

Key tasks:
- Search controls card (JOB TITLE input, LOCATION input, Find Jobs button, success banner)
- Job list section (filter bar, jobs table with COMPANY / ROLE / MATCH SCORE / SALARY / SOURCE / DATE columns)
- Match score column: color-coded progress bar + percentage
- SOURCE badge: Search vs URL variant
- Pagination row: "Showing 1 to 6 of 24 results", Previous/Next, page numbers
- All UI with mock data — no logic yet

## Open questions

- `@google/generative-ai` is installed but unused — remove if package weight is a concern.
- The debug `console.log` in `generate/route.ts` was removed; confirm the view link works end-to-end before shipping.
