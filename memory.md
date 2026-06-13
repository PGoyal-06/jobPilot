# Memory — Feature 17: Analytics Charts + Tooltips

Last updated: 2026-06-13

## What was built

**Feature 17 — Analytics Charts: Real Data**
- `components/dashboard/JobsFoundChart.tsx` — now accepts `data: {day: string; value: number}[]` prop. Removed hardcoded Mon–Sun mock. 30-day AreaChart with `interval={4}` on XAxis to prevent label crowding. Auto-scaling YAxis (`allowDecimals={false}`). Empty state ("No data yet") when all values are zero. Tooltip added.
- `components/dashboard/CompanyResearchChart.tsx` — accepts `data: {day: string; value: number}[]` prop. 7-day BarChart. Same empty state + tooltip pattern.
- `components/dashboard/MatchScoreChart.tsx` — accepts `data: {range: string; value: number}[]` prop. 5-bucket BarChart. Same empty state + tooltip pattern.
- `app/dashboard/page.tsx` — three new helper functions added: `jobsFoundChartData()` (30 days from agent_runs.jobs_found summed per day), `matchScoreChartData()` (jobs.match_score bucketed into 5 ranges), `researchChartData()` (7 days of jobs where company_research != null, counted per day). agent_runs query updated: removed `.limit(8)`, added `.gte("completed_at", thirtyDaysAgo)`. Activity list still takes the first 8 from runRows. Props passed: `<JobsFoundChart data={jobsFoundChartData(runRows)} />`, `<MatchScoreChart data={matchScoreChartData(jobRows)} />`, `<CompanyResearchChart data={researchChartData(jobRows)} />`.

**Tooltip addition (post-Feature 17)**
- All three chart components now include a `ChartTooltip` custom component rendered via recharts `<Tooltip content={<ChartTooltip />} />`.
- Tooltip shows: label (day/range) bold, "count : {value}" in muted text, styled with `bg-surface border-border shadow-card rounded-lg`.
- AreaChart uses `cursor={false}`; BarCharts use `cursor={{ fill: "#F3F4F6", opacity: 0.5 }}`.
- `TooltipProps` from recharts was unusable (TS errors) — props typed inline as `{ active?: boolean; payload?: { value: number }[]; label?: string }`.

## Decisions made

- **DB-derived chart data instead of PostHog** — `posthog-node` is capture-only with no query API. PostHog HTTP query API requires a Personal API Key not present in `.env.local` (only public project token exists). DB is the source of truth anyway — same data, no new secrets, consistent with Features 15/16.
- **agent_runs query window is 30 days** — sufficient for Jobs Found Over Time chart; activity list still uses the first 8 rows from the same fetch (no extra query).
- **Inline tooltip prop types** — recharts `TooltipProps<number, string>` does not expose `payload`/`label` in this version of the package. Typed inline to avoid TS errors.

## Problems solved

- `TooltipProps` from recharts caused TS2339 errors (`payload` and `label` do not exist on the type). Fixed by removing the import and typing the tooltip props inline.

## Current state

Phase 5 — Dashboard. **All features complete (01–17).**
- ✓ Features 01–17 complete
- `npx tsc --noEmit` passes clean
- Dashboard shows real stat counts, real activity list, real chart data from DB
- All three charts have hover tooltips
- `progress-tracker.md` updated: Phase 5 marked complete, Feature 17 logged

## Next session starts with

Phase 6 is not yet defined in the build plan. Next session should:
1. Read `context/build-plan.md` to check if a Phase 6 exists
2. If none — discuss with the user what comes next (deployment, new features, polish)

## Open questions

- `@google/generative-ai` package still installed but unused — safe to remove with `npm uninstall @google/generative-ai`
- `BROWSERBASE_API_KEY` and `BROWSERBASE_PROJECT_ID` must be in `.env.local` for Feature 13 (Company Research Agent) to work in production
