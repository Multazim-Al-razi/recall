# Illustrations Asset Directory

All illustration SVGs used by Recall, organized by source library.

## Quick Start

Before adding any illustration, read `.skills/context.json` for project context, then follow the decision framework in `AGENTS.md`.

## Library Inventory

| Library | Directory | License | Attribution | Style | Recall Fit |
|---------|-----------|---------|-------------|-------|------------|
| [unDraw](https://undraw.co) | `undraw/` | MIT | No | Flat vector | **9.4** ⭐ |
| [ManyPixels](https://manypixels.co) | — | Free | No | Flat/isometric | **8.0** |
| [Streamline](https://streamlinehq.com) | — | CC BY 4.0 | **Yes** | Clean flat | **7.8** |
| [Humaaans](https://humaaans.com) | — | CC0 | No | Mix-and-match people | **7.8** |
| [Open Peeps](https://openpeeps.com) | `open-peeps/` | CC0 | No | Hand-drawn people | **7.6** |
| [IRA Design](https://iradesign.io) | — | Free | No | Gradient | **7.6** |
| [Fresh Folk](https://freshfolk.com) | — | Free | No | Diverse characters | **7.4** |
| [Blush Design](https://blush.design) | — | Free | **Yes** | Artist-illustrated | **7.4** |
| [DrawKit](https://drawkit.io) | — | MIT | No | Hand-illustrated | **7.4** |
| [illlustrations.co](https://illlustrations.co) | — | MIT | No | Everyday scenes | **7.0** |
| [Storyset](https://storyset.com) | `storyset/` | Free | **Yes** | Character-rich Pana | **6.8** |
| [Avataaars](https://avataaars.com) | — | MIT | No | Avatar generator | **6.8** |
| [Icons8 Ouch!](https://icons8.com/illustrations) | — | Free | **Yes** | Multi-style | **6.6** |
| [Reshot](https://reshot.com) | — | Free | No | Clean minimal | **6.6** |
| [Lukasz Adam](https://lukaszadam.com) | `lukasz-adam/` | CC0 | No | Simple minimal | **6.4** |
| [Bigheads](https://bigheads.io) | — | MIT | No | Character generator | **6.2** |
| [Bottts](https://bottts.com) | — | CC0 | No | Robot avatars | **5.6** |
| [Open Doodles](https://opendoodles.com) | — | CC0 | No | Sketchy hand-drawn | **5.4** |

Libraries marked `—` in Directory have no assets on disk yet. Create the directory under `undraw/` or `storyset/` (or a new library directory) when downloading.

## Semantic Slot → File Mapping

Components request illustrations by **intent**, never by filename. The registry lives in `src/lib/visuals.ts`.

| Slot | File | Library | Used In |
|------|------|---------|---------|
| `hero` | `undraw/revenue-analysis_fjh2.svg` | unDraw | Dashboard hero |
| `emptyAdd` | `undraw/drag-to-add_8zdg.svg` | unDraw | Empty state / add cells |
| `entertainment` | `undraw/video-tutorial_ly8k.svg` | unDraw | Entertainment category |
| `music` | `undraw/dancing_lvv0.svg` | unDraw | Music category |
| `cloud` | `undraw/device-sync_d9ei.svg` | unDraw | Cloud category |
| `fitness` | `undraw/fitness-stats_bd09.svg` | unDraw | Fitness category |
| `welcome` | `storyset/potted-plants-pana.svg` | Storyset | Onboarding welcome |
| `pricing` | `storyset/e-wallet-pana.svg` | Storyset | Pricing page |
| `empty` | `storyset/strelitzia-plant-pana.svg` | Storyset | Generic empty state |
| `profile` | `storyset/messy-bun-pana.svg` | Storyset | Profile / account |
| `profileAlt` | `open-peeps/peep-15.svg` | Open Peeps | Profile alternative |
| `welcomeAlt` | `open-peeps/peep-standing-1.svg` | Open Peeps | Welcome alternative |
| `faqAlt` | `open-peeps/peep-17.svg` | Open Peeps | FAQ alternative |
| `notification` | `lukasz-adam/notification_woman.svg` | Lukasz Adam | Notifications |
| `emptyAlt` | `lukasz-adam/cactus.svg` | Lukasz Adam | Empty state alternative |
| `goal` | `lukasz-adam/goal.svg` | Lukasz Adam | Savings goals |
| `success` | `lukasz-adam/success_illustration.svg` | Lukasz Adam | Success states |
| `settings` | `lukasz-adam/tools.svg` | Lukasz Adam | Settings page |
| `heroAlt` | `lukasz-adam/relaxing.svg` | Lukasz Adam | Hero alternative |
| `pricingAlt` | `lukasz-adam/sale.svg` | Lukasz Adam | Pricing alternative |
| `aboutAlt` | `lukasz-adam/hero-illustration.svg` | Lukasz Adam | About alternative |
| `cloudAlt` | `lukasz-adam/website_work.svg` | Lukasz Adam | Cloud alternative |

## How to Add a New Illustration

1. **Read context.json** — understand Recall's brand, tone, and constraints
2. **Score libraries** — run `node scripts/score-library.mjs --all` or check `.skills/<lib>/library.json`
3. **Search within library** — look for illustrations matching the slot's `subjectMatter`
4. **Validate fit** — check style, color, tone, subject against constraints
5. **Download** — use `scripts/download-svg.mjs` (handles dedup, optimize, catalog)
6. **Register slot** — use `scripts/add-slot.mjs` or edit `src/lib/visuals.ts`
7. **Verify credit** — if attribution required, ensure entry in `src/lib/credits.ts`
8. **Build check** — run `npx tsc --noEmit`

## Naming Convention

All SVGs use **lowercase-kebab-case** with no spaces:

```
library-name/illustration-name-style.svg
```

## Deduplication

Each asset is tracked by its **SHA-256 content hash** in `scripts/manifest.json`. The download script checks for duplicates automatically.

## License Compliance

- **No-attribution libraries** (unDraw, Humaaans, Open Peeps, etc.): safe to use. Listed in `credits.ts` for transparency.
- **Attribution-required libraries** (Storyset, Streamline, Blush Design): must have a credit entry in `credits.ts` before shipping.
- Never hot-link illustration CDNs in production. Always bundle the SVG.
