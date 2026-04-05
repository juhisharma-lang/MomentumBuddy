# Momentum Buddy V2 — Product Specification

## The pivot in one sentence

V1 was built for milestone-driven professionals who needed a restart nudge after missing
a session. V2 is built for learners who need a structured journey with guided recovery —
the same core insight, sharper persona, better mechanic.

---

## Why the pivot happened

Mentor feedback after V1 cohort presentation identified four problems:

1. **Context switching is not a stable moat.** Users who have already dropped off will
   not switch between the app and Telegram to respond to a bot. The friction exists at
   exactly the wrong moment.

2. **The persona was too broad.** "Milestone-driven professional" covers both structured
   learners (following a course) and self-directed upskilling (making it up as they go).
   These are different problems. V2 narrows to learners following known certification paths.

3. **No learning context.** The product had no awareness of what the user was actually
   studying. Recovery guidance was generic. Context-specific help (you missed the
   Security Groups topic — here is the 10-minute version) is where the real moat is.

4. **Gamification was missing.** The recovery speed metric is meaningful but cold.
   A visual that grows and wilts with the user's consistency creates emotional investment
   that numbers alone do not.

---

## What did not change

- The core insight: **recovery speed is the North Star**, not streak length
- The behavioral science underpinning: miss → guilt → avoidance → bigger gap
- The tone: no shame, no confetti, no emotional escalation
- The technical stack: React + TypeScript + Vite + shadcn/ui + localStorage
- The monetisation direction: B2C freemium, India-first

---

## Primary persona — V2

**The Structured Learner**

- Enrolled in or self-studying toward a specific certification or course
- Has a clear endpoint (exam date, course completion, portfolio ready)
- Motivated when on track; derailed by life, work, fatigue
- Does not naturally break a 60-day cert prep into weekly goals
- Likely uses NotebookLM, Notion, or Anki for study organisation
- India-first: price-sensitive, mobile-first, aspirational about career transitions
- Representative journeys: AWS cert, PM transition, Gen AI upskilling, CFA Level 1

**What they want from the product:**
- Tell me what to study this week (not just "study more")
- Notice when I fall behind and help me catch up, not shame me
- Make my progress feel real without being childish about it

---

## The 10 learner journeys

Selected based on 2026–27 India upskilling demand signal. Sources: UpGrad trending
courses data, LinkedIn Learning India report, PMI job growth projections, XCalibre
training demand research.

### Launch journeys (full week-by-week templates built at launch)

**1. AI / ML fundamentals → practitioner**
- Why: Biggest upskilling category in India 2025–27. Roles requiring AI literacy grew
  40%+ YoY. Entry point exists for both engineers and non-engineers via Google /
  DeepLearning.AI certs.
- Timeline: 8–16 weeks
- Template anchors: Python basics → ML concepts → supervised learning → neural nets →
  deployment → project

**2. AWS Solutions Architect (SAA-C03)**
- Why: Cloud market projected at $1.35T by 2027. AWS SAA is the most-taken cloud cert
  globally. The official exam guide publishes 6 domains with percentage weightings —
  ideal for week-by-week templating.
- Timeline: 10–14 weeks
- Template anchors: IAM + basics → EC2 + networking → S3 + storage → databases →
  high availability → cost optimisation → exam prep

**3. Product management transition**
- Why: Founder's own user persona. High-intent learners switching from engineering or
  design into PM roles. PM cert programs (NextLeap, PMC) have structured curricula.
  India PM job openings up 60% since 2023. Useful for dogfooding.
- Timeline: 8–12 weeks
- Template anchors: PM fundamentals → user research → product strategy → roadmapping →
  execution + metrics → case studies + portfolio → interview prep

### Coming soon journeys (tiles visible, content not yet built)

**4. Data analytics** — SQL → Python → dashboards. 10–16 weeks.
**5. PMP certification** — PMBOK domains as weekly anchors. 12–20 weeks.
**6. UX / product design** — Figma + portfolio. Project milestones as checkpoints. 10–14 weeks.
**7. Cybersecurity** — CompTIA Security+ or CEH. Domain-by-domain. 10–16 weeks.
**8. Generative AI for non-engineers** — Shortest journey (4–8 weeks). Highest 2026
  growth signal. Tool-by-tool weekly progression. Good for completion rate data.
**9. CFA Level 1** — 10 official topics as module anchors. 16–24 weeks. High-stakes
  deadline creates strong recovery motivation.
**10. DSA + system design** — Coding interview prep. Neetcode / Striver roadmaps already
  map to weekly topics. High dropout rate = strong product-market fit for recovery mechanic.

---

## Core mechanics

### Journey templates

Each journey has a week-by-week breakdown stored in `src/data/journeys.ts`.
Each week has:
- A milestone label (e.g. "EC2 + Networking")
- 4–6 specific topics (e.g. "Security groups vs NACLs", "Load balancer types")
- Estimated minutes per topic
- A "smallest step" version of each topic for recovery moments (10-min subset)

For MVP, templates are static data. In Phase 2, an AI layer generates or customises
templates from the user's pasted outline.

### Custom time input

Users set their study block duration using a HH:MM input (two separate number fields,
not a single string). Quick-select chips (15m, 30m, 45m, 1h, 1h 30m) reduce friction
for the common cases. A "+ Add a second study block" option supports split-schedule
learners (e.g. 20 min morning + 25 min evening). This matters for notification timing.

Why HH:MM instead of chips only: users have specific routines. A nurse studying between
shifts may have 25 minutes, not a round number. Respecting their actual time communicates
that the product is built for real life.

### PWA push notifications

Replaces Telegram as the nudge channel. One-time permission prompt during onboarding.
The prompt is inline on Screen 3 — not a modal, not a separate step.

Study reminder fires at the user's set start time.
Check-in fires at the user's set check-in time with "Did you study today?" message.

iOS constraint: PWA push notifications require the app to be added to the home screen
on iOS 16.4+. Handle this with an Add to Home Screen prompt for Safari iOS users.
This is a known limitation, not a blocker.

For MVP testing: implement the permission UI only. Service worker scheduling is a
separate build task.

### Plant visual

Three states only:
- **Growing** — user has studied consistently this week. Plant is full, upright, green.
- **Wilting** — 2+ missed sessions. Plant droops, leaves grey.
- **Recovered** — user missed then came back. Transitional state — some green returning.

The plant responds to session logging, not to real-time elapsed time. It does not wilt
in real-time while the user is away — it updates when the user opens the app.

Do not add more than three states. Do not add animations beyond subtle state transitions.
Keep it simple — the emotional impact comes from the metaphor, not the complexity.

### Miss recovery flow

Triggered when the app detects a missed session on open.

The smallest step suggestion is the key behavioral mechanism. Instead of showing the
full missed topic, show a 10-minute subset. This applies implementation intentions
research: specific, time-bound commitments dramatically increase follow-through vs
vague re-engagement prompts.

The missed topic data comes from the journey template — the app knows what was planned
for the missed day and can surface the right 10-minute starting point.

### NotebookLM integration (optional, MVP)

NotebookLM has no public API as of April 2026. Live integration is future state.

MVP implementation: an optional text area in onboarding Step 2.
- Label: "Using NotebookLM? Paste your study guide outline here"
- Helper: "We'll use this to customise your weekly goals"
- Skip link clearly visible

When the user pastes an outline, it is stored in AppContext alongside the journey
selection. In MVP, a human (the founder) can manually review submitted outlines during
beta to see how users actually describe their study materials — this is research, not
a feature. In Phase 2, an LLM parses the outline and adjusts the weekly template.

---

## What is out of scope for V2 MVP

These were explicitly deferred and should not be built now:

- **Notification delivery** (service worker, scheduling logic) — prompt UI only
- **Remaining 7 journey templates** — coming soon tiles only
- **Spaced repetition scheduling** — Phase 2
- **AI goal generation** — Phase 2
- **NotebookLM live API sync** — impossible today, Phase 3+
- **Calendar integration** — Phase 2, role is scheduling surface not notification channel
- **Backend / Supabase** — still localStorage for MVP
- **Multi-device sync** — blocked by no backend
- **Social features / shareable cards** — Phase 3
- **Quizzes or in-app learning content** — not the product; the product is the structure
  and recovery layer around content the user gets elsewhere

---

## Phased roadmap (context only)

**Phase 1 — MVP (current build)**
Free. Learner journeys with templates. PWA notification prompt. Plant visual.
LocalStorage only. 3 fully built journey templates.

**Phase 2 — Automation**
Actual push notification delivery. Calendar integration (read-only, scheduling surface).
AI outline parser for NotebookLM paste. Remaining 7 journey templates. Supabase backend.

**Phase 3 — AI + paywall**
AI-powered weekly goal adjustment. Spaced repetition. Shareable recovery cards (growth loop).
Freemium paywall triggered here. India: ₹149–199/month. International: ~$4–5/month.

**Phase 4 — Scale**
WhatsApp integration. B2B / team plans. Course provider partnerships.
