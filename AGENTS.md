## Goal
Complete JEEIFY with AI chat via OpenRouter, guided tour onboarding, polished feature coverage, performance optimization, and bug fixes across all major pages, plus comprehensive new features (PYQ engine, pomodoro timer, backlog tracker, gamification, study heatmap, formula flashcards, etc.) based on research of JEE aspirant needs.

## Constraints & Preferences
- Follow existing design language (CSS variables, DM Sans, `rounded-[18px]`, `rounded-[40px]`, `var(--c-*)`, dark mode support)
- Build must pass with zero errors
- No secrets committed to git
- All UI must feel polished, scalable, and production-ready
- Design language never altered; no feature interference
- Always show sidebar + topbar during page transitions (no black flash)
- Internet connection monitored live — offline disrupts everything
- All new features must sync across devices via Supabase
- All new features must be added to the View Tour
- Data models (types, DB tables, sync, stores) must be consistent with existing patterns

## Progress
### Done
- AI chat API route (`/api/chat/route.ts`) switched from Google Gemini to OpenRouter API with model `nvidia/nemotron-3-ultra-550b-a55b:free`; function calling tools wrapped properly
- `AITutorPanel.tsx`: error handling for server errors, AbortError, etc.
- `DashboardTour.tsx`: 16-step multi-page tour; 4-rectangle overlay approach (no clip-path) for reliable `backdrop-filter: blur(4px)` across browsers
- OfflineOverlay: live `navigator.onLine` listener; full-screen overlay at `z-[9999]`; auto-dismiss on reconnection
- `not-found.tsx`: `SearchX` icon following design language
- Auth page: real email/password auth with Supabase; proper error handling
- `settingsStore.ts`: `syncUpsert('settings', ...)` in `update()` for cloud persistence
- Dashboard: `settings.onboarded` guard; optimized `continueChapter` with raw `for` loops; heatmap uses `logMap` lookup; `handleSavePlan` wrapped in `useCallback`
- CSS performance: `will-change` on animated utilities; `prefers-reduced-motion` disable animations; `transform: translateZ(0)` for backdrop-filter
- `PageTransition.tsx`: `mode="wait"`; composite-only animation; wrapped in `memo`
- `Sidebar.tsx` & `TopBar.tsx`: memoized with `useCallback`/`useMemo` optimizations
- `layout.tsx`: `pathname` dependency removed from auth effect
- BetaPopup: `X` button at top-right
- AI page priority analysis: groups by subject, top 2 per subject, returns top 6
- AI page: shell always renders; spinner only in content area
- **Settings "View full release notes"** changed to `releases/latest`
- **Settings tour toggle**: "Start Tour" button sets `tourCompleted = false`
- **All 12 app pages redesigned**: from `max-w-[Xpx] mx-auto` to `px-4 md:px-8 lg:px-10 pt-[17px] pb-6 overflow-x-hidden`
- **Sidebar "What's New" button**: bottom section with clock icon + controlled ChangelogPopup
- **ChangelogPopup**: `open`/`onClose` props for dual-mode (auto-show + manual)
- **Research completed**: 40+ features across 12 categories from Reddit, competitors, and industry trends
- **Types updated**: `StudySession`, `GamificationData`, `BacklogItem`, `PYQAttempt`, `Language`, `ACHIEVEMENT_DEFS` (10 achievements); `Settings` extended with `language`, `backlogReminder`
- **DB version 8**: `backlog`, `pyqAttempts`, `studySessions` tables with proper indexes + sync keys
- **Sync extended**: `ALL_TABLES`, `TABLE_KEYS`, `SUPABASE_TO_DEXIE` for new tables
- **`settingsStore.ts`**: defaults `language: 'en'`, `backlogReminder: true`
- **`gamificationStore.ts`**: streaks, XP, level, 10 achievements; `recordStudy()` with streak calculation; `checkAchievements()` evaluates all achievement types
- **`backlogStore.ts`**: backlog CRUD; `getDueItems()` for spaced repetition
- **`pyqStore.ts`**: PYQ attempt recording; `load()`, `recordAttempt()`, `toggleBookmark()`, `getByChapter()`, `getStats()`
- **`StudyTimer.tsx`**: floating pomodoro timer on all pages; focus/break modes; logs to dailyLogs + gamification store
- **`FormulaFlashcards.tsx`**: swipeable formula card UI; subject/chapter filter; tap to flip
- **`/pyq` page**: topic-wise PYQ browser; answer selection; correct/wrong feedback; bookmark toggle; stats display
- **`/backlog` page**: add backlog items by subject/chapter/type; clear/remove; filter by subject and type; "due today" badges
- **Dashboard enhanced**: gamification bar (streak, XP, level, achievements count, Flash shortcut); recent achievements showcase
- **Sidebar updated**: added `PYQs` and `Backlog` to NAV_ITEMS
- **Activity page enhanced**: full-year GitHub-style contribution grid above existing month calendar
- **Tests page enhanced**: stats cards (tests taken, avg accuracy, best score, trend); score trend bar chart
- **Settings Language toggle**: English/Hindi toggle in Preferences
- **Settings Backlog Reminder toggle**: on/off toggle in Preferences
- **DashboardTour updated**: 16 steps covering gamification, PYQ, backlog, heatmap, formula vault, test analytics

### In Progress
- (none)

### Blocked
- (none)

## Key Decisions
- OpenRouter over Gemini: user's Gemini key returned 401; OpenRouter key is valid
- 4-rectangle overlays replace clip-path evenodd — reliable `backdrop-filter` across all browsers
- Settings sync via `syncUpsert` in `update()` ensures `tourCompleted` survives sign-out/sign-in
- Priority analysis groups by subject (top 2 per subject) instead of global top 6
- Sidebar/TopBar always render in each page but memoized to prevent cascading re-renders
- AI page loads shell immediately; only content area shows spinner during auth resolution
- Page redesign: all content containers changed from `max-w` constrained to dashboard-style full-width responsive padding
- Gamification data stored as single `settings` entry (`id: 'gamification'`) following existing pattern
- Backlog, PYQ, study sessions use dedicated IndexedDB tables + Supabase sync
- XP formula: `BASE_XP_PER_LEVEL = 200`, `XP_GROWTH = 1.5`, `XP_PER_MINUTE = 2`
- Tour step count increased from 12 to 16 to cover all new features

## Next Steps
1. Setup dev server and verify all new pages render correctly
2. Test gamification streak calculation + achievement unlocks
3. Test PYQ answer recording and bookmark sync across devices
4. Test backlog add/clear/remove flow
5. Test Hindi language toggle (translations will need to be implemented in future)
6. Verify tour navigates through all 16 steps correctly
7. Consider adding study room / live collaboration features as next major feature

## Critical Context
- `OPENROUTER_API_KEY` validated and working
- OpenRouter API URL: `https://openrouter.ai/api/v1/chat/completions`
- `backdrop-filter` uses 4 separate `fixed` divs — no `clip-path` — reliable across browsers
- Tour z-indexing: click catcher `z-[199]`, overlays `z-[200]`, highlight ring `z-[200]`, popup `z-[210]`
- Offline overlay at `z-[9999]`
- DB version 8 with tables: `backlog`, `pyqAttempts`, `studySessions`
- Gamification store uses `db.settings.get('gamification')` for persistence
- 10 achievements: `first_chapter`, `ten_chapters`, `fifty_chapters`, `seven_day_streak`, `thirty_day_streak`, `hundred_pyq`, `first_test`, `ninety_plus`, `hundred_hours`, `first_revision`
- Build passes with 0 errors

## Relevant Files
- `src/app/api/chat/route.ts`: OpenRouter AI chat endpoint
- `src/components/ai/AITutorPanel.tsx`: AI chat UI
- `src/components/dashboard/DashboardTour.tsx`: 16-step tour with 4-rectangle spotlight overlays
- `src/components/OfflineOverlay.tsx`: live internet monitor
- `src/components/ai/BetaPopup.tsx`: Beta info popup with X close
- `src/components/dashboard/ChangelogPopup.tsx`: Release notes with controlled open/close
- `src/components/dashboard/StudyTimer.tsx`: Floating pomodoro timer
- `src/components/dashboard/FormulaFlashcards.tsx`: Swipeable formula cards
- `src/components/layout/Sidebar.tsx`: Nav with PYQ, Backlog, "What's New" button
- `src/components/layout/TopBar.tsx`: Header with exam countdown, memoized
- `src/components/layout/PageTransition.tsx`: `mode="wait"` composite animation
- `src/app/layout.tsx`: Root layout with sync table keys
- `src/app/dashboard/page.tsx`: Dashboard with gamification, heatmap, plan, pace
- `src/app/pyq/page.tsx`: PYQ practice browser
- `src/app/backlog/page.tsx`: Backlog tracker
- `src/app/activity/page.tsx`: Yearly contribution grid + monthly calendar
- `src/app/tests/page.tsx`: Test logging with analytics (trend chart, stats)
- `src/app/settings/page.tsx`: Release notes link, tour toggle, language toggle, backlog reminder
- `src/app/auth/page.tsx`: Real email/password auth
- `src/types/index.ts`: All types, interfaces, `ACHIEVEMENT_DEFS`
- `src/lib/db.ts`: Version 8, 3 new tables
- `src/lib/supabase-sync.ts`: ALL_TABLES extended
- `src/store/gamificationStore.ts`: Streaks, XP, level, 10 achievements
- `src/store/backlogStore.ts`: Backlog CRUD
- `src/store/pyqStore.ts`: PYQ attempts, bookmark, stats
- `src/store/settingsStore.ts`: Language, backlog reminder defaults
