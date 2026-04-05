# Decisions Log

Every significant decision made during the V2 design session, with the reasoning.
Reference this when you are tempted to change something — understand why it was decided
before overriding it.

---

## Why pivot from V1 at all

V1 was presented to a PM cohort and received mentor feedback that identified structural
weaknesses. The mentor's critique had four parts:

1. Context switching (app ↔ Telegram) is not a stable moat. Users who have already
   dropped off will not open a second app to respond to a bot. This fails exactly the
   person the product is trying to serve.

2. The V1 persona ("milestone-driven professional") was too broad. It covered two
   different problems: learners following a structured course, and self-directed
   professionals making up their own syllabus. These need different mechanics.

3. No learning context. The product had no awareness of what the user was studying.
   Generic recovery nudges ("come back!") are weaker than context-aware ones
   ("you missed Security Groups — here is the 10-minute version").

4. Missing emotional layer. Recovery speed as a metric is cold. A visual that grows and
   wilts with consistency creates the emotional investment that drives retention.

The core insight — recovery speed matters more than streak — was validated and kept.
Everything else was restructured around it.

---

## Why learners over professionals

The mentor explicitly recommended narrowing to learners. The reasoning that held up:

- Learners following a certification have a **defined endpoint** (exam date, course
  completion). This enables the template approach — the syllabus is known.
- Professionals doing self-directed upskilling have no external structure. The product
  would need to provide all of it. That is a bigger problem.
- The recovery mechanic is more powerful when the product knows what was missed.
  "You missed Day 12 of your AWS prep" is more actionable than "you missed a session."
- Learner journeys have measurable completion. This gives V2 a cleaner success metric
  than V1's open-ended milestone tracking.

---

## Why template-based journeys over open goal entry

Three options were considered:

**Option A — Freeform goal entry (V1 approach)**
User types their goal, sets a deadline, defines their own structure. Maximum flexibility,
minimum guidance. Problem: users do not know how to break a 60-day cert prep into weekly
goals. The product ends up being a habit tracker with extra steps.

**Option B — Pre-built templates (chosen)**
The app provides week-by-week topic breakdowns for known certification paths. The user
picks their journey; the app does the decomposition. This is the right MVP approach
because:
- Structured certifications (AWS SAA, PMP, CFA Level 1) publish their own syllabi.
  The week templates are not invented — they reflect how candidates actually prepare.
- It makes the recovery mechanic course-aware without requiring AI.
- It creates a reason to come back to the app (your weekly goals are here).
- It differentiates from generic habit trackers that give the user a blank canvas.

**Option C — User pastes their syllabus**
A text field where the user pastes their course outline or NotebookLM study guide.
The app parses it to generate goals. This is the right Phase 2 upgrade to Path B —
it handles custom courses that do not have published syllabi. In MVP it is an optional
field stored but not parsed. AI parsing comes in Phase 2.

Path C was added as an optional onboarding field precisely because serious learners
(the target user) use NotebookLM and will appreciate the explicit callout. It is
research data for Phase 2 — seeing what users actually paste tells you what courses
they are studying that are not in the 10 templates.

---

## Why these 10 journeys

Selection criteria:
1. India-first demand signal (2026–27 upskilling data from UpGrad, LinkedIn Learning,
   Great Learning reports)
2. Structured, published syllabus (easier to template)
3. Clear endpoint (exam, portfolio, certification)
4. Fits learner persona (not purely self-directed)

Journeys 2, 5, 7, 9 (AWS, PMP, Security+, CFA) were prioritised for templates first
because their exam bodies publish domain breakdowns. The templates are not invented —
they reflect official preparation guidance.

Journey 8 (Gen AI for non-engineers) was included because it is the fastest growing
search category in 2025-26 and has the shortest timeline (4–8 weeks), which means
users can complete a journey and start another — good for retention data.

Journey 3 (PM transition) is the founder's own persona. Dogfooding it is a feature,
not a coincidence.

---

## Why PWA push notifications over Telegram

V1 used Telegram as the nudge channel. Cut for V2 for these reasons:

1. The user who has dropped off is not opening Telegram to respond to a bot. The
   channel assumption broke at the exact moment the product needed to work.

2. Context switching adds cognitive load. App → Telegram → app is three steps at
   a moment when friction causes abandonment.

3. Telegram penetration among the target user base (learners, not just tech professionals)
   is lower than assumed. V1 targeted tech-adjacent professionals specifically. V2 targets
   a broader learner population.

PWA push notifications:
- Send from within the app's own service worker
- One-time permission grant during onboarding
- Zero context switching — notification taps open the app directly
- Content is controlled by the product (contextual, course-aware)

Known constraint: iOS Safari requires the app to be added to the home screen before
push notifications work (iOS 16.4+). This was weighed against the Telegram friction
and judged acceptable. Handle with an Add to Home Screen prompt for iOS users.

---

## Why calendar integration was deferred to Phase 2

The mentor suggested calendar integration. It was scoped and deferred for these reasons:

1. OAuth to Google/Apple Calendar is a 2–3 week build minimum. It is not MVP scope.

2. More importantly: the notification that fires from a calendar event is a generic
   calendar ping, not a learning-aware nudge. The intelligence of the nudge ("you
   planned EC2 today and haven't logged it yet") is what makes the product different.
   A calendar event loses that.

3. Calendar's correct role was identified as a **scheduling surface**, not a notification
   channel. The user sees their week and blocks study time. The app reads those blocks
   to know when they are free. It does not write generic "Study AWS" events to the calendar.

This reframing made the Phase 2 calendar integration more valuable and the MVP scope
more focused.

---

## Why the plant metaphor

The "water a plant, make it grow" gamification concept came from the mentor.

What it solves that the recovery speed metric did not:
- Recovery speed as a number requires the user to understand and care about a metric
  they have never seen before. Cognitive load at the wrong moment.
- A visual that grows and wilts communicates the same concept (come back quickly or
  the plant suffers) without requiring metric literacy.
- It creates emotional investment without being shame-based. The plant is not
  punishing the user — it is just waiting for water.
- Three states (growing, wilting, recovered) are enough to communicate the full
  lifecycle without complexity.

What it does not replace:
- The recovery speed metric still lives in the stats row. The plant is the emotional
  layer; the numbers are for users who want data.
- Streaks are not the mechanic. The plant responds to recovery behaviour, not to
  consecutive days. A user who misses 2 days but comes back immediately sees the
  plant recover — this reinforces the product's core message.

---

## Why localStorage (no backend) for MVP

Supabase migration was discussed and explicitly deferred. Reasons:
- No backend is the fastest path to a testable product
- The core mechanic (recovery speed, weekly goals) does not require server-side
  scheduling in MVP
- Real push notification delivery (which does require a backend) is also deferred
- localStorage data loss risk is accepted as a beta constraint — noted in V1 docs

When to move to Supabase: when push notification delivery is built. The cron job
that sends nudges needs server-side execution. That is the forcing function.

---

## Why V2 uses the same shadcn default theme

The "warm linen + terracotta" theme explored in early wireframes was the wrong call.
That was the V1 post-overhaul theme. The actual production CSS confirmed the app uses
the default shadcn/ui dark navy theme.

The decision to stay with the existing CSS variables:
- Zero visual regression risk
- Testers see a familiar UI
- The navy primary + dark dashboard creates a focused, intentional feel that works
  for a study session context
- Adding a new colour system is scope creep that does not validate the product

---

## Why this build order (journeys.ts first)

Every other file depends on the journey data structure. If you build the UI first
and then define the data, you will refactor the UI to match the data shape.
Define the shape once, build everything against it.

The type definitions in `journeys.ts` also force decisions about the data model
(what does a TopicTemplate look like? what is a "smallest step"?) before those
decisions are buried in component code.

---

## On NotebookLM integration — what is real vs aspiration

**What is real today:**
- NotebookLM has no public API as of April 2026
- Users can export a study guide as PDF or copy their outline as text
- An optional text field in onboarding captures this

**What is aspirational:**
- Live sync between the app and a user's notebook
- Quiz generation from notebook content
- Automatic goal adjustment when the user adds material

The optional paste field is real and buildable. Everything else is contingent on
Google opening an API. The field is positioned as "bring your outline" not "connect
your notebook" — this is an important distinction to maintain in copy and in the
product spec.

---

## The one thing that must not change

The core insight from user research:

> **How fast you bounce back matters more than whether you missed a day.**

Every product decision flows from this. The plant embodies it. The recovery flow
operationalises it. The North Star Metric measures it. If a feature does not serve
this insight, it does not belong in MVP.
