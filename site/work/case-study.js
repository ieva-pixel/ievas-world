/* ═══════════════════════════════════════════════════════════════════════════
   CASE STUDY — shared interactions
   ───────────────────────────────────────────────────────────────────────────
   Sections:
     1. PAGE TRANSITION  — overlay slide on enter / leave (GSAP timeline)
     2. CUSTOM CURSOR    — lerp follower with hover-aware ring
     3. SPLIT TEXT       — chars / words / lines for reveal
     4. SCROLL REVEALS   — hero entry, batch fades, image clip wipes
     5. PINNED STAGE     — 3-act sticky scrolly with text + visual swap
     6. GALLERY          — pinned horizontal scrub
     7. NEXT PROJECT     — orb parallax + arrow expand
   ═════════════════════════════════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

/* ─── 0. UTILS ────────────────────────────────────────────────────────────── */
const lerp   = (a, b, t) => a + (b - a) * t;
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const $$     = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── 1. PAGE TRANSITION ──────────────────────────────────────────────────── */
const overlay      = document.querySelector('.cs-overlay');
const overlayLabel = document.querySelector('.cs-overlay-label');

// Entry: overlay starts covering, slides up off-screen revealing the page
function playEntry() {
  if (!overlay) return;
  const tl = gsap.timeline();
  gsap.set(overlay, { y: '0%' });
  if (overlayLabel) gsap.set(overlayLabel, { opacity: 1, y: 0 });
  tl.to(overlayLabel, { opacity: 0, y: -30, duration: 0.5, ease: 'power2.in' }, 0)
    .to(overlay, {
      y: '-100%',
      duration: 1.1,
      ease: 'expo.inOut',
    }, 0.1)
    .from('.cs-hero-counter, .cs-hero-tagline, .cs-hero-info', {
      y: 30, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08,
    }, 0.7)
    .from('.cs-back, #logo, #location', {
      opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.06,
    }, 0.6)
    .from('.cs-hero-visual', {
      yPercent: 8, opacity: 0, duration: 1, ease: 'expo.out',
    }, 0.85)
;
  return tl;
}

// Leave: overlay slides up from bottom, then navigate
function playLeave(href, label) {
  if (!overlay) { window.location.href = href; return; }
  if (overlayLabel && label) overlayLabel.textContent = label;
  const tl = gsap.timeline({
    onComplete: () => { window.location.href = href; },
  });
  gsap.set(overlay, { y: '100%' });
  if (overlayLabel) gsap.set(overlayLabel, { opacity: 0, y: 30 });
  tl.to(overlay, {
      y: '0%',
      duration: 0.95,
      ease: 'expo.inOut',
    })
    .to(overlayLabel, {
      opacity: 1, y: 0, duration: 0.45, ease: 'power2.out',
    }, 0.4);
}

// Wire same-origin links to use leave transition
function wireLinks() {
  $$('a[data-cs-link]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto') || a.target === '_blank') return;
      e.preventDefault();
      playLeave(href, a.dataset.csLabel || a.textContent.trim());
    });
  });
}

/* ─── 2. CUSTOM CURSOR ────────────────────────────────────────────────────── */
function initCursor() {
  if (window.matchMedia('(max-width: 900px)').matches) return;
  const cursor = document.querySelector('.cs-cursor');
  if (!cursor) return;
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;
  document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mousedown', () => cursor.classList.add('cs-press'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('cs-press'));

  // Hover detection — anything interactive gets the bigger ring
  const HOVER_SEL = 'a, button, .pill, [data-cs-hover]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(HOVER_SEL)) cursor.classList.add('cs-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(HOVER_SEL) && !e.relatedTarget?.closest(HOVER_SEL)) {
      cursor.classList.remove('cs-hover');
    }
  });

  gsap.ticker.add(() => {
    cx = lerp(cx, mx, 0.18);
    cy = lerp(cy, my, 0.18);
    cursor.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`;
  });
}

/* ─── 3. SPLIT TEXT ───────────────────────────────────────────────────────── */
// Split into character spans (for hero title burst)
function splitChars(el) {
  const preserved = Array.from(el.children);
  const txt = el.textContent.trim();
  el.textContent = '';
  el.classList.add('cs-split-chars');
  const out = [];
  for (const ch of txt) {
    const span = document.createElement('span');
    span.className = 'cs-char';
    span.textContent = ch === ' ' ? ' ' : ch;
    el.appendChild(span);
    out.push(span);
  }
  preserved.forEach(c => el.appendChild(c));
  return out;
}

// Split into word-wrap spans (for slide-up reveal)
function splitWords(el) {
  const txt = el.textContent;
  el.textContent = '';
  const out = [];
  txt.split(/(\s+)/).forEach((token) => {
    if (/^\s+$/.test(token)) {
      el.appendChild(document.createTextNode(' '));
    } else if (token.length) {
      const wrap = document.createElement('span');
      wrap.className = 'cs-word-wrap';
      const inner = document.createElement('span');
      inner.className = 'cs-word';
      inner.textContent = token;
      wrap.appendChild(inner);
      el.appendChild(wrap);
      out.push(inner);
    }
  });
  return out;
}

// Split block into "lines" — re-measure after font load by wrapping each
// rendered line in cs-line-wrap. For our serif headings we use word-level
// reveal which reads as line-level due to controlled max-width.
function splitToLines(el) {
  // Simpler approximation: split words, then group into wraps per visual line
  // by rebuilding after measurement.
  const words = splitWords(el);
  // Group by their offsetTop
  const lines = [];
  let curTop = null, curLine = [];
  words.forEach((w) => {
    const top = w.parentElement.offsetTop;
    if (curTop === null || top !== curTop) {
      if (curLine.length) lines.push(curLine);
      curLine = [w];
      curTop = top;
    } else {
      curLine.push(w);
    }
  });
  if (curLine.length) lines.push(curLine);
  return { words, lines };
}

/* ─── 4. ENTRY ANIMATIONS (run after page transition lifts) ───────────────── */
function animateHeroTitle() {
  const title = document.querySelector('.cs-hero-title');
  if (!title || reduce) return;
  const chars = splitChars(title);
  gsap.to(chars, {
    opacity: 1, y: 0,
    duration: 0.9,
    ease: 'expo.out',
    stagger: { each: 0.025, from: 'start' },
    delay: 0.55,
  });
}

function animateSectionTitles() {
  $$('.cs-section-title').forEach((el) => {
    if (reduce) { el.style.opacity = 1; return; }
    const words = splitWords(el);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to(words, {
          y: 0,
          duration: 0.95,
          ease: 'expo.out',
          stagger: 0.04,
        });
      },
    });
  });
}

function animateFadeUps() {
  const targets = $$('.cs-fade');
  if (!targets.length) return;
  if (reduce) { targets.forEach((t) => { t.style.opacity = 1; t.style.transform = 'none'; }); return; }
  ScrollTrigger.batch(targets, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1, y: 0,
        duration: 0.95,
        ease: 'expo.out',
        stagger: 0.08,
      });
    },
  });
}

function animateImageReveals() {
  $$('.cs-img-reveal').forEach((wrap) => {
    if (reduce) return;
    const cover = wrap;
    gsap.set(wrap, { '--cs-rev-y': '0%' });
    // Use a real cover element via ::after — animate transform via JS variable
    gsap.fromTo(wrap, {
      '--cs-rev-y': '0%',
    }, {
      '--cs-rev-y': '100%',
      duration: 1.2,
      ease: 'expo.inOut',
      scrollTrigger: {
        trigger: wrap,
        start: 'top 78%',
        once: true,
      },
    });
  });
}

/* ─── 5. PINNED STAGE: sticky scrolly with phased text + visual swap ──────── */
function initPinnedStage() {
  const wrap = document.querySelector('.cs-pin-wrap');
  if (!wrap) return;
  const stage = wrap.querySelector('.cs-pin-stage');
  const phases = $$('.cs-pin-phase', wrap);
  const frames = $$('.cs-pin-frame', wrap);
  if (!phases.length || !frames.length || !stage) return;
  const N = phases.length;

  // Initial state lives in CSS (.is-active). JS just toggles the class.
  // CSS transition handles the opacity + transform animation smoothly.
  phases.forEach((p, i) => p.classList.toggle('is-active', i === 0));
  frames.forEach((f, i) => f.classList.toggle('is-active', i === 0));

  function activate(idx) {
    phases.forEach((p, i) => p.classList.toggle('is-active', i === idx));
    frames.forEach((f, i) => f.classList.toggle('is-active', i === idx));
  }

  // Distribute activations across the ACTUAL pinning window (wrap - stage height),
  // not the full wrap height — otherwise late phases activate after the pin releases.
  for (let i = 1; i < N; i++) {
    ScrollTrigger.create({
      trigger: wrap,
      start: () => `top+=${(i / N) * (wrap.offsetHeight - stage.offsetHeight)}px top`,
      invalidateOnRefresh: true,
      onEnter:     () => activate(i),
      onLeaveBack: () => activate(i - 1),
    });
  }

  // Progress bar
  ScrollTrigger.create({
    trigger: wrap,
    start: 'top top',
    end:   'bottom bottom',
    scrub: 0.4,
    onUpdate: (self) => {
      const bar = wrap.querySelector('.cs-pin-progress');
      if (bar) bar.style.setProperty('--cs-pin-p', `${(self.progress * 100).toFixed(1)}%`);
    },
  });
}

/* ─── 6. GALLERY — horizontal pinned scrub ────────────────────────────────── */
function initGallery() {
  const wrap  = document.querySelector('.cs-gallery-wrap');
  if (!wrap || reduce) return;
  const track = wrap.querySelector('.cs-gallery-track');
  if (!track) return;

  const items = $$('.cs-gallery-item', track);
  if (!items.length) return;

  // We translate the track left by (track scrollWidth - viewport width)
  const computeDistance = () => track.scrollWidth - window.innerWidth;

  // Gallery wrap is just tall enough for the horizontal scrub + 1 viewport.
  // Sticky pin window = wrap.height - 100vh = computeDistance. Gallery releases
  // exactly when the horizontal scrub completes. Outcomes pinning is handled
  // separately by ScrollTrigger.pin — see further down.
  const HOLD_VH = 1.0; // outcomes pinned for ~1 viewport of scroll
  const syncWrapHeight = () => {
    wrap.style.height = (computeDistance() + window.innerHeight) + 'px';
  };
  syncWrapHeight();
  window.addEventListener('resize', () => { syncWrapHeight(); ScrollTrigger.refresh(); });

  const trackTween = gsap.to(track, {
    x: () => -computeDistance(),
    ease: 'none',
    scrollTrigger: {
      trigger: wrap,
      start: 'top top',
      end:   () => `+=${computeDistance()}`,
      // No `pin` — `.cs-gallery-pin` already uses CSS sticky. Letting CSS handle
      // the visual pin preserves the natural overlap of the next section sliding
      // up; ScrollTrigger's pin spacer would snap on release and break that.
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });

  // Per-item enter animation — gentle fade up using the same easing language as
  // .cs-fade elsewhere on the page. Fires once when the item crosses into view
  // horizontally (containerAnimation tracks horizontal scrub position).
  items.forEach((item) => {
    gsap.fromTo(item,
      { opacity: 0, y: 60 },
      {
        opacity: 1, y: 0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          containerAnimation: trackTween,
          start: 'left 95%',  // when the item starts entering from the right
          end:   'left 55%',  // finishes by the time it's near centre
          scrub: true,         // ties the fade to scroll position so the user sees it
        },
      }
    );
  });

  // Pin the next section (outcomes) for HOLD_VH viewports of scroll. Uses
  // ScrollTrigger's native pin — single source of truth, no transforms to
  // fight each other, no jitter. Learnings (and anything below) only appears
  // after this pin releases.
  const nextSection = wrap.nextElementSibling;
  if (nextSection && nextSection.tagName === 'SECTION') {
    ScrollTrigger.create({
      trigger: nextSection,
      start: 'top top',
      end:   () => `+=${window.innerHeight * HOLD_VH}`,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    });
  }
}

/* ─── 7. NEXT PROJECT ────────────────────────────────────────────────────── */
// initNext() previously animated a radial-gradient orb in the .cs-next
// footer. The orb was removed by design direction — no glow/gradient
// accent in the next-case-study section. The hook stays as a no-op so the
// kickoff sequence doesn't break, and so a future, non-gradient embellishment
// can plug in here if needed.
function initNext() {}

/* ─── 8. PARALLAX (data-speed) ───────────────────────────────────────────── */
function initParallax() {
  if (reduce) return;
  $$('[data-speed]').forEach((el) => {
    const speed = parseFloat(el.dataset.speed) || 0.5;
    gsap.to(el, {
      yPercent: -8 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end:   'bottom top',
        scrub: true,
      },
    });
  });
}

/* ─── 9. STARFIELD ───────────────────────────────────────────────────────── */
function buildStars(container, defs) {
  if (!container) return;
  defs.forEach((d) => {
    const star = document.createElement('div');
    star.className = `cs-star ${d.type === 'burst' ? 'cs-star-burst' : ''} cs-star-${d.color}`;
    star.style.left = d.x;
    star.style.top  = d.y;
    if (d.size) {
      if (d.type === 'burst') {
        star.style.width = d.size + 'px';
        star.style.height = d.size + 'px';
      } else {
        star.style.width = d.size + 'px';
        star.style.height = d.size + 'px';
        star.style.background = 'currentColor';
      }
    }
    star.style.opacity = d.opacity || 0.6;
    container.appendChild(star);
    if (!reduce) {
      gsap.to(star, {
        yPercent: -25 * (d.speed || 1),
        ease: 'none',
        scrollTrigger: {
          trigger: container.parentElement,
          start: 'top bottom',
          end:   'bottom top',
          scrub: true,
        },
      });
    }
  });
}

function initStars() {
  // Hero stars
  buildStars(document.getElementById('csHeroStars'), [
    { x: '12%', y: '18%', size: 12, type: 'burst', color: 'blue',   opacity: .65, speed: 0.6 },
    { x: '82%', y: '12%', size: 8,  type: 'burst', color: 'red',    opacity: .55, speed: 0.8 },
    { x: '68%', y: '78%', size: 10, type: 'burst', color: 'purple', opacity: .55, speed: 0.5 },
    { x: '22%', y: '82%', size: 6,  type: 'burst', color: 'blue',   opacity: .45, speed: 0.9 },
  ]);
  // Next-project stars
  buildStars(document.getElementById('csNextStars'), [
    { x: '14%', y: '28%', size: 10, type: 'burst', color: 'red',    opacity: .55, speed: 0.7 },
    { x: '78%', y: '62%', size: 14, type: 'burst', color: 'blue',   opacity: .55, speed: 0.5 },
    { x: '54%', y: '20%', size: 6,  type: 'burst', color: 'purple', opacity: .55, speed: 0.9 },
  ]);
}

/* ─── 9b. CLICK-TO-ZOOM LIGHTBOX ─────────────────────────────────────────── */
function initLightbox() {
  const triggers = $$('.cs-pin-img-zoom');
  if (!triggers.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'cs-lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('tabindex', '-1');
  overlay.innerHTML = `
    <button type="button" class="cs-lightbox-close" aria-label="Close">Close ✕</button>
    <img alt="" />
  `;
  document.body.appendChild(overlay);

  const overlayImg = overlay.querySelector('img');
  const closeBtn   = overlay.querySelector('.cs-lightbox-close');

  function openLightbox(src, alt) {
    overlayImg.src = src;
    overlayImg.alt = alt || '';
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Focus the dialog container (not the Close button) so a :focus-visible
    // ring never appears on the button on open. Escape is wired to document,
    // and the user can Tab into the button if they want.
    overlay.focus({ preventScroll: true });
  }
  function closeLightbox() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  triggers.forEach(img => {
    img.addEventListener('click', () => openLightbox(img.currentSrc || img.src, img.alt));
  });
  overlay.addEventListener('click', (e) => {
    // Click outside the inner image (or on close button) closes
    if (e.target === overlay || e.target === closeBtn) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeLightbox();
  });
}

/* ─── 10. KICKOFF ────────────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  initStars();
  wireLinks();
  initCursor();
  if (!reduce) {
    playEntry();
    animateHeroTitle();
  } else {
    if (overlay) gsap.set(overlay, { y: '-100%' });
    document.querySelector('.cs-hero-title')?.style.setProperty('opacity', '1');
  }
  // Defer scroll-bound setups until after layout settles
  requestAnimationFrame(() => {
    animateSectionTitles();
    animateFadeUps();
    animateImageReveals();
    initPinnedStage();
    initGallery();
    initNext();
    initParallax();
    initLightbox();
    ScrollTrigger.refresh();
  });
});

// Also flush on full load (fonts can shift layout)
window.addEventListener('load', () => ScrollTrigger.refresh());

/* image-reveal cover uses CSS variable */
const style = document.createElement('style');
style.textContent = `.cs-img-reveal::after { transform: translateY(var(--cs-rev-y, 0%)); }`;
document.head.appendChild(style);
