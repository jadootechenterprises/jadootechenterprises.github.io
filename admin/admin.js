/* ============================================================
   JadooTech Admin Panel — admin.js
   Vanilla JS, no dependencies
   GitHub Contents API as backend
   ============================================================ */

'use strict';

/* ── State ───────────────────────────────────────────────── */
let CFG = {};           // loaded from config.json
let TOKEN = '';         // sessionStorage only, never logged
let DEV_MODE = false;   // localhost dev bypass
let USERNAME = '';
let IDLE_TIMER = null;
const IDLE_MINUTES = 30;
const DATA = {};        // in-memory JSON files
const SHAS = {};        // per-file SHA for conflict detection
let UNSAVED = false;
let editingServiceIdx = -1;
let editingProjectIdx = -1;

/* ── Boot ────────────────────────────────────────────────── */
(async function boot() {
  try {
    const r = await fetch('config.json');
    CFG = await r.json();
  } catch {
    CFG = { owner: 'jadootechenterprises', repo: 'jadootechenterprises.github.io', branch: 'main', siteUrl: 'https://jadootechenterprises.github.io/' };
  }

  /* Restore session */
  TOKEN = sessionStorage.getItem('jt_token') || '';
  const devMode = sessionStorage.getItem('jt_devmode') === '1';
  USERNAME = sessionStorage.getItem('jt_user') || '';

  if (TOKEN || devMode) {
    DEV_MODE = devMode;
    await showAdmin();
    return;
  }
  showLogin();
})();

/* ── Theme toggle (admin panel's own theme) ─────────────── */
function getAdminTheme() {
  return localStorage.getItem('jt_admin_theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
function applyAdminTheme(t) {
  document.documentElement.setAttribute('data-a-theme', t);
  localStorage.setItem('jt_admin_theme', t);
  const moon = document.getElementById('theme-icon-moon');
  const sun  = document.getElementById('theme-icon-sun');
  if (moon) moon.style.display = t === 'light' ? 'block' : 'none';
  if (sun)  sun.style.display  = t === 'dark'  ? 'block' : 'none';
}
applyAdminTheme(getAdminTheme());
document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
  applyAdminTheme(getAdminTheme() === 'dark' ? 'light' : 'dark');
});

/* ── Login tabs ──────────────────────────────────────────── */
document.getElementById('tab-token')?.addEventListener('click', () => switchLoginTab('token'));
document.getElementById('tab-dev')?.addEventListener('click',   () => switchLoginTab('dev'));
function switchLoginTab(t) {
  document.querySelectorAll('.login-tab').forEach(b => { b.classList.toggle('active', b.id === `tab-${t}`); b.setAttribute('aria-selected', b.id === `tab-${t}`); });
  document.querySelectorAll('.login-section').forEach(s => { s.classList.toggle('active', s.id === `section-${t}`); });
}

/* ── Token login ─────────────────────────────────────────── */
document.getElementById('login-token-btn')?.addEventListener('click', async () => {
  const pat = document.getElementById('pat-input').value.trim();
  const errEl = document.getElementById('token-error');
  const btn   = document.getElementById('login-token-btn');
  const txt   = document.getElementById('login-token-text');
  const spin  = document.getElementById('login-token-spinner');

  errEl.style.display = 'none';
  if (!pat) { errEl.textContent = 'Please paste your Personal Access Token.'; errEl.style.display = 'block'; return; }
  if (!pat.startsWith('github_pat_') && !pat.startsWith('ghp_') && !pat.startsWith('gho_')) {
    errEl.textContent = 'That does not look like a GitHub token. It should start with github_pat_, ghp_, or gho_.';
    errEl.style.display = 'block'; return;
  }

  btn.disabled = true; txt.textContent = 'Verifying…'; spin.style.display = 'inline-block';

  try {
    /* Verify: call /user and /repos/:owner/:repo */
    const [uRes, rRes] = await Promise.all([
      ghFetch('https://api.github.com/user', pat),
      ghFetch(`https://api.github.com/repos/${CFG.owner}/${CFG.repo}`, pat)
    ]);

    if (uRes.status === 401) throw new Error('Token is invalid or expired. Please check and try again.');
    if (uRes.status === 403) throw new Error('Token does not have the required permissions.');
    if (rRes.status === 404) throw new Error(`Cannot find repo ${CFG.owner}/${CFG.repo}. Check the token has Contents access for this repo.`);

    const user = await uRes.json();
    TOKEN    = pat;
    USERNAME = user.login;
    sessionStorage.setItem('jt_token', TOKEN);
    sessionStorage.setItem('jt_user',  USERNAME);
    DEV_MODE = false;
    await showAdmin();
  } catch (e) {
    errEl.textContent = e.message || 'Login failed. Please try again.';
    errEl.style.display = 'block';
  } finally {
    btn.disabled = false; txt.textContent = 'Sign In with Token'; spin.style.display = 'none';
  }
});

/* ── Dev login (localhost only) ──────────────────────────── */
document.getElementById('login-dev-btn')?.addEventListener('click', () => {
  const errEl = document.getElementById('dev-error');
  errEl.style.display = 'none';
  const u = document.getElementById('dev-user').value;
  const p = document.getElementById('dev-pass').value;

  if (!['localhost','127.0.0.1'].includes(location.hostname)) {
    errEl.textContent = 'Dev login is only available on localhost.';
    errEl.style.display = 'block'; return;
  }
  if (u !== 'admin' || p !== 'admin') {
    errEl.textContent = 'Incorrect credentials.';
    errEl.style.display = 'block'; return;
  }
  DEV_MODE = true;
  USERNAME = 'dev-admin';
  sessionStorage.setItem('jt_devmode', '1');
  sessionStorage.setItem('jt_user', USERNAME);
  showAdmin();
});

/* ── Show admin shell ─────────────────────────────────────── */
async function showAdmin() {
  document.getElementById('login-page').style.display  = 'none';
  document.getElementById('admin-shell').classList.add('visible');
  document.getElementById('sidebar-username').textContent = USERNAME || 'Admin';

  const siteLink = document.getElementById('view-site-link');
  const dashLink  = document.getElementById('dash-view-site');
  if (siteLink) siteLink.href = CFG.siteUrl || 'https://jadootechenterprises.github.io/';
  if (dashLink)  dashLink.href = CFG.siteUrl || 'https://jadootechenterprises.github.io/';

  startIdleTimer();
  await loadAllData();
  populatePanels();
  loadDashboard();
  loadMediaGrid();
}

function showLogin() {
  document.getElementById('login-page').style.display  = 'flex';
  document.getElementById('admin-shell').classList.remove('visible');
}

/* ── Logout ───────────────────────────────────────────────── */
document.getElementById('logout-btn')?.addEventListener('click', logout);
function logout() {
  sessionStorage.removeItem('jt_token');
  sessionStorage.removeItem('jt_user');
  sessionStorage.removeItem('jt_devmode');
  TOKEN    = '';
  USERNAME = '';
  DEV_MODE = false;
  showLogin();
}

/* ── Idle timer (30 min) ─────────────────────────────────── */
function startIdleTimer() {
  resetIdle();
  ['click','keydown','mousemove','touchstart'].forEach(evt => document.addEventListener(evt, resetIdle, { passive: true }));
}
function resetIdle() {
  clearTimeout(IDLE_TIMER);
  IDLE_TIMER = setTimeout(() => { toast('Session expired due to inactivity.', 'warning'); logout(); }, IDLE_MINUTES * 60 * 1000);
}

/* ── Nav / panel switching ───────────────────────────────── */
document.querySelectorAll('.sidebar-link[data-panel]').forEach(btn => {
  btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
});
function switchPanel(id) {
  document.querySelectorAll('.sidebar-link').forEach(b => b.classList.toggle('active', b.dataset.panel === id));
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${id}`));
  const titleEl = document.getElementById('topbar-title');
  if (titleEl) titleEl.textContent = btn_label(id);
  closeMobileSidebar();
  /* Load history list when switching to history panel */
  if (id === 'history') loadHistoryList();
}
function btn_label(id) {
  const map = { dashboard:'Dashboard','site-settings':'Site Settings', hero:'Hero', services:'Services', projects:'Projects', about:'About', process:'Process', tools:'Tech Tools', theme:'Theme', sections:'Sections', media:'Media Library', history:'Version History' };
  return map[id] || id;
}

/* ── Mobile sidebar ──────────────────────────────────────── */
document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
  document.getElementById('admin-sidebar').classList.toggle('mobile-open');
  document.getElementById('sidebar-overlay').classList.toggle('visible');
});
document.getElementById('sidebar-overlay')?.addEventListener('click', closeMobileSidebar);
function closeMobileSidebar() {
  document.getElementById('admin-sidebar')?.classList.remove('mobile-open');
  document.getElementById('sidebar-overlay')?.classList.remove('visible');
}

/* ── GitHub API helpers ──────────────────────────────────── */
function ghFetch(url, token, opts = {}) {
  return fetch(url, {
    ...opts,
    headers: {
      'Accept':        'application/vnd.github+json',
      'Authorization': `Bearer ${token || TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...opts.headers,
    },
  });
}

async function ghGetFile(path) {
  if (DEV_MODE) return null;
  const r = await ghFetch(`https://api.github.com/repos/${CFG.owner}/${CFG.repo}/contents/${path}?ref=${CFG.branch}`);
  if (!r.ok) { if (r.status === 404) return null; throw new Error(`API ${r.status} getting ${path}`); }
  return r.json();
}

async function ghPutFile(path, content, message, sha) {
  if (DEV_MODE) { toast('Dev mode: changes are not saved to GitHub.', 'info'); return; }
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch: CFG.branch,
  };
  if (sha) body.sha = sha;

  const r = await ghFetch(`https://api.github.com/repos/${CFG.owner}/${CFG.repo}/contents/${path}`, TOKEN, {
    method: sha ? 'PUT' : 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (r.status === 409) throw new Error('SHA conflict: the file was changed elsewhere. Please reload and try again.');
  if (!r.ok) { const e = await r.json().catch(()=>{}); throw new Error(`Save failed (${r.status}): ${e?.message || 'unknown error'}`); }
  const data = await r.json();
  SHAS[path] = data.content?.sha;
  return data;
}

/* ── Load all data JSON files ─────────────────────────────── */
const DATA_FILES = ['site','home','services','projects','about','process','tools','settings'];

async function loadAllData() {
  const results = await Promise.allSettled(
    DATA_FILES.map(async name => {
      try {
        /* Prefer live repo via GitHub API if authenticated */
        if (!DEV_MODE) {
          const fileInfo = await ghGetFile(`data/${name}.json`);
          if (fileInfo) {
            SHAS[`data/${name}.json`] = fileInfo.sha;
            DATA[name] = JSON.parse(decodeURIComponent(escape(atob(fileInfo.content.replace(/\n/g, '')))));
            return;
          }
        }
        /* Fallback: fetch relative to admin panel */
        const r = await fetch(`../data/${name}.json`);
        if (r.ok) DATA[name] = await r.json();
      } catch (e) {
        console.warn(`Could not load ${name}.json:`, e);
        DATA[name] = {};
      }
    })
  );
}

/* ── Save a JSON file via GitHub API ─────────────────────── */
async function saveFile(name, obj) {
  const path    = `data/${name}.json`;
  const content = JSON.stringify(obj, null, 2);
  const sha     = SHAS[path] || null;

  setSaveStatus('saving', 'Saving…');
  try {
    /* Detect SHA conflict */
    if (!DEV_MODE && sha) {
      const current = await ghGetFile(path);
      if (current && current.sha !== sha) {
        throw new Error('SHA conflict: file was updated elsewhere. Reloading latest…');
      }
    }

    await ghPutFile(path, content, `admin: update ${name}`, sha);
    DATA[name] = obj;
    setSaveStatus('saved', 'Saved ✓ — live in ~1–2 min');
    setTimeout(() => setSaveStatus('', ''), 5000);
    setUnsaved(false);
    toast(`${name}.json saved.`, 'success');
  } catch (e) {
    setSaveStatus('error', 'Save failed');
    toast(e.message, 'error');
    throw e;
  }
}

/* ── Undo last save (revert to previous commit's version) ── */
async function undoFile(name) {
  const path = `data/${name}.json`;
  try {
    const commitsR = await ghFetch(`https://api.github.com/repos/${CFG.owner}/${CFG.repo}/commits?path=${path}&per_page=2`);
    if (!commitsR.ok) throw new Error('Could not fetch commit history.');
    const commits = await commitsR.json();
    if (commits.length < 2) { toast('No previous version found.', 'info'); return; }

    const prevSha = commits[1].sha;
    const fileR   = await ghFetch(`https://api.github.com/repos/${CFG.owner}/${CFG.repo}/contents/${path}?ref=${prevSha}`);
    if (!fileR.ok) throw new Error('Could not load previous version.');
    const fileData = await fileR.json();
    const content  = decodeURIComponent(escape(atob(fileData.content.replace(/\n/g,''))));

    const confirmed = await confirmDialog(`Restore ${name}.json to the version from commit "${commits[1].commit.message}"?`, 'Restore');
    if (!confirmed) return;

    await saveFile(name, JSON.parse(content));
    await loadAllData();
    populatePanels();
    toast(`${name}.json restored to previous version.`, 'success');
  } catch (e) {
    toast(e.message, 'error');
  }
}

/* ── Wire save buttons ───────────────────────────────────── */
document.addEventListener('click', async e => {
  const btn = e.target.closest('[data-save]');
  if (!btn) return;
  const name = btn.dataset.save;
  btn.disabled = true;
  try {
    await collectAndSave(name);
  } finally {
    btn.disabled = false;
  }
});

document.addEventListener('click', async e => {
  const btn = e.target.closest('[data-undo]');
  if (!btn) return;
  await undoFile(btn.dataset.undo);
});

async function collectAndSave(name) {
  switch (name) {
    case 'site':     await saveFile('site',     collectSite()); break;
    case 'home':     await saveFile('home',     collectHome()); break;
    case 'services': await saveFile('services', collectServices()); break;
    case 'projects': await saveFile('projects', collectProjects()); break;
    case 'about':    await saveFile('about',    collectAbout()); break;
    case 'process':  await saveFile('process',  collectProcess()); break;
    case 'tools':    await saveFile('tools',    collectTools()); break;
    case 'settings': await saveFile('settings', collectSettings()); break;
  }
}

/* ── Mark unsaved ────────────────────────────────────────── */
function setUnsaved(v) {
  UNSAVED = v;
  document.getElementById('unsaved-badge')?.classList.toggle('show', v);
}
function setSaveStatus(cls, msg) {
  const el = document.getElementById('save-status');
  if (!el) return;
  el.className = 'save-status ' + cls;
  el.textContent = msg;
}

/* Track changes */
document.addEventListener('input', () => setUnsaved(true));

/* ── Populate all editor panels ──────────────────────────── */
function populatePanels() {
  populateSite();
  populateHero();
  populateServices();
  populateProjects();
  populateAbout();
  populateProcess();
  populateTools();
  populateTheme();
  populateSections();
}

/* ── SITE panel ──────────────────────────────────────────── */
function populateSite() {
  const s = DATA.site || {};
  const b = s.brand || {};
  const c = s.contact || {};
  const l = s.social || {};
  const e = s.seo || {};
  const f = s.footer || {};
  set('site-brand-name',      b.name);
  set('site-tagline',         b.tagline);
  set('site-logo-url',        b.logoUrl);
  set('site-favicon-url',     b.faviconUrl);
  set('site-phone',           c.phone);
  set('site-phone-display',   c.phoneDisplay);
  set('site-email',           c.email);
  set('site-whatsapp',        c.whatsapp);
  set('site-address',         c.address || '');
  set('site-github',          l.github || '');
  set('site-linkedin',        l.linkedin || '');
  set('site-instagram',       l.instagram || '');
  set('site-twitter',         l.twitter || '');
  set('site-seo-title',       e.title || '');
  set('site-seo-desc',        e.description || '');
  set('site-og-image',        e.ogImage || '');
  set('site-form-endpoint',   s.formEndpoint || '');
  set('site-footer-text',     f.text || '');
  set('site-footer-note',     f.note || '');
}
function collectSite() {
  return {
    brand:   { name: get('site-brand-name'), tagline: get('site-tagline'), logoUrl: get('site-logo-url'), faviconUrl: get('site-favicon-url') },
    contact: { phone: get('site-phone'), phoneDisplay: get('site-phone-display'), email: get('site-email'), whatsapp: get('site-whatsapp'), whatsappMessage: DATA.site?.contact?.whatsappMessage || 'Hi, I want to discuss a project.', address: get('site-address') },
    social:  { github: get('site-github'), linkedin: get('site-linkedin'), instagram: get('site-instagram'), twitter: get('site-twitter'), facebook: DATA.site?.social?.facebook || '' },
    seo:     { title: get('site-seo-title'), description: get('site-seo-desc'), ogImage: get('site-og-image'), canonicalUrl: DATA.site?.seo?.canonicalUrl || CFG.siteUrl },
    footer:  { text: get('site-footer-text'), copyright: DATA.site?.footer?.copyright || 'JadooTech Enterprises. All rights reserved.', note: get('site-footer-note') },
    formEndpoint: get('site-form-endpoint'),
  };
}

/* ── HERO panel ──────────────────────────────────────────── */
function populateHero() {
  const h = DATA.home || {};
  set('hero-kicker',              h.kicker || '');
  set('hero-headline',            h.headline || '');
  set('hero-accent',              h.headlineAccent || '');
  set('hero-subtext',             h.subtext || '');
  set('hero-cta-primary-label',   h.ctaPrimary?.label || '');
  set('hero-cta-secondary-label', h.ctaSecondary?.label || '');
  renderTagEditor('hero-tags-editor', (h.tags || []).map(t => t.label));
  renderMetricsEditor(h.metrics || []);
}
function collectHome() {
  const h = DATA.home || {};
  const tags = readTagEditor('hero-tags-editor').map((lbl, i) => ({
    label: lbl,
    href:  h.tags?.[i]?.href || '#services',
    icon:  h.tags?.[i]?.icon || 'link',
  }));
  return {
    ...h,
    kicker:         get('hero-kicker'),
    headline:       get('hero-headline'),
    headlineAccent: get('hero-accent'),
    subtext:        get('hero-subtext'),
    ctaPrimary:   { label: get('hero-cta-primary-label'),   href: h.ctaPrimary?.href   || '#contact' },
    ctaSecondary: { label: get('hero-cta-secondary-label'), href: h.ctaSecondary?.href || '#work' },
    tags,
    metrics: collectMetrics(),
  };
}
function renderMetricsEditor(metrics) {
  const el = document.getElementById('metrics-editor');
  if (!el) return;
  el.innerHTML = metrics.map((m, i) => `
    <div class="a-input-row" style="margin-bottom:.75rem">
      <div class="a-form-group">
        <label for="metric-val-${i}" class="a-label">Metric ${i+1} value</label>
        <input type="text" id="metric-val-${i}" class="a-input" value="${esc(m.value)}" placeholder="Live"/>
      </div>
      <div class="a-form-group">
        <label for="metric-lbl-${i}" class="a-label">Label</label>
        <input type="text" id="metric-lbl-${i}" class="a-input" value="${esc(m.label)}" placeholder="Deployed Projects"/>
      </div>
    </div>
  `).join('');
}
function collectMetrics() {
  const metrics = DATA.home?.metrics || [];
  return metrics.map((m, i) => ({
    ...m,
    value: (document.getElementById(`metric-val-${i}`)?.value || m.value),
    label: (document.getElementById(`metric-lbl-${i}`)?.value || m.label),
  }));
}

/* ── SERVICES panel ──────────────────────────────────────── */
function populateServices() {
  const s = DATA.services || {};
  set('svc-section-kicker',  s.kicker  || '');
  set('svc-section-heading', s.heading || '');
  set('svc-section-subtext', s.subtext || '');
  set('svc-section-also',    s.alsoOffered || '');
  renderServicesList(s.items || []);
}
function renderServicesList(items) {
  const el = document.getElementById('services-list');
  if (!el) return;
  if (!items.length) { el.innerHTML = '<div class="a-empty"><div class="a-empty-icon">📋</div>No services yet. Click + Add service.</div>'; return; }
  el.innerHTML = items.map((svc, i) => `
    <div class="a-list-item" data-idx="${i}">
      <span class="a-list-item-drag" aria-hidden="true">⠿</span>
      <span class="a-list-item-num">${String(i+1).padStart(2,'0')}</span>
      <div class="a-list-item-body">
        <div class="a-list-item-title">${esc(svc.title)}</div>
        <div class="a-list-item-meta">${esc(svc.tech?.join(' · ') || '')}</div>
      </div>
      <div class="a-list-item-actions">
        <span class="a-badge ${svc.visible ? 'a-badge-green' : 'a-badge-gray'}">${svc.visible ? 'Visible' : 'Hidden'}</span>
        <button class="a-btn a-btn-ghost a-btn-sm" onclick="moveService(${i},-1)" aria-label="Move up">↑</button>
        <button class="a-btn a-btn-ghost a-btn-sm" onclick="moveService(${i}, 1)" aria-label="Move down">↓</button>
        <button class="a-btn a-btn-secondary a-btn-sm" onclick="editService(${i})">Edit</button>
        <button class="a-btn a-btn-danger a-btn-sm"    onclick="deleteService(${i})" aria-label="Delete service">✕</button>
      </div>
    </div>
  `).join('');
}
function collectServices() {
  return { ...DATA.services, kicker: get('svc-section-kicker'), heading: get('svc-section-heading'), subtext: get('svc-section-subtext'), alsoOffered: get('svc-section-also'), items: DATA.services?.items || [] };
}

window.moveService = function(idx, dir) {
  const items = DATA.services?.items || [];
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= items.length) return;
  [items[idx], items[newIdx]] = [items[newIdx], items[idx]];
  items.forEach((s, i) => s.order = i + 1);
  renderServicesList(items);
  setUnsaved(true);
};

window.deleteService = async function(idx) {
  const svc = DATA.services?.items?.[idx];
  if (!svc) return;
  const ok = await confirmDialog(`Delete "${svc.title}"? This cannot be undone.`, 'Delete');
  if (!ok) return;
  DATA.services.items.splice(idx, 1);
  renderServicesList(DATA.services.items);
  setUnsaved(true);
};

window.editService = function(idx) {
  editingServiceIdx = idx;
  const svc = idx === -1
    ? { id:'', visible:true, order:999, title:'', summary:'', detail:'', includes:[], tech:[], cta:'' }
    : { ...DATA.services.items[idx] };
  document.getElementById('svc-drawer-title').textContent = idx === -1 ? 'Add Service' : 'Edit Service';
  const body = document.getElementById('svc-drawer-body');
  body.innerHTML = `
    <div class="a-form-group">
      <label for="sd-title" class="a-label">Title</label>
      <input type="text" id="sd-title" class="a-input" value="${esc(svc.title)}"/>
    </div>
    <div class="a-form-group">
      <label for="sd-summary" class="a-label">Short summary <span class="a-label-hint">shown in the row</span></label>
      <input type="text" id="sd-summary" class="a-input" value="${esc(svc.summary)}"/>
    </div>
    <div class="a-form-group">
      <label for="sd-detail" class="a-label">Full description</label>
      <textarea id="sd-detail" class="a-textarea" rows="3">${esc(svc.detail)}</textarea>
    </div>
    <div class="a-form-group">
      <label class="a-label">Technology tags</label>
      <div class="tag-editor" id="sd-tech-tags"></div>
    </div>
    <div class="a-form-group">
      <label class="a-label">What's included <span class="a-label-hint">one per line</span></label>
      <textarea id="sd-includes" class="a-textarea" rows="5">${(svc.includes||[]).join('\n')}</textarea>
    </div>
    <div class="a-checkbox-row" style="margin-top:.5rem">
      <label class="toggle" aria-label="Visible on site">
        <input type="checkbox" id="sd-visible" ${svc.visible ? 'checked' : ''}/>
        <span class="toggle-slider"></span>
      </label>
      <label for="sd-visible">Show on public site</label>
    </div>
  `;
  renderTagEditor('sd-tech-tags', svc.tech || []);
  openDrawer('service');
};

document.getElementById('add-service-btn')?.addEventListener('click', () => window.editService(-1));

document.getElementById('save-svc-drawer')?.addEventListener('click', () => {
  const svc = editingServiceIdx === -1 ? {} : { ...DATA.services.items[editingServiceIdx] };
  svc.title    = sanitise(get('sd-title'));
  svc.summary  = sanitise(get('sd-summary'));
  svc.detail   = sanitise(get('sd-detail'));
  svc.tech     = readTagEditor('sd-tech-tags').map(sanitise);
  svc.includes = get('sd-includes').split('\n').map(l => sanitise(l.trim())).filter(Boolean);
  svc.visible  = document.getElementById('sd-visible')?.checked ?? true;
  if (!svc.id) svc.id = svc.title.toLowerCase().replace(/\s+/g,'-');
  if (!svc.cta) svc.cta = svc.title;

  if (editingServiceIdx === -1) { DATA.services.items = DATA.services.items || []; DATA.services.items.push(svc); }
  else DATA.services.items[editingServiceIdx] = svc;

  renderServicesList(DATA.services.items);
  closeDrawer('service');
  setUnsaved(true);
});

/* ── PROJECTS panel ──────────────────────────────────────── */
function populateProjects() {
  const p = DATA.projects || {};
  set('proj-section-heading', p.heading || '');
  set('proj-section-subtext', p.subtext || '');
  renderProjectsList(p.items || []);
}
function renderProjectsList(items) {
  const el = document.getElementById('projects-list-admin');
  if (!el) return;
  if (!items.length) { el.innerHTML = '<div class="a-empty"><div class="a-empty-icon">📋</div>No projects yet.</div>'; return; }
  el.innerHTML = items.map((proj, i) => `
    <div class="a-list-item" data-idx="${i}">
      <span class="a-list-item-drag" aria-hidden="true">⠿</span>
      <span class="a-list-item-num">${i+1}</span>
      <div class="a-list-item-body">
        <div class="a-list-item-title">${esc(proj.title)}${proj.featured ? ' <span class="a-badge a-badge-blue">Featured</span>' : ''}</div>
        <div class="a-list-item-meta">${esc(proj.tech?.join(' · ')||'')}</div>
      </div>
      <div class="a-list-item-actions">
        <span class="a-badge ${proj.visible ? 'a-badge-green' : 'a-badge-gray'}">${proj.visible ? 'Visible' : 'Hidden'}</span>
        <button class="a-btn a-btn-ghost a-btn-sm" onclick="moveProject(${i},-1)">↑</button>
        <button class="a-btn a-btn-ghost a-btn-sm" onclick="moveProject(${i}, 1)">↓</button>
        <button class="a-btn a-btn-secondary a-btn-sm" onclick="editProject(${i})">Edit</button>
        <button class="a-btn a-btn-danger a-btn-sm"    onclick="deleteProject(${i})">✕</button>
      </div>
    </div>
  `).join('');
}
function collectProjects() {
  return { ...DATA.projects, heading: get('proj-section-heading'), subtext: get('proj-section-subtext'), items: DATA.projects?.items || [] };
}

window.moveProject = function(idx, dir) {
  const items = DATA.projects?.items || [];
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= items.length) return;
  [items[idx], items[newIdx]] = [items[newIdx], items[idx]];
  renderProjectsList(items);
  setUnsaved(true);
};
window.deleteProject = async function(idx) {
  const proj = DATA.projects?.items?.[idx];
  if (!proj) return;
  const ok = await confirmDialog(`Delete "${proj.title}"?`, 'Delete');
  if (!ok) return;
  DATA.projects.items.splice(idx, 1);
  renderProjectsList(DATA.projects.items);
  setUnsaved(true);
};
window.editProject = function(idx) {
  editingProjectIdx = idx;
  const proj = idx === -1
    ? { id:'', visible:true, featured:false, order:999, title:'', problem:'', solution:'', result:'', tech:[], demoUrl:'', githubUrl:'', images:[], terminalLines:[] }
    : { ...DATA.projects.items[idx] };
  document.getElementById('proj-drawer-title').textContent = idx === -1 ? 'Add Project' : 'Edit Project';
  const body = document.getElementById('proj-drawer-body');
  body.innerHTML = `
    <div class="a-form-group">
      <label for="pd-title" class="a-label">Project title</label>
      <input type="text" id="pd-title" class="a-input" value="${esc(proj.title)}"/>
    </div>
    <div class="a-form-group">
      <label for="pd-problem" class="a-label">Problem</label>
      <textarea id="pd-problem" class="a-textarea" rows="2">${esc(proj.problem)}</textarea>
    </div>
    <div class="a-form-group">
      <label for="pd-solution" class="a-label">Solution</label>
      <textarea id="pd-solution" class="a-textarea" rows="2">${esc(proj.solution)}</textarea>
    </div>
    <div class="a-form-group">
      <label for="pd-result" class="a-label">Result</label>
      <textarea id="pd-result" class="a-textarea" rows="2">${esc(proj.result)}</textarea>
    </div>
    <div class="a-form-group">
      <label class="a-label">Tech stack tags</label>
      <div class="tag-editor" id="pd-tech-tags"></div>
    </div>
    <div class="a-input-row">
      <div class="a-form-group">
        <label for="pd-demo" class="a-label">Live demo URL</label>
        <input type="url" id="pd-demo" class="a-input" value="${esc(proj.demoUrl||'')}"/>
      </div>
      <div class="a-form-group">
        <label for="pd-github" class="a-label">GitHub repo URL</label>
        <input type="url" id="pd-github" class="a-input" value="${esc(proj.githubUrl||'')}"/>
      </div>
    </div>
    <div class="a-checkbox-row">
      <label class="toggle"><input type="checkbox" id="pd-featured" ${proj.featured?'checked':''}/><span class="toggle-slider"></span></label>
      <label for="pd-featured">Featured (shows first, larger)</label>
    </div>
    <div class="a-checkbox-row" style="margin-top:.5rem">
      <label class="toggle"><input type="checkbox" id="pd-visible" ${proj.visible?'checked':''}/><span class="toggle-slider"></span></label>
      <label for="pd-visible">Show on public site</label>
    </div>
  `;
  renderTagEditor('pd-tech-tags', proj.tech || []);
  openDrawer('project');
};
document.getElementById('add-project-btn')?.addEventListener('click', () => window.editProject(-1));
document.getElementById('save-proj-drawer')?.addEventListener('click', () => {
  const proj = editingProjectIdx === -1 ? {} : { ...DATA.projects.items[editingProjectIdx] };
  proj.title    = sanitise(get('pd-title'));
  proj.problem  = sanitise(get('pd-problem'));
  proj.solution = sanitise(get('pd-solution'));
  proj.result   = sanitise(get('pd-result'));
  proj.tech     = readTagEditor('pd-tech-tags').map(sanitise);
  proj.demoUrl  = get('pd-demo') || null;
  proj.githubUrl= get('pd-github') || null;
  proj.featured = document.getElementById('pd-featured')?.checked ?? false;
  proj.visible  = document.getElementById('pd-visible')?.checked ?? true;
  if (!proj.id) proj.id = proj.title.toLowerCase().replace(/\s+/g,'-');
  if (!proj.terminalLines) proj.terminalLines = [];
  if (editingProjectIdx === -1) { DATA.projects.items = DATA.projects.items || []; DATA.projects.items.push(proj); }
  else DATA.projects.items[editingProjectIdx] = proj;
  renderProjectsList(DATA.projects.items);
  closeDrawer('project');
  setUnsaved(true);
});

/* ── ABOUT panel ─────────────────────────────────────────── */
function populateAbout() {
  const a = DATA.about || {};
  set('about-heading',      a.heading || '');
  set('about-p1',           a.paragraphs?.[0] || '');
  set('about-p2',           a.paragraphs?.[1] || '');
  set('about-cta-label',    a.ctaLabel || '');
  set('about-card-tagline', a.card?.tagline?.replace('\n', ' ') || '');
}
function collectAbout() {
  return {
    ...DATA.about,
    heading:    sanitise(get('about-heading')),
    paragraphs: [sanitise(get('about-p1')), sanitise(get('about-p2'))].filter(Boolean),
    ctaLabel:   sanitise(get('about-cta-label')),
    card: { ...DATA.about?.card, tagline: sanitise(get('about-card-tagline')) },
  };
}

/* ── PROCESS panel ───────────────────────────────────────── */
function populateProcess() {
  const p = DATA.process || {};
  set('process-heading', p.heading || '');
  set('process-subtext', p.subtext || '');
  set('process-example-quote',  p.example?.quote || '');
  set('process-example-result', p.example?.result || '');
  renderProcessSteps(p.steps || []);
}
function renderProcessSteps(steps) {
  const el = document.getElementById('process-steps-list');
  if (!el) return;
  el.innerHTML = steps.map((s, i) => `
    <div class="step-item" data-idx="${i}">
      <span class="step-item-num">${esc(s.number || String(i+1).padStart(2,'0'))}</span>
      <div class="step-item-body">
        <input type="text" class="a-input" data-step="title" data-i="${i}" value="${esc(s.title)}" placeholder="Step title" style="margin-bottom:.35rem"/>
        <textarea class="a-textarea" data-step="desc" data-i="${i}" rows="2" placeholder="Description">${esc(s.description)}</textarea>
      </div>
      <div class="step-item-del">
        <button class="a-btn a-btn-danger a-btn-sm a-btn-icon" onclick="deleteStep(${i})" aria-label="Delete step">✕</button>
      </div>
    </div>
  `).join('');
}
window.deleteStep = function(idx) {
  DATA.process.steps.splice(idx, 1);
  renderProcessSteps(DATA.process.steps);
  setUnsaved(true);
};
document.getElementById('add-process-step')?.addEventListener('click', () => {
  DATA.process = DATA.process || { steps: [] };
  DATA.process.steps = DATA.process.steps || [];
  DATA.process.steps.push({ number: String(DATA.process.steps.length+1).padStart(2,'0'), title:'', description:'' });
  renderProcessSteps(DATA.process.steps);
});
function collectProcess() {
  const steps = [];
  document.querySelectorAll('#process-steps-list .step-item').forEach((item, i) => {
    steps.push({
      number:      DATA.process?.steps?.[i]?.number || String(i+1).padStart(2,'0'),
      title:       sanitise(item.querySelector('[data-step="title"]')?.value || ''),
      description: sanitise(item.querySelector('[data-step="desc"]')?.value  || ''),
    });
  });
  return {
    ...DATA.process,
    heading: sanitise(get('process-heading')),
    subtext: sanitise(get('process-subtext')),
    example: {
      label:  DATA.process?.example?.label || 'A real example',
      quote:  sanitise(get('process-example-quote')),
      result: sanitise(get('process-example-result')),
    },
    steps,
  };
}

/* ── TOOLS panel ─────────────────────────────────────────── */
function populateTools() {
  const t = DATA.tools || {};
  set('tools-heading', t.heading || '');
  renderTagEditor('tools-chips-editor', t.items || []);
}
function collectTools() {
  return { ...DATA.tools, heading: sanitise(get('tools-heading')), items: readTagEditor('tools-chips-editor').map(sanitise) };
}

/* ── THEME panel ─────────────────────────────────────────── */
function populateTheme() {
  const s = DATA.settings?.theme || {};
  setColor('theme-accent',     s.accentColor || '#1A56DB');
  setColor('theme-navy',       s.navyColor   || '#0D1B2A');
  setColor('theme-bg',         s.bgColor     || '#F7F4EF');
  setVal('theme-font-display', s.fontDisplay || 'Playfair Display');
  setVal('theme-default-mode', s.default     || 'light');
}
function collectSettings() {
  return {
    ...DATA.settings,
    theme: {
      ...DATA.settings?.theme,
      default:      get('theme-default-mode'),
      accentColor:  get('theme-accent-hex') || get('theme-accent'),
      navyColor:    get('theme-navy-hex')   || get('theme-navy'),
      bgColor:      get('theme-bg-hex')     || get('theme-bg'),
      fontDisplay:  get('theme-font-display'),
    },
    sections: collectSectionToggles(),
  };
}

/* ── SECTIONS toggles ────────────────────────────────────── */
function populateSections() {
  const vis = DATA.settings?.sections || {};
  const secs = [
    { id:'hero',     label:'Hero',     desc:'Main headline and code card.' },
    { id:'services', label:'Services', desc:'Services list.' },
    { id:'work',     label:'Work',     desc:'Project cards.' },
    { id:'about',    label:'About',    desc:'About section.' },
    { id:'process',  label:'Process',  desc:'5-step process.' },
    { id:'contact',  label:'Contact',  desc:'Enquiry form.' },
  ];
  const el = document.getElementById('sections-toggles');
  if (!el) return;
  el.innerHTML = secs.map(s => `
    <div class="section-toggle-row">
      <div>
        <div class="section-toggle-label">${esc(s.label)}</div>
        <div class="section-toggle-sub">${esc(s.desc)}</div>
      </div>
      <label class="toggle" aria-label="Show ${s.label}">
        <input type="checkbox" id="sec-${s.id}" ${vis[s.id] !== false ? 'checked' : ''}/>
        <span class="toggle-slider"></span>
      </label>
    </div>
  `).join('');
}
function collectSectionToggles() {
  const out = {};
  ['hero','services','work','about','process','contact'].forEach(id => {
    out[id] = document.getElementById(`sec-${id}`)?.checked ?? true;
  });
  return out;
}

/* ── COLOR pickers ───────────────────────────────────────── */
['theme-accent','theme-navy','theme-bg'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', e => {
    const hexId = id + '-hex';
    const hex = document.getElementById(hexId);
    if (hex) hex.value = e.target.value;
  });
  document.getElementById(id + '-hex')?.addEventListener('input', e => {
    const col = document.getElementById(id);
    if (col && /^#[0-9A-Fa-f]{6}$/.test(e.target.value)) col.value = e.target.value;
  });
});
function setColor(id, val) {
  const col = document.getElementById(id);
  const hex = document.getElementById(id + '-hex');
  if (col) col.value = val;
  if (hex) hex.value = val;
}

/* ── Tag editor ──────────────────────────────────────────── */
function renderTagEditor(containerId, tags) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  tags.forEach(tag => addTagChip(container, tag));
  /* Add input */
  const input = document.createElement('input');
  input.type = 'text'; input.className = 'tag-add-input'; input.placeholder = 'Add…';
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const v = input.value.trim().replace(/,$/,'');
      if (v) { addTagChip(container, v); input.value = ''; setUnsaved(true); }
    }
  });
  container.appendChild(input);
}
function addTagChip(container, label) {
  const chip = document.createElement('span');
  chip.className = 'tag-chip';
  chip.innerHTML = `${esc(label)}<button type="button" aria-label="Remove ${esc(label)}">×</button>`;
  chip.querySelector('button').addEventListener('click', () => { chip.remove(); setUnsaved(true); });
  chip.dataset.label = label;
  /* Insert before input */
  const inp = container.querySelector('.tag-add-input');
  if (inp) container.insertBefore(chip, inp);
  else container.appendChild(chip);
}
function readTagEditor(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  return Array.from(container.querySelectorAll('.tag-chip')).map(c => c.dataset.label);
}

/* ── Drawer open/close ───────────────────────────────────── */
function openDrawer(name) {
  document.getElementById('drawer-overlay').classList.add('open');
  document.getElementById(`${name}-drawer`).classList.add('open');
  document.getElementById(`${name}-drawer`).querySelector('.a-drawer-body')?.scrollTo(0, 0);
}
function closeDrawer(name) {
  document.getElementById('drawer-overlay').classList.remove('open');
  document.getElementById(`${name}-drawer`).classList.remove('open');
}
document.getElementById('drawer-overlay')?.addEventListener('click', () => { closeDrawer('service'); closeDrawer('project'); });
document.getElementById('close-svc-drawer')?.addEventListener('click',    () => closeDrawer('service'));
document.getElementById('cancel-svc-drawer')?.addEventListener('click',   () => closeDrawer('service'));
document.getElementById('close-proj-drawer')?.addEventListener('click',   () => closeDrawer('project'));
document.getElementById('cancel-proj-drawer')?.addEventListener('click',  () => closeDrawer('project'));
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDrawer('service'); closeDrawer('project'); } });

/* ── DASHBOARD ───────────────────────────────────────────── */
async function loadDashboard() {
  const svcCount  = (DATA.services?.items || []).filter(s => s.visible).length;
  const projCount = (DATA.projects?.items || []).length;
  document.getElementById('dash-services-count').textContent = svcCount;
  document.getElementById('dash-projects-count').textContent = projCount;

  if (DEV_MODE) {
    document.getElementById('dash-last-commit').textContent = 'Dev mode';
    document.getElementById('dash-commits').innerHTML = '<p class="a-help">Dev mode: no GitHub API access.</p>';
    return;
  }

  try {
    const r = await ghFetch(`https://api.github.com/repos/${CFG.owner}/${CFG.repo}/commits?per_page=5`);
    if (!r.ok) throw new Error();
    const commits = await r.json();
    if (commits.length) {
      const d = new Date(commits[0].commit.committer.date);
      document.getElementById('dash-last-commit').textContent = d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
    }
    document.getElementById('dash-commits').innerHTML = `
      <div class="commit-list">
        ${commits.map(c => `
          <div class="commit-item">
            <div>
              <div class="commit-msg">${esc(c.commit.message)}</div>
              <div class="commit-meta">${esc(c.commit.committer.name)} · ${new Date(c.commit.committer.date).toLocaleString('en-IN')}</div>
            </div>
            <span class="commit-sha">${c.sha.slice(0,7)}</span>
          </div>
        `).join('')}
      </div>`;
  } catch {
    document.getElementById('dash-commits').innerHTML = '<p class="a-help">Could not load commits.</p>';
  }
}

/* ── MEDIA LIBRARY ───────────────────────────────────────── */
async function loadMediaGrid() {
  const grid = document.getElementById('media-grid');
  if (!grid) return;

  if (DEV_MODE) { grid.innerHTML = '<p class="a-help">Dev mode: media library unavailable.</p>'; return; }

  try {
    const r = await ghFetch(`https://api.github.com/repos/${CFG.owner}/${CFG.repo}/contents/assets/img?ref=${CFG.branch}`);
    const items = r.ok ? await r.json() : [];
    const images = items.filter(f => /\.(webp|png|jpg|jpeg|gif)$/i.test(f.name));

    if (!images.length) {
      grid.innerHTML = '<div class="a-empty"><div class="a-empty-icon">🖼️</div>No images yet. Upload one above.</div>';
      return;
    }
    grid.innerHTML = images.map(img => `
      <div class="media-item" title="${esc(img.name)}" tabindex="0"
           onclick="copyPath('assets/img/${esc(img.name)}')" role="button" aria-label="Copy path: ${esc(img.name)}">
        <img src="${img.download_url}" alt="${esc(img.name)}" loading="lazy"/>
        <div class="media-item-name">${esc(img.name)}</div>
        <button class="media-item-del" onclick="event.stopPropagation();deleteMedia('${esc(img.name)}','${esc(img.sha)}')" aria-label="Delete ${esc(img.name)}">✕</button>
      </div>
    `).join('');
  } catch {
    grid.innerHTML = '<p class="a-help">Could not load media library.</p>';
  }
}

window.copyPath = function(path) {
  navigator.clipboard?.writeText(path).then(() => toast(`Copied: ${path}`, 'success'));
};

window.deleteMedia = async function(name, sha) {
  const ok = await confirmDialog(`Delete image "${name}"? This cannot be undone.`, 'Delete');
  if (!ok) return;
  try {
    await ghFetch(`https://api.github.com/repos/${CFG.owner}/${CFG.repo}/contents/assets/img/${name}`, TOKEN, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `admin: delete image ${name}`, sha, branch: CFG.branch }),
    });
    toast(`Deleted ${name}`, 'success');
    loadMediaGrid();
  } catch (e) { toast(e.message, 'error'); }
};

/* Upload */
const uploadZone = document.getElementById('upload-zone');
const fileInput  = document.getElementById('file-input');

uploadZone?.addEventListener('click',   () => fileInput?.click());
uploadZone?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') fileInput?.click(); });
uploadZone?.addEventListener('dragover',  e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
uploadZone?.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone?.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  handleFiles(Array.from(e.dataTransfer.files));
});
fileInput?.addEventListener('change', () => handleFiles(Array.from(fileInput.files)));

async function handleFiles(files) {
  const images = files.filter(f => f.type.startsWith('image/'));
  if (!images.length) { toast('Please select image files.', 'warning'); return; }

  const progress = document.getElementById('upload-progress');
  const bar      = document.getElementById('upload-progress-bar');
  const status   = document.getElementById('upload-status');
  if (progress) progress.style.display = 'block';

  for (let i = 0; i < images.length; i++) {
    const file = images[i];
    if (status) status.textContent = `Processing ${file.name}…`;

    try {
      const { dataUrl, name, size } = await processImage(file);
      if (size > 500 * 1024) {
        const proceed = await confirmDialog(`${name} is ${Math.round(size/1024)} KB which exceeds the 500 KB recommendation. Upload anyway?`, 'Upload anyway');
        if (!proceed) continue;
      }

      if (bar) bar.style.width = `${Math.round(((i+1)/images.length)*100)}%`;

      const b64 = dataUrl.split(',')[1];
      const existing = await ghGetFile(`assets/img/${name}`).catch(() => null);
      await ghFetch(`https://api.github.com/repos/${CFG.owner}/${CFG.repo}/contents/assets/img/${name}`, TOKEN, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `admin: upload image ${name}`,
          content: b64,
          branch: CFG.branch,
          ...(existing?.sha ? { sha: existing.sha } : {}),
        }),
      });
      toast(`Uploaded: ${name}`, 'success');
    } catch (e) {
      toast(`Failed to upload ${file.name}: ${e.message}`, 'error');
    }
  }

  if (progress) progress.style.display = 'none';
  if (bar) bar.style.width = '0';
  if (status) status.textContent = '';
  fileInput.value = '';
  loadMediaGrid();
}

function processImage(file) {
  return new Promise((resolve, reject) => {
    const MAX_W = 1600;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = img.width > MAX_W ? MAX_W / img.width : 1;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const name = file.name.replace(/\.[^.]+$/, '') + '.webp';
      canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onload = () => resolve({ dataUrl: reader.result, name, size: blob.size });
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }, 'image/webp', 0.88);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/* ── VERSION HISTORY ─────────────────────────────────────── */
document.getElementById('history-load-btn')?.addEventListener('click', loadHistoryList);
async function loadHistoryList() {
  const path = document.getElementById('history-file')?.value;
  const el   = document.getElementById('history-list');
  if (!path || !el) return;

  if (DEV_MODE) { el.innerHTML = '<p class="a-help">Dev mode: version history unavailable.</p>'; return; }

  el.innerHTML = '<div class="a-loading"><span class="a-spinner"></span> Loading…</div>';
  try {
    const r = await ghFetch(`https://api.github.com/repos/${CFG.owner}/${CFG.repo}/commits?path=${path}&per_page=20`);
    if (!r.ok) throw new Error(`API ${r.status}`);
    const commits = await r.json();
    if (!commits.length) { el.innerHTML = '<div class="a-empty">No history for this file.</div>'; return; }
    el.innerHTML = `<div class="commit-list">${commits.map(c => `
      <div class="commit-item">
        <div>
          <div class="commit-msg">${esc(c.commit.message)}</div>
          <div class="commit-meta">${esc(c.commit.committer.name)} · ${new Date(c.commit.committer.date).toLocaleString('en-IN')}</div>
        </div>
        <div style="display:flex;gap:.4rem;align-items:center;flex-shrink:0">
          <span class="commit-sha">${c.sha.slice(0,7)}</span>
          <button class="a-btn a-btn-secondary a-btn-sm" onclick="restoreVersion('${path}','${c.sha}','${esc(c.commit.message.slice(0,40))}')">Restore</button>
        </div>
      </div>
    `).join('')}</div>`;
  } catch (e) { el.innerHTML = `<p class="a-help">Error: ${esc(e.message)}</p>`; }
}

window.restoreVersion = async function(path, sha, msg) {
  const ok = await confirmDialog(`Restore ${path} to commit "${msg}"?\nThis will overwrite the current version.`, 'Restore');
  if (!ok) return;
  try {
    const r = await ghFetch(`https://api.github.com/repos/${CFG.owner}/${CFG.repo}/contents/${path}?ref=${sha}`);
    if (!r.ok) throw new Error('Could not fetch that version.');
    const fileData = await r.json();
    const content  = decodeURIComponent(escape(atob(fileData.content.replace(/\n/g,''))));
    const current  = await ghGetFile(path);
    await ghPutFile(path, content, `admin: restore ${path} to ${sha.slice(0,7)}`, current?.sha || null);
    toast(`Restored ${path} to ${sha.slice(0,7)}`, 'success');
    await loadAllData();
    populatePanels();
  } catch (e) { toast(e.message, 'error'); }
};

/* ── TOAST ───────────────────────────────────────────────── */
function toast(msg, type = 'info') {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  stack.appendChild(t);
  setTimeout(() => t.remove(), 4500);
}

/* ── CONFIRM DIALOG ──────────────────────────────────────── */
function confirmDialog(message, actionLabel = 'Confirm') {
  return new Promise(resolve => {
    const overlay = document.getElementById('confirm-overlay');
    const body    = document.getElementById('confirm-body');
    const ok      = document.getElementById('confirm-ok');
    const cancel  = document.getElementById('confirm-cancel');
    if (!overlay) { resolve(window.confirm(message)); return; }
    body.textContent  = message;
    ok.textContent    = actionLabel;
    overlay.classList.add('open');
    const finish = v => { overlay.classList.remove('open'); ok.removeEventListener('click', onOk); cancel.removeEventListener('click', onCancel); resolve(v); };
    const onOk     = () => finish(true);
    const onCancel = () => finish(false);
    ok.addEventListener('click',     onOk);
    cancel.addEventListener('click', onCancel);
  });
}

/* ── Sanitise user input (text content only, no HTML) ────── */
function sanitise(s) {
  return String(s || '').replace(/</g,'&lt;').replace(/>/g,'&gt;').trim();
}

/* ── DOM helpers ─────────────────────────────────────────── */
function get(id)      { return document.getElementById(id)?.value?.trim() || ''; }
function set(id, val) { const el = document.getElementById(id); if (el) el.value = val ?? ''; }
function setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val ?? ''; }
function esc(s)       { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
