/* ============================================================
   JADOOTECH ENTERPRISES — assets/js/main.js
   Vanilla JS, no dependencies, ES2017+
   Modules (IIFEs): theme, nav, content, reveal, modals, form
   ============================================================ */

'use strict';

/* ── CONFIG ────────────────────────────────────────────────── */
const CONFIG = {
  GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxxVb6VneNQ3oR1GtwliWMkhUSPuxapBrOuGmxIRwmCz2Rnu1bT_qdLSy4AzDz66QT9hQ/exec',
  CONTENT_URL:       'data/content.json',
  SCROLL_OFFSET:     72,   /* px — navbar height + breathing room */
};

/* ── UTILITY ───────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const esc = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/* ── 1. THEME ──────────────────────────────────────────────── */
const Theme = (() => {
  const STORAGE_KEY = 'jt-theme';
  const html = document.documentElement;

  function getSystemPref() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    const btn = $('#theme-toggle');
    if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    apply(stored || getSystemPref());

    const btn = $('#theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      apply(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });

    /* Follow system changes when user hasn't picked manually */
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) apply(e.matches ? 'dark' : 'light');
    });
  }

  return { init };
})();

/* ── 2. NAVBAR ─────────────────────────────────────────────── */
const Nav = (() => {
  function initScrolled() {
    const navbar = $('#navbar');
    if (!navbar) return;
    let ticking = false;
    const update = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 16);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  function initMobileMenu() {
    const btn  = $('#hamburger');
    const menu = $('#mobile-menu');
    if (!btn || !menu) return;

    const open = () => {
      btn.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
      menu.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    };
    const toggle = () => btn.getAttribute('aria-expanded') === 'true' ? close() : open();

    btn.addEventListener('click', toggle);
    $$('.mobile-link, .mobile-cta', menu).forEach(l => l.addEventListener('click', close));
    document.addEventListener('click', e => { if (!$('#navbar').contains(e.target)) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 1024) close(); }, { passive: true });
  }

  function initSmoothScroll() {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (!id || id === '#') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - CONFIG.SCROLL_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  }

  function initActiveLink() {
    const sections = $$('section[id]');
    const links    = $$('.nav-link');
    if (!sections.length || !links.length) return;

    const setActive = () => {
      let current = '';
      sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - CONFIG.SCROLL_OFFSET - 10) current = s.id;
      });
      links.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
      });
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(() => { setActive(); ticking = false; }); ticking = true; }
    }, { passive: true });
    setActive();
  }

  function initBackToTop() {
    const btn = $('#back-to-top');
    if (!btn) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          btn.classList.toggle('visible', window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function init() {
    initScrolled();
    initMobileMenu();
    initSmoothScroll();
    initActiveLink();
    initBackToTop();
    /* Footer year */
    const yr = $('#footer-year');
    if (yr) yr.textContent = new Date().getFullYear();
  }

  return { init };
})();

/* ── 3. CONTENT LOADER ────────────────────────────────────── */
const Content = (() => {
  let data = null;

  async function load() {
    try {
      const res = await fetch(CONFIG.CONTENT_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
    } catch (err) {
      console.warn('[JadooTech] Could not load content.json:', err);
      data = { services: [], projects: [], tech: [] };
    }
    return data;
  }

  /* ── Build service rows (5 core, numbered list layout) ── */
  const CORE_SVC_IDS = ['website-development','web-application','python-automation','ai-solutions','api-integration'];

  /* Icon SVGs per service */
  const SVC_ICONS = {
    'website-development': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M9 21H15M12 17V21"/></svg>`,
    'web-application':     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9l3 3-3 3M13 15h3"/></svg>`,
    'python-automation':   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3L6 8L8 13M16 3L18 8L16 13M11 17L13 7"/></svg>`,
    'ai-solutions':        `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>`,
    'api-integration':     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M9 12h6M15 6v3M15 15v3"/></svg>`,
  };

  function buildServices(services) {
    const list = $('#services-list');
    if (!list || !services.length) return;

    const coreServices = CORE_SVC_IDS.map(id => services.find(s => s.id === id)).filter(Boolean);

    list.innerHTML = coreServices.map((svc, i) => `
      <div class="svc-row" role="listitem button" tabindex="0"
           data-service="${esc(svc.id)}"
           aria-expanded="false"
           aria-controls="sd-${esc(svc.id)}">
        <span class="svc-row-num" aria-hidden="true">0${i+1}</span>
        <span class="svc-row-icon" aria-hidden="true">${SVC_ICONS[svc.id] || ''}</span>
        <div class="svc-row-body">
          <div class="svc-row-title">${esc(svc.title)}</div>
          <div class="svc-row-desc">${esc(svc.summary)}</div>
        </div>
        <div class="svc-row-tags" aria-label="Technologies">
          ${svc.tech.map(t => `<span class="svc-tag">${esc(t)}</span>`).join('')}
        </div>
        <span class="svc-row-arrow" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M7 5l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </div>
      <div class="svc-detail" id="sd-${esc(svc.id)}">
        <div class="svc-detail-cols">
          <div>
            <h4>Overview</h4>
            <p class="svc-detail-text">${esc(svc.detail)}</p>
          </div>
          <div>
            <h4>What's included</h4>
            <ul class="svc-include-list">
              ${svc.includes.map(item => `<li>${esc(item)}</li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="svc-detail-footer">
          <button class="btn btn-primary btn-sm" onclick="requestService('${esc(svc.cta)}')">Enquire about this service</button>
        </div>
      </div>
    `).join('');

    /* Toggle expand */
    $$('.svc-row', list).forEach(row => {
      const toggle = () => {
        if (e && e.target.closest('button')) return;
        const id  = row.dataset.service;
        const det = $(`#sd-${id}`);
        if (!det) return;
        const open = det.classList.toggle('open');
        row.setAttribute('aria-expanded', String(open));
      };
      row.addEventListener('click', e => {
        if (e.target.closest('button')) return;
        const id  = row.dataset.service;
        const det = $(`#sd-${id}`);
        if (!det) return;
        const open = det.classList.toggle('open');
        row.setAttribute('aria-expanded', String(open));
      });
      row.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); row.click(); }
      });
    });
  }

  /* ── Build project cards ── */
  function buildProjects(projects) {
    const list = $('#projects-list');
    if (!list || !projects.length) return;

    list.innerHTML = projects.map((proj, i) => {
      const featured  = i === 0;
      const filename  = proj.tech[0] ? proj.tech[0].toLowerCase().replace(/\s/g,'_')+'.py' : 'run.py';
      const termLines = (proj.terminalLines||[]).map(l => {
        let cls = 'pt-line';
        if (l.type==='prompt')  cls += ' prompt';
        if (l.type==='success') cls += ' ok';
        if (l.type==='kw')      cls += ' kw';
        return `<div class="${cls}">${esc(l.text)}</div>`;
      }).join('');
      const demoBtn = proj.demoUrl
        ? `<a href="${esc(proj.demoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Live site ↗</a>`
        : `<button class="btn btn-outline btn-sm btn-disabled" disabled aria-disabled="true">No live demo</button>`;
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
            <div class="proj-tags">${proj.tech.map(t=>`<span class="proj-tag">${esc(t)}</span>`).join('')}</div>
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

  /* ── Build tech tags ── */
  function buildTech(tech) {
    const container = $('#tech-tags-about');
    if (!container || !tech.length) return;
    container.innerHTML = tech
      .map(t => `<span class="tech-tag">${esc(t)}</span>`)
      .join('');
  }

  async function init() {
    const d = await load();
    buildServices(d.services);
    buildProjects(d.projects);
    buildTech(d.tech);
    /* Re-observe new elements for scroll reveal */
    Reveal.observeNew();
  }

  return { init, getData: () => data };
})();

/* ── 4. SCROLL REVEAL ─────────────────────────────────────── */
const Reveal = (() => {
  let observer = null;

  function createObserver() {
    if (!('IntersectionObserver' in window)) {
      $$('.reveal').forEach(el => el.classList.add('visible'));
      return null;
    }
    return new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
  }

  function observeNew() {
    if (!observer) return;
    $$('.reveal:not(.visible)').forEach(el => observer.observe(el));
  }

  function init() {
    /* Respect prefers-reduced-motion */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      $$('.reveal').forEach(el => el.classList.add('visible'));
      return;
    }
    observer = createObserver();
    if (observer) observeNew();
  }

  return { init, observeNew };
})();

/* ── 5. MODALS ─────────────────────────────────────────────── */
const Modals = (() => {
  function show(id) {
    const overlay = $(`#${id}`);
    if (!overlay) return;
    overlay.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => overlay.querySelector('.modal-close')?.focus());
  }

  function hide(id) {
    const overlay = $(`#${id}`);
    if (!overlay) return;
    overlay.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  function init() {
    /* Close buttons */
    $('#service-modal-close')?.addEventListener('click', () => hide('service-modal'));
    $('#project-modal-close')?.addEventListener('click', () => hide('project-modal'));

    /* Click outside */
    $$('.modal-overlay').forEach(el => {
      el.addEventListener('click', e => { if (e.target === el) hide(el.id); });
    });

    /* Escape */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { hide('service-modal'); hide('project-modal'); }
    });
  }

  function buildServiceModal(svc) {
    if (!svc) return;
    const content = $('#service-modal-content');
    if (!content) return;
    content.innerHTML = `
      <h2 id="smodal-title">${esc(svc.title)}</h2>
      <span class="modal-type svc">Service</span>

      <div class="modal-section">
        <h3>Overview</h3>
        <p>${esc(svc.detail)}</p>
      </div>

      <div class="modal-section">
        <h3>What's included</h3>
        <ul class="modal-list">
          ${svc.includes.map(item => `<li>${esc(item)}</li>`).join('')}
        </ul>
      </div>

      <div class="modal-section">
        <h3>Technology</h3>
        <div class="modal-tech-row">
          ${svc.tech.map(t => `<span class="modal-tech">${esc(t)}</span>`).join('')}
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-primary" onclick="requestService('${esc(svc.cta)}')">
          Enquire about this service
        </button>
        <button class="btn btn-ghost" onclick="Modals.hideService()">Close</button>
      </div>`;
    show('service-modal');
  }

  function hideService() { hide('service-modal'); }
  function hideProject() { hide('project-modal'); }

  return { init, buildServiceModal, hideService, hideProject, show, hide };
})();

/* Expose globals called from inline onclick in dynamically injected HTML */
window.Modals = Modals;

/* ── 6. SMART FORM PREFILL ────────────────────────────────── */
function requestService(serviceName) {
  Modals.hide('service-modal');

  const contact = $('#contact');
  if (contact) {
    const top = contact.getBoundingClientRect().top + window.scrollY - CONFIG.SCROLL_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  setTimeout(() => {
    const sel = $('#serviceRequired');
    if (!sel) return;
    const match = Array.from(sel.options).find(
      o => o.value === serviceName || o.value.toLowerCase().includes(serviceName.toLowerCase())
    );
    if (match) {
      sel.value = match.value;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      /* Brief highlight */
      sel.style.borderColor = 'var(--accent)';
      sel.style.boxShadow   = '0 0 0 3px var(--accent-dim)';
      setTimeout(() => { sel.style.borderColor = ''; sel.style.boxShadow = ''; }, 2500);
    }
    $('#fullName')?.focus();
  }, 650);
}
window.requestService = requestService;

/* ── 7. CONTACT FORM ──────────────────────────────────────── */
const Form = (() => {
  let lastKey      = null;
  let isSubmitting = false;

  /* Field-level error */
  function fieldError(field, msg) {
    clearFieldError(field);
    field.classList.add('error');
    const span = document.createElement('span');
    span.className   = 'field-error';
    span.textContent = msg;
    span.setAttribute('role', 'alert');
    span.style.cssText = 'display:block;font-size:.72rem;color:var(--err);margin-top:4px;font-weight:500';
    field.parentElement.appendChild(span);
  }

  function clearFieldError(field) {
    field.classList.remove('error');
    $$('.field-error', field.parentElement).forEach(el => el.remove());
  }

  function validate(d) {
    const errors = [];
    if (!d.fullName || d.fullName.length < 2)        errors.push({ id: 'fullName',        msg: 'Please enter your full name.' });
    if (!d.email)                                     errors.push({ id: 'email',           msg: 'Please enter your email address.' });
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) errors.push({ id: 'email',    msg: 'Please enter a valid email address.' });
    if (!d.serviceRequired)                           errors.push({ id: 'serviceRequired', msg: 'Please select a service.' });
    if (!d.projectDetails || d.projectDetails.length < 10) errors.push({ id: 'projectDetails', msg: 'Please add a little more detail.' });
    return errors;
  }

  function setLoading(loading) {
    const btn     = $('#submit-btn');
    const txt     = $('#btn-text');
    const spinner = $('#btn-spinner');
    if (!btn) return;
    btn.disabled      = loading;
    txt.textContent   = loading ? 'Sending…' : 'Send Enquiry';
    if (loading) { spinner?.removeAttribute('hidden'); spinner?.removeAttribute('aria-hidden'); }
    else         { spinner?.setAttribute('hidden', ''); spinner?.setAttribute('aria-hidden', 'true'); }
  }

  function showMsg(el) { el?.removeAttribute('hidden'); el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  function hideMsg(el) { el?.setAttribute('hidden', ''); }

  async function submit(data) {
    if (!CONFIG.GOOGLE_SCRIPT_URL || CONFIG.GOOGLE_SCRIPT_URL.includes('YOUR_')) {
      throw new Error('SCRIPT_NOT_CONFIGURED');
    }
    const payload = new URLSearchParams({
      fullName:        data.fullName,
      companyName:     data.companyName     || '',
      email:           data.email,
      phone:           data.phone           || '',
      serviceRequired: data.serviceRequired,
      budget:          data.budget          || '',
      projectDetails:  data.projectDetails,
      source:          'Website',
    });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    try {
      await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    payload.toString(),
        signal:  ctrl.signal,
      });
    } finally { clearTimeout(timer); }
  }

  function friendlyError(err) {
    if (err.name === 'AbortError')             return 'The request timed out. Please try again.';
    if (!navigator.onLine)                     return 'You appear to be offline.';
    if (err.message === 'SCRIPT_NOT_CONFIGURED') return 'The form is not yet connected. Please email us directly at <a href="mailto:jadootechenterprises@gmail.com">jadootechenterprises@gmail.com</a>.';
    return 'Something went wrong. Please try again or email us at <a href="mailto:jadootechenterprises@gmail.com">jadootechenterprises@gmail.com</a>.';
  }

  function init() {
    const form = $('#contact-form');
    if (!form) return;

    const successEl  = $('#form-success');
    const errorEl    = $('#form-error');
    const errorText  = $('#error-text');

    /* Clear errors on input */
    $$('.form-input, .form-select, .form-textarea', form).forEach(f => {
      f.addEventListener('input',  () => clearFieldError(f));
      f.addEventListener('change', () => clearFieldError(f));
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (isSubmitting) return;

      hideMsg(successEl);
      hideMsg(errorEl);
      $$('.error', form).forEach(f => clearFieldError(f));

      /* Honeypot check */
      const honey = form.querySelector('[name="website"]');
      if (honey && honey.value) return; /* Silent discard */

      const g = id => (form.querySelector(`#${id}`)?.value || '').trim();
      const data = {
        fullName:        g('fullName'),
        companyName:     g('companyName'),
        email:           g('email'),
        phone:           g('phone'),
        serviceRequired: g('serviceRequired'),
        budget:          g('budget'),
        projectDetails:  g('projectDetails'),
      };

      const errors = validate(data);
      if (errors.length) {
        errors.forEach(({ id, msg }) => {
          const el = form.querySelector(`#${id}`);
          if (el) fieldError(el, msg);
        });
        form.querySelector('.error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        form.querySelector('.error')?.focus();
        return;
      }

      /* Duplicate guard */
      const key = `${data.email}|${data.projectDetails}`.toLowerCase().trim();
      if (lastKey === key) {
        if (errorText) errorText.innerHTML = 'This enquiry was already submitted.';
        showMsg(errorEl);
        return;
      }

      isSubmitting = true;
      setLoading(true);
      try {
        await submit(data);
        lastKey = key;
        showMsg(successEl);
        form.reset();
      } catch (err) {
        if (errorText) errorText.innerHTML = friendlyError(err);
        showMsg(errorEl);
        console.error('[JadooTech Form]', err);
      } finally {
        isSubmitting = false;
        setLoading(false);
      }
    });
  }

  return { init };
})();

/* ── BOOT ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  Theme.init();
  Nav.init();
  Reveal.init();
  Modals.init();
  Form.init();
  await Content.init();  /* fetch JSON, render lists, then re-observe reveal els */
});
