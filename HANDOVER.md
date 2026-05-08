# Handover — Ieva's World portfolio

Living doc. Sessions appended in reverse chronological order — newest first.

## Project context

- Vanilla HTML/CSS/JS, no build step.
- Dev server: `python3 site/_serve.py` on port 8000 (configured in `.claude/launch.json` as `site`). The Claude preview tools auto-launch this.
- Three files do all the work:
  - [site/index.html](site/index.html) — markup
  - [site/styles.css](site/styles.css) — tokens + section styles
  - [site/scripts.js](site/scripts.js) — scroll handlers (sections labelled in comments)
- GSAP + ScrollTrigger loaded via CDN in `index.html` (used only for the orbit animation in the process scene).
- Browser caches CSS/JS aggressively. After edits you must hard-reload (Cmd+Shift+R) — a normal reload won't pick up the new bundle.

## Architecture quick map

- Pinned scroll scenes (`statement`, `process`, `about`) use a `.pin-wrap` containing a `position: sticky; height: 100vh` inner. Progress in scene = `sceneProg(wrap)` returns 0–1.
- Per-scene logic lives in `onPinnedScroll`, `onWorkScroll`, `onAboutScroll` (scripts.js). `onScroll` wires them up via `passive: true` listener.
- Process scene's orbit animation is the only GSAP-driven piece — a `gsap.timeline` scrubbed by a single `ScrollTrigger` with `scrub: 2.0`, plus a per-frame `gsap.ticker` that reads orbit state and writes `transform` on each orb div.
- Helpers in scripts.js for cross-section progress: `approachInP(wrap, vh)`, `approachExitP(nextWrap, startVh, endVh)`, `pinExitP(wrap, hold)`, `sceneProg(wrap)`. Use these — don't add new state.

---

## Session 3 — Slide-on-top section transition + softer orbit + flat orbs

Merged to main as `a7feda6` (branch `ieva-is-awesome` commit `a1164d5`).

### What changed conceptually

1. **Statement → Process transition is now slide-on-top, not a fade.** Previously the statement faded its content out and interpolated its background cream → olive-deep as the process section approached, so both sections shared a "transition zone." Now the statement stays pinned (longer wrap), `#process` has `z-index: 2`, and `procSection` is given a `translateY` that pulls it up over the still-pinned statement. The statement content drifts subtly underneath (blur, scale, lift) while opacity stays at 1 — the process section's olive will cover it anyway, so no fade needed.
2. **Orbit animation is slower and continuous through phase boundaries.** Used to have an abrupt angular-velocity jump at the entry→orbit transition (orbs "stopped" at the ring). Rewrote the angle math so entry, orbit, and exit form a single continuous-velocity curve.
3. **Orbs flattened to single-layer dual-tone discs.** Previously two stacked elements (`core` + `glow`) with directional masks gave each orb a 3D-spherical shaded look. Now one element with both radial gradients comma-stacked as a single background — no blur, gentle falloff, two color zones blending into a watercolor wash.

### Geometry (the numbers that matter)

Recompute these if you change wrap heights — handful of magic numbers depend on them.

| Marker | scrollY (at vh=991) | Trigger |
|---|---|---|
| stmt pin start | 1120 | stmtWrap top hits viewport top |
| slide window start | ~1833 | stmtP = 0.6 (`SLIDE_START`) |
| stmt pin end | ~2309 | stmtWrap bottom hits viewport bottom; slide window end (slideP = 1) |
| procWrap pin start | ~3300 | procWrap top hits viewport top |
| procWrap pin end | ~5183 | procWrap bottom hits viewport bottom |

Wrap heights: `#statement-wrap` 220vh, `#process-wrap` 290vh ([styles.css:347](site/styles.css:347), [styles.css:367](site/styles.css:367)).

### Slide-on-top — implementation details

**CSS** ([styles.css:367-373](site/styles.css:367)):
```css
#statement-wrap { background: #F1F0EA; height: 220vh; }   /* was 150vh */
#process { background: var(--olive-deep); padding: 0; z-index: 2; will-change: transform; }
```
`#process` z-index bumped to 2 so it renders above `#statement` (z-index 1) when their viewport space overlaps.

**JS** ([scripts.js:399-446](site/scripts.js:399), inside `onPinnedScroll`):

- `SLIDE_START = 0.6` — slide begins at 60% through stmt pin progress.
- `slideP = clamp01((stmtP - SLIDE_START) / (1 - SLIDE_START))` — drives both the stmt drift and the proc translation. Same source = synced timing.
- Stmt drift values (subtle on purpose; opacity stays at `_in`, no exit fade):
  - `scale: (0.70 + _in * 0.30) * (1 - slideE * 0.08)` → 0.92 at slideP=1
  - `translateY: (1 - _in) * 60 - slideE * 40` → -40 at slideP=1
  - `blur: (1 - _in) * 20 + slideE * 14` → +14 at slideP=1
  - `slideE = pow(slideP, 1.6)` (gentle ease-in)
- Proc translation:
  ```js
  if (procRectTop > 0) {
    const target = (1 - slideP) * wh;             // vh → 0 as slideP 0 → 1
    procSection.style.transform = `translateY(${target - procRectTop}px)`;
  } else {
    procSection.style.transform = '';             // procWrap pinned, let sticky handle it
  }
  ```
  `procRectTop` is `procWrap.getBoundingClientRect().top`. After slideP=1 (stmt pin ended), `slideP` stays clamped at 1 because `sceneProg(stmtWrap)` clamps at 1, so `target = 0` and `translateY = -procRectTop` keeps procSection glued to viewport top through the [stmt-end, procWrap-pin] window.

### Orbit animation — slower, smoother

**ScrollTrigger** ([scripts.js:215-221](site/scripts.js:215)):
```js
ScrollTrigger.create({
  trigger:   '#process-wrap',
  start:     'top bottom',     // was 'top top'
  end:       'bottom bottom',
  scrub:     2.0,              // was 1.4
  animation: orbitScrollTl,
});
```
`start: 'top bottom'` is critical now — procSection is *visually* in view from slide-end onward (scrollY ~2309), even though procWrap doesn't pin until ~3300. If you leave `start: 'top top'`, the orbit only starts at ~3300 and the user sees a static "How I work" for ~991px before any motion.

**Phase angle math** ([scripts.js:171-200](site/scripts.js:171)):
```js
const ORBIT_ANGLE = Math.PI * 0.6;            // 108° main rotation
const EDGE_ANGLE  = ORBIT_ANGLE * 0.25;       // 27° added on each end
```
- Entry angle uses `easeIn2` (`t²`) — derivative at t=1 is 2.
- Orbit phase is linear in `rp` — derivative is 1, scaled by `ORBIT_ANGLE / 0.5 = 2·ORBIT_ANGLE`.
- Exit angle uses `easeOut2` (`1-(1-t)²`) — derivative at t=0 is 2.

`EDGE_ANGLE = ORBIT_ANGLE/4` is the velocity-matching value. If you change `ORBIT_ANGLE` (e.g. for less rotation), keep `EDGE_ANGLE` proportional or you'll re-introduce the angular-velocity discontinuity at boundaries.

Radius / alpha use `easeOut2` on entry and `easeIn2` on exit — matches the natural "landing on the ring" feel (radial velocity → 0 at ring) and "kicking off" feel (radial velocity → 0 leaving ring). This is intentionally NOT continuous through orbit boundaries.

### Orb visual — flat single-layer

Three iterations during this session:
1. Switched from "single saturated radial + masked directional glow" (3D sphere look) to "core + glow" with two distinct radial colors at offset positions (warm/cool dual-tone watercolor).
2. Removed blur from core layer (kept blur only on glow halo).
3. Merged into one element entirely. Final state.

**CSS** ([styles.css:419-424](site/styles.css:419)):
```css
.proc-circle-orb {
  position: absolute;
  inset: -10%;
  border-radius: 50%;
  opacity: 0.9;
}
```

**Per-orb data** ([scripts.js:52-71](site/scripts.js:52)) — each orb has a single `bg` field with two comma-stacked radial gradients:
- Color A at `30% 30%`, Color B at `70% 70%` (diagonal split for warm/cool blending)
- Stops `0% → 35% → 70%` (solid → 0.7 alpha → fully transparent) — flat plateau then quick fade
- 4 palettes: coral↔lavender, mint↔sky, lavender↔pink, amber↔sage

**JS build** ([scripts.js:135-148](site/scripts.js:135)):
```js
const orb = document.createElement('div');
orb.className = 'proc-circle-orb';
orb.style.background = c.bg;
wrap.appendChild(orb);
wrap.appendChild(label);
```
The old `.proc-circle-core` and `.proc-circle-glow` CSS classes and DOM elements are gone. If you find references to them anywhere, those are dead code.

### Statement entry animation (still applied from session 2)

- `approachInP(stmtWrap, 1.3)` drives the entry — animation runs while stmtWrap.rect.top is in `(0, 1.3·vh)`.
- `delayedIn = clamp01((rawIn - 0.08) / 0.92)`, then `_in = 1 - (1-delayedIn)²` (ease-out-quad).
- Base scale 0.70 → 1.0, transY 60 → 0, blur 20 → 0 across the entry.

### Olive color — verified, no change

`--olive-deep: #212E02` is correct for all dark-bg sections (process, about, contact, body default). `--olive: #3A4A16` is for text/accents/borders. The "olive feels darker now" perception was the side-effect of removing the cream→olive bg interpolation that previously spent most of its scroll in mid-tones.

### Tried and reverted this session

Nothing reverted in session 3. Three iterations on the orb visual but each was a deliberate progression, not a rollback.

### Open / worth verifying

- **Static pin time before the slide.** With `SLIDE_START = 0.6` and 220vh wrap (~120vh of pin), the stmt sits unmoving for ~72vh before the slide starts. Reading time is good but if it feels "long-paused" in real scrolling, lower `SLIDE_START` to 0.4-0.5.
- **Slide is geometry-coupled.** `target = (1-slideP) * wh` assumes `slideP` reaches 1 exactly when `procRectTop` reaches `wh` (i.e. the slide-end moment is also the moment procSection naturally enters viewport bottom). This is true *only because* stmt pin ends exactly when procWrap.offsetTop is reached. Don't add a gap between stmt-wrap and proc-wrap or this will desync.
- **Orbit phase split.** `ENTRY_END = 0.25, ORBIT_END = 0.75` is unchanged; tweak only if you want longer/shorter intro spirals. The angle continuity holds for any split because `EDGE_ANGLE = ORBIT_ANGLE/4` was derived from `ENTRY_END = 0.25` specifically — if you change phase fractions, redo the math.
- **About scene** still uses the old `applyTimeline` + `pinExitP` pattern. If consistency with the new slide-on-top transition matters, the about scene is the next candidate for the same treatment.

---

## Session 2 — scroll-driven scene timing + visual polish

(Historical record. Several specific values below were superseded by Session 3 — see the "after" column for what they look like *as of Session 2*. Cross-reference scripts.js for current values.)

### Timing / motion

| Where | Before | After (session 2) |
|---|---|---|
| Statement scene | text fades in 0–30%, holds, exits 70–100% | text full-size + fully visible at p=0; entire scene is the exit (fade up, scale 1→0.82, light blur) |
| Statement bg | cream → olive-deep during 50–80% | cream → olive-deep across entire scene, synced with text exit |
| Process scene content | fade-in over first 25%, exit last 18% | fade-in 12%, exit 12% (balanced); position decoupled |
| Process scene length | 170vh wrap | 130vh wrap |
| About content fade-in | 0.35 of scene | 0.18 of scene |
| Work cards | first card visible at p=0.125 | shifted: `(i+0.35)/n` so first card visible at ~p=0.087 |
| Pill hover | 400ms ease-out | 180ms `--ease-out` |
| Nav opacity | 300ms ease | 220ms `--ease-out` |
| Marquee | 40s | 28s |
| Reveal classes | 9 inline `cubic-bezier(.16,1,.3,1)` | unified to `var(--ease-expo)` |

### Visual

- Removed `<div class="hero-blob">` and its CSS rule. Hero is flat olive-deep, no top-right glow.
- Statement text bumped: `clamp(1.7rem, 3.5vw, 3.2rem)` → `clamp(2rem, 4.2vw, 3.9rem)` ([styles.css:354-364](site/styles.css:354)).

### Tried and reverted (don't redo)

1. **Unifying `--olive-deep` to `#3A4A16` (= `--olive`).** Tried because user said "the dark green is too dark, match the testimonial section." Reverted: it made `.project-title` and `.project-desc` blend into cream backgrounds. Both colors remain distinct: `--olive: #3A4A16`, `--olive-deep: #212E02`. (Re-confirmed valid in Session 3.)
2. **Radial glow gradient on dark sections** (`--olive-glow-bg` token + per-section layered backgrounds + matching glow blend in JS bg interpolations). User: "remove the gradient, it's not good." All glow code stripped from CSS and the three JS bg fade sites.
3. **`--olive-bright` text token** for project-title/desc. Was a workaround for #1 above. Removed when #1 was reverted.

---

## Useful pointers (apply to all sessions)

- All scroll handlers receive `p` (scene progress 0–1) computed from `sceneProg(wrap)`. Modify timing by adjusting clamp ranges, not by adding new state.
- Init hidden states for content blocks live near the bottom of scripts.js (~line 534). If you change a scene's "rest" state, update the init.
- Reduced-motion fallback at [styles.css:748](site/styles.css:748) — animation-duration nuked, hero letters lit, process opacity:1. New scroll-driven transforms don't need additional reduced-motion handling.
- Easing tokens (`--ease-out`, `--ease-expo`) at [styles.css:21-22](site/styles.css:21) are the source of truth — reach for them rather than inlining cubic-beziers.
- `html { scroll-behavior: smooth }` ([styles.css:3](site/styles.css:3)) is on. Use `behavior: 'instant'` in programmatic `scrollTo()` calls when testing or it'll smooth-scroll and your post-scroll reads will be stale.
