# Recall — Design System

> A warm, editorial design language inspired by Airbnb's consumer marketplace aesthetic, adapted for subscription intelligence.

## 1. Visual Identity

### 1.1 Design Principles
- **Warm over cold** — `#f5f0eb` off-white canvas, not sterile pure white
- **Soft shapes** — 20px card radii, pill-shaped buttons (9999px), no hard corners
- **Photography-led** — brand icons and illustrations carry visual weight, not typography
- **Single accent** — Rausch `#d4443a` carries every CTA, alert, and brand moment
- **Editorial density** — bento grid with asymmetric cells, not generic card rows

### 1.2 Color Palette

```css
--canvas: #f5f0eb;          /* page background — warm paper */
--surface: #fffdf9;          /* card background — slightly warm white */
--ink: #1a1a1a;              /* primary text — near-black */
--muted: #999999;            /* secondary text */
--hairline: rgba(26,26,26,0.04); /* subtle borders */
--rausch: #d4443a;           /* primary accent — all CTAs */
--rausch-hover: #c23a31;     /* hover state */
--rausch-glow: rgba(212,68,58,0.12); /* highlight underline */
--success: #28a745;          /* positive trends */
--warning: #b8860b;          /* trial ending soon */
--dark: #1a1a1a;             /* insight card background */
```

### 1.3 Typography

**Font:** Inter (Google Fonts) — closest open-source match to Airbnb Cereal VF

| Token | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| display-xl | 54px | 300 | 1.05 | Hero headline |
| display-lg | 42px | 300 | 1.1 | Page headers |
| display-md | 30px | 300 | 1.2 | Section headers |
| stat-value | 48px | 300 | 1 | KPI numbers |
| title | 16px | 600 | 1.25 | Card titles |
| body | 14px | 400 | 1.43 | Body text |
| caption | 13px | 400 | 1.3 | Meta text |
| label | 10px | 700 | 1.25 | Uppercase labels |
| button | 15px | 600 | 1.25 | Button text |

### 1.4 Spacing

Base unit: 4px. Scale: 4, 8, 12, 14, 16, 20, 24, 28, 32, 36, 48, 64.

Section padding: 64px vertical. Card padding: 28px. Card gap: 14px.

### 1.5 Border Radius

Defined in `frontend/src/index.css` as Tailwind CSS `@theme` tokens. Components use the token classes rather than hard-coded values.

| Token | Value | Tailwind Class | Use |
|---|---|---|---|
| sm | 8px | `rounded-sm` | Icon chips, input fields, small containers |
| md | 14px | `rounded-md` | Form inputs, nav items, plan selection buttons |
| lg | 16px | `rounded-lg` | KPI tiles, alert banners, list items, compact cards |
| xl | 20px | `rounded-xl` | Surface cards, modals, sections, empty states |
| pill | 9999px | `rounded-full` | Buttons, badges, nav, filter pills |

## 2. Component Library

### 2.1 Navigation

**Floating Pill Nav** — `position: fixed`, centered horizontally, `top: 20px`.
- Background: `rgba(255,253,249,0.72)` + `backdrop-filter: blur(24px) saturate(1.4)`
- Border: `1px solid rgba(26,26,26,0.06)`
- Shadow: `0 2px 16px rgba(0,0,0,0.06)`
- Radius: 9999px
- Height: 52px, padding: 8px 10px
- Logo left, links center (pill-shaped active state), avatar right

### 2.2 Cards

**Bento Cell** — the primary container.
- Background: `#fffdf9`
- Border: `1px solid rgba(26,26,26,0.04)`
- Radius: 20px
- Padding: 28px
- Hover: `translateY(-2px)` + `box-shadow: 0 12px 40px rgba(26,26,26,0.05)`

### 2.3 Subscription Card

- Brand icon in 56x56px rounded square (14px radius) with tinted gradient bg
- Name (16px/600), meta (13px/muted), renewal date (11px/muted)
- Footer: price (15px/600) + cancel action link (11px/Rausch)

### 2.4 Alert Banner

- Dark background (`#1a1a1a`), 16px radius
- Pulsing Rausch dot animation
- Dismissible

### 2.5 Renewal Timeline

- Date column (60px): day number (22px/700) + month abbreviation (10px/uppercase)
- Colored dot: Rausch for urgent (48h), muted for later
- Name + amount inline
- Cancel action link right-aligned

### 2.6 Donut Chart

- Pure SVG — `stroke-dasharray` technique, no chart library
- Center label: total amount (26px/700) + "/month" (10px/uppercase)
- Legend: dot + name + amount, separated by hairline borders

## 3. Illustration System

### 3.1 UnDraw (Decorative)
- Hero section: `revenue-analysis` illustration
- Empty states: `searching-everywhere`, `drag-to-add`
- Color-matched to `#d4443a` Rausch accent
- Used sparingly — hero, empty states, error pages only

### 3.2 Simple Icons (Brand)
- Provider logos: Netflix, Spotify, Apple, Peloton, etc.
- Rendered at 24-28px inside tinted containers
- Each icon gets a category-appropriate gradient background

## 4. Layout System

### 4.1 Bento Grid
- 12-column CSS Grid
- Gap: 14px
- Max width: 1280px, centered with 48px side padding
- Asymmetric cell spans: stats (span 4), cards (span 3), chart (span 5), list (span 7)

### 4.2 Responsive Breakpoints

| Name | Width | Changes |
|---|---|---|
| Mobile | < 744px | Single column, nav collapses |
| Tablet | 744-1128px | 2-column grid, reduced padding |
| Desktop | 1128-1440px | Full bento layout |
| Wide | > 1440px | Content caps at 1280px |

## 5. Animation

### 5.1 Page Transitions
- Framer Motion `AnimatePresence` with fade + subtle Y-slide
- Duration: 300ms, ease: `easeOut`

### 5.2 Micro-interactions
- Card hover: `translateY(-2px)` + shadow expansion (300ms)
- Button hover: `translateY(-2px)` + shadow glow
- Alert dot: pulse animation (2s infinite)
- Stat counters: number count-up on mount

### 5.3 Smooth Scrolling
- Lenis integration for buttery scroll behavior
- Parallax on hero illustration (subtle, 0.1x rate)

## 6. Mask & Section Breaks

Curved mask divider between sections:
```css
.mask::before {
  content: "";
  position: absolute;
  top: 0; left: -5%; right: -5%; bottom: 0;
  background: var(--canvas);
  border-radius: 0 0 50% 50% / 0 0 100% 100%;
}
```

## 7. Accessibility

- All interactive elements: minimum 44x44px touch target
- Color contrast: WCAG AA (4.5:1 minimum)
- Focus visible: 2px Rausch outline with 2px offset
- Screen reader: semantic HTML, ARIA labels on charts
- Keyboard navigation: full tab order through all interactive elements
