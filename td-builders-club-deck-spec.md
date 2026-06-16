# TD Builders Club — Slide Deck Build Spec

**Purpose:** A single source of truth for building two visually-consistent slide decks in Claude Code:
1. **Overview Deck** — pitches the initiative + walks the 8 sessions (one slide each).
2. **Prompt Monkeys Deck** — Session 1, a tight 7–8 min talk on prompt engineering + context management.

Both decks import the **same shared design system** so they read as one product, not two one-offs.

> **How to use this doc with Claude Code:** Build the shared system first (Section 2), confirm a sample slide renders, then build Deck 1 and Deck 2 against it. Treat the slide-by-slide content (Sections 4–5) as the script; tune copy as you go but keep the structure.

---

## 1. Tech & build approach

**Recommended: reveal.js** (single portable HTML per deck, CDN or vendored).
- Why: keyboard nav, built-in **speaker notes** (you'll be presenting), **PDF export** (so virtual/async attendees and breakout rooms get the deck), trivially themeable via one shared CSS file. Zero build step required to present.
- Alt if you'd rather author in markdown: **Slidev** (great DX, beautiful defaults, code highlighting). If you go this route, **export to a self-contained build + PDF** so presenting never depends on a live dev server or the TD network.

**Repo structure:**
```
/builders-club-decks
  /shared
    theme.css          # the entire design system (Section 2)
    components.html     # reference snippets for each layout (Section 3)
    fonts/              # vendored fonts (don't rely on Google Fonts being reachable)
  overview.html         # Deck 1
  prompt-monkeys.html   # Deck 2
  /assets               # screenshots, demo stills, logo
  README.md             # how to present + export to PDF
```

**Hard requirements:**
- **Vendor the fonts and reveal.js locally** — do not assume CDNs are reachable from a TD machine on presentation day.
- Every deck must **export cleanly to PDF** (test this, the grid/footer often break in print).
- 16:9, design at **1920×1080**, big type (it's projected + screen-shared).

---

## 2. Shared design system

### Direction: "Build Log" (on TD brand)
A workbench / engineering-notebook aesthetic — it grounds the club in the *builder* world (drafting, iteration, shipping) while staying clean enough for a bank. **Color is now locked to TD's official palette**, so we spend the design boldness on **typography and structure**, not color. The personality lives in three places: **monospace as a co-lead typeface** (eyebrows, session numbers, all prompt/code blocks), a faint **blueprint grid**, and the numbered **log-entry** framing — earned, because the sessions are a real weekly sequence.

The deliberate tension *is* the brand: buttoned-up TD Graphik against scrappy raw monospace — corporate bank × scrappy builder. TD's **dark green** carries structure, **light green** does soft tints, **orange** is the energy signal, **grey** is the paper. Bright **TD green** is a punchy active highlight used sparingly, so it never reads as a logo splash.

Tokens are **role-based** (so they stay meaningful across light/dark) and map directly to the Power Fx brand variables you already use across Power Platform.

### Color tokens (primary — light, TD brand)
```css
:root {
  --paper:        #EFEDEE;  /* TD_Grey — base surface */
  --panel:        #FFFFFF;  /* cards / blocks */
  --ink:          #1A1A1A;  /* primary text */
  --ink-soft:     #5C5C5C;  /* secondary text */
  --line:         #D7D4D5;  /* hairlines + blueprint grid */
  --accent:       #1A5336;  /* TD_Dark_Green — structural brand thread */
  --accent-bright:#008A00;  /* TD_Green — punchy active highlight, sparingly */
  --tint:         #E5F1D4;  /* TD_Light_Green — soft fills, chips, "good" side */
  --signal:       #FF9500;  /* TD_Orange — energy: highlights, timers */
}
```

### Color tokens (dark alternate — for screen-share punch)
Deep TD-green-tinted charcoal, **not** pure black. Roles stay constant; only the values shift, and the bright green is lifted for contrast.
```css
:root[data-theme="dark"] {
  --paper:        #11211A;  /* deep green-charcoal base */
  --panel:        #1A3328;
  --ink:          #ECECE8;
  --ink-soft:     #9FB0A6;
  --line:         #2C4A3B;
  --accent:       #E5F1D4;  /* light green carries structure on dark */
  --accent-bright:#34B233;  /* TD green lifted for dark-bg contrast */
  --tint:         #1A5336;  /* dark green becomes the soft fill */
  --signal:       #FF9500;
}
```

### Typography
- **Display / body:** `TD Graphik` — the brand voice. Five weights given; map them:
  - `Graphik Semibold` → display + big statements (impact, projector-legible)
  - `Graphik Medium` → h1 / h2 / subheads
  - `Graphik Regular` → body
  - `Graphik Semilight` → large intro / lead lines (elegant at size)
  - `Graphik Light` → oversized hero numerals / quiet captions
- **Mono (co-lead, the signature):** `JetBrains Mono` — eyebrows, session numbers (`S01 / 08`), taglines, and every prompt/code block.

**Source the real TD Graphik files from TD's brand portal — it's a licensed face, don't substitute a free Graphik lookalike. Vendor both Graphik and JetBrains Mono locally so presentation day never depends on the network.**

Pairing rationale: Graphik is corporate-clean and legitimate; mono is raw and scrappy. The contrast between them *is* the club's identity — a bank that builds. Mono is personality, not a caption afterthought.

**Type scale (projected sizes, Graphik weights):**
```
display   88px / Semibold   (title, big statements)
h1        52px / Medium
h2        34px / Medium
lead      28px / Semilight  (intro lines)
body      24px / Regular
mono-eyebrow  18px / Mono Medium  uppercase, +0.08em tracking
caption   18px / Regular   --ink-soft
```

### Layout & motion
- Frame 1920×1080, **96px** outer margins, one idea per slide.
- Faint blueprint grid behind content (≈ `--line` at low opacity, ~48px cells). Keep it subtle — must survive a bad projector and PDF export.
- **Persistent footer** on every content slide (see component 10).
- **Icons:** one set only — [Lucide](https://lucide.dev), one weight, used sparingly (run-of-show steps, session markers). Vendor it; don't pull a grab-bag of icon packs.
- **Motion:** minimal and deliberate. One content reveal per slide on advance. The *one* signature flourish: a blinking mono cursor on taglines (`Build with it.▋`) — pure CSS, nothing else moves. Respect `prefers-reduced-motion`.

---

## 3. Reusable slide components

Define each once in `theme.css` + `components.html`. Both decks use only these.

1. **Title slide** — club wordmark, deck title in display, mono tagline, faint grid.
2. **Log-entry / section divider** — oversized mono number (`S03`) + display title. Used for session dividers and the overview's session cards.
3. **Statement slide** — one big display line, lots of negative space (e.g. *"Are you a prompt monkey?"*).
4. **Content slide** — mono eyebrow + h1 heading + ≤3 sparse supporting lines. No paragraphs.
5. **Session card** *(overview deck)* — standardized block: `Sxx / 08` · title · mono tagline · **You'll learn** (1 line) · **Tools** (chips) · **The hook** (1 line) · **Why it's fun** (1 line). Keep every field to one line — the card is a glance, not a doc.
6. **Split / Before-After** *(Prompt Monkeys)* — two equal columns with a center divider; left = "lazy", right = "engineered". `--accent` label + `--tint` fill on the good side.
7. **Prompt / code block** — the signature styled mono block (`--panel` bg, `--accent` left-border, soft inner padding). Used for prompts in Deck 2.
8. **Demo slide** — bordered "screen" frame for a screenshot/still + a one-line caption.
9. **Closing / CTA slide** — display call-to-action + where/when + sign-up line.
10. **Persistent footer** — left: `TD BUILDERS CLUB` (mono); center: session marker; right: the **standing data rule** as micro-text → `synthetic / public data only`. This bakes the safety rule into every single slide so it's omnipresent without a lecture.
11. **Tool chip** — small mono pill (`Streamlit`, `Supabase`, `Figma Make`…), `--accent` outline. Only ever lists **reachable** tools.

---

## 4. Deck 1 — Initiative Overview (slide-by-slide)

~14 slides. Goal: someone who's never heard of this gets *what it is, why it exists, and what 8 weeks look like* in one read-through.

- **01 — Title.** `TD Builders Club`. Tagline (mono): *"Stop watching AI happen. Build with it."* (or your preferred line.)
- **02 — The problem.** Three pain points, one line each:
  - AI anxiety: smart people feel left behind, the pressure to be "tapped in" never stops.
  - The gap: beginner Python → production code doesn't scale on its own. People need reps building real things.
  - FTEs especially: no assignments, no hackathons, no reason to build — so they don't.
- **03 — What it is.** Food and snacks in a room. A 7-minute skill drop, then you build a passion project with mentors floating. End by demoing if you want. *Come have fun, finally test that idea.*
- **04 — How a session runs.** Run-of-show: doors + floor open 15 min early (build while you arrive) → 7–8 min skill talk → build time with execs floating → optional demos for show-off + feedback. Virtual attendees in breakout rooms.
- **05 — The season.** The 8-week map as a numbered sequence (this is where the numbered log-entry motif pays off). Show the arc: *foundation → make it pretty → plug things in → safety → what's under the hood → make it work for you → ship it → hackathon.*
- **06 — S01 / Prompt Monkeys** *(session card)*
  - You'll learn: stop prompting like it's Google — context + structure.
  - Tools: your internal chat model / KMAI sandbox.
  - Hook: live "prompt makeover" — same task, lazy vs engineered.
  - Why it's fun: everyone secretly fears they're a prompt monkey. Instant before/after payoff.
- **07 — S02 / Eye Candy**
  - You'll learn: make things look good without "being creative."
  - Tools: `Figma Make`, `21st.dev`, `Hero UI`.
  - Hook: blank screen → polished UI in one session, using ready-made component libraries.
  - Why it's fun: pulls in the "I'm not creative" crowd; pure visual dopamine.
- **08 — S03 / API Haven**
  - You'll learn: an API is just a digital plug. Multimodal in plain terms.
  - Tools: `Streamlit`, internal vision model, `Supabase`.
  - Hook: **Snap-to-Dashboard** (Section 6) — handwritten numbers → live dashboard.
  - Why it's fun: "the AI can *see*" wow moment, and it's finance-native, not a party trick.
- **09 — S04 / Lies of Copilot** *(the AI Safety session — the vegetables)*
  - You'll learn: corporate survival — spot confident-wrong answers, data leaks, safe sandbox use.
  - Tools: KMAI sandbox; mostly conceptual.
  - Hook: catch the AI lying live (a confidently incorrect answer about something TD-specific).
  - Why it's fun: framed as a survival skill, not compliance training. A little spicy.
- **10 — S05 / We Have AI at Home**
  - You'll learn: LLM vs Fine-tuning vs RAG — and why "AI at home" (TD's own context) beats a generic wrapper.
  - Tools: internal models; RAG-on-internal-data concept.
  - Hook: *"Why doesn't the generic bot know our deal flow?"* → because nobody gave it the documents to read.
  - Why it's fun: the mom-meme title; finally explains the jargon everyone nods along to.
- **11 — S06 / Build an Intern**
  - You'll learn: make AI do work on a loop / schedule.
  - Tools: `Power Automate`, `Copilot Studio` (no-code agents).
  - Hook: an agent that watches a sheet/inbox and acts overnight.
  - Why it's fun: "work while you sleep" — speaks straight to the overworked banker.
- **12 — S07 / Fullstack Toolkit** *(the Holy Grail)*
  - You'll learn: turn a frontend into a real app that saves data and lives on the internet.
  - Tools: `Vercel`, `Streamlit`, `Supabase`.
  - Hook: deploy something with a real URL and a working database.
  - Why it's fun: the "my app is actually REAL" moment — and it arms you for the finale.
- **13 — S08 / Season Finale: The Hackathon**
  - 2 hours, sandbox open, snacks, high energy. Bring whatever you've been poking at and ship it. Demos to close the season.
  - Why it's fun: it feels like a real milestone, because it is.
- **14 — Closing / CTA.** When + where, how to join, and the standing rule once, loud: *build with synthetic or public data only — never real TD data in external tools.*

---

## 5. Deck 2 — Prompt Monkeys (slide-by-slide + timing)

Target **7–8 min**, ~11 slides, minimal words per slide (you talk, the slide anchors). Timings in parens.

- **01 — Title (0:30).** `Prompt Monkeys`. Mono tagline: *"You're better at this than you think. Probably."*
- **02 — Statement (1:00).** *"Are you a prompt monkey?"* Define it out loud: typing requests like Google searches, grabbing the first answer, blaming the model when it's mid.
- **03 — The gap (0:45).** Prompting is a skill with a skill ceiling. Most people are stuck on the floor. Here's what the ceiling looks like.
- **04 — Before / After (1:30)** *(split layout — the core payoff)*. Same task, two prompts. Left: lazy one-liner → generic output. Right: engineered prompt → sharp output. Let the delta land. *(Use a real, finance-flavored task — e.g. summarizing a memo or drafting a client note — with synthetic content.)*
- **05 — Lever 1: Context & role (0:45).** Tell it who it is and what it's working with. Prompt-block example.
- **06 — Lever 2: Show, don't tell (0:45).** One or two examples of what "good" looks like beats three paragraphs of instructions. (Few-shot, in plain terms.)
- **07 — Lever 3: Structure the output (0:30).** Ask for the exact format you want — table, bullets, JSON, a 3-line summary. You get what you specify.
- **08 — Lever 4: Iterate (0:30).** It's a conversation, not a vending machine. The second and third turn are where the value is.
- **09 — Context management — the real unlock (1:00).** The thing experts actually do: manage *what the model knows*. Feed it the right snippet, not the whole drive. Know when to start fresh vs keep going. (This is the bridge to S05 / RAG later — plant the seed.)
- **10 — Live: Prompt Makeover (1:00).** Take a lazy prompt from the room, fix it live applying the 4 levers + context. Highest-energy moment — keep a backup prompt ready in case the room's shy.
- **11 — The one rule + go build (0:30).** Synthetic/public data only. Then: *here's what to try in your build time today.* Launch them.

≈ 8:00 total. Put per-slide timing in the **speaker notes** so you can pace live.

---

## 6. API Haven demo — "Snap-to-Dashboard" (replaces ElevenLabs)

**Build this before the session and rehearse it. Present with a known-good test image as the safe path.**

**One-liner:** Take a phone photo of handwritten numbers (a napkin deal sketch, a whiteboard, scribbled quarterly figures) → the app reads it with a vision-capable model → extracts structured data → renders a clean interactive dashboard in seconds.

**Why it's the right replacement:**
- **Multimodal** (image in) — exactly the "APIs aren't scary, they're a plug" lesson, made visual.
- **Finance-native** — analysts live in scribbled numbers and whiteboards; this isn't a toy.
- **High dopamine** — messy handwriting → clean dashboard is a deeply satisfying transformation.
- **Won't be blocked** — built entirely on the reachable stack, no external consumer API.

**Stack (all reachable):** `Streamlit` front end · internal vision-capable model via the KMAI / Azure layer · optional `Supabase` to persist snapshots.

**The teaching beat (the slide):** show the conceptual flow in three steps — `photo → model reads it → structured JSON → chart`. The line: *"You didn't build the eyes. You borrowed them through a plug. That's an API."*

**Backup demo** (use if internal vision turns out not to be exposed): **"Earnings Brief"** — paste an earnings-call transcript or 10-K excerpt → one-page brief + extracted key metrics. Text-only, same stack, same "API is a plug" lesson, lower wow but bulletproof.

**Rule on screen:** synthetic / public numbers only.

> **Open item to confirm before building:** that the KMAI / Azure layer exposes a **callable vision-capable model endpoint** your Streamlit app can hit. Copilot Studio being available strongly implies Azure OpenAI access exists — but confirm the vision modality specifically. If it's text-only, default to the Earnings Brief backup.

---

## 7. Build checklist for Claude Code

1. Build `shared/theme.css` (all tokens + the 11 components) and `components.html`. Render one sample of **each** component; eyeball it light + dark.
2. Vendor fonts + reveal.js locally. Confirm PDF export keeps the grid + footer intact.
3. Build `overview.html` (Section 4). Verify every tool chip lists only reachable tools.
4. Build `prompt-monkeys.html` (Section 5) with per-slide timing in speaker notes.
5. Write `README.md`: how to present, how to export PDF, how to switch light/dark.
6. Separately, scaffold the **Snap-to-Dashboard** Streamlit app (Section 6) and rehearse it.

**Standing rules encoded everywhere:** footer micro-text on every slide; one loud reminder on the overview CTA and the Prompt Monkeys closer. Never real TD data in external tools.
