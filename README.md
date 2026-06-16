# TD Builders Club — slide decks

HTML decks for the TD Builders Club sessions at 66 Wellington. Self-contained, vendored, offline-safe — they present from a single HTML file with no build step and no external network calls on presentation day (Inter and JetBrains Mono are loaded via Google Fonts as a fallback when reachable; TD Graphik resolves locally).

```
/td-builders-club
  shared/
    theme.css            ← entire design system (tokens + 11 components)
    deck.js              ← keyboard nav, speaker notes, theme toggle, print
    components.html      ← QA gallery — one sample of every component
    vendor/lucide.min.js ← vendored icon set
    fonts/               ← drop TD Graphik woff2 here (see "Fonts")
  overview.html          ← Deck 1 — initiative overview (14 slides)
  prompt-monkeys.html    ← Deck 2 — S01 Prompt Monkeys (11 slides, ~8 min)
  visual targets/        ← the source-of-truth visual references the design was tuned to
  td-builders-club-deck-spec.md
  README.md
```

## Present

Open `overview.html` or `prompt-monkeys.html` in any modern browser. No server needed — `file://` works.

| Key | Action |
| --- | --- |
| `→` `Space` `PgDn` | next slide |
| `←` `PgUp` | previous slide |
| `Home` / `End` | first / last slide |
| `S` | toggle speaker notes overlay |
| `D` | toggle light / dark theme (persisted) |
| `F` | toggle fullscreen |
| `P` | print → PDF export |
| `#5` in URL | deep-link to slide 5 |

Click the left / right edges of the slide to navigate by mouse.

## Export to PDF

1. Open the deck in Chrome.
2. Hit `P` (or `⌘P` / `Ctrl+P`).
3. Destination → **Save as PDF**. Layout → **Landscape**. Margins → **None**. Paper size → **Custom 1920×1080** if available, otherwise **A4 Landscape**.
4. Background graphics **on** (the blueprint grid + footer rule rely on it).
5. Save.

The print stylesheet renders every slide on its own page at 1920×1080 with the HUD and notes hidden.

## Light / dark

Press `D` while presenting, or open the deck with `?theme=dark` and hit `D` once. The choice persists per-browser. Dark is a deep TD-green-tinted charcoal (not pure black) — designed for screen-share punch.

## Fonts

`TD Graphik` is loaded via `local()` `@font-face` declarations at weights 300/350/400/500/600. If the face is installed on the presenting machine — including via TD's standard image — slides render in Graphik. Otherwise the deck falls back to **Inter** (loaded from Google Fonts when online; system sans otherwise). The stack is identical so layouts don't shift.

**To ship Graphik with the deck on a locked-down machine:** drop the `.woff2` files into `shared/fonts/` and append `url()` sources to each `@font-face` rule in `shared/theme.css`. Source the licensed files from TD's brand portal — don't substitute a free Graphik lookalike.

`JetBrains Mono` is loaded via the same Google Fonts import with a system-mono fallback.

## QA the components

Open `shared/components.html` to see one sample of each of the 11 components from the spec (§3) on a single scrollable page. Use the **Toggle dark** button (top right) to eyeball both themes.

## The standing rule

> **Synthetic or public data only. Never real TD data in external tools.**

Baked into the footer of every slide. Said loud, once, on the overview CTA and the Prompt Monkeys closer.
