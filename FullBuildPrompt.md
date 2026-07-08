# FullBuildPrompt.md — Calcoon

**Read `SKILL.md` in full before writing any code.** It is the source of truth for architecture, schema, algorithms, and constraints. This document tells you *what to build, in what order*. It does not restate SKILL.md — if something here conflicts with SKILL.md, SKILL.md wins.

You are building **Calcoon** — a web-first calculator app that animates results, surfaces contextual facts on certain numbers, supports both simple and calculus-level math, and has a raccoon mascot. MVP is the web app only.

---

## Build Order

Build in the phases below, in order. Do not skip ahead to later phases before earlier ones are functionally complete — each phase should be independently testable.

### Phase 1 — Project scaffold
- `npx create-next-app@latest` with TypeScript, Tailwind, App Router, `src/` dir.
- Verify Tailwind v4 syntax is used (CSS-first `@theme` config, not `tailwind.config.js`). If the scaffold generates v3-style config, migrate it.
- Set up the repo for Vercel deployment (connect repo, confirm build passes with a blank page before adding features).
- Confirm Node version is 22 LTS locally and in any CI/build config.

### Phase 2 — Core calculator (simple, client-side only)
- Build the keypad UI and result display per the visual direction below.
- Wire up math.js for all basic arithmetic (+, −, ×, ÷, %, decimals). This must work with zero network calls.
- Implement the number count-up/count-down animation (Framer Motion) whenever the result changes — animate from old value to new value, not an instant snap.
- Implement the 3D button press affordance: raised default state, compressed/darker state on press (CSS `box-shadow` + `translateY`, no WebGL).
- At this phase, do not build complex calc, facts, or accounts yet. A fully working, good-feeling basic calculator is the milestone.

### Phase 3 — Complex calc backend
- Set up the FastAPI service on Render per SKILL.md architecture.
- Implement the SymPy wrapper following SKILL.md Section 8 security requirements exactly (sandboxed `parse_expr`, whitelist validation, subprocess timeout). Do not deviate from this for convenience.
- Build the client-side input classifier: detect calculus/formula tokens (`∫`, `d/dx`, `sin`, `cos`, `log`, `lim`, etc.) as the user types. On detection, fire the early wake-ping to Render (fire-and-forget, non-blocking) before the user finishes typing.
- Route detected-complex expressions to the Render endpoint; route everything else to math.js locally.
- Add rate limiting to the FastAPI endpoints per SKILL.md Section 8.
- Test cold-start behavior explicitly: let the service sleep, then time a complex-calc request with and without the early wake-ping to confirm it actually reduces perceived wait.

### Phase 4 — Fact engine
- Set up Neon Postgres using the schema in SKILL.md Section 5.
- Build a small, seed set of verified facts across all five `format_family` types (aim for ~20-30 facts across categories to validate the mechanic before scaling content).
- Implement client-side fact matching against a cached trigger table for `exact`, `range`, and simple computable `property` triggers (isPrime, isFibonacci, etc.).
- Implement the Curiosity Engine exactly as specified in SKILL.md Section 6 — CF adjustment, cooldown check, rarity override roll, single-slot pending queue.
- Build the fact reveal UI: card animates in below the result, using the interactive format per its `format_family` (not a static trivia sentence).
- Wire up the `engaged` / `dismissed` / `ignored` interaction tracking that feeds CF.

### Phase 5 — Users, stats, sharing
- Implement guest-mode entry: name-only, no password, backed by a device token (cookie/localStorage) mapped to a `users` row.
- Build the `user_stats` counters (operation counts, total calcs, facts unlocked) updated on each relevant action.
- Build the "save your progress" prompt: trigger it based on unlocked-fact count or usage milestone (not on a fixed timer), framed as loss-aversion ("keep these if you switch devices"), never as a feature-gate.
- Build fact sharing as an image card (Spotify Wrapped-style) — generate from the fact + calc context, downloadable/shareable.

### Phase 6 — Onboarding, feedback, polish
- Build first-open onboarding: briefly explain the fact mechanic and complex-calc capability. Keep it skippable.
- Build the feedback/bug report form: category selector, auto-attached context (device, browser, app version, current calc state), routes to both a Telegram bot webhook and email.
- Add the mascot (Calcoon) placeholder asset in the header, idle by default, reacts on fact reveal.
- Add banner ad slot (bottom-anchored, never overlapping calculator UI) with a GDPR/CCPA consent banner.
- Add the mode toggle for scientific/complex calc entry (expand from simple view rather than replacing it).

---

## Visual Direction (for scaffolding UI components)

- Hero-number layout: the result display gets the most visual weight and whitespace, similar in spirit to a minimal fintech calc — not cramped.
- Dedicated, normally-collapsed **fact zone** directly beneath the result, expands only when a fact fires.
- Buttons: deep rounded corners, skeuomorphic "lip" shadow that compresses on press.
- Operator buttons get a distinct accent color from number buttons (hierarchy through color, not size).
- Palette: to be finalized separately from Spectra (Hydrogen Beta) and Keyflex (Ember Dark) — Calcoon needs its own distinct identity, not a reused brand system.
- Font: pick one from the shortlist in SKILL.md Section 4 (Baloo 2 / Quicksand / Nunito / Fredoka) and apply consistently — do not mix.
- Mascot sits in the header/chrome, not inside the numeric flow.

## What NOT to build in this pass

- No mobile app, no desktop app.
- No WebGL/three.js — all "3D" is CSS depth only.
- No AI-generated facts — facts come from the seeded database only.
- No login requirement anywhere — guest mode must always be a complete path.
- No calculus-level step-by-step (mathsteps covers algebra only; do not attempt to extend it to calculus in this build).
- No UptimeRobot or any keep-alive service for Render.

## Definition of done for MVP

A user can open the web app with no login, perform simple and complex calculations with animated results, occasionally discover a fact that feels earned rather than spammy, see their basic usage stats, optionally save their name-linked progress, and report a bug that reaches the developer within minutes. The app never requires the backend to be awake to perform basic math.
