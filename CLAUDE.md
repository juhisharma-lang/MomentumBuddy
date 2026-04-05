# Momentum Buddy — V2 Learner Pivot
## Claude Code Context File

This file captures the full product and technical context for the V2 build of Momentum Buddy.
Read this before touching any code. All decisions here came from a design/strategy session and
have rationale attached — do not override them without understanding why they were made.

---

## What this project is

Momentum Buddy is a learning accountability app. The core insight from user research:
**the problem is not motivation — it is re-entry after missing a session.** The guilt and
avoidance after a missed day causes multi-day dropoffs. The product is a structured restart
engine, not a habit tracker.

V1 was built around a Telegram-first nudge architecture for milestone-driven professionals.
V2 pivots to a **learner-focused** product with pre-built journey templates, PWA push
notifications, and a plant visual as the emotional centrepiece.

---

## Repo and branch

- **Repo:** https://github.com/juhisharma-lang/momentum-buddy
- **Local path:** `~/Desktop/BUILD/momentum-buddy`
- **V1 lives on:** `main` branch — DO NOT touch this until V2 is ready to ship
- **V2 lives on:** `v2-learner` branch — all new work goes here
- **Vercel:** Connected to GitHub main branch. V1 stays live at momentum-buddy.vercel.app
  until V2 branch is merged to main.

---

## Tech stack

- React + TypeScript + Vite
- shadcn/ui component library
- Tailwind CSS
- React Router DOM
- AppContext for state (localStorage, no backend yet)
- Vercel for hosting

---

## CSS / Design system

The exact shadcn/ui default theme. Do not introduce new colour variables — use what exists.

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;        /* navy — main CTA colour */
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}
.dark {
  --background: 222.2 84% 4.9%;        /* near-black navy */
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;              /* white in dark mode */
  --primary-foreground: 222.2 47.4% 11.2%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --border: 217.2 32.6% 17.5%;
}
```

Font: Inter (system default via shadcn). No custom fonts introduced in V2.

---

## What carries over from V1

- All shadcn/ui components in `src/components/ui/`
- `AppContext` pattern and state shape (see `src/contexts/AppContext.tsx`)
- `OnboardingCard` component pattern
- Dashboard layout shell
- `src/types/app.ts` type definitions (extend, do not replace)
- Routing structure in `App.tsx` — V2 pages slot in alongside V1 via the existing
  `devMode` flag pattern

Roughly 40% of V1 code is reusable. Do not delete V1 pages — they are the rollback.

---

## What is new in V2

See `PRODUCT_SPEC.md` for full detail. Summary:

1. Journey selection screen (replaces open goal entry)
2. Pre-built weekly micro-goal templates for 10 learning journeys
3. Custom time input for study block (HH:MM + quick-select chips)
4. PWA push notification permission prompt in onboarding
5. Plant visual on dashboard (3 states: growing, wilting, recovered)
6. Weekly goals checklist embedded in dashboard
7. Optional NotebookLM outline paste field in onboarding

---

## Files to create for V2

Build in this order:

```
src/data/journeys.ts          — 10 journey definitions + week templates for first 3
src/pages/JourneySelect.tsx   — Screen 1 of new onboarding
src/pages/OnboardingV3.tsx    — Full new onboarding (journey → plan → notifications)
src/components/PlantVisual.tsx — SVG plant with 3 states
src/pages/DashboardV3.tsx     — Dashboard with plant + weekly goals checklist
```

Do not modify existing V1 pages. Add V3 routes to `App.tsx` alongside V1/V2.

---

## Key decisions and why

### Why PWA push notifications instead of Telegram

Telegram was the V1 nudge channel. It was cut because:
- Users who have already dropped off will not open a second app to respond to a bot
- Context switching (app → Telegram → app) adds friction at exactly the wrong moment
- Mentor feedback confirmed this is not a stable moat

PWA push notifications send from within the app itself. One-time permission prompt during
onboarding. No second app required. Works on Android natively; on iOS requires the user to
add the app to their home screen (iOS 16.4+). This is a known constraint — handle it with
an "Add to home screen" prompt for iOS users.

**Important:** For Sunday testing, only implement the permission prompt UI. Actual
notification scheduling and service worker delivery is a separate 1-week job. Tell testers
"notifications are being configured."

### Why template-based journeys instead of open goal entry

Three options were considered:
- A: User enters their own goal freeform (V1 approach)
- B: Pre-built templates for known certifications (chosen for V2 MVP)
- C: User pastes their syllabus / NotebookLM outline (added as optional field)

Path B was chosen because:
- Structured certifications (AWS, PMP, CFA) have stable, published syllabi that map
  cleanly into weekly modules
- Users don't know how to break a 60-day cert prep into weekly goals — the template
  does this for them
- It differentiates from generic habit trackers which require the user to do all the work
- It enables the recovery mechanic to be course-aware ("you missed Security Groups —
  here's the 10-minute version")

Path C (NotebookLM paste) was added as an optional onboarding field because:
- Serious learners use NotebookLM for spaced repetition
- NotebookLM has no public API — live integration is impossible today
- But users can paste their study guide outline as text
- This text drives custom goal breakdown without needing AI in MVP
- Label the field explicitly as "Using NotebookLM? Paste your outline here"
- AI-powered parsing of this field is Phase 2

### Why the plant metaphor

The plant replaces the "recovery speed" metric card as the primary emotional element.
Rationale:
- Recovery speed as a number is not immediately meaningful to new users
- A plant that grows with consistency and wilts with missed sessions communicates the
  same concept without requiring the user to interpret a metric
- It externalises progress in a way that is sticky without being shame-based
- Three states only: growing (consistent), wilting (missed sessions), recovered (came back)
- Do not add more states — keep it simple

The plant does NOT replace the recovery speed metric. The metric still lives in the stats
row below. The plant is the emotional layer; the stats are for data-oriented users.

### Why dark mode for the dashboard

The existing dark CSS variables produce a near-black navy background that feels focused
and intentional for a learning session. The dashboard is where the user spends most of
their time — dark mode reduces eye strain and makes the plant visual more atmospheric.
Onboarding stays light mode.

### Why V1 stays live until V2 is explicitly merged

The cohort presentation used V1. Real users may be testing V1. Rebuilding on main would
break the live URL. The `v2-learner` branch approach means:
- V1 is the rollback at any point
- Vercel preview URL for the branch lets testers access V2 without affecting V1
- The merge to main is a deliberate decision, not an accident

---

## The 10 learner journeys

Full templates in `src/data/journeys.ts`. Build weeks 1–end for the first 3 on launch;
show the other 7 as "coming soon" tiles in the journey picker.

| # | Journey | Category | Timeline | Priority |
|---|---------|----------|----------|----------|
| 1 | AI/ML fundamentals → practitioner | AI/ML | 8–16 wks | Launch |
| 2 | AWS Solutions Architect (SAA-C03) | Cloud | 10–14 wks | Launch |
| 3 | Product management transition | Prod mgmt | 8–12 wks | Launch |
| 4 | Data analytics (SQL → Python → dashboards) | Data | 10–16 wks | Coming soon |
| 5 | PMP certification | Proj mgmt | 12–20 wks | Coming soon |
| 6 | UX/product design (Figma + portfolio) | Design | 10–14 wks | Coming soon |
| 7 | Cybersecurity (CompTIA Security+ / CEH) | Security | 10–16 wks | Coming soon |
| 8 | Generative AI for non-engineers | Gen AI | 4–8 wks | Coming soon |
| 9 | CFA Level 1 / financial analysis | Finance | 16–24 wks | Coming soon |
| 10 | DSA + system design (coding interviews) | Engineering | 8–16 wks | Coming soon |

Journeys 2, 5, 7, 9 have the most stable published syllabi and are easiest to template.
Journey 8 (Gen AI non-tech) is the shortest and has the highest growth signal in 2026.
Journey 3 (PM) is the founder's own user persona — use it for dogfooding.

---

## Onboarding flow — 3 screens

### Screen 1: Journey selection
- Grid of journey tiles (6 visible, "+4 more" affordance)
- Each tile: icon, name, estimated weeks
- Selected journey name carries through to all subsequent screens as context label
- Progress bar at top (step 1 of 3)

### Screen 2: Plan setup
- Context label shows selected journey name
- Card 1: Target date — Fixed date (date picker) or Flexible toggle
  - If fixed: show "N weeks from today — achievable ✓" or warning if too tight
- Card 2: Study time per day
  - HH:MM custom input (two separate number boxes, not a string field)
  - Quick-select chips below: 15m, 30m, 45m, 1h, 1h 30m
  - "+ Add a second study block" link for split-schedule learners
- Card 3: Study days — day-of-week chip selector (Mon–Sun)
- Optional Card 4: NotebookLM outline paste
  - Text area, clearly labelled "Using NotebookLM? Paste your study guide outline"
  - Helper text: "We'll use this to customise your weekly goals"
  - Fully optional — skip link visible

### Screen 3: Notifications
- Card 1: Study reminder time (HH:MM input, AM/PM selector)
- Card 2: Check-in time (HH:MM input) + helper "We'll ask: did you study today?"
- PWA notification permission prompt — inline card, not a separate modal
  - Copy: "Allow notifications — it's how this works"
  - Subtext: "No marketing. Only your learning nudges."
  - iOS users: show "Add to home screen first" if on Safari iOS
- CTA: "Start my journey →"

---

## Dashboard layout

Top: Journey name + week/day counter + days remaining
Middle: Plant SVG (centrepiece)
Below plant: Week view (7 day dots, colour-coded)
Stats row: sessions count, avg recovery days, on-pace percentage
Weekly goals card: checklist for current week's topics (from journey template)
Bottom: "Log today's session" primary CTA

Plant states:
- Growing: consistent sessions this week, green/full
- Wilting: 2+ missed sessions, grey/drooping leaves
- Recovered: missed then came back, transitional state

---

## Miss recovery screen

Triggered when user opens app after a missed session.

- Heading: "You missed yesterday." (or "You missed X days.")
- Subtext: "No guilt. Here's the smallest step back."
- Wilted plant visual
- Card showing: what topic was missed, how long it would take
- Smallest step suggestion: a 10-minute subset of the missed topic
- Plant recovery note: "Your plant recovers when you return."
- Primary CTA: "Start 10-min session now"
- Secondary CTA: "Reschedule to later today"

---

## What is explicitly out of scope for V2 MVP

- Actual push notification delivery (service worker scheduling) — prompt only
- All 10 journey templates fully built — first 3 only
- Spaced repetition logic
- AI-powered goal generation from pasted outline
- NotebookLM live API sync (Google has no public API)
- Calendar integration (Phase 2 — scheduling surface, not notification channel)
- Backend / Supabase migration (still localStorage)
- Multi-device sync
- Social / sharing features

---

## North Star Metric

Recovery speed — how fast a learner returns after a missed session. Measured in days.
Lower is better. This metric lives in the stats row on the dashboard.

The plant visualises this qualitatively. The stat quantifies it.

---

## Monetisation (context only, not in scope for V2 build)

- Phase 1–2: Free (build habit and trust)
- Phase 3: Freemium paywall when AI features land
  - India: ₹149–199/month
  - International: ~$4–5/month
- Model: B2C freemium, same playbook as Duolingo — free experience is real, not crippled

---

## Where to start

1. `git checkout v2-learner` (branch already created)
2. `npm run dev` to confirm the app runs
3. Read `src/contexts/AppContext.tsx` and `src/pages/OnboardingV2.tsx` to understand
   existing state shape before adding anything
4. Create `src/data/journeys.ts` first — everything else depends on it
5. Then build `src/pages/JourneySelect.tsx`
6. Then `src/pages/OnboardingV3.tsx`
7. Then `src/components/PlantVisual.tsx`
8. Then `src/pages/DashboardV3.tsx`
9. Wire new routes into `App.tsx` alongside existing routes
