/* ============================================================
   JADOOTECH ENTERPRISES — assets/js/main.js  v6
   Reads all content from /data/*.json — fully CMS-driven
   ============================================================ */

'use strict';

/* ── CONFIG (form endpoint overridden by site.json) ──────── */
const CONFIG = {
  GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxxVb6VneNQ3oR1GtwliWMkhUSPuxapBrOuGmxIRwmCz2Rnu1bT_qdLSy4AzDz66QT9hQ/exec',
  SCROLL_OFFSET: 72,
};

/* ── UTILS ───────────────────────────────────────────────── */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const setText = (id, val) => { const e = document.getElementById(id); if (e && val != null) e.textContent = val; };
const setAttr = (id, attr, val) => { const e = document.getElementById(id); if (e && val) e.setAttribute(attr, val); };
const safeFetch = async url => { try { const r = await fetch(url); return r.ok ? r.json() : null; } catch { return null; } };

/* ── BOOT: load all JSON then render ─────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  Theme.init();
  Nav.init();
  Reveal.init();
  Modals.init();
  Form.init();

  /* Load all data files in parallel */
  const [site, home, services, projects, about, process, tools, settings] = await Promise.all([
    safeFetch('data/site.json'),
    safeFetch('data/home.json'),
    safeFetch('data/services.json'),
    safeFetch('data/projects.json'),
    safeFetch('data/about.json'),
    safeFetch('data/process.json'),
    safeFetch('data/tools.json'),
    safeFetch('data/settings.json'),
  ]);

  /* Apply settings first (CSS vars, font) */
  if (settings) applySettings(settings);

  /* Override form endpoint from site.json */
  if (site?.formEndpoint) CONFIG.GOOGLE_SCRIPT_URL = site.formEndpoint;

  /* Render each section */
  if (site)     renderSite(site);
  if (home)     renderHome(home);
  if (services) renderServices(services);
  if (projects) renderProjects(projects);
  if (about)    renderAbout(about);
  if (process)  renderProcess(process);
  if (tools)    renderTools(tools);
  if (settings) applySectionVisibility(settings);

  /* Re-trigger scroll reveal for dynamically added elements */
  Reveal.observeNew();

  /* Dynamic footer year */
  const yr = document.getElementById('footer-year');
  if (yr) yr.textContent = new Date().getFullYear();
});

/* ── SETTINGS (CSS vars + font) ──────────────────────────── */
function applySettings(s) {
  const t = s.theme || {};
  const root = document.documentElement;
  if (t.accentColor) root.style.setProperty('--blue',    t.accentColor);
  if (t.navyColor)   root.style.setProperty('--navy',    t.navyColor);
  if (t.bgColor)     root.style.setProperty('--ivory',   t.bgColor);

  /* Font */
  const font = t.fontDisplay || 'Playfair Display';
  root.style.setProperty('--f-display', `'${font}', Georgia, serif`);
  const link = document.getElementById('google-font-link');
  if (link) {
    const slug = font.replace(/ /g, '+');
    link.href = `https://fonts.googleapis.com/css2?family=${slug}:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap`;
  }

  /* Theme default */
  if (t.default === 'dark')  Theme.apply('dark');
  if (t.default === 'light') Theme.apply('light');
}

function applySectionVisibility(s) {
  const vis = s.sections || {};
  const sectionMap = {
    hero:     '#home',
    services: '#services',
    work:     '#work',
    about:    '#about',
    process:  '#process',
    contact:  '#contact',
  };
  Object.entries(sectionMap).forEach(([key, selector]) => {
    if (vis[key] === false) {
      const el = document.querySelector(selector);
      if (el) { el.hidden = true; el.style.display = 'none'; }
      /* Also hide the preceding <hr> */
      const prev = el?.previousElementSibling;
      if (prev?.classList.contains('rule')) prev.style.display = 'none';
    }
  });
}

/* ── SITE (SEO, contact, social, footer) ─────────────────── */
function renderSite(site) {
  /* SEO meta */
  const seo = site.seo || {};
  if (seo.title)       { document.getElementById('page-title').textContent = seo.title; setAttr('og-title','content',seo.title); setAttr('tw-title','content',seo.title); }
  if (seo.description) { setAttr('page-desc','content',seo.description); setAttr('og-desc','content',seo.description); setAttr('tw-desc','content',seo.description); }
  if (seo.ogImage)     { setAttr('og-image','content',seo.ogImage); setAttr('tw-image','content',seo.ogImage); }
  if (seo.canonicalUrl){ setAttr('page-canonical','href',seo.canonicalUrl); }

  /* Brand name in nav */
  const brand = site.brand || {};
  if (brand.name) setText('nav-brand-name', brand.name);

  /* Favicon */
  if (brand.faviconUrl) { setAttr('favicon','href',brand.faviconUrl); setAttr('apple-icon','href',brand.faviconUrl); }

  /* Contact details */
  const c = site.contact || {};
  if (c.phone)        { setAttr('contact-phone-link','href',`tel:${c.phone}`); setText('contact-phone-val', c.phoneDisplay || c.phone); setAttr('footer-phone-link','href',`tel:${c.phone}`); setText('footer-phone-val', c.phoneDisplay || c.phone); }
  if (c.email)        { setAttr('contact-email-link','href',`mailto:${c.email}`); setText('contact-email-val', c.email); setAttr('footer-email-link','href',`mailto:${c.email}`); setText('footer-email-val', c.email); const errA = document.querySelector('#error-text a'); if (errA) { errA.href = `mailto:${c.email}`; errA.textContent = c.email; } }
  if (c.whatsapp)     { const wl = document.getElementById('wa-link'); if (wl) wl.href = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(c.whatsappMessage||'Hi, I want to discuss a project.')}`; }

  /* Social links */
  const social = site.social || {};
  const socials = [
    { key:'github',    label:'GitHub' },
    { key:'linkedin',  label:'LinkedIn' },
    { key:'instagram', label:'Instagram' },
    { key:'twitter',   label:'Twitter' },
  ];
  const footerSocials = document.getElementById('footer-socials');
  if (footerSocials && Object.values(social).some(Boolean)) {
    const links = footerSocials.querySelectorAll('.social-link');
    links.forEach(link => {
      const lbl = link.getAttribute('aria-label')?.toLowerCase();
      const key = socials.find(s => s.label.toLowerCase() === lbl)?.key;
      if (key && social[key]) link.href = social[key];
    });
  }

  /* Footer */
  const f = site.footer || {};
  if (f.text)      setText('footer-tagline', f.text);
  if (f.copyright) setText('footer-copyright', f.copyright);
  if (f.note)      setText('footer-note', f.note);

  /* JSON-LD */
  const ld = document.getElementById('json-ld');
  if (ld && (brand.name || c.email)) {
    const obj = JSON.parse(ld.textContent);
    if (brand.name) obj.name = brand.name;
    if (c.email)    obj.email = c.email;
    if (c.phone)    obj.telephone = c.phone;
    if (social.github) obj.sameAs = [social.github];
    ld.textContent = JSON.stringify(obj);
  }
}

/* ── HOME (hero) ─────────────────────────────────────────── */
function renderHome(home) {
  if (home.kicker)         setText('hero-kicker', home.kicker);
  if (home.subtext)        setText('hero-sub',    home.subtext);

  /* Headline with accent word */
  if (home.headline || home.headlineAccent) {
    const h1 = document.getElementById('hero-h1');
    const accent = home.headlineAccent || 'Automate.';
    const full   = home.headline || 'Build. Automate. Grow.';
    const parts  = full.split(accent);
    if (h1 && parts.length === 2) {
      h1.innerHTML = `${esc(parts[0])}<br><span class="hl-blue">${esc(accent)}</span><br>${esc(parts[1])}`;
    }
  }

  /* CTAs */
  if (home.ctaPrimary?.label)   { const el = document.getElementById('hero-cta-primary');   if (el) { el.textContent = home.ctaPrimary.label; el.href = home.ctaPrimary.href || '#contact'; } }
  if (home.ctaSecondary?.label) { const el = document.getElementById('hero-cta-secondary'); if (el) { el.querySelector('svg')?.insertAdjacentText('afterend', ` ${home.ctaSecondary.label}`); el.href = home.ctaSecondary.href || '#work'; } }

  /* Tags */
  if (home.tags?.length) {
    const container = document.getElementById('hero-tags');
    if (container) {
      container.innerHTML = home.tags.map(t => `
        <a href="${esc(t.href||'#services')}" class="hero-tag">${esc(t.label)}</a>
      `).join('');
    }
  }

  /* Metrics */
  if (home.metrics?.length) {
    home.metrics.forEach((m, i) => {
      setText(`m${i}-val`, m.value);
      setText(`m${i}-lbl`, m.label);
    });
  }
}

/* ── SERVICES ────────────────────────────────────────────── */
const SVC_ICONS = {
  'website-development': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M9 21H15M12 17V21"/></svg>`,
  'web-application':     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9l3 3-3 3M13 15h3"/></svg>`,
  'python-automation':   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3L6 8L8 13M16 3L18 8L16 13M11 17L13 7"/></svg>`,
  'ai-solutions':        `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>`,
  'api-integration':     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M9 12h6M15 6v3M15 15v3"/></svg>`,
  'default':             `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>`,
};

/* Store service data for modal */
const _serviceData = {};

function renderServices(svcData) {
  if (svcData.kicker)  setText('svc-kicker',  svcData.kicker);
  if (svcData.heading) setText('svc-heading',  svcData.heading);
  if (svcData.subtext) setText('svc-sub',      svcData.subtext);
  if (svcData.alsoOffered) {
    const el = document.getElementById('svc-also');
    if (el) el.innerHTML = `<strong>Also offered:</strong> ${esc(svcData.alsoOffered)} — <a href="#contact" class="link">enquire for details</a>.`;
  }

  const list = document.getElementById('services-list');
  if (!list) return;

  const visible = (svcData.items || []).filter(s => s.visible !== false).sort((a,b) => (a.order||99)-(b.order||99));
  if (!visible.length) { list.innerHTML = '<p style="padding:1rem;color:var(--ink-3)">No services available.</p>'; return; }

  /* Store all for modals */
  (svcData.items || []).forEach(s => { _serviceData[s.id] = s; });

  list.innerHTML = visible.map((svc, i) => `
    <div class="svc-row" role="listitem button" tabindex="0"
         data-service="${esc(svc.id)}" aria-expanded="false" aria-controls="sd-${esc(svc.id)}">
      <span class="svc-row-num" aria-hidden="true">${String(i+1).padStart(2,'0')}</span>
      <span class="svc-row-icon" aria-hidden="true">${SVC_ICONS[svc.id] || SVC_ICONS.default}</span>
      <div class="svc-row-body">
        <div class="svc-row-title">${esc(svc.title)}</div>
        <div class="svc-row-desc">${esc(svc.summary)}</div>
      </div>
      <div class="svc-row-tags" aria-label="Technologies">
        ${(svc.tech||[]).map(t => `<span class="svc-tag">${esc(t)}</span>`).join('')}
      </div>
      <span class="svc-row-arrow" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M7 5l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </div>
    <div class="svc-detail" id="sd-${esc(svc.id)}" hidden>
      <div class="svc-detail-cols">
        <div><h4>Overview</h4><p class="svc-detail-text">${esc(svc.detail||'')}</p></div>
        <div>
          <h4>What's included</h4>
          <ul class="svc-include-list">${(svc.includes||[]).map(item=>`<li>${esc(item)}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="svc-detail-footer">
        <button class="btn btn-primary btn-sm" onclick="requestService('${esc(svc.cta||svc.title)}')">Enquire about this service</button>
      </div>
    </div>
  `).join('');

  /* Toggle rows */
  $$('.svc-row', list).forEach(row => {
    const toggle = e => {
      if (e.target.closest('button,a')) return;
      const id  = row.dataset.service;
      const det = document.getElementById(`sd-${id}`);
      if (!det) return;
      const open = !det.hasAttribute('hidden') ? false : true;
      if (open) { det.removeAttribute('hidden'); row.setAttribute('aria-expanded','true'); }
      else       { det.setAttribute('hidden',''); row.setAttribute('aria-expanded','false'); }
    };
    row.addEventListener('click', toggle);
    row.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); toggle(e); } });
  });
}

/* ── PROJECTS ────────────────────────────────────────────── */
const _projectData = {};

function renderProjects(projData) {
  if (projData.heading) setText('work-heading', projData.heading);
  if (projData.subtext) setText('work-sub',     projData.subtext);

  const list = document.getElementById('projects-list');
  if (!list) return;

  const visible = (projData.items||[]).filter(p=>p.visible!==false).sort((a,b)=>(a.order||99)-(b.order||99));
  if (!visible.length) { list.innerHTML = '<p style="padding:1rem">No projects available.</p>'; return; }

  visible.forEach(p => { _projectData[p.id] = p; });

  list.innerHTML = visible.map((proj, i) => {
    const featured  = proj.featured || i===0;
    const filename  = (proj.tech?.[0]||'run').toLowerCase().replace(/\s/g,'_')+'.py';
    const termLines = (proj.terminalLines||[]).map(l => {
      let cls = 'pt-line';
      if (l.type==='prompt')  cls+=' prompt';
      if (l.type==='success') cls+=' ok';
      if (l.type==='kw')      cls+=' kw';
      return `<div class="${cls}">${esc(l.text)}</div>`;
    }).join('');
    const demoBtn = proj.demoUrl
      ? `<a href="${esc(proj.demoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Live site ↗</a>`
      : `<button class="btn btn-outline btn-sm" disabled aria-disabled="true">No live demo</button>`;
    const ghBtn = proj.githubUrl
      ? `<a href="${esc(proj.githubUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">GitHub ↗</a>` : '';

    return `
      <article class="proj-card ${featured?'proj-card--featured':''} reveal" aria-label="${esc(proj.title)}">
        <div class="proj-terminal">
          <div class="pt-bar">
            <div class="pt-dots"><span class="pt-dot r"></span><span class="pt-dot y"></span><span class="pt-dot g"></span></div>
            <span class="pt-title">${esc(filename)}</span>
          </div>
          <div class="pt-lines">${termLines}</div>
        </div>
        <div class="proj-info">
          <div class="proj-tags">${(proj.tech||[]).map(t=>`<span class="proj-tag">${esc(t)}</span>`).join('')}</div>
          <h3 class="proj-title">${esc(proj.title)}</h3>
          <div class="proj-psr">
            <div class="proj-psr-row"><span class="proj-psr-lbl">Problem</span><p class="proj-psr-val">${esc(proj.problem)}</p></div>
            <div class="proj-psr-row"><span class="proj-psr-lbl">Solution</span><p class="proj-psr-val">${esc(proj.solution)}</p></div>
            <div class="proj-psr-row"><span class="proj-psr-lbl">Result</span><p class="proj-psr-val"><strong>${esc(proj.result)}</strong></p></div>
          </div>
          <div class="proj-actions">${demoBtn}${ghBtn}</div>
        </div>
      </article>`;
  }).join('');
}

/* ── ABOUT ───────────────────────────────────────────────── */
function renderAbout(about) {
  if (about.heading)  setText('about-heading', about.heading);
  if (about.ctaLabel) { const el = document.getElementById('about-cta'); if (el) el.textContent = about.ctaLabel; }
  if (about.card?.tagline) setText('about-card-tagline', about.card.tagline.replace(/\\n/g, '\n'));

  const paras = document.getElementById('about-paragraphs');
  if (paras && about.paragraphs?.length) {
    paras.innerHTML = about.paragraphs.map(p=>`<p class="about-text">${esc(p)}</p>`).join('');
  }
}

/* ── PROCESS ─────────────────────────────────────────────── */
function renderProcess(proc) {
  if (proc.heading) setText('process-heading', proc.heading);
  if (proc.subtext) setText('process-subtext', proc.subtext);

  const stepsEl = document.getElementById('process-steps');
  if (stepsEl && proc.steps?.length) {
    stepsEl.innerHTML = proc.steps.map((s,i) => `
      <li class="process-step reveal${i>0&&i<4?' reveal-delay-'+i:''}">
        <span class="ps-num" aria-hidden="true">${esc(s.number||String(i+1).padStart(2,'0'))}</span>
        <div><h3 class="ps-title">${esc(s.title)}</h3><p class="ps-desc">${esc(s.description)}</p></div>
      </li>`).join('');
  }
}

/* ── TOOLS ───────────────────────────────────────────────── */
function renderTools(tools) {
  const container = document.getElementById('tech-tags-about');
  if (!container || !tools.items?.length) return;
  container.innerHTML = tools.items.map(t=>`<span class="tech-tag">${esc(t)}</span>`).join('');
}

/* ══════════════════════════════════════════════════════════
   UI MODULES (unchanged from original — theme, nav, etc.)
══════════════════════════════════════════════════════════ */

/* ── 1. THEME ────────────────────────────────────────────── */
const Theme = (() => {
  const KEY = 'jt-theme';
  const html = document.documentElement;
  function getSystemPref() { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  function apply(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.setAttribute('aria-label', theme==='dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  function init() {
    const stored = localStorage.getItem(KEY);
    apply(stored || getSystemPref());
    document.getElementById('theme-toggle')?.addEventListener('click', () => apply(html.getAttribute('data-theme')==='dark' ? 'light' : 'dark'));
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => { if (!localStorage.getItem(KEY)) apply(e.matches ? 'dark' : 'light'); });
  }
  return { init, apply };
})();

/* ── 2. NAV ──────────────────────────────────────────────── */
const Nav = (() => {
  function initScrolled() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    let t = false;
    const up = () => { nav.classList.toggle('scrolled', window.scrollY > 16); t=false; };
    window.addEventListener('scroll', () => { if (!t) { requestAnimationFrame(up); t=true; } }, {passive:true});
    up();
  }
  function initMobileMenu() {
    const btn  = document.getElementById('hamburger');
    const menu = document.getElementById('mobile-menu');
    if (!btn||!menu) return;
    const open  = () => { btn.setAttribute('aria-expanded','true'); menu.setAttribute('aria-hidden','false'); menu.classList.add('open'); document.body.style.overflow='hidden'; };
    const close = () => { btn.setAttribute('aria-expanded','false'); menu.setAttribute('aria-hidden','true'); menu.classList.remove('open'); document.body.style.overflow=''; };
    btn.addEventListener('click', () => btn.getAttribute('aria-expanded')==='true' ? close() : open());
    $$('.mobile-link,.mobile-cta',menu).forEach(l=>l.addEventListener('click',close));
    document.addEventListener('click', e => { if (!document.getElementById('navbar').contains(e.target)) close(); });
    document.addEventListener('keydown', e => { if (e.key==='Escape') close(); });
    window.addEventListener('resize', () => { if (window.innerWidth>1024) close(); }, {passive:true});
  }
  function initSmoothScroll() {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (!id||id==='#') { e.preventDefault(); window.scrollTo({top:0,behavior:'smooth'}); return; }
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      window.scrollTo({top: el.getBoundingClientRect().top+window.scrollY-CONFIG.SCROLL_OFFSET, behavior:'smooth'});
    });
  }
  function initActiveLink() {
    const sections = $$('section[id]');
    const links    = $$('.nav-link');
    if (!sections.length||!links.length) return;
    const set = () => {
      let cur='';
      sections.forEach(s => { if (window.scrollY>=s.offsetTop-CONFIG.SCROLL_OFFSET-10) cur=s.id; });
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href')===`#${cur}`));
    };
    let t=false;
    window.addEventListener('scroll',()=>{ if(!t){requestAnimationFrame(()=>{set();t=false;});t=true;} },{passive:true});
    set();
  }
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    let t=false;
    window.addEventListener('scroll',()=>{ if(!t){requestAnimationFrame(()=>{btn.classList.toggle('visible',window.scrollY>400);t=false;});t=true;} },{passive:true});
    btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  }
  function init() { initScrolled(); initMobileMenu(); initSmoothScroll(); initActiveLink(); initBackToTop(); }
  return { init };
})();

/* ── 3. REVEAL ───────────────────────────────────────────── */
const Reveal = (() => {
  let obs = null;
  function createObs() {
    if (!('IntersectionObserver' in window)) { $$('.reveal').forEach(e=>e.classList.add('visible')); return null; }
    return new IntersectionObserver(entries=>{
      entries.forEach(e=>{ if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);} });
    },{threshold:.1,rootMargin:'0px 0px -40px 0px'});
  }
  function observeNew() { if (!obs) return; $$('.reveal:not(.visible)').forEach(e=>obs.observe(e)); }
  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { $$('.reveal').forEach(e=>e.classList.add('visible')); return; }
    obs=createObs(); if (obs) observeNew();
  }
  return { init, observeNew };
})();

/* ── 4. MODALS ───────────────────────────────────────────── */
const Modals = (() => {
  function show(id) { const o=document.getElementById(id); if(!o) return; o.removeAttribute('hidden'); document.body.style.overflow='hidden'; requestAnimationFrame(()=>o.querySelector('.modal-close')?.focus()); }
  function hide(id) { const o=document.getElementById(id); if(!o) return; o.setAttribute('hidden',''); document.body.style.overflow=''; }
  function init() {
    document.getElementById('service-modal-close')?.addEventListener('click',()=>hide('service-modal'));
    document.getElementById('project-modal-close')?.addEventListener('click',()=>hide('project-modal'));
    $$('.modal-overlay').forEach(el=>el.addEventListener('click',e=>{if(e.target===el)hide(el.id);}));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){hide('service-modal');hide('project-modal');}});
  }
  return { init, show, hide };
})();

/* ── 5. REQUEST SERVICE (smart prefill) ──────────────────── */
function requestService(serviceName) {
  Modals.hide('service-modal');
  openEnquiryModal(null, serviceName);
}
window.requestService = requestService;

/* ── 5b. ENQUIRY POPUP MODAL ─────────────────────────────── */
function openEnquiryModal(event, preselect) {
  if (event) event.preventDefault();
  /* Prefill service if passed */
  if (preselect) {
    const sel = document.getElementById('eq-serviceRequired');
    if (sel) {
      const match = Array.from(sel.options).find(o => o.value === preselect || o.value.toLowerCase().includes(preselect.toLowerCase()));
      if (match) sel.value = match.value;
    }
  }
  /* Hide any previous messages */
  const suc = document.getElementById('eq-form-success');
  const err = document.getElementById('eq-form-error');
  if (suc) suc.setAttribute('hidden', '');
  if (err) err.setAttribute('hidden', '');
  Modals.show('enquiry-modal');
  /* Focus first field */
  setTimeout(() => document.getElementById('eq-fullName')?.focus(), 100);
}
window.openEnquiryModal = openEnquiryModal;

/* Enquiry modal form submit */
(function initEnquiryModal() {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('enquiry-modal-form');
    if (!form) return;

    /* Close button */
    document.getElementById('enquiry-modal-close')?.addEventListener('click', () => Modals.hide('enquiry-modal'));
    document.getElementById('enquiry-modal')?.addEventListener('click', function(e) {
      if (e.target === this) Modals.hide('enquiry-modal');
    });

    /* Clear errors on input */
    form.querySelectorAll('.form-input,.form-select,.form-textarea').forEach(f => {
      f.addEventListener('input',  () => { f.classList.remove('error'); f.parentElement.querySelectorAll('.field-error').forEach(e => e.remove()); });
      f.addEventListener('change', () => { f.classList.remove('error'); f.parentElement.querySelectorAll('.field-error').forEach(e => e.remove()); });
    });

    let submitting = false;
    let lastKey = null;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (submitting) return;

      const suc  = document.getElementById('eq-form-success');
      const err  = document.getElementById('eq-form-error');
      const etxt = document.getElementById('eq-error-text');
      const btn  = document.getElementById('eq-submit-btn');
      const btxt = document.getElementById('eq-btn-text');
      const spin = document.getElementById('eq-btn-spinner');

      suc?.setAttribute('hidden', '');
      err?.setAttribute('hidden', '');
      form.querySelectorAll('.error').forEach(f => f.classList.remove('error'));
      form.querySelectorAll('.field-error').forEach(f => f.remove());

      /* Honeypot */
      if (document.getElementById('eq-hp')?.value) return;

      const g = id => (document.getElementById(id)?.value || '').trim();
      const data = {
        fullName:        g('eq-fullName'),
        companyName:     g('eq-companyName'),
        email:           g('eq-email'),
        phone:           g('eq-phone'),
        serviceRequired: g('eq-serviceRequired'),
        budget:          g('eq-budget'),
        projectDetails:  g('eq-projectDetails'),
      };

      /* Validate */
      const errors = [];
      if (!data.fullName || data.fullName.length < 2)                errors.push({ id: 'eq-fullName',        msg: 'Please enter your full name.' });
      if (!data.email)                                               errors.push({ id: 'eq-email',           msg: 'Please enter your email address.' });
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))     errors.push({ id: 'eq-email',           msg: 'Please enter a valid email address.' });
      if (!data.serviceRequired)                                     errors.push({ id: 'eq-serviceRequired', msg: 'Please select a service.' });
      if (!data.projectDetails || data.projectDetails.length < 10)  errors.push({ id: 'eq-projectDetails',  msg: 'Please add a little more detail.' });

      if (errors.length) {
        errors.forEach(({ id, msg }) => {
          const el = document.getElementById(id);
          if (!el) return;
          el.classList.add('error');
          const sp = document.createElement('span');
          sp.className = 'field-error';
          sp.textContent = msg;
          sp.setAttribute('role', 'alert');
          sp.style.cssText = 'display:block;font-size:.73rem;color:var(--err, #DC2626);margin-top:4px;font-weight:500';
          el.parentElement.appendChild(sp);
        });
        document.getElementById(errors[0].id)?.focus();
        return;
      }

      /* Duplicate guard */
      const key = `${data.email}|${data.projectDetails}`.toLowerCase().trim();
      if (lastKey === key) {
        if (etxt) etxt.textContent = 'This enquiry was already submitted.';
        err?.removeAttribute('hidden');
        return;
      }

      submitting = true;
      btn.disabled = true;
      btxt.textContent = 'Sending…';
      spin?.removeAttribute('hidden');

      try {
        const url = CONFIG.GOOGLE_SCRIPT_URL;
        if (!url || url.includes('YOUR_')) throw new Error('NOT_CONFIGURED');
        const payload = new URLSearchParams({ ...data, source: 'Website' });
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 12000);
        try {
          await fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: payload.toString(), signal: ctrl.signal });
        } finally { clearTimeout(timer); }

        lastKey = key;
        suc?.removeAttribute('hidden');
        form.reset();
      } catch (ex) {
        let msg = 'Something went wrong. Please try again or email us at <a href="mailto:jadootechenterprises@gmail.com">jadootechenterprises@gmail.com</a>.';
        if (ex.name === 'AbortError') msg = 'Request timed out. Please try again.';
        if (!navigator.onLine)       msg = 'You appear to be offline.';
        if (etxt) etxt.innerHTML = msg;
        err?.removeAttribute('hidden');
      } finally {
        submitting = false;
        btn.disabled = false;
        btxt.textContent = 'Send Enquiry';
        spin?.setAttribute('hidden', '');
      }
    });
  });
})();

/* ── 6. CONTACT FORM ─────────────────────────────────────── */
const Form = (() => {
  let lastKey=null, isSubmitting=false;

  function fieldErr(field, msg) {
    clearErr(field);
    field.classList.add('error');
    const s=document.createElement('span');
    s.className='field-error'; s.textContent=msg; s.setAttribute('role','alert');
    s.style.cssText='display:block;font-size:.73rem;color:var(--err);margin-top:4px;font-weight:500';
    field.parentElement.appendChild(s);
  }
  function clearErr(field) { field.classList.remove('error'); $$('.field-error',field.parentElement).forEach(e=>e.remove()); }
  function clearAll(form)   { $$('.error',form).forEach(f=>clearErr(f)); }

  function validate(d) {
    const e=[];
    if (!d.fullName||d.fullName.length<2)           e.push({id:'fullName',        msg:'Please enter your full name.'});
    if (!d.email)                                    e.push({id:'email',           msg:'Please enter your email address.'});
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.push({id:'email',     msg:'Please enter a valid email address.'});
    if (!d.serviceRequired)                          e.push({id:'serviceRequired', msg:'Please select a service.'});
    if (!d.projectDetails||d.projectDetails.length<10)   e.push({id:'projectDetails',msg:'Please add a little more detail.'});
    return e;
  }

  function setLoad(loading) {
    const btn=document.getElementById('submit-btn');
    const txt=document.getElementById('btn-text');
    const spin=document.getElementById('btn-spinner');
    if(!btn) return;
    btn.disabled=loading; txt.textContent=loading?'Sending…':'Send Enquiry';
    loading ? spin?.removeAttribute('hidden') : spin?.setAttribute('hidden','');
    loading ? spin?.removeAttribute('aria-hidden') : spin?.setAttribute('aria-hidden','true');
  }

  const showMsg = el=>{ el?.removeAttribute('hidden'); el?.scrollIntoView({behavior:'smooth',block:'nearest'}); };
  const hideMsg = el=>{ el?.setAttribute('hidden',''); };

  async function submit(data) {
    const url = CONFIG.GOOGLE_SCRIPT_URL;
    if (!url||url.includes('YOUR_')) throw new Error('SCRIPT_NOT_CONFIGURED');
    const payload = new URLSearchParams({ ...data, source:'Website' });
    const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),12000);
    try { await fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:payload.toString(),signal:ctrl.signal}); return {status:'success'}; }
    finally { clearTimeout(timer); }
  }

  function errMsg(err) {
    if (err.name==='AbortError')              return 'The request timed out. Please try again.';
    if (!navigator.onLine)                    return 'You appear to be offline.';
    if (err.message==='SCRIPT_NOT_CONFIGURED') return 'The form is not yet configured. Please email us directly.';
    return 'Something went wrong. Please try again or email us at <a href="mailto:jadootechenterprises@gmail.com">jadootechenterprises@gmail.com</a>.';
  }

  function init() {
    const form=document.getElementById('contact-form');
    if (!form) return;
    const successEl=document.getElementById('form-success');
    const errorEl=document.getElementById('form-error');
    const errorText=document.getElementById('error-text');

    $$('.form-input,.form-select,.form-textarea',form).forEach(f=>{ f.addEventListener('input',()=>clearErr(f)); f.addEventListener('change',()=>clearErr(f)); });

    form.addEventListener('submit', async e=>{
      e.preventDefault(); if (isSubmitting) return;
      hideMsg(successEl); hideMsg(errorEl); clearAll(form);
      const honey=form.querySelector('[name="website"]');
      if (honey?.value) return;
      const g=id=>(document.getElementById(id)?.value||'').trim();
      const data={fullName:g('fullName'),companyName:g('companyName'),email:g('email'),phone:g('phone'),serviceRequired:g('serviceRequired'),budget:g('budget'),projectDetails:g('projectDetails')};
      const errors=validate(data);
      if (errors.length) { errors.forEach(({id,msg})=>{const el=document.getElementById(id);if(el)fieldErr(el,msg);}); document.querySelector('.error')?.scrollIntoView({behavior:'smooth',block:'center'}); document.querySelector('.error')?.focus(); return; }
      const key=`${data.email}|${data.projectDetails}`.toLowerCase().trim();
      if (lastKey===key) { if (errorText) errorText.textContent='This enquiry was already submitted.'; showMsg(errorEl); return; }
      isSubmitting=true; setLoad(true);
      try { await submit(data); lastKey=key; showMsg(successEl); form.reset(); }
      catch(err) { if (errorText) errorText.innerHTML=errMsg(err); showMsg(errorEl); console.error('[Form]',err); }
      finally { isSubmitting=false; setLoad(false); }
    });
  }
  return { init };
})();
