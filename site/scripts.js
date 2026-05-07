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
    eyebrow: '2024 — Present · Lead UX/UI · PwC Switzerland',
    title:   'PwC Bridge',
    desc:    "Consolidating fragmented tools into a single role-aware workspace for PwC Switzerland's Tax & Technology teams.",
    bg:      'linear-gradient(135deg,#1e2c0e 0%,#2c3d12 100%)',
    accent:  '#8FA96B',
    href:    'work/pwc-bridge/',
  },
  {
    num: '02', total: '04',
    eyebrow: '2025 · UX/UI · Personal',
    title:   'Hey Honey',
    desc:    'A curated marketplace for high-quality, locally produced honey — mobile-first, subscription-friendly, gift-ready.',
    bg:      'linear-gradient(135deg,#2e2208 0%,#4a3810 100%)',
    accent:  '#C8A84B',
    href:    'work/hey-honey/',
  },
  {
    num: '03', total: '04',
    eyebrow: '2023 · UX/UI · Certifaction AG',
    title:   'Certifaction',
    desc:    "A 3-month sprint at Switzerland's leading eSignature provider. Onboarding redesign took task completion from 3/10 to 7/10.",
    bg:      'linear-gradient(135deg,#0a1520 0%,#162436 100%)',
    accent:  '#6B8FA9',
    href:    'work/certifaction/',
  },
  {
    num: '04', total: '04',
    eyebrow: '2021 — 2026 · UX/UI · Personal',
    title:   'Share Your Bag',
    desc:    'Revisiting my first UX project five years later, with a product mindset. A peer-to-peer marketplace for designer handbag rentals.',
    bg:      'linear-gradient(135deg,#22152a 0%,#36204a 100%)',
    accent:  '#A98FA9',
    href:    'work/share-your-bag/',
  },
];

const OVALS = [
  { label: 'Listen & define', color: '#B85A24' },
  { label: 'Strategy & plan', color: '#3A4A16' },
  { label: 'Design & refine', color: '#6B5A7A' },
  { label: 'Build & test',    color: '#24445A' },
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

const workCardEls = PROJECTS.map((p, idx) => {
  const card = document.createElement('div');
  card.className = 'work-card';
  card.style.cssText = 'opacity:0;transition:none;';
  const flip = idx % 2 === 1;
  card.innerHTML = `
    <div class="work-card-grid"${flip ? ' style="direction:rtl"' : ''}>
      <div style="direction:ltr">
        <div class="project-eyebrow">${p.eyebrow}</div>
        <h2 class="project-title">${p.title}</h2>
        <p class="project-desc">${p.desc}</p>
        <a href="${p.href}" class="pill pill-dark">View case study</a>
      </div>
      <div style="direction:ltr">
        <div class="thumb" style="background:${p.bg}">
          <div class="thumb-glow" style="background:${p.accent}"></div>
          <span class="thumb-label" style="color:${p.accent}">project image</span>
        </div>
      </div>
    </div>
  `;
  workCardsEl.appendChild(card);
  return card;
});

// 2c. Ovals
const ovalsWrap = document.getElementById('ovalsWrap');
const ovalEls = OVALS.map((o, i) => {
  const el = document.createElement('div');
  el.className = 'oval';
  el.style.background = o.color;
  el.style.zIndex = OVALS.length - i;
  el.innerHTML = `<span>${o.label}</span>`;
  ovalsWrap.appendChild(el);
  return el;
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
function progress(scrollY, top, bottom) { return (scrollY - top) / (bottom - top); }
function sceneProg(wrap) {
  if (!wrap) return 0;
  const rect = wrap.getBoundingClientRect();
  const wh   = window.innerHeight;
  return clamp01(-rect.top / (wrap.offsetHeight - wh));
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

function applyTimeline(p, content, decorItems) {
  const inP  = clamp01(p / 0.30);
  const outP = clamp01((p - 0.70) / 0.30);
  const op    = inP * (1 - outP);
  const blur  = (1 - inP) * 10 + outP * 15;
  const transY = (1 - inP) * 30 - outP * 40;
  content.style.opacity   = op;
  content.style.filter    = `blur(${blur.toFixed(1)}px)`;
  content.style.transform = `translateY(${transY.toFixed(1)}px)`;

  decorItems.forEach(({ el, speed, baseY }) => {
    const drift = outP * speed;
    el.style.opacity   = op * (el.dataset.baseOpacity || 1);
    el.style.transform = `translateY(${(baseY - drift).toFixed(1)}px)`;
  });
}

// 3c. Scene 2 — Process (with collapsing ovals)
const procWrap    = document.getElementById('process-wrap');
const procSection = document.getElementById('process');
const procContent = document.getElementById('processContent');
const ovalsEl     = document.getElementById('ovalsWrap');

// 3d. Work card swap
const workPinWrap = document.getElementById('work-pin-wrap');
const workSection = document.getElementById('work');

// 3e. About scene
const aboutWrap    = document.getElementById('about-wrap');
const aboutContent = document.getElementById('aboutContent');

function onPinnedScroll() {
  const sy = window.scrollY;
  const wh = window.innerHeight;

  // Scene 1 — Statement
  if (stmtWrap && stmtContent) {
    const p = sceneProg(stmtWrap);
    const outPbg = clamp01((p - 0.50) / 0.30);
    const r = Math.round(241 + (33  - 241) * outPbg);
    const g = Math.round(240 + (46  - 240) * outPbg);
    const b = Math.round(234 + (2   - 234) * outPbg);
    if (stmtSection) stmtSection.style.background = `rgb(${r},${g},${b})`;
    applyTimeline(p, stmtContent, stmtDecor);
  }

  // Scene 2 — Process (longer hold)
  if (procWrap && procContent) {
    const p = sceneProg(procWrap);
    const bgOutP = clamp01((p - 0.72) / 0.28);
    const pr = Math.round(33 + (240 - 33) * bgOutP);
    const pg = Math.round(46 + (239 - 46) * bgOutP);
    const pb = Math.round(2  + (233 - 2)  * bgOutP);
    if (procSection) procSection.style.background = `rgb(${pr},${pg},${pb})`;

    const inP  = clamp01(p / 0.25);
    const outP = clamp01((p - 0.82) / 0.18);
    const op    = inP * (1 - outP);
    const blur  = (1 - inP) * 10 + outP * 15;
    const transY = (1 - inP) * 30 - outP * 40;
    procContent.style.opacity   = op;
    procContent.style.filter    = `blur(${blur.toFixed(1)}px)`;
    procContent.style.transform = `translateY(${transY.toFixed(1)}px)`;

    if (ovalsEl) {
      const SPREAD = 72, TIGHT = 22;
      const oP = clamp01((p - 0.20) / 0.60);
      ovalEls.forEach((el, i) => {
        const y = SPREAD * i + (TIGHT * i - SPREAD * i) * oP;
        el.style.transform = `translateY(${y}px)`;
      });
    }
  }
}

function onWorkScroll() {
  if (!workPinWrap || !workCardEls.length) return;
  const rect = workPinWrap.getBoundingClientRect();
  const wh   = window.innerHeight;
  const totalScroll = workPinWrap.offsetHeight - wh;
  const globalP = clamp01(-rect.top / totalScroll);

  // Background cream → olive during last 18%
  const bgOutP = clamp01((globalP - 0.82) / 0.18);
  const r = Math.round(240 + (33 - 240) * bgOutP);
  const g = Math.round(239 + (46 - 239) * bgOutP);
  const b = Math.round(233 + (2  - 233) * bgOutP);
  if (workSection) workSection.style.background = `rgb(${r},${g},${b})`;

  // Cards exit during last 12%
  const cardsExitP = clamp01((globalP - 0.88) / 0.12);
  if (workCardsEl) {
    workCardsEl.style.filter    = `blur(${(cardsExitP * 12).toFixed(1)}px)`;
    workCardsEl.style.transform = `translateY(${(-cardsExitP * 30).toFixed(1)}px)`;
    workCardsEl.style.opacity   = 1 - cardsExitP;
  }

  // Each card occupies 1/n of the window
  const n = PROJECTS.length;
  workCardEls.forEach((card, i) => {
    const centre = (i + 0.5) / n;
    const half   = 0.5 / n;
    const dist   = Math.abs(globalP - centre);
    const t      = Math.max(0, 1 - dist / half);
    const easedT = t < 0.5 ? 2*t*t : -1 + (4 - 2*t) * t;
    card.style.opacity = easedT;
    const dir   = globalP < centre ? 1 : -1;
    const drift = (1 - easedT) * 28 * dir;
    card.style.transform = `translateY(calc(-50% + ${drift.toFixed(1)}px))`;
    card.style.pointerEvents = easedT > 0.5 ? 'auto' : 'none';
  });

  const activeIdx = Math.min(n - 1, Math.floor(globalP * n));
  if (workProgressEl) workProgressEl.textContent = `0${activeIdx + 1} / 0${n}`;

  // Work star field parallax
  const starOp = Math.min(globalP * 6, (1 - globalP) * 6, 0.85);
  workStarItems.forEach(({ el, speed }) => {
    el.style.opacity = Math.max(0, starOp);
    el.style.transform = `translateY(${(-globalP * wh * speed).toFixed(1)}px)`;
  });
}

function onAboutScroll() {
  const sy = window.scrollY;
  const wh = window.innerHeight;

  if (aboutWrap && aboutContent) {
    const p    = sceneProg(aboutWrap);
    const inP  = clamp01(p / 0.35);
    const outP = clamp01((p - 0.80) / 0.20);
    aboutContent.style.opacity   = inP * (1 - outP);
    aboutContent.style.filter    = `blur(${((1 - inP) * 10 + outP * 12).toFixed(1)}px)`;
    aboutContent.style.transform = `translateY(${((1 - inP) * 28 - outP * 35).toFixed(1)}px)`;
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
}

// Init hidden states
if (stmtContent) { stmtContent.style.opacity = '0'; stmtContent.style.filter = 'blur(10px)'; stmtContent.style.transform = 'translateY(30px)'; }
if (procContent) { procContent.style.opacity = '0'; procContent.style.filter = 'blur(10px)'; procContent.style.transform = 'translateY(30px)'; }
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
