# JEE 2027 Progress Tracker — Master Plan & Build Specification

**Target exam:** JEE Main Session 1 — **22 Jan 2027**
**Today:** 28 Jun 2026 → **208 days remaining (~29.7 weeks / ~6.8 months)**
**Goal:** A multi-page, premium-feeling personal command center for JEE prep — syllabus tracking, daily/weekly/monthly roadmap, an editable weekly timetable, and a full analytics/progress dashboard.

---

## 0. Read this first — the accuracy guardrail

You asked for 100% accuracy, so here's the honest state of things:

- NTA has **not released the official JEE Main 2027 syllabus** yet. It's expected with the information brochure around **October 2026**.
- Until then, the only legitimate source to build from is the **current (2024-revised) syllabus**, which has been used for JEE Main 2025 and 2026 and is widely expected to carry over unchanged into 2027.
- Confirmed deletions from that 2024 revision: **Communication Systems** (Physics), **Linear Programming** and **Mathematical Reasoning** (Maths), **Polymers** and **Environmental Chemistry** (Chemistry).
- NCERT itself went through a "rationalization" of Class 11–12 textbooks in 2023, which renumbered/merged some chapters. Exact current chapter numbering should be cross-checked against the live NCERT PDFs at ncert.nic.in before you lock the data in.

**So the plan below does two things at once:**
1. Gives you a verified, confident **unit-level skeleton** for Physics/Chemistry/Maths (these top-level groupings are stable and well-documented).
2. Builds **a verification flag directly into the data model** (`verified: true/false`) so the website itself shows you exactly which chapters/topics still need a final NCERT/NTA cross-check — instead of me silently guessing at granular topic lists and presenting guesses as facts. This is what real 100% accuracy looks like for a syllabus that hasn't been officially re-published yet: verifiable-by-design, not confidently-asserted-from-memory.

---

## 1. Project Vision

A **multi-page web app** (not a single scrolling page) that feels like a premium SaaS analytics dashboard — think Linear, Vercel, or Notion Calendar — but purpose-built as a personal JEE command center. Four pillars:

| Pillar | Page | Core Job |
|---|---|---|
| 📚 Know it | **Syllabus** | What exists, what's deleted, what's done |
| 🗺️ Plan it | **Roadmap** | What to do today / this week / this month |
| ⏰ Schedule it | **Timetable** | When, exactly, in the day |
| 📊 See it | **Progress** | Are you actually on pace for Jan 22 2027 |

A 5th invisible pillar ties them together: a **Pacing Engine** that recalculates "topics/day needed" every time you complete something, using real days-left math — not a static plan that goes stale in week 2.

---

## 2. Site Map (Information Architecture)

```
/                      → Dashboard (home) — countdown, today's targets, quick stats
/syllabus              → Syllabus Tracker
  /syllabus/physics
  /syllabus/chemistry
  /syllabus/maths
/roadmap               → Roadmap hub (tab switcher)
  ?view=daily
  ?view=weekly
  ?view=monthly
/timetable             → Weekly editable timetable
/progress              → Analytics dashboard
/tests                 → Test/Mock score log (add-on)
/revision               → Error log + formula vault (add-on)
/settings              → Theme, data export/import, exam date, study hours config
```

Persistent UI across all pages: a **left sidebar (desktop) / bottom nav (mobile)** with the 5 main icons, plus a **sticky countdown chip** ("208 days to JEE") always visible in the top bar.

---

## 3. Page-by-Page Detailed Spec

### 3.1 Dashboard (`/`)
The "morning briefing" screen — opens app, sees everything that matters in 5 seconds.

- **Hero countdown card**: big animated number, days/hours/minutes to 22 Jan 2027, with a thin progress bar showing "% of available prep time used."
- **Today's Target card** (pulled from Roadmap engine): the 2 subjects assigned today + the 50-question drill for the most recently completed chapter, with checkboxes.
- **Quick-stat strip**: 4 small stat tiles — Physics %, Chemistry %, Maths %, Overall % (same numbers as Progress page, repeated here for visibility).
- **Streak tracker**: consecutive days you've hit your daily target (GitHub-style flame icon + number).
- **Mini consistency heatmap**: last 30 days, color-graded by hours studied (click-through to full Progress page).
- **"Continue where you left off"**: last chapter you opened in Syllabus, one tap to resume.

### 3.2 Syllabus Tracker (`/syllabus`)
This is the data backbone of the entire app.

**Layout:**
- Top-level tabs: **Physics | Chemistry | Maths**
- Each subject splits into its **divisions** (this is your "mechanics, electrical, magnetics, modern physics" idea, generalized):
  - **Physics →** Mechanics · Heat & Thermodynamics · Waves & Oscillations · Electrostatics & Current Electricity · Magnetism & EMI/AC · Optics & Modern Physics
  - **Chemistry →** Physical Chemistry · Inorganic Chemistry · Organic Chemistry
  - **Maths →** Algebra · Calculus · Coordinate & 3D Geometry · Trigonometry · Vectors · Statistics & Probability
- Inside each division: a **card grid of chapters**. Each card shows:
  - Chapter name + Class tag (11/12)
  - A small ring showing % of topics done in that chapter
  - If deleted: chapter name renders **struck-through, greyed out**, with `(Removed from JEE syllabus — 2024 revision)` in brackets right next to it, and it's excluded from all progress-% math
- **Click a chapter →** expands (accordion, not new page — keeps flow fast) to show:
  - Full topic list as checkboxes (tick = done)
  - Per-topic "deleted" sub-tag if NTA dropped a sub-topic but kept the chapter
  - A `verified ✅ / needs check ⚠️` badge per chapter, pulled straight from the data file's `verified` flag — so you always know what's locked-in vs pending your own NCERT cross-check
  - Inline buttons: "Mark all done," "Add note," "Jump to this chapter in Roadmap"
- **Search bar** at the top of the page: fuzzy-search across all 3 subjects for any chapter/topic.
- **Filter chips**: Class 11 / Class 12 / Not started / In progress / Done / High-weightage only.

### 3.3 Roadmap (`/roadmap`)
Three tabs feeding off ONE pacing engine (see §6) so they're always mathematically consistent with each other.

**Daily tab**
- Today's date, day-of-week
- **2 subjects assigned today** (engine rotates subjects so all 3 get fair coverage across the week, weighted by how far behind each one is)
- For each assigned subject: the specific chapter/topic to study today
- **50-question drill block**: auto-pulls from the *most recently completed* chapter (configurable: last chapter, or last 2 chapters mixed)
- A "Mark today done" button → feeds the streak counter on Dashboard

**Weekly tab**
- 7-day strip (Mon–Sun) showing what was assigned each day + actual completion (green check / red miss)
- "Total topics completed this week" counter vs. weekly target
- **End-of-week test trigger**: auto-suggests a chapter test covering everything completed that week, with a button → logs into `/tests`

**Monthly tab**
- Calendar-style view, current month
- Monthly target: e.g., "Finish Rotational Motion + Thermodynamics + Coordination Compounds by 31 Jul"
- Macro phase indicator (see Pacing Engine phases below): which of the 3 big phases you're currently in

### 3.4 Timetable (`/timetable`)
- **Grid: 7 columns (Mon–Sun) × hourly rows**, default span 9 AM–10/11 PM (configurable total hours/day in Settings, default target = 9–10 hrs)
- Each cell is **click-to-edit**: pick subject/activity from a dropdown (Physics / Chemistry / Maths / Break / Sleep / School-College / Revision / Mock Test / Custom), color-coded block
- **Drag to resize** a block across multiple hours
- **Templates**: "School day," "Holiday/full study day," "Test day" — one click applies a pre-built layout you can then tweak
- **Save** persists to local storage (or backend if you go with Supabase — see §7) and **auto-loads on return** — no re-entering every visit
- Small **"hours allocated vs hours studied"** comparison bar per day, pulling actual completion from Roadmap check-ins

### 3.5 Progress Analytics (`/progress`)
- **Per-subject visual graphs**: 3 cards (Physics/Chemistry/Maths), each with:
  - A radial/ring chart for % chapters complete
  - A small line graph of completion trend over time (this month)
- **Total Progress graph**: one big combined ring/bar showing overall % of syllabus done (deleted topics excluded from denominator)
- **Consistency graph**: GitHub-style heatmap calendar, daily study hours intensity, full year view, scrollable
- **Bottom stat row** (exactly as you described):
  - `Physics: XX% complete`
  - `Chemistry: XX% complete`
  - `Maths: XX% complete`
  - `Total Syllabus: XX% complete`
- **Pace indicator**: "You're X days ahead / behind schedule" — computed by comparing actual completion rate vs. the rate required to finish on time (this is the single most useful number on the whole site)
- **Test score trend** (if `/tests` has data): line graph of mock/chapter test scores over time, per subject

### 3.6 Add-on pages (the "more addons" you mentioned)

| Page | What it does |
|---|---|
| **`/tests`** | Log every chapter test / mock test: date, subject(s), score, accuracy, time taken. Auto chart of trend. |
| **`/revision`** | Two tools: (1) **Error log / mistake notebook** — log every question you got wrong with a one-line "why," tagged by chapter, so you can filter "show me every silly mistake in Electrostatics." (2) **Formula vault** — quick-reference card per chapter for last-minute revision. |
| **`/settings`** | Exam date (editable in case of date shifts), daily study-hour target, theme (dark/light), data export (download all your data as JSON backup) and import, notification/reminder toggle. |
| **Pomodoro/focus timer** | Small floating widget, usable from any page, logs studied minutes straight into Progress/Timetable. |
| **Daily motivation strip** | Small rotating quote/stat on Dashboard — purely cosmetic, keep subtle, not preachy. |

---

## 4. Data Architecture

Everything is driven by 4 JSON-shaped data structures. This is the part that matters most for "no mistakes" — get the schema right once, and content updates later (when NTA's Oct 2026 brochure drops) become a 10-minute data edit, not a rebuild.

### 4.1 `syllabus.json` — the source of truth

```json
{
  "physics": {
    "divisions": [
      {
        "id": "mechanics",
        "name": "Mechanics",
        "chapters": [
          {
            "id": "phy-laws-of-motion",
            "name": "Laws of Motion",
            "class": 11,
            "ncertRef": "Class 11 Physics — Laws of Motion",
            "weightage": "high",
            "verified": false,
            "deleted": false,
            "topics": [
              { "id": "t1", "name": "Newton's first, second, third laws", "deleted": false },
              { "id": "t2", "name": "Momentum and impulse", "deleted": false },
              { "id": "t3", "name": "Friction (static, kinetic, rolling)", "deleted": false },
              { "id": "t4", "name": "Circular motion dynamics, banking of roads", "deleted": false }
            ]
          }
        ]
      }
    ],
    "deletedChapters": [
      { "name": "Communication Systems", "reason": "Removed in 2024 NTA syllabus revision", "verified": true }
    ]
  },
  "chemistry": { "...": "same shape" },
  "maths": { "...": "same shape" }
}
```

**Confirmed unit-level skeleton to start from** (verify chapter-level granularity against NCERT before final lock):

- **Physics (20 units total):** Physics & Measurement · Kinematics · Laws of Motion · Work, Energy & Power · Rotational Motion · Gravitation · Properties of Solids & Liquids · Thermodynamics · Kinetic Theory of Gases · Oscillations & Waves · Electrostatics · Current Electricity · Magnetic Effects of Current & Magnetism · Electromagnetic Induction & AC · Electromagnetic Waves · Optics · Dual Nature of Matter & Radiation · Atoms & Nuclei · Electronic Devices · ~~Communication Systems~~ *(deleted 2024)*
- **Chemistry:** *Physical* — Basic Concepts, Atomic Structure, Chemical Bonding, States of Matter, Thermodynamics, Solutions, Equilibrium, Redox & Electrochemistry, Chemical Kinetics, Surface Chemistry. *Inorganic* — Periodicity, Hydrogen, s-Block, p-Block, d-&f-Block, Coordination Compounds, Metallurgy. *Organic* — GOC, Hydrocarbons, Haloalkanes, Alcohols/Phenols/Ethers, Aldehydes/Ketones/Carboxylic Acids, Amines, Biomolecules, Chemistry in Everyday Life, Practical Chemistry principles. ~~Polymers~~, ~~Environmental Chemistry~~ *(both deleted 2024)*
- **Maths (14 units total):** Sets & Functions · Complex Numbers & Quadratic Equations · Matrices & Determinants · Permutations & Combinations · Binomial Theorem · Sequence & Series · Limit, Continuity & Differentiability · Integral Calculus & Differential Equations · Coordinate Geometry · 3D Geometry · Vector Algebra · Statistics & Probability · Trigonometry. ~~Mathematical Reasoning~~, ~~Linear Programming~~ *(both deleted 2024)*

> **Action item before launch:** open the live NCERT Class 11/12 PDFs (Physics, Chemistry, Maths) + the most recent NTA syllabus PDF side-by-side, fill every chapter's `topics[]` array properly, set `verified: true` chapter by chapter. The site's Syllabus page should literally show you a running count of "X/Y chapters verified" so this never silently goes stale.

### 4.2 `userProgress.json`
```json
{ "phy-laws-of-motion": { "status": "done", "completedOn": "2026-07-04", "topicStatus": { "t1": true, "t2": true, "t3": true, "t4": false } } }
```

### 4.3 `timetable.json`
```json
{ "monday": { "9": "physics", "10": "physics", "11": "break", "12": "chemistry", "...": "..." } }
```

### 4.4 `tests.json`
```json
[{ "date": "2026-07-06", "subject": "physics", "chapters": ["phy-laws-of-motion"], "score": 42, "total": 50, "accuracy": 84 }]
```

---

## 5. The Pacing Engine — the "brain" of the app

This is what makes Roadmap/Timetable/Progress feel intelligent instead of static.

**Inputs:** total non-deleted topics per subject · topics already completed · today's date · exam date (22 Jan 2027) · a "freeze buffer" (last N days reserved purely for revision/mocks, default 21 days, so the real "new content" deadline is ~1 Jan 2027) · your configured daily study hours.

**Calculation, run on every app load:**

```
daysUntilFreeze   = (1 Jan 2027 - today)
remainingTopics   = totalTopics - completedTopics   (per subject)
requiredPace      = remainingTopics / daysUntilFreeze   (topics/day, per subject)
actualPace        = topics completed in last 7 days / 7
paceStatus        = actualPace >= requiredPace ? "on track" : "behind by X days"
```

**3 macro phases auto-displayed on Monthly Roadmap:**
1. **Foundation & Coverage** (now → ~mid-Nov 2026): first-pass through 100% of non-deleted syllabus, high-weightage chapters prioritized within each subject.
2. **Consolidation & Testing** (mid-Nov → ~1 Jan 2027): full revision pass two, chapter-wise tests, weak-topic remediation.
3. **Final Sprint** (1 Jan → 22 Jan 2027): zero new content, only formula sheets, full mocks, sleep discipline.

This single engine is what feeds: Dashboard's "today's targets," Roadmap's daily/weekly/monthly views, and Progress's "ahead/behind schedule" indicator. Build it once as a pure function, call it everywhere.

---

## 6. Design System — the "$10,000,000 website" brief

**Visual direction:** premium, dark-first SaaS dashboard — closer to Linear / Vercel / Arc / Raycast than a typical "study app." Calm, confident, a little bit luxe. No cartoonish ed-tech clutter.

- **Theme:** dark mode default (near-black `#0A0A0F` background, not pure black), light mode toggle available.
- **Accent:** one signature gradient — electric violet → cyan (`#7C3AED → #06B6D4`), used sparingly: progress rings, the countdown number, primary buttons, active nav state. Everything else stays neutral grey/white so the gradient actually pops.
- **Typography:** a modern geometric sans (Inter, Geist, or Satoshi) — large, confident numerals for stats (countdown, %, streak), smaller tracked-out uppercase labels for section headers.
- **Cards:** glassmorphic — subtle translucency, soft 1px border with a faint glow on hover, soft shadow, generous corner radius (16–20px).
- **Layout pattern:** bento-grid dashboard — asymmetric card sizes on the home/progress pages instead of a rigid uniform grid; one hero card, several supporting cards of varying size.
- **Motion:** Framer Motion throughout — cards fade/slide in on page load (staggered), progress rings animate filling on first view, checking off a topic triggers a satisfying micro-pop + subtle particle burst, page transitions are a soft cross-fade, not a hard cut.
- **Micro-delight:** completing a full chapter triggers a brief, tasteful confetti burst (toggleable off in Settings). Hitting a 7-day streak gets a small badge animation.
- **Navigation:** collapsible left sidebar (desktop), translucent bottom tab bar (mobile), plus a `Cmd/Ctrl+K` command palette for power-user navigation ("jump to Rotational Motion," "open today's roadmap").
- **Responsiveness:** true fluid responsive design — sidebar collapses to bottom nav under 768px, bento grid reflows to single column on mobile, timetable grid becomes a swipeable day-by-day view on small screens instead of cramming 7 columns.
- **Empty/loading states:** skeleton loaders matching final layout shape, never a blank flash.

---

## 7. Tech Stack Recommendation

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14 (App Router) + TypeScript** | File-based multi-page routing matches your "multipage, not single page" requirement exactly |
| Styling | **Tailwind CSS + shadcn/ui** | Fast, consistent, easy to make look premium |
| Animation | **Framer Motion** | Industry standard for the polish level you want |
| Charts | **Recharts** (or Tremor for dashboard-style charts) | Rings, bars, line trends, heatmaps |
| State | **Zustand** | Lightweight global state for progress/timetable data |
| Persistence — Option A (recommended to start) | **IndexedDB via Dexie.js**, local-first, with one-click JSON export/import as backup | Zero backend cost, works offline, fastest to ship, fully private |
| Persistence — Option B (upgrade later) | **Supabase** (Postgres + Auth + Realtime) | If you later want multi-device sync (phone + laptop) |
| PWA | **next-pwa** | Installable on your phone home screen, works offline — important since you'll check this daily |
| Hosting | **Vercel** (free tier is enough) | One-click deploy from GitHub, instant HTTPS |

**Recommendation:** start with Option A (local-first). You're the only user, it's free, it's fast, and it works fine offline at a coaching center with bad wifi. Move to Supabase only if you actually need the same data on two devices.

---

## 8. Build Roadmap (building the app itself)

1. **Scaffold** — Next.js + Tailwind + shadcn/ui project, dark theme tokens, sidebar/nav shell, routing for all pages (empty placeholders).
2. **Data layer** — build `syllabus.json` with the verified unit skeleton above, Dexie storage wrapper, Zustand stores for progress/timetable/tests.
3. **Syllabus page** — full UI, accordions, search, filters, verified-badge system.
4. **Pacing engine** — pure function + unit tests on the math, wire into Dashboard.
5. **Roadmap (daily/weekly/monthly)** — built on top of the pacing engine.
6. **Timetable** — editable grid + templates + persistence.
7. **Progress analytics** — charts, heatmap, pace indicator.
8. **Add-ons** — tests log, error log, formula vault, settings, export/import.
9. **Polish pass** — Framer Motion transitions, empty states, responsive QA on real mobile, PWA manifest.
10. **Data accuracy pass** — go chapter-by-chapter against live NCERT PDFs + whatever NTA publishes (Oct 2026), flipping `verified: true` as you confirm each one.

---

## 9. Master Build Prompt (copy-paste this to build it)

Use this as a single, complete brief — for me, for Claude Code, or for any AI build tool.

```
Build a multi-page personal JEE 2027 exam-prep progress tracker web app.

STACK: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui +
Framer Motion + Recharts + Zustand. Local-first persistence via Dexie.js
(IndexedDB) with one-click JSON export/import for backup. Make it an
installable PWA (next-pwa).

CONTEXT: Target exam date is 22 January 2027. Today's date should always
be read dynamically from the system clock, never hardcoded, so the
countdown and pacing math stay correct on every visit.

PAGES (true multi-page routing, not a single scrolling page):
1. / — Dashboard: animated countdown to exam date, "today's target" card
   (2 subjects + 50-question drill from most recently completed chapter,
   pulled from the pacing engine), 4 quick-stat tiles (Physics %,
   Chemistry %, Maths %, Total %), streak flame counter, 30-day mini
   consistency heatmap, "continue where you left off" shortcut.
2. /syllabus — Tabs: Physics | Chemistry | Maths. Each subject splits
   into divisions (Physics: Mechanics, Heat & Thermodynamics, Waves &
   Oscillations, Electrostatics & Current Electricity, Magnetism &
   EMI/AC, Optics & Modern Physics; Chemistry: Physical, Inorganic,
   Organic; Maths: Algebra, Calculus, Coordinate & 3D Geometry,
   Trigonometry, Vectors, Statistics & Probability). Each division shows
   a card grid of chapters with a completion ring. Deleted chapters
   render struck-through and greyed with "(Removed from JEE syllabus)"
   appended, and are EXCLUDED from all percentage math. Click a chapter
   to expand (accordion) into a topic checklist; each topic is a
   checkbox; deleted topics get a small "deleted" tag and are excluded
   from progress math. Each chapter shows a verified/needs-check badge
   driven by a `verified: boolean` field in the data — do not hide or
   fake this, surface it honestly in the UI. Include search and filter
   (class 11/12, status, weightage).
3. /roadmap — Three tabs: Daily, Weekly, Monthly, all driven by one
   shared pacing-engine function (see ENGINE below).
   - Daily: today's 2 assigned subjects + specific chapter, a 50-
     question drill block referencing the most recently completed
     chapter, mark-done button.
   - Weekly: 7-day strip of assigned vs completed, weekly totals vs
     target, an end-of-week "create chapter test" button linking to
     /tests.
   - Monthly: calendar view, monthly target description, current macro
     phase indicator (Foundation & Coverage / Consolidation & Testing /
     Final Sprint).
4. /timetable — 7-column (Mon-Sun) x hourly-row editable grid, default
   visible range 9am-11pm. Click a cell to assign an activity (Physics /
   Chemistry / Maths / Break / Sleep / School / Revision / Mock Test /
   Custom) from a colour-coded dropdown; allow drag-to-span multiple
   hours. Provide 3 quick templates (School day, Full study day, Test
   day). Persist to IndexedDB and reload automatically on return. Show a
   small "planned vs actual hours" bar per day using Roadmap check-in
   data. Must collapse to a swipeable single-day view under 768px width.
5. /progress — Per-subject card with completion ring + trend line
   (Physics, Chemistry, Maths), one combined "Total Progress" ring,
   GitHub-style yearly consistency heatmap, a "pace status" banner
   ("X days ahead/behind schedule" — computed by the pacing engine), a
   bottom row with exactly: Physics % complete / Chemistry % complete /
   Maths % complete / Total Syllabus % complete, and (if test data
   exists) a test-score trend line per subject.
6. /tests — Log form (date, subject, chapters, score, total, time
   taken) + auto-generated trend chart + simple table/list view.
7. /revision — Two tools: an error/mistake log (question, chapter tag,
   one-line reason, date) with filter-by-chapter, and a formula vault
   (one quick-reference card per chapter, markdown-renderable content).
8. /settings — Editable exam date, daily study-hour target, theme
   toggle (dark default / light), confetti on/off, data export (download
   full JSON backup) and import, notification toggle.

ENGINE (pacing.ts) — pure function, no side effects, called by Dashboard
and all 3 Roadmap tabs and Progress:
  freezeDate = examDate.minus(21 days)
  daysUntilFreeze = freezeDate - today
  remainingTopics[subject] = totalNonDeletedTopics[subject] - completedTopics[subject]
  requiredPace[subject] = remainingTopics[subject] / daysUntilFreeze
  actualPace[subject] = topics completed in trailing 7 days / 7
  paceStatus[subject] = actualPace >= requiredPace ? "on track" : behind-by-days
  currentPhase = today < freezeDate.minus(50days) ? "Foundation & Coverage"
               : today < freezeDate ? "Consolidation & Testing"
               : "Final Sprint"
Daily-target selector rotates the 2 least-progressed subjects unless the
user has manually pinned subjects for the day.

DATA MODEL — create these as typed JSON files seeded with the verified
unit-level skeleton (do NOT invent granular NCERT topic lists from
memory; leave `topics: []` with a `verified: false` flag and a TODO
comment instructing a manual NCERT cross-check chapter by chapter):

syllabus.json — subjects > divisions > chapters[{id, name, class,
ncertRef, weightage, deleted, verified, topics[{id, name, deleted}]}]
plus a deletedChapters[] list per subject.

Seed Physics with these 19 active + 1 deleted units: Physics &
Measurement, Kinematics, Laws of Motion, Work Energy & Power, Rotational
Motion, Gravitation, Properties of Solids & Liquids, Thermodynamics,
Kinetic Theory of Gases, Oscillations & Waves, Electrostatics, Current
Electricity, Magnetic Effects of Current & Magnetism, Electromagnetic
Induction & AC, Electromagnetic Waves, Optics, Dual Nature of Matter &
Radiation, Atoms & Nuclei, Electronic Devices; deleted: Communication
Systems.

Seed Chemistry — Physical: Basic Concepts, Atomic Structure, Chemical
Bonding, States of Matter, Thermodynamics, Solutions, Equilibrium, Redox
& Electrochemistry, Chemical Kinetics, Surface Chemistry. Inorganic:
Periodicity, Hydrogen, s-Block, p-Block, d-&f-Block, Coordination
Compounds, Metallurgy. Organic: GOC, Hydrocarbons, Haloalkanes,
Alcohols/Phenols/Ethers, Aldehydes/Ketones/Carboxylic Acids, Amines,
Biomolecules, Chemistry in Everyday Life, Practical Chemistry
Principles; deleted: Polymers, Environmental Chemistry.

Seed Maths with these 12 active + 2 deleted units: Sets & Functions,
Complex Numbers & Quadratic Equations, Matrices & Determinants,
Permutations & Combinations, Binomial Theorem, Sequence & Series, Limit
Continuity & Differentiability, Integral Calculus & Differential
Equations, Coordinate Geometry, 3D Geometry, Vector Algebra, Statistics
& Probability, Trigonometry; deleted: Mathematical Reasoning, Linear
Programming.

userProgress.json — chapterId -> {status, completedOn, topicStatus{}}
timetable.json — day -> hour -> activity
tests.json — array of {date, subject, chapters[], score, total, accuracy}

DESIGN SYSTEM: Dark-first (#0A0A0F base), one signature accent gradient
violet-to-cyan (#7C3AED -> #06B6D4) used sparingly on progress rings,
countdown numerals, primary CTAs, active nav. Glassmorphic cards (subtle
translucency, 1px glow border on hover, 16-20px radius). Geometric sans
typeface (Inter/Geist), oversized numerals for stats. Bento-grid
dashboard layout (asymmetric card sizes, not a uniform grid). Framer
Motion on every page transition (soft cross-fade) and on first-load card
entrance (staggered fade/slide). Animated fill on progress rings.
Tasteful confetti micro-burst on full-chapter completion (togglable).
Collapsible sidebar on desktop, translucent bottom tab bar on mobile,
Cmd/Ctrl+K command palette for navigation. Fully fluid responsive: bento
grid -> single column under 768px, timetable -> swipeable single-day
view, sidebar -> bottom nav.

NON-NEGOTIABLES:
- True multi-page routing (separate routes per the sitemap above), never
  a single-page scroll layout.
- Deleted syllabus content always visibly marked and always excluded
  from every percentage calculation.
- All dates/countdowns computed live from the system clock, never
  hardcoded.
- All user data persists across reloads (IndexedDB) with export/import.
- Every chapter/topic carries a visible verified/unverified badge so
  syllabus accuracy is auditable, not assumed.
- Fully responsive — test at 375px, 768px, 1440px.

Build it in this order: project scaffold + nav shell -> data layer ->
syllabus page -> pacing engine -> roadmap -> timetable -> progress
analytics -> add-on pages -> motion/polish pass.
```

---

## What I'd suggest as the very next step

This plan + prompt is comprehensive enough to hand to any AI builder, but since I can actually build this for you right here, I'd recommend I scaffold the real Next.js project next — starting with the data layer and Syllabus page (the foundation everything else depends on), then layering in Roadmap → Timetable → Progress.

Want me to start building it now in this chat, or do you want to tweak anything in the plan first (e.g. different color theme, different daily question count, add/remove an add-on page)?
