# 04 — UI/UX Brief

Direction: the structure and voice of reinostudio.com.br, reimagined in light. Few elements, each one large. Monochrome. Statements instead of decoration.

Reference copy: `D:\Development\WEb-download\reinostudio.com.br`. We borrow its system (type, scale, palette, section rhythm), not its content or assets.

## What we take from the reference

| Reference | Here |
|-----------|------|
| Dark charcoal hero with a giant two-line statement | Light grey hero, same statement scale, charcoal ink |
| Work slider with circle-dot controls straddling the hero edge | Selected-work slider: charcoal cards with the outcome as the visual |
| Giant statement followed by two columns of body copy | About |
| Giant uppercase service lines with inline pill images | Capability lines with inline pills holding CV figures |
| Monochrome client logo grid | Employer wordmarks set in type (no logo files) |
| Black pill button with arrow | Same |
| Logo plus menu button, full-screen menu with 68px links | Same, on a light surface |
| Black footer with large nav | Light grey footer with large nav |

## Tokens (light only — no dark mode, no theme switch)

| Token | Value | Use |
|-------|-------|-----|
| `--m-paper` | `#ffffff` | Page |
| `--m-surface` | `#f5f5f5` | Hero, footer, menu, inputs |
| `--m-ink` | `#2b2f31` | Headings, text, dark cards |
| `--m-ink-2` | `#393c3e` | Hover on dark surfaces |
| `--m-black` | `#000000` | Buttons |
| `--m-muted` | `#666b6e` | Secondary text (4.5:1 or better on white and on `--m-surface`) |
| `--m-quiet` | `#8f9497` | Large pale type only: company names, second word of a title (3:1 on white) |
| `--m-line` | `#e0e0e0` | Rules, borders |
| `--m-faint` | `#bdbdbd` | Placeholder marks, inactive dots |

## Typography

| Role | Family | Size | Weight | Tracking |
|------|--------|------|--------|----------|
| Hero statement | Poppins | `clamp(2.1rem, 5vw, 4.25rem)`, line-height 1.1 | 600 | -0.055em |
| Carousel result | Poppins | `clamp(1.7rem, 4.4vw, 3.6rem)`, line-height 1.08 | 600 | -0.055em |
| Section statement (h2) | Poppins | `clamp(2rem, 5vw, 4rem)`, line-height 1.12 | 600 | -0.05em |
| Capability lines | Poppins, uppercase | `clamp(1.9rem, 6vw, 5rem)` | 500 | -0.03em |
| Item title (h3) | Poppins | 1.25–1.5rem | 600 | -0.03em |
| Body | Inter | 1rem–1.0625rem, line-height 1.55 | 400 | -0.02em |
| Label | Inter | 0.875rem | 500 | 0 |

Fonts load from Google Fonts: Poppins 500 and 600, Inter 400 and 500.

## Layout

- Content width 1360px, side padding 54px (20px under 760px).
- Section spacing 144px desktop, 80px mobile.
- Radius: 999px pills and buttons, 20px cards, 12px inputs.

## Components

Hand-written CSS in `client/src/minimal.css`. No component library on the main site.

## Motion

- Hero lines rise and fade in on load.
- Menu links rise in, staggered.
- **Lens** (from the reference's `.layer-back` mask): hovering a statement opens a circle at the cursor that shows an inverted layer (charcoal ground, white type) with alternate copy. Used on the hero statement (440px) and the contact statement (260px) only. Built with a CSS radial mask and a pointer handler in `components/site/Lens.tsx`.
- **Line flip** (from the reference's `.item-back`): hovering a capability line opens a charcoal panel from the centre line with the supporting detail.
- Lens and flip run only on devices with hover and a fine pointer. Touch devices see the front layer; no information is lens-only except alternate headline copy.
- No scroll-triggered animation in this phase (tried CSS scroll-driven reveal; it made rendering unreliable in the preview).
- Hover: arrow shift, colour change, 200ms.
- **Travel theme** (`/bucket-list` and below): parchment `#ead9b0` with generated grain and foxing, ink `#38281a`, one red `#a6221e`; headings and map lettering in IM Fell English, body text stays Inter. The map (`components/site/ExpeditionMap.tsx`, canvas 2D) has an engraved shoreline, graticule, compass rose, sea names, hand-drawn X marks and dashed red routes that draw themselves on arrival. Journal photos are sepia prints with tape, turning to colour on hover. Wax seal presses on at first discovery.
- **Travel stories**: cover photo fills the first screen with the place name at up to 11rem; city cards are 4:5 photos; the photo story is a loose two-column grid. Hovering a pin shows a 220px preview card above it. The clicked photo and the next page's cover share a `view-transition-name`, so the browser morphs one into the other (620ms).
- All motion off under `prefers-reduced-motion: reduce`.

## Voice

First person, plain, specific. Numbers only from the CV. No emoji.

## Accessibility floor

WCAG 2.2 AA contrast, visible focus ring, 44px touch targets, labels on every input, menu closes on Escape, `aria-live` on chat messages.
