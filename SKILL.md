# SKILL.md — Calcoon

**One-line pitch:** A daily-use calculator that turns every calculation into a small moment of discovery — real math (simple to calculus-level), Duolingo-grade polish, and a raccoon mascot that reacts to what you just computed.

This document is the condensed reference for building Calcoon. It is the source of truth for architecture, data, algorithms, and constraints. `FullBuildPrompt.md` references this file and should not restate it — it should point AI coding agents here for detail.

---

## 1. Core Concept

Calcoon is a calculator, first and foremost. It must be fast, correct, and frictionless for everyday use — that is non-negotiable and comes before any gamification. Layered on top:

1. **Animated results** — numbers count up/down with motion, not snap into place.
2. **Contextual facts** — some results trigger a fact tied to *that number*, delivered in an interactive, non-boring format (not "X is the Y of Z" trivia-speak).
3. **Curiosity Engine** — an adaptive pacing system (detailed below) that governs when facts appear so they stay a surprise, not a pattern.
4. **Full math range** — simple arithmetic client-side; calculus/formula-based input routed to a symbolic engine server-side.
5. **Mascot: Calcoon**, a raccoon — curious, investigative personality. Reacts to fact reveals.
6. **No forced login.** Name-only entry. Login is offered only when the user is about to lose something they already have (unlocked facts, stats).

## 2. Non-Negotiable Constraints

- **Free-tier only.** No paid infra unless revenue exists. No credit card required anywhere in the stack.
- **No Fly.io.**
- **Vercel preferred** for anything that can live there.
- **Web first**, then mobile app, then desktop app. Do not build mobile/desktop-only features into the web MVP.
- **No AI/LLM in the math or fact-matching engine.** Math is solved deterministically (math.js / SymPy). Facts are pre-authored and stored, not generated live.
- Always verify current stable versions of any dependency before use — do not assume versions from training data.

## 3. Architecture

```
┌─────────────────────────────────────────────┐
│  Next.js 16 (App Router) — Vercel            │
│  - UI, keypad, animations, mascot            │
│  - Client-side math.js: instant simple calc  │
│  - Input classifier: simple vs complex       │
│  - Curiosity Engine state (client-driven)    │
└───────────────┬───────────────────────────────┘
                │ complex calc / fact lookups only
                ▼
┌─────────────────────────────────────────────┐
│  FastAPI + SymPy — Render (free tier)        │
│  - Sandboxed symbolic computation             │
│  - mathsteps for algebra step breakdowns      │
│  - Subprocess timeout + input whitelist       │
└───────────────┬───────────────────────────────┘
                ▼
┌─────────────────────────────────────────────┐
│  Neon Postgres                                │
│  - users, facts, user_facts, user_stats,      │
│    server_wake_events                         │
└─────────────────────────────────────────────┘
```

**Key architectural decisions:**
- Simple arithmetic **never touches the server**. It runs entirely in the browser via math.js. No delay, no dependency on Render being awake.
- Complex calc (calculus, multi-step formulas) is detected client-side by token matching (`∫`, `d/dx`, `sin`, `log`, `lim`, etc.) as the user types, which fires an early **wake-ping** to Render before the user finishes typing — masking cold-start latency rather than eliminating it.
- Facts are matched **client-side first** against a locally cached fact-trigger table (exact values, ranges, simple properties like prime/Fibonacci). Only if a richer lookup is needed does it hit the server. Facts are not time-critical — they can arrive slightly after the number animation completes.
- No UptimeRobot or artificial keep-alive. The app has no server dependency on the critical path, so Render spin-down is an acceptable, expected state.

## 4. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend framework | Next.js 16.2.x (App Router, Turbopack) | Node.js 20+ required, use Node 22 LTS |
| UI library | React 19.2 | |
| Language | TypeScript | |
| Styling | Tailwind CSS v4.3 | CSS-first config via `@theme`, not `tailwind.config.js`. If scaffolded from an older template, verify it targets v4 syntax (e.g. `bg-linear-to-r`, not `bg-gradient-to-r`). |
| Animation | Framer Motion (motion) | Number count-up, button press physics, fact card reveal, mascot reactions |
| Client math engine | math.js v15.x | Arithmetic, units, basic symbolic ops, unit-aware parsing (used for "add km/s" style fact triggers) |
| Backend framework | FastAPI (Python) | Thin wrapper around SymPy |
| Symbolic engine | SymPy (current stable) | Calculus, derivatives, integrals, simplification |
| Step-by-step (algebra) | mathsteps | ⚠️ Unmaintained upstream (last real release ~8 years old); functional for pre-algebra/algebra simplification and linear equation solving only. Does NOT cover calculus steps — treat calculus step-by-step as a stretch goal, not an MVP guarantee. |
| Database | Neon Postgres | |
| Hosting — frontend | Vercel | |
| Hosting — backend | Render (free tier) | 15-min spin-down, 750 free instance-hours/month, no card required. No keep-alive service used — see Architecture. |
| Fonts (shortlist, finalize in build) | Baloo 2 / Quicksand / Nunito / Fredoka | Rounded, friendly, high x-height. Not Duolingo's proprietary Feather. |

## 5. Database Schema

```sql
-- Users (guest-first, no forced auth)
users (
  id                uuid PRIMARY KEY,
  display_name      text NOT NULL,
  auth_type         text CHECK (auth_type IN ('guest','email','oauth')) DEFAULT 'guest',
  email             text NULL,
  created_at        timestamptz DEFAULT now(),
  last_active_at     timestamptz,
  curiosity_factor   numeric DEFAULT 1.0,   -- CF, clamp [0.5, 2.0]
  last_fact_shown_at timestamptz NULL,
  pending_fact_id    uuid NULL REFERENCES facts(id)
);

-- Fact bank (core content database)
facts (
  id              uuid PRIMARY KEY,
  trigger_value    numeric NULL,             -- null when trigger_type = 'property'
  trigger_type     text CHECK (trigger_type IN ('exact','range','unit_conversion','property')),
  range_min        numeric NULL,
  range_max        numeric NULL,
  category         text CHECK (category IN ('space','body','nature','history','pop_culture','math_property')),
  rarity           text CHECK (rarity IN ('common','uncommon','rare','legendary')),
  override_chance  numeric DEFAULT 0,        -- 0 for common/uncommon, 0.3 rare, 0.6 legendary
  format_family    text CHECK (format_family IN ('you_just_became','add_a_unit','has_a_name','rare_number','not_first')),
  copy_template    text NOT NULL,
  verified         boolean DEFAULT false,
  source_note      text NULL,                -- internal audit trail, never shown to users
  active           boolean DEFAULT true,
  created_at       timestamptz DEFAULT now()
);

-- Per-user unlocked facts ("Pokédex" collection)
user_facts (
  id            uuid PRIMARY KEY,
  user_id       uuid REFERENCES users(id),
  fact_id       uuid REFERENCES facts(id),
  unlocked_at   timestamptz DEFAULT now(),
  interaction   text CHECK (interaction IN ('engaged','dismissed','ignored')),
  calc_context  jsonb NULL,
  shared        boolean DEFAULT false
);

-- Usage metadata (fun stats, not streak-guilt)
user_stats (
  user_id              uuid PRIMARY KEY REFERENCES users(id),
  total_calculations   int DEFAULT 0,
  addition_count       int DEFAULT 0,
  subtraction_count    int DEFAULT 0,
  multiplication_count int DEFAULT 0,
  division_count       int DEFAULT 0,
  complex_calc_count   int DEFAULT 0,
  facts_unlocked_count int DEFAULT 0,
  last_calc_at         timestamptz
);

-- Wake-ping debug/tuning log (not user-facing)
server_wake_events (
  id                 uuid PRIMARY KEY,
  user_id            uuid NULL REFERENCES users(id),
  trigger_reason     text CHECK (trigger_reason IN ('complex_calc_typed','fact_cooldown_near_clear')),
  fired_at           timestamptz DEFAULT now(),
  resulted_in_request boolean
);
```

## 6. The Curiosity Engine (Fact Pacing Algorithm)

Purpose: facts must feel like spontaneous discovery, not a predictable timer or a nagging notification. Pacing is personalized per user, not fixed globally.

**State per user:** `curiosity_factor` (CF), range `[0.5, 2.0]`, default `1.0`.
`current_gap = base_gap (15 min) * CF`

**CF adjustment on each fact interaction:**
- `interaction = 'engaged'` (user taps/expands/shares) → `CF *= 0.85` (facts appear more often for curious users; floor 0.5 ≈ 7.5 min gap)
- `interaction = 'dismissed'` or `'ignored'` → `CF *= 1.15` (back off; cap 2.0 ≈ 30 min gap)

**Per-calculation flow:**
1. Does the result match any active fact trigger (exact / range / property)? If no → no-op.
2. If yes and `now - last_fact_shown_at >= current_gap` → show the fact, update `last_fact_shown_at`.
3. If yes but still on cooldown → roll against the fact's `override_chance` (0 for common/uncommon, 0.3 rare, 0.6 legendary). Success → show anyway. Failure → go to step 4.
4. If suppressed → set `pending_fact_id` (max 1 queued, prioritized by rarity if a new suppression would overwrite a lower-rarity pending fact). Next eligible window pulls from the queue first.

This means: nothing is ever silently discarded, rare/legendary moments aren't held hostage by timing, and pacing self-tunes per user without manual settings.

## 7. Fact Content Rules

Facts must never read like a textbook sentence. Required format families (stored in `format_family`):

- **`you_just_became`** — frames the result as something that just happened to the user.
- **`add_a_unit`** — the "add km/s and you've got escape velocity" mechanic: same number, dramatic reveal via unit attachment.
- **`has_a_name`** — the number is a known constant (golden ratio, etc.) with a short, non-textbook hook.
- **`rare_number`** — primes, Fibonacci numbers, meme-tier numbers (42, 404, etc.).
- **`not_first`** — historical numeric coincidences.

Every fact must have `verified = true` before going `active = true`. Facts are the app's core trust liability — a wrong fact costs more than a missing one. Do not autogenerate fact content with AI; author and verify manually, tag `source_note` internally for audit.

**Firing rate:** not every matching calculation should surface a fact — aim for roughly 15-20% hit-rate on eligible numbers so discovery feels rare, tuned via the `active` flag and trigger specificity, not a global percentage roll (the Curiosity Engine already handles pacing).

## 8. Security Requirements (mandatory, not optional)

1. **SymPy input handling:**
   - Never call `sympify()` directly on raw user input.
   - Use `parse_expr()` with an explicit empty/restricted `local_dict` and `global_dict`, and a limited `transformations` set.
   - Validate the resulting expression tree against a whitelist of allowed symbols/functions before evaluating.
   - Run computation in a subprocess with a hard timeout (3-5s) to guard against both malicious input and expensive-but-legitimate expressions hanging the service.
2. **Rate limiting** on the complex-calc and fact-lookup endpoints (e.g. 20 req/min/user or IP) via FastAPI middleware — protects Render free-tier hours and prevents fact-database farming.
3. **Guest data minimalism.** Do not persist calculation history tied to an identifiable user unless they've explicitly opted in to saving. Local-only until saved.
4. **Ad consent.** Once banner ads are added, implement a cookie/consent banner (GDPR/CCPA) as part of the web shell, not retrofitted later.
5. **Secrets.** Neon connection string, any ad-network keys: environment variables only, on Vercel/Render — never committed.

## 9. Mascot — Calcoon (the raccoon)

- Personality: curious, investigative, always "poking" at things — directly mirrors the Curiosity Engine.
- MVP asset requirement: one placeholder pose (tilted head, one raised paw, "presenting" gesture) — flat, 2-3 shape silhouette, single accent color matching the app palette. No fine detail at this stage.
- Placement: header/chrome area, idle by default, animates/reacts when a fact triggers.
- Deep mascot design work is explicitly deferred post-MVP.

## 10. Monetization

- Free tier: banner display ads, **web only initially**, positioned so they never overlap the calculator UI (bottom-anchored).
- Mobile ads deferred until web ad revenue justifies it.
- Premium: algebra step-by-step reveal (via mathsteps), additional color themes, higher fact-frequency option (opt-in, not pay-to-win).

## 11. Explicitly Deferred (post-MVP)

- Mobile app, desktop app.
- Full 3D rendering (mascot/buttons use CSS-based skeuomorphic depth, not WebGL, for MVP).
- Calculus-level step-by-step breakdowns.
- Deep mascot illustration/rigging.
- Login/account system beyond guest + optional save prompt.
- Historical stats charts / calc event time-series (only flat counters in MVP).
