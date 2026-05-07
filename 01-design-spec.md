# Ieva's World — Design Spec

Editorial portfolio for Ieva Kirdaikytė, UX/UI designer, Zürich. Inspired by [marimba.design](https://marimba.design) but its own thing — same restraint, more concrete narrative arc, scroll-driven motion as the spine of the page.

> **Note (2026-05):** Direction adjusted. We're staying closer to the Claude Design output we landed on (deep olive hero with letter-reveal, marquee disciplines strip, pinned scenes for statement and process, pinned card-swap for work, pinned about teaser, full-bleed contact). The goal now is to make that exact composition **nicer and more consistent** rather than rebuilding from marimba reference. Source of truth for visuals lives in `site/index.html`, `site/styles.css`, `site/scripts.js`.

## Vibe in one sentence

Editorial, calm, slightly nostalgic — like a high-end print magazine that happens to live on the web. Big serif italic display type doing all the heavy lifting; sans-serif kept small and quiet for navigation and metadata.

## Color palette

| Token | Hex | Use |
|-------|-----|-----|
| `--cream` | `#F0EFE9` | Primary light bg (statement, work, side projects) |
| `--cream-soft` | `#F1F0EA` | Statement scene bg, side-projects bg |
| `--olive` | `#3A4A16` | Body text on cream, mid sections |
| `--olive-deep` | `#212E02` | Hero, process, about, contact backgrounds |
| `--muted` | `#8F8F8E` | Tertiary text, captions, work progress |

Two backgrounds, one ink. Cream and deep olive trade places between sections — the whole site is a slow rhythm of light → dark → light.

## Typography

Both fonts are free on Google Fonts.

| Role | Font | Notes |
|------|------|-------|
| Display + body | **Instrument Serif** | Used everywhere except UI labels. Italic at display sizes, weight 400. |
| UI / nav / metadata | **Jost** | Geometric sans, kept small (~10–14px). Weights 300/400/500. |

- **Hero display:** `clamp(4rem, 12vw, 11rem)`, italic, weight 400, line-height 0.95, letter-spacing -0.025em
- **Body editorial:** `clamp(1.25rem, 1.8vw, 1.7rem)`, weight 400, line-height 1.58 — body copy is unusually large. That's the editorial trick. Don't shrink to 16px.
- **Eyebrow:** Jost, 0.68rem, uppercase, letter-spacing 0.18em, opacity 0.5

```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />
```

## Layout system

- **4-column grid** with subtle vertical hairlines on cream sections (`rgba(58,74,22,.08)`) and dark sections (`rgba(240,239,233,.055)`). Signature detail.
- Generous vertical rhythm — most sections are roughly viewport-height; pinned scenes are 150–170vh of scroll room.
- Content max-width ~1100px on desktop.
- Mobile (<700px): collapse two-column grids to one, drop horizontal padding to 1.5rem, hide side nav and location pin (<640px).

## Persistent UI

- **Logo:** top-left, two stacked words ("ieva's" / "world" with indent), Instrument Serif italic, `mix-blend-mode: difference` so it stays legible over both light and dark sections.
- **Side nav:** sticky right edge, vertically centred, Jost uppercase 0.68rem, list: Home / Work / About / Contact. Active item gets `•` bullet. Same blend-mode trick.
- **Location pin:** bottom-left, "Zürich, CH" in Jost uppercase 0.68rem, muted.
- Side nav + location pin hidden below 640px.

## Page architecture (Home)

The home page is the whole site for now — case studies and About link out from here.

1. **Hero** — full-viewport deep-olive, "ieva's / world" rendered as individual letters. Letters start near-invisible (olive on olive); they light up to cream as you scroll past. Subtitle "UX/UI Designer · Zürich". Scroll cue bottom-right.
2. **Disciplines marquee** — cream band, infinite horizontal scroll: *Interaction design · UI/UX · Visual design · Research*. Pauses on hover. Big italic serif type.
3. **Statement scene (pinned, 170vh)** — cream-soft background that fades to deep olive as you scroll out. Single italic sentence ("Designing products that feel obvious — one decision at a time."), drifts in with blur, holds, drifts out. Decorative spinning stars in scene-accent colors (orange, blue-purple, mauve, olive).
4. **Process scene (pinned, 170vh)** — deep olive. Eyebrow "Process" + heading "How I work". Left column: short body paragraph. Right column: four colored ovals (Listen & define / Strategy & plan / Design & refine / Build & test) that start spread apart and stack tight as you scroll. Background fades back to cream on exit.
5. **Featured work (pinned, 500vh)** — cream. Four projects swap one-after-another in the same centered slot; alternating left/right thumb placement. Bottom-right shows "0X / 04" progress. Project blocks: eyebrow, big italic title, body description, "View case study" pill, gradient thumb with accent glow. Background fades to olive at the end.
6. **About teaser (pinned, 150vh)** — olive. Two-column: bio + "More about me" pill on the left, testimonial pull-quote on the right.
7. **Side projects** — cream-soft band. Eyebrow + italic heading "Illustrations & side projects" + "View collection" pill.
8. **Contact** — full-bleed olive deep. Eyebrow "Contact", massive italic "Let's work together", short copy, pill row (Email / LinkedIn / Behance), footer baseline (copyright + signature). Oversized "hello" watermark behind.

## Animation principles

- **Pinned scenes** drive the spine: each scene has a fade-in (0–25/30%), a hold, and a fade-out (70–100%). Content gets opacity + blur + y-translate; backgrounds cross-fade between cream and olive.
- **Reveal-on-scroll** for non-pinned blocks: opacity 0→1, y 30→0, 0.85–0.9s, easing `cubic-bezier(.16, 1, .3, 1)`. Triggered at 12% threshold via IntersectionObserver.
- **Hero letter-reveal** is the signature opener — drives off scroll progress through the hero.
- **Slow, hand-tuned easing** — never bouncy or springy. No hover-glitch, no scale-on-hover. Pills fill from transparent to filled on hover, 400ms ease-out.
- **Decorative stars** (statement and work scenes) spin slowly and parallax on scroll. Reduced-motion users get none of this.

## What's distinctly Ieva

- **Mochi corner** — a small Dalmatian illustration or photo somewhere on About, as a personal flourish.
- **Star palette** — the orange/blue-purple/mauve/olive accents in the decorative stars echo the four process-oval colours. This thread runs through statement and work scenes.
- **Geo tag** — the "Zürich, CH" location pin in the bottom-left of every screen is part of the personality.
- **EN/LT toggle (optional)** — micro-detail for later. Out of scope for v1.

## Tech stack

- **Vanilla HTML + CSS + JS**, three files in `site/` — zero build step, zero framework.
  - `site/index.html` — markup only
  - `site/styles.css` — all visual tokens and component styles
  - `site/scripts.js` — data (projects, ovals), DOM construction, scroll drivers, IntersectionObservers
- Google Fonts via CDN. No bundler. No npm. Open the file in a browser, edit it in Cursor, refresh.
- Deployable to GitHub Pages as-is — push the `site/` folder (or set Pages to serve from root with `site/index.html` as entry).
- Reduced-motion + responsive (≥640 / ≥900) handled in CSS.

This keeps the site simple enough to maintain forever, fast enough to score 95+ on Lighthouse, and easy to push from Cursor → GitHub → live.

## Editing pointers

- **Project copy:** edit the `PROJECTS` array at the top of `site/scripts.js`.
- **Process oval labels:** edit the `OVALS` array at the top of `site/scripts.js`.
- **Section copy** (statement, process intro, about bio, testimonial, contact): edit `site/index.html` directly.
- **Colors / type sizes:** change tokens at the top of `site/styles.css` (`:root`).
- **Animation timings:** scroll-driver constants live inside the relevant function in `site/scripts.js` (`onPinnedScroll`, `onWorkScroll`, etc.).
