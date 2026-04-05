# V2 Build Order

Step-by-step instructions for Claude Code. Read CLAUDE.md and PRODUCT_SPEC.md first.

---

## Before writing any code

```bash
cd ~/Desktop/BUILD/momentum-buddy
git checkout v2-learner
npm run dev
```

Confirm the app runs at localhost:8080 (or whatever port Vite assigns).

Then read these two existing files in full before touching anything:
- `src/contexts/AppContext.tsx` — understand the full state shape
- `src/pages/OnboardingV2.tsx` — understand what the current V2 onboarding collects

Do not guess at the state shape. Read it.

---

## Step 1 — Journey data file

**Create:** `src/data/journeys.ts`

This is the foundation everything else depends on. Define the Journey type and export
the 10 journey objects. Build out full week-by-week templates for journeys 1–3 (AI/ML,
AWS, PM). Journeys 4–10 need name, icon, category, and timeline only — no week templates.

Each journey needs:
```typescript
interface Journey {
  id: string
  name: string
  subtitle: string         // e.g. "SAA-C03"
  icon: string             // emoji
  category: string
  timelineMin: number      // weeks
  timelineMax: number      // weeks
  available: boolean       // false = coming soon
  weeks: WeekTemplate[]
}

interface WeekTemplate {
  weekNumber: number
  milestone: string        // e.g. "EC2 + Networking"
  topics: TopicTemplate[]
}

interface TopicTemplate {
  id: string
  title: string
  estimatedMinutes: number
  smallestStep: string     // 10-min subset description
}
```

---

## Step 2 — Journey selection screen

**Create:** `src/pages/JourneySelect.tsx`

This is Screen 1 of the new onboarding. Do not modify `Onboarding.tsx` or `OnboardingV2.tsx`.

UI requirements:
- Heading: "What are you learning?"
- Subtext: "Pick your goal. We've mapped the path."
- Progress indicator: step 1 of 3
- Journey grid: 2 columns, 6 visible tiles
- Each tile: icon, journey name, "X–Y wks" label
- Coming soon tiles: visible but not selectable, with "Soon" badge
- "+4 more journeys" affordance below the grid if showing only 6
- Primary CTA: "Continue →" (disabled until a journey is selected)
- On select: store journey ID in local state, pass forward to onboarding

Use existing shadcn Button, Card components. Follow the existing mobile-first layout
pattern from OnboardingV2 (full height flex column, scrollable inner, fixed bottom CTA).

---

## Step 3 — Full V3 onboarding

**Create:** `src/pages/OnboardingV3.tsx`

Three-screen onboarding. Journey selection (Step 1) can be its own page or the first
screen here — your call based on how V1/V2 handled it.

**Screen 2 — Plan setup**

Uses the `OnboardingCard` pattern from V1/V2. Four cards:

Card 1 — Target date
- Toggle: Fixed date | Flexible
- If Fixed: date picker (reuse existing Calendar component from shadcn)
- Below date: calculated weeks from today with feasibility note
  - Green if 80%+ of journey's min timeline: "N weeks — achievable ✓"
  - Amber if tight: "N weeks — this will be intensive"

Card 2 — Study time per day
- Two separate number inputs for HH and MM (not a single time string)
- Quick-select chips: 15m, 30m, 45m, 1h, 1h 30m
- Selecting a chip fills the HH/MM inputs
- Typing in HH/MM clears any selected chip
- "+ Add a second study block" link — reveals a second HH:MM input row
- Why two inputs: users have specific routines (e.g. 25 min, not a round number)

Card 3 — Study days
- 7 chips: Mon Tue Wed Thu Fri Sat Sun
- Multi-select
- Weekdays pre-selected by default

Card 4 — NotebookLM outline (optional)
- Textarea, clearly optional
- Label: "Using NotebookLM? Paste your study guide outline"
- Helper text: "We'll use this to customise your weekly goals"
- Small "Skip this" link — does not block progress

**Screen 3 — Notifications**

Card 1 — Study reminder
- HH:MM input + AM/PM selector for reminder time
- Label: "When should we remind you to study?"

Card 2 — Check-in time
- HH:MM input + AM/PM selector
- Helper: "We'll ask: did you study today?"

PWA permission card
- Not a modal — inline card below the time inputs
- Icon, heading "Allow notifications", brief explanation
- CTA button: "Allow notifications"
- On click: call `Notification.requestPermission()`
- If iOS Safari (check userAgent): show "Add to home screen first for notifications"
- Subtext: "No marketing. Only your learning nudges."

Primary CTA: "Start my journey →"
- Calls `completeOnboarding()` from AppContext
- Navigates to `/dashboard-v3`

**State to collect and store:**
- selectedJourneyId: string
- targetDate: Date | null
- deadlineType: 'fixed' | 'flexible'
- studyMinutes: number (total daily minutes, combine blocks)
- studyBlocks: { hours: number, minutes: number }[] (for notification scheduling)
- studyDays: string[] (e.g. ['mon', 'tue', 'wed', 'thu', 'fri'])
- reminderTime: string (HH:MM)
- checkinTime: string (HH:MM)
- notebookLMOutline: string | null
- notificationsGranted: boolean

Extend the existing Milestone type in `src/types/app.ts` to include these fields rather
than creating a parallel type. Check what already exists before adding.

---

## Step 4 — Plant visual component

**Create:** `src/components/PlantVisual.tsx`

Props:
```typescript
interface PlantVisualProps {
  state: 'growing' | 'wilting' | 'recovered'
  sessionCount: number   // shown as subtext below plant
}
```

Three SVG states. Keep the SVG simple — basic shapes only, no complex paths.

Growing state: upright stem, two side leaves, top bud/small flower. Green tones using
CSS variables (use a green that works in both light and dark mode — `#16a34a` or similar).

Wilting state: same structure but leaves drooping downward, muted grey-green tones,
stem slightly curved. Communicates neglect without being dramatic.

Recovered state: midpoint between growing and wilting — leaves starting to lift, some
green returning. This is a transitional state shown the day after a miss when the user
has logged a session.

Below the plant SVG, show two lines of small text:
- State label: "Growing steadily" / "Needs attention" / "Coming back"
- Session count: "N sessions this month"

The plant should work on both light and dark dashboard backgrounds. Use opacity-based
fills rather than hardcoded colours where possible.

Do not add animations in MVP. Static SVG only.

---

## Step 5 — V3 Dashboard

**Create:** `src/pages/DashboardV3.tsx`

Layout (top to bottom):

**Header row**
- Left: journey name (short), "Week N · Day N of N"
- Right: "N days left" in muted text

**Plant section**
- `<PlantVisual>` component, centred
- Determine state from session log:
  - 0–1 misses this week: growing
  - 2+ consecutive misses: wilting
  - Missed yesterday, logged today: recovered

**Week view**
- 7 small day pills: M T W T F S S
- Colour states:
  - Done: green (`#16a34a`)
  - Missed: red-tinted (`hsl(0, 84.2%, 96%)` bg, red text)
  - Today (not yet logged): primary navy
  - Future/empty: muted grey
- Derive from `activeLogs` in AppContext

**Stats row**
- 3 equal boxes: sessions count, avg recovery days, on-pace %
- Use `hsl(210, 40%, 96.1%)` background (secondary) in light mode
- Use `hsl(217.2, 32.6%, 17.5%)` (muted) in dark mode

**Weekly goals card**
- Heading: "Week N · [milestone name]" from journey template
- Checklist of topics for current week
- Topics marked done based on session log entries
- Missed topics show in a subtle "catch up" section if applicable
- Tap a topic to mark it done (writes a log entry)

**Primary CTA**
- "Log today's session" — fixed at bottom
- On tap: navigate to `/checkin` (reuse existing CheckIn page or create V3 version)

**Miss recovery banner**
- Show at top of screen (below header) if last logged session was 2+ days ago
- "You missed N days. Here's the smallest step back."
- Tap banner → navigate to miss recovery flow

The dashboard should render correctly in dark mode. Apply `.dark` class handling via
Tailwind's dark: prefix or follow whatever pattern V1 Dashboard uses.

---

## Step 6 — Wire routes into App.tsx

Add to the existing routes in `App.tsx`:

```typescript
import OnboardingV3 from "./pages/OnboardingV3";
import DashboardV3 from "./pages/DashboardV3";

// Inside Routes:
<Route path="/onboarding-v3" element={<OnboardingV3 />} />
<Route path="/dashboard-v3" element={<DashboardV3 />} />
```

Do not remove existing V1/V2 routes. The devMode flag already handles routing between
versions — extend that pattern if needed, or add a separate `?v=3` query param for
testing.

---

## Step 7 — Extend AppContext

Open `src/contexts/AppContext.tsx` and extend the Milestone interface and AppState
to store the new V3 fields (journey ID, study blocks, notebook outline, etc.).

Do not change the existing field names or types — only add new optional fields.
This preserves backward compatibility with V1 data in localStorage.

---

## Testing checklist before pushing to v2-learner

- [ ] Full onboarding flow completes without errors
- [ ] Journey selection persists to dashboard
- [ ] Custom time input accepts typed values and chip selections
- [ ] NotebookLM field is skippable without blocking completion
- [ ] PWA notification prompt fires `Notification.requestPermission()` on click
- [ ] Plant renders all 3 states (test by temporarily hardcoding state prop)
- [ ] Week view shows correct colours for done/missed/today/empty days
- [ ] Weekly goals checklist renders correct week from journey template
- [ ] "Log today's session" CTA navigates correctly
- [ ] App renders on mobile viewport (375px width minimum)
- [ ] Dark mode dashboard looks correct
- [ ] V1 routes (`/onboarding`, `/dashboard`) still work — no regression

---

## Pushing to Vercel preview

```bash
git add .
git commit -m "feat: v2-learner onboarding + dashboard"
git push origin v2-learner
```

Vercel will auto-create a preview URL for the branch. Share this URL with testers.
Do NOT merge to main until V2 is tested and ready to replace V1.
