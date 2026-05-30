# Recall — Design Moodboard

> Inspiration scan of subscription-tracker UIs (sourced from Dribbble) translated
> into concrete direction for Recall. Pairs with [DESIGN.md](DESIGN.md) (the
> current system) and the Visual Chief playbook (`.kiro/steering/visual-chief.md`).

## How to read this

DESIGN.md describes what Recall *is* today. This file is a forward-looking
moodboard: what the best subscription trackers do, where Recall already nails it,
and the few high-leverage moves worth stealing. Nothing here changes code — it's
a reference for the next design pass.

## Reference scan

Pulled from leading "subscription tracker" shots on Dribbble. Palettes are the
real swatches published with each shot.

| Reference | Theme | Core palette | Takeaway |
|---|---|---|---|
| **Trackizer** — Artur Dziuła / JCD | Dark | `#09070C` bg · `#BA3329` red · `#457A87` teal | Independently lands on nearly Recall's exact red accent. Validates warm-red. |
| **SUBU** — AI budget tracker (Karolis) | Light | `#F6F6FA` bg · `#536EFD` indigo + `#7287FD`/`#96A4FD` tints | Soft-light fintech: one saturated accent over a near-white base, with a tint ramp. |
| **Personal Finance Tracker** — Built By Jul | Dark | `#121214` bg · `#73A8AB` sage · `#637B43` olive | Earthy, calm "money" palette — muted, not neon. Closest in spirit to Recall. |
| **SubTrack** — Parvathy S Kumar | Dark | `#020102` · `#B26EE0`/`#D78BFA` purple | The purple-gradient cliché. Listed as a **counter-example** — what to avoid. |

## Patterns that recur across the strong shots

1. **One dominant total.** A single oversized, light-weight spend numeral with a
   tiny uppercase label. Recall already does this (donut center, KPI tiles).
2. **Donut / ring for category split.** The default chart for this category — bar
   charts are rare. Recall's hand-rolled `DonutChart` is on-trend.
3. **Logo-forward service cards.** Real provider logos in tinted tiles drive the
   visual rhythm. Recall has this via Simple Icons + `CATEGORY_CONFIG` gradients.
4. **Upcoming-renewal timeline / calendar.** The second-most-common module. Recall
   has `RenewalTimeline`.
5. **Single bold accent over a neutral canvas.** Winners commit to one accent;
   losers spread many. Recall's Rausch-on-warm-canvas is exactly the winning move.

## Where Recall already aligns

- **Accent choice is validated.** Trackizer arriving at `#BA3329` next to Recall's
  Rausch `#d4443a` is strong external confirmation.
- **Calm over neon.** The earthy direction (Built By Jul) suits Recall's warm
  `#f5f0eb` canvas far better than the trending neon-purple look.
- **The right modules already exist** — KPI tiles, donut, renewal timeline,
  logo-forward cards. The structure matches what top shots ship.

## High-leverage moves worth stealing

These are the few things the strongest shots do that Recall doesn't yet. Each is
scoped to fit the existing architecture.

### 1. A "spend ring" hero moment

The best dashboards open with one oversized animated total — the ring fills and
the number counts up on load. Recall has the donut but treats it as a sidebar
widget.

- Promote the category ring to a hero on `DashboardView`, or add a count-up to the
  existing donut center using Framer Motion (`useMotionValue` + `animate`).
- Respect `prefers-reduced-motion` (already handled globally in `index.css`) — gate
  the count-up so reduced-motion users see the final value immediately.

### 2. Editorial number typography

Every reference pairs a distinctive display face with a neutral body font. Recall
uses Inter for everything. A display face on the big money numbers (KPI values,
donut total, analytics headline figures) would add the editorial polish the
warm/Airbnb tone is reaching for.

- Candidates that fit a calm, premium, financial tone: a humanist or
  slightly-condensed display (e.g. *Fraunces*, *Hanken Grotesk*, *Schibsted Grotesk*).
- Keep Inter for body/UI. Add a `--font-display` token in `@theme` alongside
  `--font-sans` so it's centralized.
- Per the design guidance, avoid converging on generic AI defaults — do **not**
  reach for Space Grotesk by reflex.

### 3. Logo-forward density on the dashboard

Strong shots use provider logos as the primary visual beat, not just an accent in
one card. Recall shows logos only on the four "Top subscriptions" cards.

- Add a compact logo row/marquee of all active providers near the top of the
  dashboard — instant "this is *my* stack" recognition.
- Reuse the existing Simple Icons pattern and `iconFailed` fallback from
  `SubscriptionCard.tsx`.

### 4. Status & urgency color language

References lean on a clear traffic-light system for renewals/trials. Recall has
`--color-success`/`--color-warning` and urgency logic (e.g. `TrialCard` red ≤ 5
days) but applies it unevenly.

- Standardize: Rausch = act now (≤ 2 days / at-limit), warning amber = soon
  (≤ 7 days), success green = healthy. Document the thresholds so every component
  uses the same cutoffs.

## Explicit anti-patterns (from the scan)

- **Purple gradients on near-black** (SubTrack) — the AI-slop default. Recall's
  warm canvas is a deliberate differentiator; keep it.
- **Multiple competing accents.** One accent (Rausch) over neutrals. Category
  colors stay confined to the donut/legend, not the whole chrome.
- **Bar charts for category split.** The donut is the idiom users expect here.
- **Decorative illustration on every card.** Already covered by the Visual Chief
  rule (at most one large illustration per view) — the scan reinforces it.

## Token-level starting points

If/when this gets implemented, these slot into the existing `@theme` block in
`src/index.css` without disturbing current tokens:

```css
/* Display face for money/headline numerals (body stays Inter) */
--font-display: "Fraunces", Georgia, serif;   /* pick during implementation */

/* Urgency scale — formalize existing usage */
--urgency-now:    var(--color-rausch);   /* <= 2 days / at limit */
--urgency-soon:   var(--color-warning);  /* <= 7 days */
--urgency-ok:     var(--color-success);  /* healthy */
```

## Out of scope

This moodboard is direction only. No component, token, or dependency has been
changed. Implementation should go through the normal flow (and the Visual Chief
playbook for anything touching illustrations/icons).
