/* ═══════════════════════════════════════════════════════════════════════════
   Ieva's World — interactions
   ───────────────────────────────────────────────────────────────────────────
   Sections:
     1. DATA            — projects + ovals (edit copy here)
     2. BUILD           — DOM construction (hero letters, work cards, ovals)
     3. SCROLL DRIVERS  — hero letter reveal, pinned scenes, work card swap
     4. REVEAL OBSERVER — fade/slide in on enter
     5. NAV OBSERVER    — active section indicator
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── 1. DATA ─────────────────────────────────────────────────────────── */
const PROJECTS = [
  {
    num: '01', total: '04',
    eyebrow: '2024-2025 · Lead UX/UI · PwC Switzerland',
    title:   'PwC Bridge',
    desc:    "Consolidating fragmented tools into a single role-aware workspace for PwC Switzerland's Tax & Technology teams.",
    bg:      'linear-gradient(135deg,#1e2c0e 0%,#2c3d12 100%)',
    accent:  '#8FA96B',
    href:    'work/pwc-bridge/',
    image:   'work/pwc-bridge/pwc-bridge-hero.jpg',
    imageFocal: '50% 70%', // laptop is in lower-middle of the image — shift visible window down to centre it
  },
  {
    num: '02', total: '04',
    eyebrow: '2025 · UX/UI · Personal',
    title:   'Hey Honey',
    desc:    'A curated marketplace for high-quality, locally produced honey: mobile-first, subscription-friendly, gift-ready.',
    bg:      'linear-gradient(135deg,#2e2208 0%,#4a3810 100%)',
    accent:  '#C8A84B',
    href:    'work/hey-honey/',
    image:   'work/hey-honey/hero-homepage.png',
    imageFocal: '50% 35%',
  },
  {
    num: '03', total: '04',
    eyebrow: '2021 · UX/UI · Certifaction AG',
    title:   'Certifaction',
    desc:    "A 3-month sprint at Switzerland's leading eSignature provider. Onboarding redesign took task completion from 3/10 to 7/10.",
    bg:      'linear-gradient(135deg,#0a1520 0%,#162436 100%)',
    accent:  '#6B8FA9',
    href:    'work/certifaction/',
    image:   'work/certifaction/Hero image.PNG',
  },
  {
    num: '04', total: '04',
    eyebrow: '2021 to 2026 · UX/UI · Personal',
    title:   'Share Your Bag',
    desc:    'Revisiting my first UX project five years later, with a product mindset. A peer-to-peer marketplace for designer handbag rentals.',
    bg:      'linear-gradient(135deg,#22152a 0%,#36204a 100%)',
    accent:  '#A98FA9',
    href:    'work/share-your-bag/',
    image:   'work/share-your-bag/hero image home page.png',
    imageFocal: '50% 35%',
  },
];

const CIRCLES = [
  { label: 'Listen and\ndefine',  variant: 'listen'   },
  { label: 'Strategy and\nplan',  variant: 'strategy' },
  { label: 'Design and\nrefine',  variant: 'design'   },
  { label: 'Build and\ntest',     variant: 'build'    },
];

/* ─── 2. BUILD ────────────────────────────────────────────────────────── */

// 2a. Hero letters — split into spans for color reveal
const heroLine1El = document.getElementById('heroLine1');
const heroLine2El = document.getElementById('heroLine2');
const allLetterEls = [];

function buildHeroLine(text, container) {
  text.split('').forEach((ch) => {
    const span = document.createElement('span');
    span.className = 'hero-letter';
    span.textContent = ch === ' ' ? ' ' : ch;
    container.appendChild(span);
    allLetterEls.push(span);
  });
}
buildHeroLine("ieva's", heroLine1El);
buildHeroLine('world',  heroLine2El);

// 2b. Project cards — stacked, JS swaps them on scroll
const workCardsEl   = document.getElementById('workCards');
const workProgressEl = document.getElementById('workProgress');
const workVisualEl  = document.getElementById('workVisual');

// Visual items — live in the persistent rounded frame, slide in/out independently
const workVisualEls = workVisualEl ? PROJECTS.map((p) => {
  const item = document.createElement('div');
  item.className = 'work-visual-item';
  // If the project has a hero image, show it; otherwise fall back to the
  // gradient + accent glow used as a placeholder.
  if (p.image) {
    // No green fallback bg — image covers the frame fully. If the image
    // doesn't load, the cream body shows through, not a stale gradient.
    const focal = p.imageFocal || 'center';
    item.innerHTML = `<div class="thumb thumb-image"><img src="${p.image}" alt="${p.title}" loading="lazy" style="object-position:${focal};"/></div>`;
  } else {
    item.innerHTML = `<div class="thumb" style="background:${p.bg}"><div class="thumb-glow" style="background:${p.accent}"></div></div>`;
  }
  item.style.transform = 'translateY(100%)';
  workVisualEl.appendChild(item);
  return item;
}) : [];

// Text cards — no visual inside, positioned right of the frame
const workCardEls = PROJECTS.map((p) => {
  const card = document.createElement('div');
  card.className = 'work-card';
  card.style.cssText = 'opacity:1;transition:none;';
  card.innerHTML = `
    <div class="work-card-meta">
      <div class="work-card-counter">${p.num}&thinsp;/&thinsp;${p.total}</div>
      <h2 class="project-title">${p.title}</h2>
      <div class="project-eyebrow" style="margin-bottom:0.75rem">${p.eyebrow}</div>
      <p class="project-desc">${p.desc}</p>
      <a href="${p.href}" class="pill pill-dark work-card-cta">View case study</a>
    </div>
  `;
  workCardsEl.appendChild(card);
  return card;
});

// 2c. Process orbit — circle blobs
gsap.registerPlugin(ScrollTrigger);

const CIRCLE_SIZE = 160;
const ORBIT_R = Math.round(Math.min(window.innerWidth * 0.21, window.innerHeight * 0.29, 230));
const EXIT_R  = Math.hypot(window.innerWidth / 2, window.innerHeight / 2) + CIRCLE_SIZE;

const procOrbitStage = document.getElementById('procOrbitStage');

// Orbit ring
const procRingEl = document.createElement('div');
procRingEl.className = 'proc-ring';
procRingEl.style.cssText = `width:${ORBIT_R * 2}px;height:${ORBIT_R * 2}px;left:calc(50% - ${ORBIT_R}px);top:calc(50% - ${ORBIT_R}px);`;
if (procOrbitStage) procOrbitStage.appendChild(procRingEl);

const ORB_SVG = {
  build: {
    accent: ['#E6A24E','#F0D0A0','#F4EBD8'], ops: [0.78, 0.42], acMid: 48,
    acCx: 25, acCy: 62, acR: 52, crCx: 60, crCy: 40, crR: 65,
    mask: [0, 0, 1, 0],
  },
  listen: {
    accent: ['#E9796F','#F0B5A7','#F4EBD8'], ops: [0.72, 0.38], acMid: 48,
    acCx: 78, acCy: 58, acR: 54, crCx: 42, crCy: 38, crR: 68,
    mask: [1, 0, 0, 0],
  },
  strategy: {
    accent: ['#B8C97B','#D8DDB2','#F4EBD8'], ops: [0.68, 0.36], acMid: 50,
    acCx: 58, acCy: 78, acR: 55, crCx: 48, crCy: 35, crR: 70,
    mask: [0, 1, 0, 0],
  },
  design: {
    accent: ['#A78BD6','#CDBBE4','#F4EBD8'], ops: [0.72, 0.38], acMid: 50,
    acCx: 28, acCy: 72, acR: 56, crCx: 62, crCy: 38, crR: 68,
    mask: [0, 1, 1, 0],
  },
};

function orbSVG(id, v) {
  const [mx1,my1,mx2,my2] = v.mask;
  // Shift the heavy-halo circles toward the dissolve side so the glow
  // concentrates there rather than ringing uniformly.
  const HALO_SHIFT = 16;
  const cdx = (mx1 - mx2) * HALO_SHIFT;
  const cdy = (my1 - my2) * HALO_SHIFT;
  return `<svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible;display:block">
  <defs>
    <filter id="blOut${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
    <filter id="blIn${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>
    <radialGradient id="cr${id}" cx="${v.crCx}%" cy="${v.crCy}%" r="${v.crR}%">
      <stop offset="0%" stop-color="#F8F1DF"/><stop offset="62%" stop-color="#EEE5CC"/><stop offset="100%" stop-color="#D8CDAF"/>
    </radialGradient>
    <radialGradient id="ac${id}" cx="${v.acCx}%" cy="${v.acCy}%" r="${v.acR + 30}%">
      <stop offset="0%" stop-color="${v.accent[0]}" stop-opacity="1"/>
      <stop offset="${v.acMid}%" stop-color="${v.accent[1]}" stop-opacity="0.85"/>
      <stop offset="75%" stop-color="${v.accent[1]}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${v.accent[2]}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="mk${id}" x1="${mx1}" y1="${my1}" x2="${mx2}" y2="${my2}">
      <stop offset="0%" stop-color="black"/>
      <stop offset="25%" stop-color="black"/>
      <stop offset="60%" stop-color="white"/>
      <stop offset="85%" stop-color="white"/>
      <stop offset="100%" stop-color="#707070"/>
    </linearGradient>
    <mask id="sh${id}"><rect width="220" height="220" fill="url(#mk${id})"/></mask>
  </defs>
  <circle cx="${110 + cdx}" cy="${110 + cdy}" r="60" fill="url(#cr${id})" filter="url(#blOut${id})"/>
  <circle cx="${110 + cdx}" cy="${110 + cdy}" r="60" fill="url(#ac${id})" filter="url(#blOut${id})"/>
  <g mask="url(#sh${id})">
    <circle cx="110" cy="110" r="74" fill="url(#cr${id})" filter="url(#blIn${id})"/>
    <circle cx="110" cy="110" r="74" fill="url(#ac${id})" opacity="0.7" filter="url(#blIn${id})"/>
  </g>
</svg>`;
}

// Two-layer split: the slot owns transform + opacity (and will-change),
// the inner .proc-circle stays untransformed so the SVG feGaussianBlur halo
// isn't clipped by Chrome's GPU compositing layer.
// Sharp-side angle (radians, screen y-down) for each variant's SVG gradient.
// Used to compute comet rotation: rotate so sharp side faces direction of travel.
const ORB_SHARP_ANGLE = {
  build:    0,              // gradient (0,0)→(1,0): sharp = right
  listen:   Math.PI,        // gradient (1,0)→(0,0): sharp = left
  strategy: -Math.PI / 2,   // gradient (0,1)→(0,0): sharp = up
  design:   -Math.PI / 4,   // gradient (0,1)→(1,0): sharp = upper-right
};

const orbEls = [];  // parallel array of .proc-circle-orb divs, cached for ticker

const circleEls = procOrbitStage ? CIRCLES.map((c) => {
  const slot = document.createElement('div');
  slot.className = 'proc-circle-slot';
  slot.style.cssText = `width:${CIRCLE_SIZE}px;height:${CIRCLE_SIZE}px;left:calc(50% - ${CIRCLE_SIZE / 2}px);top:calc(50% - ${CIRCLE_SIZE / 2}px);opacity:0;`;

  const wrap = document.createElement('div');
  wrap.className = 'proc-circle';

  const orb = document.createElement('div');
  orb.className = 'proc-circle-orb';
  orb.innerHTML = orbSVG(c.variant, ORB_SVG[c.variant]);
  orbEls.push(orb);

  const label = document.createElement('span');
  label.className = 'orb-content';
  label.innerHTML = c.label.replace('\n', '<br>');

  wrap.appendChild(orb);
  wrap.appendChild(label);
  slot.appendChild(wrap);
  procOrbitStage.appendChild(slot);
  return slot;
}) : [];

// Orbit state — driven by scroll progress via proxy
const orbitState = { radius: EXIT_R, alpha: 0, angleOffset: -Math.PI * 0.6 };
let orbitBaseAngle = -Math.PI / 2;
const N = CIRCLES.length;

// Scroll-scrubbed timeline via proxy object
const orbitProxy = { p: 0 };
const ENTRY_END = 0.25, ORBIT_END = 0.75;
const ORBIT_ANGLE = Math.PI * 0.6;            // main rotation, 108°
const EDGE_ANGLE  = ORBIT_ANGLE * 0.25;       // matches angular-velocity continuity at boundaries

function easeOut2(t) { return 1 - (1 - t) * (1 - t); }
function easeIn2(t)  { return t * t; }

function updateOrbitFromProgress() {
  const p = orbitProxy.p;
  if (p <= ENTRY_END) {
    const t  = p / ENTRY_END;
    const eR = easeOut2(t);
    orbitState.radius      = EXIT_R - (EXIT_R - ORBIT_R) * eR;
    orbitState.angleOffset = -Math.PI * 0.6 * (1 - eR);
    orbitState.alpha       = Math.min(1, t * 2.0);
    orbitBaseAngle         = -Math.PI / 2 + EDGE_ANGLE * easeIn2(t);
  } else if (p <= ORBIT_END) {
    const rp = (p - ENTRY_END) / (ORBIT_END - ENTRY_END);
    orbitState.radius      = ORBIT_R;
    orbitState.angleOffset = 0;
    orbitState.alpha       = 1;
    orbitBaseAngle         = -Math.PI / 2 + EDGE_ANGLE + ORBIT_ANGLE * rp;
  } else {
    const op = (p - ORBIT_END) / (1 - ORBIT_END);
    const eR = easeIn2(op);
    orbitState.radius      = ORBIT_R + (EXIT_R - ORBIT_R) * eR;
    orbitState.angleOffset = Math.PI * 0.6 * eR;
    orbitState.alpha       = 1 - eR;
    orbitBaseAngle         = -Math.PI / 2 + EDGE_ANGLE + ORBIT_ANGLE + EDGE_ANGLE * easeOut2(op);
  }
}

const orbitScrollTl = gsap.timeline({ paused: true })
  .to(orbitProxy, { p: 1, ease: 'none', onUpdate: updateOrbitFromProgress });

gsap.ticker.add(() => {
  circleEls.forEach((el, i) => {
    const a = (i / N) * Math.PI * 2 + orbitBaseAngle + orbitState.angleOffset;
    el.style.transform = `translate(${(Math.cos(a) * orbitState.radius).toFixed(2)}px,${(Math.sin(a) * orbitState.radius).toFixed(2)}px)`;
    el.style.opacity   = orbitState.alpha;

    // Comet: rotate orb so its sharp side faces the direction of travel.
    // Travel tangent for clockwise orbit at angle a = atan2(cos(a), -sin(a)).
    const travelDeg = Math.atan2(Math.cos(a), -Math.sin(a)) * 180 / Math.PI;
    const sharpDeg  = ORB_SHARP_ANGLE[CIRCLES[i].variant] * 180 / Math.PI;
    if (orbEls[i]) orbEls[i].style.transform = `rotate(${(travelDeg - sharpDeg).toFixed(1)}deg)`;
  });

  // Slide procSection over the still-pinned statement.
  // Lives on gsap.ticker (paint-coupled) instead of the scroll listener so it
  // can't lag a frame on aggressive scrolls — that lag was leaving cream gaps
  // at the top of the section when flicking back upward.
  if (procWrap && procSection && stmtWrap) {
    const procRectTop = procWrap.getBoundingClientRect().top;
    if (procRectTop > 0) {
      const stmtP  = sceneProg(stmtWrap);
      const slideP = clamp01((stmtP - 0.6) / 0.4);
      const target = (1 - slideP) * window.innerHeight;
      procSection.style.transform = `translateY(${(target - procRectTop).toFixed(1)}px)`;
    } else if (procSection.style.transform) {
      procSection.style.transform = '';
    }
  }
});

// Defer trigger until fonts/layout settle
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
  ScrollTrigger.create({
    trigger:   '#process-wrap',
    start:     'top top',
    end:       'bottom bottom',
    scrub:     2.0,
    animation: orbitScrollTl,
  });
});

// 2d. Decorative star SVG generators
function sparkleStar(size, color) {
  const s = size / 2, t = s * 0.07;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"><path d="M${s} 0 L${s+t} ${s-t} L${size} ${s} L${s+t} ${s+t} L${s} ${size} L${s-t} ${s+t} L0 ${s} L${s-t} ${s-t}Z" fill="${color}"/></svg>`;
}
function starburst8(size, color, innerRatio = 0.35) {
  const s = size / 2; let d = '';
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8 - Math.PI / 2;
    const r = i % 2 === 0 ? s : s * innerRatio;
    d += (i === 0 ? 'M' : 'L') + ' ' + (s + r * Math.cos(angle)).toFixed(2) + ' ' + (s + r * Math.sin(angle)).toFixed(2) + ' ';
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"><path d="${d}Z" fill="${color}"/></svg>`;
}
function starburst6(size, color) {
  const s = size / 2; let d = '';
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6 - Math.PI / 2;
    const r = i % 2 === 0 ? s : s * 0.08;
    d += (i === 0 ? 'M' : 'L') + ' ' + (s + r * Math.cos(angle)).toFixed(2) + ' ' + (s + r * Math.sin(angle)).toFixed(2) + ' ';
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"><path d="${d}Z" fill="${color}"/></svg>`;
}
function starSvg(type, size, color) {
  if (type === 'sparkle') return sparkleStar(size, color);
  if (type === 'burst6')  return starburst6(size, color);
  return starburst8(size, color, 0.28);
}
function spinClass(type) {
  if (type === 'burst8') return 'star-spin-slow';
  if (type === 'burst6') return 'star-spin-reverse';
  return 'star-spin';
}

function placeStar(parent, def) {
  const wrap = document.createElement('div');
  wrap.style.cssText = `position:absolute;left:${def.x};top:${def.y};width:${def.size}px;height:${def.size}px;margin-left:-${def.size/2}px;margin-top:-${def.size/2}px;opacity:0;will-change:transform,opacity;transition:opacity .8s ease;`;
  if (def.baseOp != null) wrap.dataset.baseOpacity = def.baseOp;
  const inner = document.createElement('div');
  inner.className = spinClass(def.type);
  inner.innerHTML = starSvg(def.type, def.size, def.color);
  wrap.appendChild(inner);
  parent.appendChild(wrap);
  return wrap;
}

// Statement scene stars
const stmtStarsEl = document.getElementById('statementStars');
const stmtDecor = [];
[
  { x:'8%',  y:'15%', size:32, type:'burst8',  color:'#3A4A16', speed:80,  baseOp:0.65 },
  { x:'88%', y:'10%', size:20, type:'burst6',  color:'#3A4A16', speed:120, baseOp:0.55 },
  { x:'78%', y:'68%', size:48, type:'burst8',  color:'#5C7A22', speed:55,  baseOp:0.5  },
  { x:'50%', y:'6%',  size:14, type:'sparkle', color:'#3A4A16', speed:70,  baseOp:0.5  },
  { x:'92%', y:'48%', size:22, type:'burst6',  color:'#5C7A22', speed:110, baseOp:0.55 },
  { x:'12%', y:'72%', size:28, type:'burst8',  color:'#C4622A', speed:95,  baseOp:0.75 },
  { x:'62%', y:'82%', size:16, type:'sparkle', color:'#C4622A', speed:85,  baseOp:0.8  },
  { x:'35%', y:'92%', size:10, type:'sparkle', color:'#C4622A', speed:60,  baseOp:0.6  },
  { x:'72%', y:'28%', size:22, type:'burst6',  color:'#24445A', speed:100, baseOp:0.7  },
  { x:'4%',  y:'45%', size:14, type:'sparkle', color:'#24445A', speed:75,  baseOp:0.65 },
  { x:'85%', y:'85%', size:30, type:'burst8',  color:'#6B5A7A', speed:65,  baseOp:0.6  },
  { x:'22%', y:'22%', size:12, type:'sparkle', color:'#6B5A7A', speed:90,  baseOp:0.7  },
].forEach(def => {
  const el = placeStar(stmtStarsEl, def);
  stmtDecor.push({ el, speed: def.speed, baseY: 0 });
});

// Work scene stars
const workStarField = document.getElementById('workStarField');
const workStarItems = [
  { x:'4%',  y:'18%', size:32, type:'burst8',  color:'#C4622A', speed:0.14 },
  { x:'92%', y:'12%', size:20, type:'sparkle', color:'#6B5A7A', speed:0.20 },
  { x:'88%', y:'65%', size:44, type:'burst8',  color:'#24445A', speed:0.10 },
  { x:'6%',  y:'72%', size:18, type:'sparkle', color:'#C4622A', speed:0.17 },
  { x:'94%', y:'38%', size:14, type:'burst6',  color:'#5C7A22', speed:0.12 },
  { x:'3%',  y:'45%', size:26, type:'burst8',  color:'#6B5A7A', speed:0.08 },
  { x:'90%', y:'85%', size:16, type:'sparkle', color:'#24445A', speed:0.15 },
  { x:'8%',  y:'90%', size:12, type:'burst6',  color:'#C4622A', speed:0.11 },
].map(def => ({ el: placeStar(workStarField, def), speed: def.speed }));

// Work→About exit stars
const workExitStarsEl = document.getElementById('workExitStars');
const workExitStarItems = [
  { x:'10%', y:'20%', size:34, type:'burst8',  color:'#C4622A', speed:0.06 },
  { x:'85%', y:'15%', size:22, type:'sparkle', color:'#6B5A7A', speed:0.10 },
  { x:'70%', y:'70%', size:44, type:'burst8',  color:'#24445A', speed:0.05 },
  { x:'20%', y:'75%', size:16, type:'sparkle', color:'#C4622A', speed:0.09 },
  { x:'50%', y:'10%', size:18, type:'burst6',  color:'#6B5A7A', speed:0.07 },
].map(def => ({ el: placeStar(workExitStarsEl, def), speed: def.speed }));

/* ─── 3. SCROLL DRIVERS ───────────────────────────────────────────────── */
function clamp01(v) { return Math.max(0, Math.min(1, v)); }
function smooth(t) { return t * t * t * (t * (6 * t - 15) + 10); }
function progress(scrollY, top, bottom) { return (scrollY - top) / (bottom - top); }
function sceneProg(wrap) {
  if (!wrap) return 0;
  const rect = wrap.getBoundingClientRect();
  const wh   = window.innerHeight;
  return clamp01(-rect.top / (wrap.offsetHeight - wh));
}
// Returns 0→1 as wrap approaches from below over approachVh viewports, then stays 1
function approachInP(wrap, approachVh) {
  if (!wrap) return 1;
  const rect = wrap.getBoundingClientRect();
  return rect.top > 0 ? clamp01(1 - rect.top / (approachVh * window.innerHeight)) : 1;
}
// Returns 0→1 over the pin phase, but holds at 0 for the first `hold` fraction
function pinExitP(wrap, hold) {
  const p = sceneProg(wrap);
  return clamp01((p - hold) / (1 - hold));
}
// Returns 0→1 as nextWrap approaches: 0 while nextWrap.top > startVh*wh, 1 at endVh*wh
function approachExitP(nextWrap, startVh, endVh) {
  if (!nextWrap) return 0;
  const rect = nextWrap.getBoundingClientRect();
  const wh = window.innerHeight;
  return clamp01((startVh * wh - rect.top) / ((startVh - endVh) * wh));
}

// 3a. Hero letter reveal
function onHeroScroll() {
  const heroSection = document.getElementById('home');
  if (!heroSection) return;
  const heroTop = heroSection.offsetTop;
  const heroH   = heroSection.offsetHeight;
  const p = progress(window.scrollY, heroTop, heroTop + heroH * 0.75);
  const total = allLetterEls.length;
  allLetterEls.forEach((el, i) => {
    el.classList.toggle('lit', p >= i / total);
  });
}

// 3b. Scene 1 — Statement (cream → olive bg, content fade with blur)
const stmtWrap    = document.getElementById('statement-wrap');
const stmtSection = document.getElementById('statement');
const stmtContent = document.getElementById('statementText');

function applyTimeline(p, content, decorItems, inP) {
  const rawIn     = inP !== undefined ? inP : 1;
  const delayedIn = clamp01((rawIn - 0.08) / 0.92);
  const _in  = 1 - Math.pow(1 - delayedIn, 2); // ease-out-quad: completes more gradually
  const outP = Math.pow(clamp01(p), 2.5);
  const op   = _in * (1 - outP);
  const scale = (0.70 + _in * 0.30) * (1 - outP * 0.26);
  const transY = (1 - _in) * 60 - outP * 110;
  const blur   = (1 - _in) * 20 + outP * 10;
  content.style.opacity   = op;
  content.style.filter    = `blur(${blur.toFixed(1)}px)`;
  content.style.transform = `translateY(${transY.toFixed(1)}px) scale(${scale.toFixed(3)})`;

  decorItems.forEach(({ el, speed, baseY }) => {
    const drift = outP * speed;
    el.style.opacity   = op * (el.dataset.baseOpacity || 1);
    el.style.transform = `translateY(${(baseY - drift).toFixed(1)}px)`;
  });
}

// 3c. Scene 2 — Process
const procWrap    = document.getElementById('process-wrap');
const procSection = document.getElementById('process');

// 3d. Work card swap
const workPinWrap  = document.getElementById('work-pin-wrap');
const workSection  = document.getElementById('work');
const workHeaderEl = document.getElementById('workHeader');

// 3e. About scene
const aboutWrap    = document.getElementById('about-wrap');
const aboutContent = document.getElementById('aboutContent');


function onPinnedScroll() {
  const sy = window.scrollY;
  const wh = window.innerHeight;

  // Scene 1 — Statement: subtle drift while next section slides on top
  const SLIDE_START = 0.6;
  const stmtP = stmtWrap ? sceneProg(stmtWrap) : 0;
  const slideP = clamp01((stmtP - SLIDE_START) / (1 - SLIDE_START));
  const slideE = Math.pow(slideP, 1.6);

  if (stmtWrap && stmtContent) {
    const inP = approachInP(stmtWrap, 1.3);
    const delayedIn = clamp01((inP - 0.08) / 0.92);
    const _in = 1 - Math.pow(1 - delayedIn, 2);
    const scale  = (0.70 + _in * 0.30) * (1 - slideE * 0.08);
    const transY = (1 - _in) * 60 - slideE * 40;
    const blur   = (1 - _in) * 20 + slideE * 14;

    stmtContent.style.opacity   = _in;
    stmtContent.style.filter    = `blur(${blur.toFixed(1)}px)`;
    stmtContent.style.transform = `translateY(${transY.toFixed(1)}px) scale(${scale.toFixed(3)})`;

    stmtDecor.forEach(({ el, speed, baseY }) => {
      const drift = slideE * speed * 0.5;
      el.style.opacity   = _in * (el.dataset.baseOpacity || 1);
      el.style.transform = `translateY(${(baseY - drift).toFixed(1)}px)`;
    });
  }

  // Scene 2 — Process: bg fade only. Slide-up transform lives in gsap.ticker
  // for paint-coupled timing.
  if (procWrap && procSection) {
    const bgOutP = approachExitP(workPinWrap, 1.05, 0.05);
    const pr = Math.round(33 + (240 - 33) * bgOutP);
    const pg = Math.round(46 + (239 - 46) * bgOutP);
    const pb = Math.round(2  + (233 - 2)  * bgOutP);
    procSection.style.background = `rgb(${pr},${pg},${pb})`;
  }
}

function onWorkScroll() {
  if (!workPinWrap || !workCardEls.length) return;
  const rect        = workPinWrap.getBoundingClientRect();
  const wh          = window.innerHeight;
  const totalScroll = workPinWrap.offsetHeight - wh;
  const globalP     = clamp01(-rect.top / totalScroll);

  // No work-section fade-out — the about-wrap slides up over it (margin-top: -100vh)
  // Work stays pinned until about fully covers (matched timing).
  if (workSection) workSection.style.background = '';

  // Header has a larger approach distance so it starts appearing as process exits
  const headerInP  = smooth(approachInP(workPinWrap, 1.2));
  // Cards use a tighter approach — they wait for the header to clear
  const entryInP   = smooth(approachInP(workPinWrap, 0.60));
  // As about slides in over the last ~14% of work scroll (100vh of 700vh totalScroll),
  // blur and scale the card content down (rather than letting it slide up — work stays in place).
  const aboutInP = clamp01((globalP - 0.857) / 0.143);
  if (workCardsEl) {
    const blur  = aboutInP * 8;
    const scale = 1 - aboutInP * 0.06;
    workCardsEl.style.filter    = aboutInP > 0 ? `blur(${blur.toFixed(2)}px)` : '';
    workCardsEl.style.transform = aboutInP > 0 ? `scale(${scale.toFixed(3)})` : '';
    workCardsEl.style.opacity   = entryInP;
  }

  // Header: fades in on approach (early), then out as first card enters
  if (workHeaderEl) {
    const hIn  = 1 - Math.pow(1 - clamp01((headerInP - 0.08) / 0.92), 3);
    const hOut = Math.pow(clamp01(globalP / 0.14), 1.8);
    workHeaderEl.style.opacity   = hIn * (1 - hOut);
    workHeaderEl.style.transform = `translateY(${((1 - hIn) * 40 - hOut * 50).toFixed(1)}px)`;
  }

  // Directional card swap — enter from below, exit upward (Marimba-style)
  // vh units ensure cards are fully off-screen before the next appears.
  // Last card gets a wider band so its pure-dwell (before about slides in) matches the
  // dwell of the previous cards.
  const n          = PROJECTS.length;
  const CARD_START = 0.10;
  const CARD_END   = 1.0;
  const TRANS      = 0.025;
  const lastBoost  = 1.5;  // last card cardBand is 1.5x the others
  const stdBand    = (CARD_END - CARD_START) / (n - 1 + lastBoost);
  const lastBand   = stdBand * lastBoost;

  const lastIdx = workCardEls.length - 1;
  workCardEls.forEach((card, i) => {
    const isLast = i === lastIdx;
    const cs     = CARD_START + i * stdBand;
    const ce     = isLast ? cs + lastBand : cs + stdBand;
    const entryS = cs - TRANS, entryE = cs + TRANS;
    const exitS  = ce - TRANS, exitE  = ce + TRANS;

    let op, ty;
    if (globalP <= entryS) {
      op = 1; ty = 100;                              // waiting below (clipped by overflow:hidden)
    } else if (globalP < entryE) {
      const t = (globalP - entryS) / (TRANS * 2);
      const e = 1 - Math.pow(1 - t, 2.5);           // ease-out snap up
      op = 1;
      ty = (1 - e) * 100;                            // 100vh → 0
    } else if (globalP < exitS) {
      op = 1; ty = 0;                                // dwell
    } else if (globalP < exitE) {
      // Last card stays in place; about-wrap slides up over it (blur+scale handles fade)
      if (isLast) {
        op = 1; ty = 0;
      } else {
        const t = (globalP - exitS) / (TRANS * 2);
        const e = Math.pow(t, 2);                    // ease-in push out
        op = 1 - e * 0.35;
        ty = -e * 100;                               // 0 → -100vh
      }
    } else {
      if (isLast) {
        op = 1; ty = 0;                              // last card holds in place
      } else {
        op = 0; ty = -100;                           // gone above
      }
    }

    card.style.opacity      = op;
    card.style.transform    = `translateY(${ty.toFixed(2)}vh)`;
    card.style.pointerEvents = op > 0.5 ? 'auto' : 'none';

    // Visual frame: same timing, translateY in % (clipped by frame overflow:hidden)
    if (workVisualEls[i]) {
      workVisualEls[i].style.transform = `translateY(${ty.toFixed(2)}%)`;
    }
  });

  const activeIdx = Math.min(n - 1, Math.floor(clamp01((globalP - CARD_START) / (CARD_END - CARD_START)) * n));
  if (workProgressEl) workProgressEl.textContent = `${String(activeIdx + 1).padStart(2, '0')} / 0${n}`;

  // Work star field parallax
  const starOp = Math.min(globalP * 6, (1 - globalP) * 6, 0.85);
  workStarItems.forEach(({ el, speed }) => {
    el.style.opacity   = Math.max(0, starOp);
    el.style.transform = `translateY(${(-globalP * wh * speed).toFixed(1)}px)`;
  });
}

function onAboutScroll() {
  const sy = window.scrollY;
  const wh = window.innerHeight;

  if (aboutWrap && aboutContent) {
    const inP  = approachInP(aboutWrap, 0.90);
    const d    = clamp01((inP - 0.08) / 0.92);
    const ease = 1 - Math.pow(1 - d, 2);
    aboutContent.style.opacity   = ease;
    aboutContent.style.filter    = `blur(${((1 - ease) * 10).toFixed(1)}px)`;
    aboutContent.style.transform = `translateY(${((1 - ease) * 28).toFixed(1)}px)`;
  }

  if (workExitStarsEl && workPinWrap) {
    const rect   = workPinWrap.getBoundingClientRect();
    const workGP = clamp01(-rect.top / (workPinWrap.offsetHeight - wh));
    const exitP  = clamp01((workGP - 0.78) / 0.22);
    const aboutP = aboutWrap ? sceneProg(aboutWrap) : 0;
    const aboutInP = clamp01(aboutP / 0.35);
    const starsOp = Math.max(0, Math.min(0.9, exitP * 3 * (1 - aboutInP * 1.4)));
    workExitStarsEl.style.opacity = starsOp;
    workExitStarItems.forEach(({ el, speed }) => {
      el.style.opacity   = starsOp;
      el.style.transform = `translateY(${(-(sy * speed) % wh).toFixed(1)}px)`;
    });
  }
}

function onScroll() {
  onHeroScroll();
  onPinnedScroll();
  onWorkScroll();
  onAboutScroll();
  scheduleWorkAutoScrollCheck();
}

/* Auto-scroll past the "My projects" title screen.
   Triggers: (a) when the user lands on the title and stops scrolling for ~400ms,
   (b) when they click the "Work" nav item. Uses a custom JS animation with
   adjustable duration so the scroll feels slow and deliberate, not abrupt. */
const _prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const WORK_AUTOSCROLL_DURATION = 1800; // ms — slower, more cinematic
let workIdleTimer = null;
let workAutoScrolling = false;

function smoothScrollToY(targetY, duration) {
  const startY    = window.scrollY;
  const distance  = targetY - startY;
  if (Math.abs(distance) < 2) return;
  const startTime = performance.now();
  workAutoScrolling = true;
  function step(now) {
    if (!workAutoScrolling) return; // aborted (user took over)
    const elapsed  = now - startTime;
    const t        = Math.min(elapsed / duration, 1);
    // ease-out cubic: responsive immediate start, gentle deceleration into
    // the destination. The previous in-out cubic felt sluggish at the start
    // (no perceived response to the click for the first ~200ms).
    const eased    = 1 - Math.pow(1 - t, 3);
    window.scrollTo(0, startY + distance * eased);
    if (t < 1) requestAnimationFrame(step);
    else workAutoScrolling = false;
  }
  requestAnimationFrame(step);
}

// Cancel the programmatic scroll if the user manually takes over.
let workNavPhase2Timer = null;
['wheel','touchstart','keydown'].forEach(evt => {
  window.addEventListener(evt, () => {
    if (workAutoScrolling) workAutoScrolling = false;
    // Also cancel a pending click-initiated Phase 2 if the user grabs scroll.
    if (workNavPhase2Timer) { clearTimeout(workNavPhase2Timer); workNavPhase2Timer = null; }
  }, { passive: true });
});

function scheduleWorkAutoScrollCheck() {
  if (!workPinWrap || _prefersReducedMotion) return;
  if (workAutoScrolling) return; // don't re-trigger during our own programmatic scroll
  if (workNavPhase2Timer) return; // a click-initiated Phase 2 is already scheduled
  clearTimeout(workIdleTimer);
  workIdleTimer = setTimeout(checkWorkAutoScroll, 400);
}

function checkWorkAutoScroll() {
  if (!workPinWrap || _prefersReducedMotion || workAutoScrolling) return;
  const rect = workPinWrap.getBoundingClientRect();
  const wh   = window.innerHeight;
  // Are we currently parked on the title area? (wrap top near or just past viewport top,
  // and we're within the first ~8% of the wrap — i.e. still on the title, not into cards.)
  const inTitle = rect.top <= 0 && rect.top > -(workPinWrap.offsetHeight - wh) * 0.08;
  if (!inTitle) return;
  triggerWorkAutoScroll();
}

function triggerWorkAutoScroll() {
  if (!workPinWrap || _prefersReducedMotion) return;
  const totalScroll = workPinWrap.offsetHeight - window.innerHeight;
  const target      = workPinWrap.offsetTop + totalScroll * 0.12;
  smoothScrollToY(target, WORK_AUTOSCROLL_DURATION);
}

// Hook the "Work" nav item — two-phase scroll:
//
//   PHASE 1: native browser smooth-scroll to the top of the work pin-wrap
//            (the "My projects" title). Same mechanism, speed and easing as
//            the other homepage anchors.
//
//   PAUSE:   ~1.8s on the title before advancing — deliberate beat, feels
//            intentional. Total click → first project ≈ 2.4s.
//
//   PHASE 2: fast smooth-scroll past the title to the first project card.
//            Short duration (~700ms) so the advance feels snappy, not the
//            slow cinematic 1.8s used by the idle auto-scroll.
const WORK_NAV_PHASE2_DELAY    = 1300; // ms to wait on the title before advancing
const WORK_NAV_PHASE2_DURATION = 700;  // ms duration of the advance itself
const workNavItem = document.querySelector('[data-nav="work"]');
if (workNavItem && workPinWrap) {
  workNavItem.addEventListener('click', (e) => {
    e.preventDefault();
    history.replaceState(null, '', '#work');
    window.scrollTo({ top: workPinWrap.offsetTop, behavior: 'smooth' });
    if (workNavPhase2Timer) clearTimeout(workNavPhase2Timer);
    workNavPhase2Timer = setTimeout(() => {
      workNavPhase2Timer = null;
      if (!workPinWrap || _prefersReducedMotion) return;
      const totalScroll = workPinWrap.offsetHeight - window.innerHeight;
      const target      = workPinWrap.offsetTop + totalScroll * 0.12;
      smoothScrollToY(target, WORK_NAV_PHASE2_DURATION);
    }, WORK_NAV_PHASE2_DELAY);
  });
}

// Init hidden states
if (stmtContent) { stmtContent.style.opacity = '0'; stmtContent.style.filter = 'blur(10px)'; stmtContent.style.transform = 'translateY(30px) scale(1)'; }
if (aboutContent) { aboutContent.style.cssText = 'opacity:0;filter:blur(10px);transform:translateY(28px);will-change:opacity,transform,filter;'; }
stmtDecor.forEach(d => { d.el.style.opacity = '0'; });

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ─── 4. REVEAL OBSERVER ──────────────────────────────────────────────── */
const REVEAL_SELECTORS = [
  '.reveal',
  '.stagger-group',
  '.reveal-heading',
  '.reveal-eyebrow',
  '.reveal-pill',
].join(',');

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(REVEAL_SELECTORS).forEach(el => revealObs.observe(el));

/* ─── 5. NAV OBSERVER ─────────────────────────────────────────────────── */
const navItems = document.querySelectorAll('.nav-item[data-nav]');
function setActiveNav(id) {
  navItems.forEach((item) => {
    const dot = item.querySelector('.nav-dot');
    const isActive = item.dataset.nav === id;
    item.classList.toggle('active', isActive);
    if (dot) dot.style.display = isActive ? 'inline' : 'none';
  });
}
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const navId = entry.target.getAttribute('data-nav-section');
      if (navId) setActiveNav(navId);
    }
  });
}, { threshold: 0.35 });
document.querySelectorAll('[data-nav-section]').forEach(el => sectionObs.observe(el));

// Initial: light up first 3 hero letters once fonts load so it never feels blank
window.addEventListener('load', () => {
  allLetterEls.slice(0, 3).forEach(el => el.classList.add('lit'));
});

/* ─── 6. PAGE TRANSITION ─────────────────────────────────────────────────── */
const pageOverlay      = document.getElementById('pageOverlay');
const pageOverlayLabel = document.getElementById('pageOverlayLabel');

function navigateWithTransition(href, label) {
  if (!pageOverlay) { window.location.href = href; return; }
  if (pageOverlayLabel && label) pageOverlayLabel.textContent = label;
  pageOverlay.classList.add('active');
  setTimeout(() => { window.location.href = href; }, 900);
}

// Map of link slugs to readable labels for the overlay
const TRANSITION_LABELS = {
  'work/pwc-bridge/':       'PwC Bridge',
  'work/hey-honey/':        'Hey Honey',
  'work/certifaction/':     'Certifaction',
  'work/share-your-bag/':   'Share Your Bag',
  'work/illustrations.html':'Illustrations',
};

// Intercept any same-origin link that points into /work/
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="work/"]');
  if (!a) return;
  const href = a.getAttribute('href');
  if (!href) return;
  if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  const label = TRANSITION_LABELS[href] ||
    (a.querySelector('.project-title')?.textContent.trim()) ||
    'Loading';
  navigateWithTransition(href, label);
});
