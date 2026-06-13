# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Navbar

File: components/layout/Navbar.tsx
Last updated: 2026-06-10

| Property         | Class                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------- |
| Background       | `bg-surface`                                                                            |
| Border           | `border-b border-border`                                                                |
| Border radius    | `rounded-md` for primary CTA                                                            |
| Text — primary   | `text-text-slate`, `text-accent-foreground`                                             |
| Text — secondary | none                                                                                    |
| Spacing          | `h-16`, `px-4 sm:px-6`, `gap-12`, CTA `px-4 py-2 sm:px-6`                               |
| Hover state      | `hover:text-accent`, `hover:bg-overlay`                                                 |
| Shadow           | `shadow-card` on primary CTA                                                            |
| Accent usage     | `hover:text-accent`; brand mark comes from `public/logo.png`                            |

**Pattern notes:**
Homepage navigation uses a white full-width bar, centered `page-shell`, token text colors, and a dark overlay CTA. Future nav bars should keep active/accent treatment to text color only.

### Footer

File: components/layout/Footer.tsx
Last updated: 2026-06-10

| Property         | Class                                                  |
| ---------------- | ------------------------------------------------------ |
| Background       | `bg-surface`                                           |
| Border           | `border-t border-border`                               |
| Border radius    | none                                                   |
| Text — primary   | `text-text-slate`                                      |
| Text — secondary | none                                                   |
| Spacing          | `px-6 py-12 lg:px-12`, `gap-8`, link gap `gap-4 sm:gap-10` |
| Hover state      | `hover:text-accent`                                    |
| Shadow           | none                                                   |
| Accent usage     | `hover:text-accent`; brand mark comes from `public/logo.png` |

**Pattern notes:**
Footer mirrors the navbar brand scale and white surface, with simple text links and no decorative background.

### Hero CTA Section

File: components/homepage/Hero.tsx, components/homepage/BottomCta.tsx
Last updated: 2026-06-09

| Property         | Class                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| Background       | `soft-wash`                                                                                            |
| Border           | `border-b border-border`                                                                               |
| Border radius    | CTA buttons use `rounded-md`                                                                            |
| Text — primary   | `text-text-black`                                                                                       |
| Text — secondary | `text-text-slate-medium`, `text-text-slate`                                                             |
| Spacing          | `px-6 py-20 sm:py-28 lg:px-12`, bottom CTA `px-6 py-24 lg:px-12`, button row `mt-8 gap-4`              |
| Hover state      | Primary `hover:bg-overlay`, secondary `hover:bg-surface`                                               |
| Shadow           | `shadow-card` on CTAs                                                                                  |
| Accent usage     | Pastel wash is defined in `soft-wash` using `--color-accent-muted`, `--color-accent-light`, `--color-info-lightest` |

**Pattern notes:**
Hero-style CTA sections use large centered type, token-backed pastel wash, dark primary button, translucent white secondary button, and no card wrapper.

### Dashboard Preview

File: components/homepage/DashboardPreview.tsx
Last updated: 2026-06-09

| Property         | Class                         |
| ---------------- | ----------------------------- |
| Background       | `bg-surface-tertiary`          |
| Border           | `border-b border-border`       |
| Border radius    | `rounded-xl`                   |
| Text — primary   | none                           |
| Text — secondary | none                           |
| Spacing          | `px-6 py-16 sm:py-20 lg:px-12` |
| Hover state      | none                           |
| Shadow           | none                           |
| Accent usage     | preview image carries accent UI |

**Pattern notes:**
Large product previews sit on a muted band with the bitmap clipped by `rounded-xl`; keep the image itself as the detailed visual rather than rebuilding it in markup.

### Feature Showcase

File: components/homepage/FeatureShowcase.tsx
Last updated: 2026-06-09

| Property         | Class                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------- |
| Background       | `bg-surface`, media panels `bg-surface-muted`                                                |
| Border           | `border-b border-border`, `lg:border-r`, `lg:border-l`, active `border-l-2 border-l-accent` / `border-l-success` |
| Border radius    | media images use `rounded-xl`                                                                |
| Text — primary   | `text-text-slate`                                                                            |
| Text — secondary | `text-text-slate-medium`                                                                     |
| Spacing          | section headings `px-8 py-16 sm:px-14 lg:px-18`, items `px-8 py-9 sm:px-14 lg:px-18`        |
| Hover state      | none                                                                                         |
| Shadow           | none                                                                                         |
| Accent usage     | active feature left rail uses `border-l-accent`; matching feature uses `border-l-success`    |

**Pattern notes:**
Feature bands use strict grid lines, large editorial headings, muted media halves, and a thin active rail to indicate the highlighted feature.

### Testimonial

File: components/homepage/Testimonial.tsx
Last updated: 2026-06-09

| Property         | Class                                      |
| ---------------- | ------------------------------------------ |
| Background       | `bg-surface`                               |
| Border           | `border-b border-border`                   |
| Border radius    | avatar `rounded-md`                        |
| Text — primary   | `text-text-slate`, `text-text-black`       |
| Text — secondary | `text-text-secondary`                      |
| Spacing          | `px-6 py-24 lg:px-12`, author row `mt-8 gap-4` |
| Hover state      | none                                       |
| Shadow           | none                                       |
| Accent usage     | eyebrow `text-accent`                      |

**Pattern notes:**
Testimonials are centered, spacious, and text-led with a small accent eyebrow and compact author identity.

### Diagonal Divider

File: app/globals.css
Last updated: 2026-06-09

| Property         | Class                                      |
| ---------------- | ------------------------------------------ |
| Background       | `diagonal-divider`                         |
| Border           | paired with `border-b border-border`       |
| Border radius    | none                                       |
| Text — primary   | none                                       |
| Text — secondary | none                                       |
| Spacing          | `min-height: 88px` in utility              |
| Hover state      | none                                       |
| Shadow           | none                                       |
| Accent usage     | none                                       |

**Pattern notes:**
Use diagonal dividers between major landing-page sections to match the provided design; colors are sourced from surface tokens inside `globals.css`.

### Login Screen

File: app/(auth)/login/page.tsx, components/auth/OAuthButtons.tsx
Last updated: 2026-06-10

| Property         | Class                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| Background       | `bg-background`, split card `bg-surface`, left panel `soft-wash`                                       |
| Border           | card `border border-border`, split divider `border-b border-border lg:border-r`                        |
| Border radius    | card `rounded-xl`, provider buttons `rounded-md`, security badge `rounded-full`                        |
| Text — primary   | slogan `text-5xl sm:text-6xl font-semibold leading-none text-text-slate`, form title `text-3xl font-semibold leading-9 text-text-primary`, provider buttons `text-sm font-medium text-text-primary` |
| Text — secondary | eyebrow/body `text-base font-normal leading-6 text-text-secondary`, support text `text-xs font-normal leading-5 text-text-secondary`, disabled `text-text-muted`, errors `text-error` |
| Spacing          | page `px-6 py-14 lg:px-12`, panels `px-8 py-10 sm:px-11 sm:py-14`, buttons `min-h-12 px-4`, stack `gap-3` |
| Hover state      | provider buttons `hover:bg-surface-secondary`                                                          |
| Shadow           | `shadow-card`                                                                                          |
| Accent usage     | security badge mark `text-accent`, Google icon `text-accent`, GitHub icon `text-text-primary`          |

**Pattern notes:**
Login uses a centered split-card composition matching the reference design: soft-wash slogan panel on the left, compact provider form on the right, actual provider icons in the buttons, and only a tiny Google passkey fallback note below the buttons. The approved reference puts Google first visually, so keep Google first and preserve GitHub as the fallback path when Google passkey verification blocks the callback.

### OAuth Callback Card

File: components/auth/OAuthCallback.tsx
Last updated: 2026-06-10

| Property         | Class                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------- |
| Background       | `bg-background`, card `bg-surface`                                                     |
| Border           | `border border-border`                                                                 |
| Border radius    | `rounded-xl`, retry button `rounded-md`                                                |
| Text — primary   | `text-text-primary`, retry `text-accent-foreground`                                    |
| Text — secondary | `text-text-secondary`                                                                  |
| Spacing          | page `px-6 py-12`, card `p-8`, retry `mt-5 min-h-10 px-4`                              |
| Hover state      | retry `hover:bg-accent-dark`                                                           |
| Shadow           | `shadow-card`                                                                          |
| Accent usage     | retry button `bg-accent`                                                               |

**Pattern notes:**
Callback status UI should stay quiet and brief, with one clear recovery action on failure.

### Sign Out Button

File: components/auth/SignOutButton.tsx
Last updated: 2026-06-10

| Property         | Class                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Background       | `bg-surface`                                                            |
| Border           | `border border-border`                                                  |
| Border radius    | `rounded-md`                                                            |
| Text — primary   | `text-text-primary`                                                     |
| Text — secondary | disabled `text-text-muted`                                              |
| Spacing          | `px-4 py-2 sm:px-6`                                                     |
| Hover state      | `hover:bg-surface-secondary`                                            |
| Shadow           | none                                                                    |
| Accent usage     | none                                                                    |

**Pattern notes:**
Authenticated navbar actions use a restrained secondary button for sign-out, reserving dark filled CTAs for unauthenticated acquisition actions.

### PostHog Provider

File: components/analytics/PostHogProvider.tsx
Last updated: 2026-06-10

| Property         | Class |
| ---------------- | ----- |
| Background       | none  |
| Border           | none  |
| Border radius    | none  |
| Text — primary   | none  |
| Text — secondary | none  |
| Spacing          | none  |
| Hover state      | none  |
| Shadow           | none  |
| Accent usage     | none  |

**Pattern notes:**
This provider is a non-visual client boundary mounted from the root layout. It initializes PostHog only and must not add DOM wrappers or visual styling.

### Completion Banner

File: components/profile/CompletionBanner.tsx
Last updated: 2026-06-10

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `bg-surface`                                                          |
| Border           | `border border-border`                                                |
| Border radius    | `rounded-2xl`                                                         |
| Text — primary   | `text-text-primary` (heading, percentage)                             |
| Text — secondary | `text-text-secondary` (body copy)                                     |
| Spacing          | `p-6`, ring container `h-24 w-24`                                     |
| Hover state      | none                                                                  |
| Shadow           | `shadow-card`                                                         |
| Accent usage     | SVG ring and missing-field chips use `--color-warning` / `bg-warning-light text-warning` |

**Pattern notes:**
SVG ring uses stroke-dasharray/stroke-dashoffset with `rotate(-90 50 50)` transform to start fill from top. Track uses `--color-border`; fill uses `--color-warning`. Percentage text is absolutely centred over the SVG. Missing-field chips use `bg-warning-light text-warning uppercase tracking-wide` pill style.

### Resume Section

File: components/profile/ResumeSection.tsx
Last updated: 2026-06-10

| Property         | Class                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| Background       | `bg-surface`, drop zone `bg-surface-secondary`                           |
| Border           | `border border-border`, drop zone `border-2 border-dashed border-border` |
| Border radius    | card `rounded-2xl`, drop zone `rounded-xl`, button `rounded-md`          |
| Text — primary   | `text-text-primary`                                                      |
| Text — secondary | `text-text-secondary`, `text-text-muted`                                 |
| Spacing          | card `p-6`, drop zone `px-6 py-10`                                       |
| Hover state      | drag-active `border-accent bg-accent-muted`, button `hover:bg-surface-secondary` |
| Shadow           | `shadow-card`                                                            |
| Accent usage     | drag-active state `border-accent bg-accent-muted`; Generate button `bg-success hover:bg-success-dark` |

**Pattern notes:**
Drop zone is a click-through wrapper that also handles drag events; the hidden `<input type="file">` is triggered programmatically. The Generate Resume button uses `bg-success` (green) to distinguish it as an AI generation action from the purple Save Profile primary action. Upload status feedback uses `text-success-foreground` for success and `text-error` for errors, rendered as `text-sm` below the drop zone. During upload, the zone shows "Uploading…" and the Select Resume button is disabled with `disabled:opacity-50`.

### Profile Form

File: components/profile/ProfileForm.tsx
Last updated: 2026-06-10

| Property         | Class                                                                        |
| ---------------- | ---------------------------------------------------------------------------- |
| Background       | `bg-surface`                                                                 |
| Border           | `border border-border`                                                       |
| Border radius    | card `rounded-2xl`, inputs/selects/buttons `rounded-md`, tags `rounded-full` |
| Text — primary   | `text-text-primary`                                                          |
| Text — secondary | `text-text-secondary`                                                        |
| Spacing          | card `p-6`, section gaps `mt-8`, field grid `gap-x-6 gap-y-4`               |
| Hover state      | Add/secondary buttons `hover:bg-surface-secondary`, accent link `hover:text-accent-dark` |
| Shadow           | `shadow-card`                                                                |
| Accent usage     | Focus rings `focus:ring-accent focus:border-accent`; Save button `bg-accent hover:bg-accent-dark`; "+ Add role" link `text-accent`; checkbox `accent-accent` |

**Pattern notes:**
Section headers use a `border-b border-border pb-3` separator pattern with `text-sm font-semibold text-text-primary`. Field labels are `text-xs font-medium uppercase tracking-wide text-text-secondary`. The TagInput component renders existing tags as `bg-surface-secondary rounded-full` pills inside a bordered container that looks like an input. Disabled inputs (email, end-date when currently-working is checked) use `disabled:bg-surface-secondary disabled:text-text-muted`. Select elements use `appearance-none` with a `ChevronDown` icon absolutely positioned on the right. Submit button uses `disabled:opacity-60 disabled:cursor-not-allowed` during pending state. Inline feedback messages below the button use `text-success-foreground` for success and `text-error` for errors.

### NavLinks (Active State)

File: components/layout/NavLinks.tsx
Last updated: 2026-06-13

| Property         | Class                                                                      |
| ---------------- | -------------------------------------------------------------------------- |
| Background       | none (transparent)                                                         |
| Border           | active `border-b-2 border-accent`, inactive `border-transparent`          |
| Border radius    | none                                                                       |
| Text — primary   | active `text-accent`, inactive `text-text-dark`                           |
| Text — secondary | none                                                                       |
| Spacing          | `h-16 px-4 gap-1.5` per link                                              |
| Hover state      | `hover:text-accent`                                                        |
| Shadow           | none                                                                       |
| Accent usage     | active link `text-accent border-accent`; icons 14px (`h-3.5 w-3.5`)      |

**Pattern notes:**
Links are `h-16` (matches header height) so `border-b-2` on active sits exactly at the header bottom, creating an underline-tab effect aligned with `border-b border-border` on the header. Each nav item has a leading icon: LayoutGrid (Dashboard), Search (Find Jobs), User (Profile). Uses `usePathname()` — must be a client component.

### Search Controls Card

File: components/find-jobs/SearchControls.tsx
Last updated: 2026-06-13

| Property         | Class                                                                        |
| ---------------- | ---------------------------------------------------------------------------- |
| Background       | `bg-surface`                                                                 |
| Border           | `border border-border`                                                       |
| Border radius    | card `rounded-2xl`, inputs/button `rounded-md`, banner `rounded-lg`         |
| Text — primary   | `text-text-primary`                                                          |
| Text — secondary | labels `text-text-secondary`, placeholder `text-text-muted`                 |
| Spacing          | card `p-6`, input row `gap-4`, banner `mt-4 px-4 py-2.5`                   |
| Hover state      | button `hover:bg-accent-dark`                                                |
| Shadow           | `shadow-card`                                                                |
| Accent usage     | Find Jobs button `bg-accent text-accent-foreground`; success banner `bg-success-lightest text-success-foreground` |

**Pattern notes:**
Two labeled inputs (JOB TITLE with leading Search icon, LOCATION) flex side-by-side with `flex-1`, button is `shrink-0`. Success banner sits below the input row with `bg-success-lightest`, Sparkles icon, and bold number spans. Labels use `text-xs font-medium uppercase tracking-wide text-text-secondary`.

### Jobs Table

File: components/find-jobs/JobsTable.tsx
Last updated: 2026-06-13

| Property         | Class                                                                        |
| ---------------- | ---------------------------------------------------------------------------- |
| Background       | `bg-surface`                                                                 |
| Border           | `border border-border`, rows `border-b border-border`                       |
| Border radius    | `rounded-2xl`                                                                |
| Text — primary   | `text-text-primary` (14px), headers `text-text-secondary text-xs uppercase` |
| Text — secondary | date `text-text-muted`                                                       |
| Spacing          | filter row `px-6 py-4`, table cells `px-6 py-4`, pagination `px-6 py-4`    |
| Hover state      | rows `hover:bg-surface-secondary`, filter/sort buttons `hover:bg-surface-secondary` |
| Shadow           | `shadow-card`                                                                |
| Accent usage     | active page button `bg-accent text-accent-foreground`; score bar fill color by score |

**Pattern notes:**
Filter row has a search input (flex-1) and two styled `<button>` dropdowns with ChevronDown icons right-aligned. Table uses `<table>` with no alternating row colors. MatchScoreBar: fixed `h-1 w-20` track (`bg-border-light`), fill width is `score%`, color thresholds: ≥90% `bg-success`, ≥75% `bg-info`, <75% `bg-warning`. CompanyIcon: `h-8 w-8 rounded-lg bg-surface-secondary` with Building2 icon. Pagination: left side "Showing X to Y of Z results" with bold spans; right side Previous (disabled on page 1) + page numbers + ellipsis + Next. Rows are `cursor-pointer` with `onClick={() => router.push('/find-jobs/${job.id}')}`.

---

### Job Details Page

File: app/find-jobs/[id]/page.tsx
Last updated: 2026-06-13

| Property         | Class                                                                        |
| ---------------- | ---------------------------------------------------------------------------- |
| Background       | `bg-background` (page), `bg-surface` (cards)                                |
| Border           | `border border-border`, cards `rounded-2xl`                                 |
| Border radius    | cards `rounded-2xl`, icon containers `rounded-xl` (header 48px) / `rounded-lg` (info 36px) |
| Text — primary   | `text-text-primary` (title, values), `text-text-secondary` (labels, company name) |
| Text — secondary | `text-text-muted` (timestamps, "gap label" subsection, empty state body)    |
| Spacing          | page `px-6 py-8 lg:px-12`, sections `gap-6`, content cards `p-6`, info cards `p-4`, back link `mb-0 mt-0` (inline-flex before `mt-6` div) |
| Hover state      | View Job Post `hover:bg-surface-secondary`; Apply Now `hover:bg-accent-dark`; inline text links `hover:text-accent-dark` |
| Shadow           | `shadow-card` on all cards including info cards                             |
| Accent usage     | Score badge ≥70 `bg-success-lightest text-success-foreground`, <70 `bg-warning-light text-warning`; Apply Now `bg-accent text-accent-foreground rounded-xl`; disabled Research button `bg-accent opacity-60 cursor-not-allowed`; matched skill `bg-success-lightest text-success-foreground`; gap skill `bg-accent-muted text-accent`; inline accent link `text-accent hover:text-accent-dark` |

**Pattern notes:**
Server component, `params: Promise<{ id: string }>` awaited (Next.js 16). Score badge is inline after `·` separator with `rounded-full px-2.5 py-0.5 text-xs font-medium`. Info cards: `grid grid-cols-2 sm:grid-cols-4 gap-4`, each has `h-9 w-9 rounded-lg` icon container with bg matching semantic color (salary→`bg-success-lightest`, location→`bg-info-lightest`, type/date→`bg-surface-secondary`) and stacked `text-xs uppercase tracking-wide text-text-secondary` label + `text-sm font-medium text-text-primary truncate` value. Section header pattern: `text-xs font-medium uppercase tracking-wide text-text-secondary` with icon `h-4 w-4 text-text-muted` (or `text-success` for AI sections). Skill badges always have a leading 3×3 icon (CheckCircle green / XCircle accent). Adzuna job descriptions are API-truncated snippets — render full snippet as `text-sm leading-6 text-text-primary`, follow with `text-sm font-medium text-accent` inline link "Read full description" + ExternalLink `h-3.5 w-3.5`. Apply Now is full-width `block w-full rounded-xl py-4 text-center`, only rendered when URL is present. Empty state pattern: center-column `py-12`, large muted icon `h-10 w-10`, `text-sm font-medium text-text-primary` heading, `text-sm text-text-muted max-w-xs` body. Company Research card is `<CompanyResearchCard>` client component — see entry below.

---

### Company Research Card

File: components/find-jobs/CompanyResearchCard.tsx
Last updated: 2026-06-13

| Property         | Class                                                                        |
| ---------------- | ---------------------------------------------------------------------------- |
| Background       | `bg-surface` (card shell), `bg-surface-secondary` (overview inset), `bg-success-lightest` (Your Edge), `bg-warning-light` (Areas to Address) |
| Border           | `border border-border` (card), `border-t border-border` (sources divider)   |
| Border radius    | card `rounded-2xl`, inset sections `rounded-xl`                             |
| Text — primary   | `text-text-primary`                                                          |
| Text — secondary | `text-text-secondary` (bullet lists, overview), `text-text-muted` (section labels, sources) |
| Spacing          | card `p-6`, inset sections `p-4`, section gap `gap-5`, bullet gap `gap-1.5` |
| Hover state      | Research button `hover:bg-accent-dark`, source links `hover:text-text-secondary` |
| Shadow           | `shadow-card`                                                                |
| Accent usage     | Research button `bg-accent text-accent-foreground`; Researched badge `bg-success-lightest text-success-foreground`; Tech Stack chips `bg-accent-muted text-accent`; loading spinner `text-accent`; Your Edge section `bg-success-lightest text-success-foreground`; Areas to Address `bg-warning-light text-warning` |

**Pattern notes:**
Client component (`"use client"`). Three states: empty (Building2 icon + description), loading (Loader2 `animate-spin` + progress text), dossier (9-section layout). "Research Company" button shows `Loader2 animate-spin` + "Researching…" while in flight, then calls `router.refresh()` on success so the server component re-fetches and re-passes `initialResearch`. "Researched" badge appears in the header when dossier is present. Section labels always `text-xs font-medium uppercase tracking-wide text-text-muted`. Bullet list items: `flex items-start gap-2`, bullet dot `mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full`. Tech Stack chips match skill badge pattern: `rounded-full px-2.5 py-1 text-xs font-medium`. Sources rendered as `<a>` links with ExternalLink `h-3 w-3` icon, below a `border-t border-border pt-4` divider. `CompanyResearch` type exported from this file and imported in the API route and job details page.

---

### Dashboard — Stat Card

File: components/dashboard/StatCard.tsx
Last updated: 2026-06-13

| Property         | Class                                                                        |
| ---------------- | ---------------------------------------------------------------------------- |
| Background       | `bg-surface`                                                                 |
| Border           | `border border-border`                                                       |
| Border radius    | `rounded-2xl`                                                                |
| Text — primary   | value `text-[30px] font-semibold leading-9 text-text-primary`               |
| Text — secondary | label `text-sm font-normal leading-5 text-text-secondary`, subtitle `text-xs text-text-muted` |
| Spacing          | `p-5`, trend row `mt-2 gap-1.5`                                             |
| Hover state      | none                                                                         |
| Shadow           | `shadow-card`                                                                |
| Accent usage     | trend badge `bg-success-lightest text-success-darker rounded-sm px-2 py-0.5` |

**Pattern notes:**
Four-column grid on desktop (`grid-cols-4`), two-column on mobile. Two display variants: `trendBadge` + `trendText` (renders green rounded-sm badge + muted text inline), or `subtitle` (renders muted text below value). Trend badge uses `rounded-sm` (not pill). Stat value font size is `text-[30px]` — use this exact value, not a named Tailwind class.

---

### Dashboard — Activity List

File: components/dashboard/ActivityList.tsx
Last updated: 2026-06-13

| Property         | Class                                                                        |
| ---------------- | ---------------------------------------------------------------------------- |
| Background       | `bg-surface`                                                                 |
| Border           | `border border-border`                                                       |
| Border radius    | `rounded-2xl`                                                                |
| Text — primary   | `text-sm font-medium leading-5 text-text-primary`                           |
| Text — secondary | timestamp `text-xs text-text-muted`                                         |
| Spacing          | `p-6`, list `mt-5 space-y-5`, item `gap-3`                                 |
| Hover state      | none                                                                         |
| Shadow           | `shadow-card`                                                                |
| Accent usage     | dots use inline `style` with token hex values (no Tailwind — dynamic colors) |

**Pattern notes:**
`h-full` so card stretches to match the adjacent chart height. Activity dot: outer `h-4 w-4 rounded-full` with `style={{ background: outerBg }}`, inner `h-2 w-2 rounded-full` centered via flex. Three dot types — agent (purple: outer `#F3E8FF`, inner `#7C5CFC`), research (blue: outer `#DBEAFE`, inner `#61A8FF`), job (green: outer `#D0FAE5`, inner `#00BC7D`). Dots use inline styles (not Tailwind) because the colors are dynamic and Tailwind can't purge dynamic class names safely.

---

### Dashboard — Charts (CompanyResearchChart, JobsFoundChart, MatchScoreChart)

Files: components/dashboard/CompanyResearchChart.tsx, components/dashboard/JobsFoundChart.tsx, components/dashboard/MatchScoreChart.tsx
Last updated: 2026-06-13

| Property         | Class                                                                        |
| ---------------- | ---------------------------------------------------------------------------- |
| Background       | `bg-surface`                                                                 |
| Border           | `border border-border`                                                       |
| Border radius    | `rounded-2xl`                                                                |
| Text — primary   | heading `text-base font-semibold leading-6 text-text-primary`               |
| Text — secondary | none                                                                         |
| Spacing          | `p-6`, chart wrapper `mt-4`                                                 |
| Hover state      | none                                                                         |
| Shadow           | `shadow-card`                                                                |
| Accent usage     | chart colors via recharts `fill`/`stroke` props (hex, not Tailwind)         |

**Pattern notes:**
All three are `"use client"` recharts components. `ResponsiveContainer width="100%"` wraps each chart. Grid: `CartesianGrid strokeDasharray="4 4" stroke="#E7EAF3" vertical={false}` (horizontal dashes only). Axes: `axisLine={false} tickLine={false}`, tick `fill: "#9CA3AF" fontSize: 12`. Bar charts use `radius={[4, 4, 0, 0]}` for rounded top corners. Area chart uses `<defs><linearGradient>` for gradient fill. Chart colors: CompanyResearch bars `#61A8FF`, JobsFound line `#7C5CFC` with gradient fill `rgba(124,92,252,0.2)→0`, MatchScore bars `#10B981`. Y-axis margins use `left: -20` to tighten label spacing. Chart heights: CompanyResearch `220`, JobsFound/MatchScore `240`.
