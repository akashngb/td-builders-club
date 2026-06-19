# TD Builders Club — Slide Deck Build Spec

**Purpose:** A single source of truth for building two visually-consistent slide decks in Claude Code:
1. **Overview Deck** — pitches the initiative + walks the 8 sessions (one slide each).
2. **Prompt Monkeys Deck** — Session 1, the kickoff + a talk on real prompt-engineering tricks.

Both decks import the **same shared design system** so they read as one product, not two one-offs.

> **How to use this doc with Claude Code:** Build the shared system first (Section 2), confirm a sample slide renders, then build the decks against it. Treat the slide-by-slide content (Sections 5–6) as the script; tune copy as you go but keep the structure and obey the copy rules in Section 3.

---

## 1. Tech & build approach

**Recommended: reveal.js** (themeable via one shared CSS file, keyboard nav, speaker notes, PDF export). Author in plain HTML. Zero build step required to present.
- Alt: **Slidev** (markdown authoring). If used, still meet the single-file export requirement below.

**Repo structure (dev-time source):**
```
/builders-club-decks
  /shared
    theme.css            # the entire design system (Section 2)
    components.html       # reference snippets for each base layout (Section 4)
    /fonts               # vendored JetBrains Mono (+ Graphik if/when web-licensed)
    /js                  # ported vanilla components (waves, typewriter, cards, tilt)
  /components-source     # the original pasted React components, for reference while porting
  overview.html
  prompt-monkeys.html
  /assets                # screenshots, demo stills, logo
  bundle.mjs             # the inline/bundle step (see below)
  README.md
```

**Hard requirements:**
- 16:9, design at **1920×1080**, big type (projected + screen-shared).
- Every deck must **export cleanly to PDF** (test it — grid/footer and the flashy slides need static fallbacks).

### Standalone single-file export — the most important constraint

**The final deliverable for each deck is exactly one `.html` file that opens correctly by double-click, with zero sibling files and zero network calls, on any machine.** Non-negotiable after the work-laptop blank-render incident: no CDN, no relative-path assets that can get separated in transit.

How, without making the build painful:
- Build/edit as multiple files (the dev source above).
- `bundle.mjs` runs at the end and produces one self-contained `.html` per deck: inlines `theme.css` into `<style>`, inlines reveal.js + all component JS into `<script>`, and **base64-encodes every font into the `@font-face src` as a `data:` URI**.
- Run it as the literal last action before handoff. Verify by copying **only** the single output file to another machine and opening it offline.
- All flashy components are pure JS/canvas/SVG with no external assets, so they bundle in with no extra work.

---

## 2. Shared design system

### Direction: "Build Log" (on TD brand)
A workbench / engineering-notebook aesthetic — grounds the club in the *builder* world (drafting, iteration, shipping) while staying clean enough for a bank. **Color is locked to TD's official palette**, so the design boldness is spent on **typography, structure, and five concentrated flashy moments** — not on color invention. Personality lives in: **monospace as a co-lead typeface** (eyebrows, session numbers, prompt blocks), a faint **blueprint grid**, and the numbered **log-entry** framing.

The deliberate tension *is* the brand: buttoned-up Graphik against scrappy raw monospace — a bank that builds.

### Color tokens — TD official palette only
Source brand values (from the Power Fx variables):
`TD_Green rgb(0,138,0)` · `TD_Dark_Green rgb(26,83,54)` · `TD_Light_Green rgb(229,241,212)` · `TD_Grey rgb(239,237,238)` · `TD_Orange rgb(255,149,0)`.

Tokens are **role-based** so they survive light/dark:
```css
:root {
  --paper:        #EFEDEE;  /* TD_Grey — base surface */
  --panel:        #FFFFFF;  /* cards / blocks */
  --ink:          #1A1A1A;  /* primary text */
  --ink-soft:     #5C5C5C;  /* secondary text */
  --line:         #D7D4D5;  /* hairlines + blueprint grid */
  --accent:       #1A5336;  /* TD_Dark_Green — structural brand thread */
  --accent-bright:#008A00;  /* TD_Green — punchy highlight + cursors, sparingly */
  --tint:         #E5F1D4;  /* TD_Light_Green — soft fills, chips, highlights */
  --signal:       #FF9500;  /* TD_Orange — energy: timers, one-off accents */
}
:root[data-theme="dark"] {
  --paper:#11211A; --panel:#1A3328; --ink:#ECECE8; --ink-soft:#9FB0A6; --line:#2C4A3B;
  --accent:#E5F1D4; --accent-bright:#34B233; --tint:#1A5336; --signal:#FF9500;
}
```

**There are no other colors in this project.** Every ported component must be recolored to these tokens — see the recoloring rule in Section 3.

### Typography
- **Display / body:** `TD Graphik` (brand voice). Weights → roles: Semibold → display, Medium → h1/h2, Regular → body, Semilight → lead lines, Light → oversized numerals/quiet captions.
- **Mono (co-lead signature):** `JetBrains Mono` — eyebrows, session numbers (`S01 / 08`), taglines, prompt/code blocks.

Font wiring (settled): declare **one** `@font-face` family `"TD Graphik"` across five weights, `src: local("TD Graphik <Weight>")` first so installed copies on TD machines are used with no embedding. Inter stays in the fallback stack for dev machines that lack Graphik. JetBrains Mono is OFL — self-host/vendor it. Final bundle base64-inlines whatever font files are present.
```css
:root{ --sans:"TD Graphik","Inter",system-ui,-apple-system,sans-serif;
       --mono:"JetBrains Mono",ui-monospace,Menlo,monospace; }
```

**Type scale (projected, Graphik weights):**
```
display       88px / Semibold
h1            52px / Medium
h2            34px / Medium
lead          28px / Semilight
body          24px / Regular
mono-eyebrow  18px / Mono Medium, uppercase, +0.08em tracking
caption       18px / Regular, --ink-soft
```

### Layout & motion (default)
- Frame 1920×1080, **96px** outer margins, one idea per slide.
- Faint blueprint grid behind content (dark-green lines, ~5% opacity, ~48px cells). Must survive a projector and PDF.
- **Persistent footer** on every content slide (Section 4, component 10).
- **Icons:** Lucide, one weight, used sparingly. Vendor it.
- **Motion default:** minimal — one content reveal per slide on advance. Respect `prefers-reduced-motion`. The flashy moments (Section 3) are the deliberate exceptions.

---

## 3. The rules that keep this from looking AI-generated

These two rules matter more than any single slide. Read them before writing copy or porting a component.

### Copy rules — zero slop

The fastest way to lose a room of bankers is LinkedIn-carousel copy. Hard rules for all slide text **and** speaker notes:

- **Every line carries information or it's cut.** If a sentence would survive being pasted into any other company's deck, it's too generic — delete it.
- **Banned vocabulary:** "unlock," "unleash," "supercharge," "the power of," "revolutionary," "game-changing," "elevate," "in today's fast-paced world," "imagine a world," "harness," "seamless," "robust." No exclamation-point energy.
- **Concrete over abstract, always.** Name the actual trick, tool, or number.
- **Voice = a sharp colleague, not a keynote speaker.** Dry, specific, occasionally funny when it's earned. The session titles already carry the humor; body copy plays it straight.
- **No fabricated specifics.** Never invent a stat, percentage, or quote to sound authoritative. No number unless it's real.
- **Write tight, then cut 30%.** Slides anchor what the presenter says — they are not the script. One strong line beats four hedged ones.

Calibration — the bar:
```
❌ "Unlock the power of AI to supercharge your workflow!"
✅ "Wrap your docs in <context> tags. The model stops guessing what matters."

❌ "In today's fast-paced world, prompting is a must-have skill."
✅ "Most people prompt like they're typing into Google. That's the whole problem."

❌ "Build something amazing and unleash your creativity!"
✅ "Build something small. A script that saves you ten minutes counts."
```
If a drafted line feels like it came from a LinkedIn carousel, it did. Rewrite or remove it.

### Component-sourcing + recoloring rule

- **Port from provided source — never invent — anything with real animation/interaction logic.** Provided: Waves, TypewriterEffect, GradientCard, 3D tilt card. Save the originals in `/components-source` and port each to vanilla JS/CSS (no React, no Tailwind, no framer-motion, no `motion/react`) to protect the single-file export.
- **Build pure-CSS pieces directly from tokens.** The bento grid and the animated timeline have no logic to preserve — they're CSS grid and a `stroke-dashoffset` animation. Building these from the design tokens is *not* freelancing; there is no component to source.
- **Recolor everything to TD tokens.** Every pasted component ships in Tailwind defaults that must be stripped: `bg-blue-500` cursor → `--accent-bright`; the gradient-card `orange/gray/purple/green` variants → TD tints; `dark:text-white / text-black` → `--ink`; badge dots → `--accent` or `--signal`. After porting, there must be no blue, no purple, no amber, no slate anywhere.

### The five flashy moments (the only places motion goes big)

Five slides out of ~20 get real flourish; everything else stays Build Log minimal. The contrast is the point. Each needs a **static fallback** for `prefers-reduced-motion` and PDF.

1. **Title slide — Waves background.** Port the `Waves` component (SVG paths + simplex-noise). **Strip the cursor-tracking and pointer-dot entirely** — a slide background shouldn't chase the mouse; keep only the ambient noise drift. Recolor: stroke → TD dark green at low opacity (~12–18%) over `--paper`. Welcome content sits on a near-solid scrim for legibility. PDF fallback: one static frame.
2. **Before/after slide — terminal typewriter + diff.** Port `TypewriterEffect` (the per-character staggered variant). The engineered prompt types itself out in a mono terminal frame; recolor the cursor `bg-blue-500` → `--accent-bright`. The lazy prompt sits static above. **Diff highlight in TD palette, not git red/green:** the load-bearing words in the engineered prompt get a `--tint` background so the room sees exactly which words did the work.
3. **Toolkit slide — bento grid.** Build from tokens. Asymmetric CSS grid; the "wrap context in tags" trick gets the hero cell. No source needed.
4. **Season map slide — animated timeline.** Build from tokens. A line draws itself across S01→S08 via `stroke-dashoffset`, with a pulsing `--accent-bright` dot on the current session. No library.
5. **"Build something small" slide — gradient cards + subtle 3D tilt.** This is the one slide that earns *two* combined effects, because its whole job is to make building feel tactile and reachable. Port `GradientCard` **and** the 3D tilt card, combined onto three cards (CLI tool / locally-hosted web app / dev tool):
   - Replace the decorative `imageUrl` with a **large faint Lucide icon in the back corner** — `terminal`, `app-window`, `wrench` — that scales/rotates slightly on hover (port the existing `imageAnimation`).
   - Recolor the cva gradients to a **single restrained TD wash** (`TD_Grey → TD_Light_Green`, very subtle) across all three — differentiate by icon + badge, not by hue, so it never becomes a rainbow.
   - Apply the 3D tilt from `CardContainer`, kept **subtle** (the source's `/25` divisor is right; cap the rotation low). This is the **only** slide that uses tilt.
   - Each card carries a **concrete example line** (this is the anti-blank-page mechanism, see Section 6): CLI → "a script that batch-renames your export files." Web app → "a one-page tool that reformats meeting notes." Dev tool → "a snippet that turns a CSV into a chart."

---

## 4. Reusable base components

Defined once in `theme.css` + `components.html`. The non-flashy slides use only these.

1. **Title slide** — wordmark, mono tagline w/ cursor, Waves bg (flashy moment 1).
2. **Log-entry / section divider** — oversized mono number + display title.
3. **Statement slide** — one big display line, heavy negative space.
4. **Content slide** — mono eyebrow + heading + ≤3 sparse lines.
5. **Session card** (overview) — `Sxx / 08` · title · mono tagline · You'll learn · Tools (chips) · The hook · Why it's fun. One line per field. Static and scannable — no tilt here.
6. **Split / before-after** — two columns; `--accent` label + `--tint` fill on the good side. Hosts flashy moment 2.
7. **Prompt / code block** — mono, `--panel` bg, `--accent` left border, square corners on the bordered side.
8. **Demo slide** — bordered "screen" frame + one-line caption.
9. **Closing / CTA slide** — display CTA + where/when.
10. **Persistent footer** — left `TD BUILDERS CLUB` (mono); center session marker; right the standing rule `synthetic / public data only`. Bakes safety into every slide without a lecture.
11. **Tool chip** — small mono pill, `--accent` outline. Lists only reachable tools.

---

## 5. Deck 1 — Initiative Overview (slide-by-slide)

~14 slides. Goal: a newcomer gets *what it is, why it exists, what 8 weeks look like* in one read.

- **01 — Title.** `TD Builders Club`. Mono tagline.
- **02 — The problem.** Three pain points, one line each: AI anxiety (smart people feel left behind); the gap (beginner code → shipped things doesn't scale on its own); FTEs specifically (no assignments, no hackathons, no reason to build).
- **03 — What it is.** Food in a room, a short skill drop, then build with mentors floating, optional demo. Come test the idea you've been sitting on.
- **04 — How a session runs.** Floor opens 15 min early → 7–8 min skill talk → build time, execs floating → optional demos. Virtual folks in breakout rooms.
- **05 — The season.** *(Animated timeline — flashy moment 4.)* The 8-week arc, skills compounding.
- **06 — S01 / Prompt Monkeys.** Learn: real prompting tricks beyond "give it a role." Tools: internal chat model / KMAI. Hook: live prompt makeover. Why fun: everyone fears they're a prompt monkey; instant payoff.
- **07 — S02 / Eye Candy.** Learn: make things look good without "being creative." Tools: `Figma Make`, `21st.dev`, `Hero UI`. Hook: blank → polished UI in one session. Why fun: pulls in the "I'm not creative" crowd.
- **08 — S03 / API Haven.** Learn: an API is just a digital plug; multimodal in plain terms. Tools: `Streamlit`, internal vision model, `Supabase`. Hook: Snap-to-Dashboard (Section 7). Why fun: "the AI can see," and it's finance-native.
- **09 — S04 / Lies of Copilot** *(AI safety — the vegetables)*. Learn: spot confident-wrong answers, data leaks, safe sandbox use. Tools: KMAI. Hook: catch the AI lying live. Why fun: framed as survival, not compliance training.
- **10 — S05 / We Have AI at Home.** Learn: LLM vs fine-tuning vs RAG; why TD's own context beats a generic wrapper. Hook: "why doesn't the generic bot know our deal flow?" Why fun: the mom-meme title; demystifies the jargon.
- **11 — S06 / Build an Intern.** Learn: make AI work on a loop/schedule. Tools: `Power Automate`, `Copilot Studio`. Hook: an agent that watches a sheet/inbox overnight. Why fun: "work while you sleep."
- **12 — S07 / Fullstack Toolkit** *(the holy grail)*. Learn: turn a frontend into a real app that saves data and lives on the internet. Tools: `Vercel`, `Streamlit`, `Supabase`. Hook: a real URL + working database. Why fun: "my app is actually real," and it arms you for the finale.
- **13 — S08 / Season Finale: Hackathon.** 2 hours, sandbox open, snacks. Bring what you've built and ship it.
- **14 — Closing / CTA.** When + where, how to join, and the rule once, loud: build with synthetic or public data only — never real TD data in external tools.

---

## 6. Deck 2 — Prompt Monkeys (slide-by-slide + timing)

Session 1 carries extra weight: a kickoff no future session needs, the talk, then a safety net at the build-time transition. Longer than future sessions by design.

### Welcome / kickoff (session-1 only — do not reuse) — ≈3:30
- **W1 — Welcome.** Who's running this and why tonight exists.
- **W2 — The why, felt.** Not bullets — the actual feeling: the pressure to stay current, the gap between toy code and shipped things, FTEs deserving a reason to build that undergrads get for free.
- **W3 — What this is not.** Not a lecture series. Not a bootcamp. Not evaluated. Say it out loud.
- **W4 — The season map.** *(Animated timeline — flashy moment 4.)* All 8 sessions; skills compound.
- **W5 — How tonight works.** The rhythm, since nobody's seen it yet.

### Core talk — ≈7:30–8:00
- **01 — Title (0:20).** *(Waves background — flashy moment 1.)* `Prompt Monkeys`.
- **02 — "Are you a prompt monkey?" (0:50).** Typing requests like Google searches, grabbing the first answer, blaming the model when it's mid.
- **03 — Reframe (0:30).** Knowing the tools exist isn't the skill. What you do with them is.
- **04 — Don't dump context, curate it (0:45).** "More is better" is backwards; models get worse with noise. Tight, relevant context wins.
- **05 — Show, don't negate (0:45).** Telling it what *not* to do half-works at best. Show the good example instead of banning the bad one.
- **06 — The attention U-curve (0:45).** Models attend most to the start and end, least to the middle. Sandwich your hardest constraint.
- **07 — Resist the yes-man (0:45).** Models agree with however you frame the question. Ask it to critique, not confirm.
- **08 — The toolkit (1:00).** *(Bento grid — flashy moment 3.)* different models for different tasks · escape hatch for low confidence · make it ask before it acts · explore before you commit · wrap extra context in tags · make it improve its own prompt · chain it into steps · know when to start a fresh thread.
- **09 — Live: Prompt Makeover (1:30).** *(Terminal typewriter + diff — flashy moment 2.)* Take a prompt from the room, fix it live stacking several techniques. Keep a backup prompt ready.

### Transition into build time — ≈1:30
- **10 — Build something small (0:45).** *(Gradient cards + subtle 3D tilt — flashy moment 5.)* The ask: build *something*, however small — a **CLI tool**, a **locally-hosted web app**, or a **dev tool**. Each card shows a concrete example. Small and real beats big and imagined. Nothing here needs fullstack skills — that comes later in the season.
- **11 — If you get stuck (0:45).** The ladder, taught as normal process: (1) ask the model itself to explain/debug the error first; (2) flag a mentor — agree the signal now (raised hand / sticky note / breakout reaction); (3) simplify the idea, no shame. Success tonight = you improved one prompt and understand why. Nobody is expected to ship anything running.

≈13:00 total for session 1. Future sessions drop the welcome and run ~8:00. Per-slide timing goes in speaker notes.

---

## 7. API Haven demo — "Snap-to-Dashboard" (replaces ElevenLabs)

**Build and rehearse before the session. Present with a known-good test image as the safe path.**

Photo of handwritten numbers (napkin sketch, whiteboard, scribbled quarterlies) → vision-capable model reads it → structured data → clean dashboard in seconds.

- **Why it's right:** multimodal (the "API is a plug" lesson made visual); finance-native; messy→clean is high dopamine; runs entirely on the reachable stack so it can't be blocked.
- **Stack:** `Streamlit` + internal vision model via KMAI/Azure + optional `Supabase`.
- **Teaching beat:** show the flow `photo → model reads it → structured JSON → chart`. "You didn't build the eyes. You borrowed them through a plug. That's an API."
- **Backup (text-only, bulletproof):** "Earnings Brief" — paste a transcript/10-K excerpt → one-page brief + extracted metrics. Same stack, same lesson.
- **On screen:** synthetic / public numbers only.

> **Confirm before building:** that KMAI/Azure exposes a callable **vision-capable** endpoint your Streamlit app can hit. Copilot Studio availability implies Azure OpenAI access — verify the vision modality. If text-only, default to Earnings Brief.

---

## 8. Build checklist for Claude Code

1. Save the four pasted React components into `/components-source` for reference.
2. Build `shared/theme.css` (tokens + the 11 base components) and `components.html`. Eyeball each light + dark.
3. Port the four components to vanilla JS/CSS in `/shared/js`, **recolored to TD tokens** (no blue/purple/amber/slate left). Strip cursor-tracking from Waves. Combine GradientCard + 3D tilt for the build cards.
4. Build the two pure-CSS flashy pieces (bento grid, animated timeline) from tokens. Static fallbacks for `prefers-reduced-motion` and PDF on all five moments.
5. Build `overview.html` (Section 5). Verify chips list only reachable tools.
6. Build `prompt-monkeys.html` (Section 6) with timing in speaker notes — welcome, talk, transition.
7. **Run `bundle.mjs`** on both decks → one self-contained `.html` each. Verify by copying only that file to another machine, offline.
8. `README.md`: how to present, re-run the bundle, export PDF, switch light/dark.
9. Separately, scaffold the Snap-to-Dashboard Streamlit app (Section 7) and rehearse.

**Component status:** Waves, TypewriterEffect, GradientCard, 3D tilt — all received, port + recolor. Bento + timeline — build from tokens. Nothing left to source.

**Standing rules everywhere:** footer micro-text on every slide; one loud data-rule reminder on the overview CTA and the Prompt Monkeys closer. Never real TD data in external tools. And: zero slop — every line earns its place.