# Claude Design — opening prompt for Ieva's World

Paste this entire prompt into claude.ai/design as the first message. After it generates, we'll iterate page by page.

---

I want to build a personal portfolio website called **"Ieva's World"** for Ieva Kirdaikytė, a senior UX/UI designer based in Zürich. The site must closely match the editorial mood and motion design of [marimba.design](https://marimba.design) — calm, slow, scroll-driven, with hero letter-reveals and graceful sticky elements. Animation is the soul of this site, not a decoration.

## Tech

Single-file React component using Tailwind CSS for layout and a small amount of inline CSS for the gridlines and letter-reveal effect. Use **Framer Motion** for all scroll-driven animations. The result should be production-ready, deployable as a static site.

## Design system (use exactly these tokens)

**Colors**
- `--bg-cream`: #F0EFE9 (primary light bg)
- `--bg-cream-soft`: #F1F0EA
- `--bg-olive`: #3A4A16 (mid section bg + body text on cream)
- `--bg-olive-deep`: #212E02 (hero, deepest sections)
- `--text-cream`: #F0EFE9 (body text on dark)
- `--text-muted`: #8F8F8E

**Typography**
- Display + body: **Instrument Serif** (Google Fonts) — used for nearly everything
- UI labels + nav: **Jost** (Google Fonts) — kept small
- Hero display ~clamp(4rem, 12vw, 11rem), italic, weight 300, line-height 0.95, letter-spacing -0.025em
- Body paragraphs are unusually large: clamp(1.25rem, 1.8vw, 1.7rem) Instrument Serif weight 300 — this is the editorial trick, do not shrink it

**Layout**
- 4-column grid with subtle vertical hairline column lines (~rgba(58, 74, 22, 0.08), 1px)
- Generous vertical rhythm — sections are roughly viewport-height

## Persistent UI (sticky on every page)

1. **Logo top-left** — small, two stacked words, Instrument Serif italic:
   - line 1: "ieva's" (right-aligned)
   - line 2: "world" (right-aligned, indented)
   Use `mix-blend-mode: difference` and `filter: invert(1)` so the logo stays legible over both light and dark sections without color changes.
2. **Side nav right edge, vertically centered** — small Jost sans, list: Home / Work / About / Contact. Active item has a `•` bullet to its left. Same blend-mode trick.
3. **Tiny location pin bottom-left** — "Zürich, CH" in Jost uppercase 0.7rem, muted.

Hide side-nav and location pin on mobile (<640px).

## Animations (mandatory — these are the soul of the site)

### 1. Hero letter-reveal on scroll
Hero takes full viewport. Display text "ieva's / world" rendered as individual `<span>` letters. Each letter starts colored at the olive bg (~invisible). As the user scrolls past the hero, letters light up one at a time to cream — driven by a `useScroll` + `useTransform` mapping based on scroll progress through the hero section. Subtitle "UX/UI Designer" stays cream.

### 2. Reveal-on-scroll for every section
Use Framer Motion `whileInView` with `opacity: 0 → 1` and `y: 30 → 0`, `duration: 0.8`, `ease: [0.16, 1, 0.3, 1]`. Threshold: when section is 15% in view.

### 3. Sticky scroll-snap project cards on the work strip
Each of the 4 projects on the homepage takes ~90vh. As you scroll, the next project's content slides up while the current one's text sticks momentarily, creating a layered editorial feel.

### 4. Active section indicator in side nav
Side nav items get the `•` bullet based on which section is in viewport. Smooth transition (300ms).

### 5. Process diagram (homepage)
A "Practice" section with 4 stacked elliptical ovals (orange, green, mauve, blue) labeled "Listen & define / Strategy & plan / Design & refine / Build & test". The ovals start spread vertically and **stack into a tight column as the user scrolls** through the section. This is the marimba "fan out" effect in reverse. Use `useScroll` and `useTransform` on each oval's `y`.

### 6. Hover transitions
All buttons and links use 400ms ease-out color transitions. Pill buttons fill from transparent to olive on hover. NO bounce, no scale, no glitch effects.

## Pages

### `/` — Home
1. **Hero** (full-viewport, deep olive bg) — letter-reveal display "ieva's / world" + subtitle "UX/UI Designer".
2. **Disciplines strip** — small "PRACTICE" eyebrow on the left, then horizontal italic list: Interaction design / UI/UX / Visual design / Research.
3. **Practice statement** — single oversized italic sentence, centered, max 22ch wide: *"Designing products that feel obvious — one decision at a time."*
4. **Process ovals section** — see animation #5 above. Each oval has a label and a one-line description.
5. **Featured work** — 4 sticky-scroll projects (see content below). Each: project number ("01 / 04"), small eyebrow line ("2024 — Present · Lead UX/UI"), big italic project title, 2-line description, "View case study" pill button.
6. **Side projects** — small section pointing to /work/illustrations.
7. **About teaser** — olive bg, short bio, "More about me" pill.
8. **Footer / Let's work together** — full olive section, big italic "Let's work together", short copy, name + email + LinkedIn + Behance pills.

### `/work/[project]` — Case study pages
Layout per case study (see content below):
1. Eyebrow "Case study" + big italic project title + subtitle + "View live website" button (where applicable)
2. 4-column meta row: Role / Duration / Platform / Focus
3. Body sections with `<h2>` + paragraph copy. Use Instrument Serif large for body — *do not shrink to 16px*.
4. For PwC Bridge specifically: include a callout box with the confidentiality note.
5. Pull-quote testimonial section — italic, oversized, centered.
6. "Other projects" — 2-up preview cards with View project links.
7. Same olive footer.

### `/about` — About
1. Big italic "About" hero.
2. 2-column layout: bio on left (Instrument Serif large), photo on right.
3. "Facts" grid: Based in / Languages / Tools / Available for.
4. Same footer.

## Content

### Identity
- Ieva Kirdaikytė
- UX/UI Designer
- Zürich, CH (originally from Lithuania)
- ievakirdaikyte@gmail.com

### Projects (in this exact order)

**01. PwC Bridge** — 2024 — Present · Lead UX/UI
Tagline: *Consolidating fragmented tools into a single role-aware workspace for PwC Switzerland's Tax & Technology teams.*

**02. Hey Honey** — 2025 · UX/UI · Personal
Tagline: *A curated marketplace for high-quality, locally produced honey — mobile-first, subscription-friendly, gift-ready.*

**03. Certifaction** — 2023 · UX/UI · Certifaction AG
Tagline: *A 3-month sprint at Switzerland's leading eSignature provider. Onboarding redesign took task completion from 3/10 to 7/10.*

**04. Share Your Bag** — 2021 — 2026 · UX/UI · Personal
Tagline: *Revisiting my first UX project five years later, with a product mindset. A peer-to-peer marketplace for designer handbag rentals.*

### About bio (use this verbatim, can be edited later)

> I'm Ieva — a UX/UI designer originally from Lithuania, now based in Zürich. For the past few years I've been turning complex enterprise tools, e-commerce flows, and product ideas into interfaces people actually want to use. Most recently as the lead designer on PwC Switzerland's Project Bridge, where I learned that the hardest part of UX leadership isn't the design — it's the politics around it.
>
> I care about restraint, evidence-based decisions, and the small details that signal someone bothered. Outside of design I snowboard, surf, hike Swiss alps, play tennis, cook (and bake — usually for friends, sometimes for myself), and walk a Dalmatian called Mochi.

### Testimonials (3 — use on Home or About)

> "Ieva is an exceptional design professional who steadfastly commits to excellence in every aspect of her work."
> — Christoph Schärer, Partner @ PwC Switzerland

> "Ieva's experience and expertise in UX/UI has driven amazing results for our solutions."
> — Jeremy Wikler, Senior Manager @ PwC Switzerland

> "Ieva effectively identifies user needs and design opportunities, transforming insights into practical solutions."
> — Stuart Jones, Partner @ PwC Switzerland

## Constraints

- No images required for the first pass — use elegant placeholders (subtle gradient blobs, like marimba's project thumbnails). Real images come later.
- All animations must respect `prefers-reduced-motion`.
- Lighthouse score should hit 95+ on Performance, Accessibility, Best Practices, SEO.
- The site must feel **slow and confident**, not snappy or trendy.
- No emojis anywhere unless a deliberate design choice.

## What I want back

A single React component file (or split into a few clean ones) that I can preview, iterate on, and eventually export to plain HTML/CSS/JS for GitHub Pages hosting. Start with the **Home** page in full motion, then we'll add Work and About in subsequent turns.

When you're done, please tell me what you generated, what design decisions you made, and any places you'd recommend I adjust.
