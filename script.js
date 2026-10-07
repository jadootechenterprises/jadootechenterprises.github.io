/* ============================================================
   JADOOTECH ENTERPRISES — script.js  v2
   Vanilla JavaScript — no dependencies
   ============================================================ */

'use strict';

/* ============================================================
   CONFIGURATION — only value you need to change
   ============================================================ */
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxfv5qwsGlRRdDkwEkF4mFCo5PkdRlfUpCVLC1LKvRcep2QB-qpcGcbXQoyQ6TPXQlDcQ/exec';

/* ============================================================
   SERVICE MODAL DATA
   ============================================================ */
const SERVICE_DATA = {
  'website-development': {
    title: 'Website Development',
    overview: 'Business websites, landing pages and portfolios built to represent your brand and generate enquiries — responsive, fast and SEO-ready from day one.',
    delivers: [
      'Business websites and landing pages',
      'Portfolio and personal brand sites',
      'Service-based company sites with contact forms',
      'Mobile-first, fully responsive layouts',
      'SEO meta structure, sitemap, robots.txt',
      'Contact form with lead capture',
      'GitHub Pages or cPanel deployment',
      'Full source code + basic documentation',
    ],
    process: ['Requirement discussion','Design mockup','Development','Testing on devices','Deployment'],
    tech: ['HTML5','CSS3','JavaScript','GitHub Pages'],
    service: 'Website Development',
  },
  'web-application': {
    title: 'Web Application Development',
    overview: 'Custom web apps built around your specific workflows — not off-the-shelf software that you have to bend your process to fit.',
    delivers: [
      'Dashboards and management portals',
      'Booking, ordering and inventory systems',
      'Multi-user apps with login and roles',
      'Admin panel and reporting',
      'REST API backend',
      'Database design and setup',
      'Mobile-responsive UI',
      'Deployment to shared or VPS hosting',
    ],
    process: ['Workflow analysis','Architecture design','Backend development','Frontend UI','Testing','Deployment'],
    tech: ['PHP','Laravel','MySQL','JavaScript','HTML5','CSS3'],
    service: 'Web Application Development',
  },
  'python-automation': {
    title: 'Python Automation',
    overview: 'If your team is copying data between spreadsheets, sending manual reports or doing repetitive file work — we automate it with Python.',
    delivers: [
      'Excel / CSV data processing scripts',
      'Email automation and report generation',
      'Web scraping and data collection',
      'Scheduled task runners (cron/Task Scheduler)',
      'File management and batch processing',
      'API data fetch and sync',
      'Error handling, logging and alerts',
      'Full documentation',
    ],
    process: ['Workflow audit','Automation design','Script development','Testing on real data','Deployment and scheduling'],
    tech: ['Python','Pandas','Selenium','REST APIs','OpenPyXL','SMTP'],
    service: 'Python Automation',
  },
  'api-integration': {
    title: 'API Integration',
    overview: 'Connect your existing tools, platforms and systems so they share data automatically — no more manual exporting and importing between apps.',
    delivers: [
      'Payment gateway integration (Razorpay, Stripe)',
      'CRM and ERP system connections',
      'Shipping and logistics API wiring',
      'WhatsApp / SMS notification triggers',
      'Third-party data sync pipelines',
      'OAuth authentication flows',
      'Webhook setup and handling',
      'API documentation',
    ],
    process: ['API audit','Integration design','Development','Testing','Go-live'],
    tech: ['REST APIs','Python','PHP','JavaScript','OAuth','Webhooks'],
    service: 'API Integration',
  },
  'business-automation': {
    title: 'Business Automation',
    overview: 'End-to-end automation of repetitive business operations — from daily reporting to multi-step approval workflows.',
    delivers: [
      'Daily/weekly automated reports',
      'Data entry elimination workflows',
      'Notification and alert systems',
      'Multi-step approval automations',
      'Customer follow-up sequences',
      'Inventory update triggers',
      'Scheduled cleanup and archiving tasks',
      'Process documentation',
    ],
    process: ['Process mapping','Automation blueprint','Build','Test on live workflow','Monitor and refine'],
    tech: ['Python','REST APIs','Scripting','Task Scheduler','Email/SMTP'],
    service: 'Business Automation',
  },
  'ai-solutions': {
    title: 'AI Solutions',
    overview: 'Practical AI tools — not buzzword features. We build things that actually save time or give you better insight into your data.',
    delivers: [
      'AI-powered data analysis dashboards',
      'CSV / document Q&A tools',
      'LLM API integrations (OpenAI, Gemini)',
      'Automated report summarisation',
      'Predictive data models',
      'Chatbot or assistant prototypes',
      'AI-assisted workflow automations',
      'Source code + documentation',
    ],
    process: ['Problem definition','Data review','Model/tool selection','Build','Testing','Deployment'],
    tech: ['Python','Streamlit','Pandas','Plotly','OpenAI API','Gemini API'],
    service: 'AI Solutions',
  },
  'uiux-development': {
    title: 'UI/UX Development',
    overview: 'Interfaces designed for real users — clean, fast and intuitive. Every element has a purpose.',
    delivers: [
      'Component-based UI development',
      'Responsive design across all screen sizes',
      'Accessibility-compliant markup',
      'Micro-interactions and transitions',
      'Design system / style guide',
      'Performance-optimised CSS',
      'Cross-browser testing',
      'Full source code',
    ],
    process: ['Wireframe review','Component design','Development','Device testing','Handoff'],
    tech: ['HTML5','CSS3','JavaScript','Figma (review)'],
    service: 'UI/UX Development',
  },
  'website-maintenance': {
    title: 'Website Maintenance',
    overview: 'Your website needs ongoing attention — bug fixes, content updates, speed improvements and security patches.',
    delivers: [
      'Bug fixes and layout corrections',
      'Content updates and additions',
      'Performance optimisation',
      'Security patches',
      'Broken link and form checks',
      'Backup management',
      'Monthly health report',
    ],
    process: ['Site audit','Issue list','Fix and test','Deploy updates','Report'],
    tech: ['HTML/CSS','JavaScript','cPanel','GitHub'],
    service: 'Website Maintenance',
  },
  'video-editing': {
    title: 'Video Editing',
    overview: 'Professional editing for promotional videos, product demos, social media reels and YouTube content.',
    delivers: [
      'Promotional brand videos',
      'Product demo and walkthrough edits',
      'Instagram / YouTube Reels',
      'Motion titles and transitions',
      'Colour grading and audio mixing',
      'Subtitles / captions',
      'Exported in platform-ready formats',
    ],
    process: ['Brief and raw footage review','First cut','Revision round','Final export'],
    tech: ['Adobe Premiere Pro','After Effects','Audition'],
    service: 'Video Editing',
  },
  'photo-editing': {
    title: 'Photo Editing',
    overview: 'Product retouching, background removal, brand graphic creation and digital assets for web and print.',
    delivers: [
      'Product photo retouching',
      'Background removal / replacement',
      'Brand social media graphics',
      'Brochure and banner design',
      'Logo touchups and file conversion',
      'Web-optimised image exports',
    ],
    process: ['Brief','First edit','Revision','Final delivery'],
    tech: ['Adobe Photoshop','Illustrator','Lightroom'],
    service: 'Photo Editing',
  },
};

/* ============================================================
   PROJECT MODAL DATA
   ============================================================ */
const PROJECT_DATA = {
  'business-website': {
    title: 'Business Website',
    type: 'demo',
    typeLabel: 'Demo Project',
    problem: 'Small and growing businesses often lack a credible online presence — leading to missed enquiries and lower trust from potential clients.',
    solution: 'A clean, fast responsive business website with a services section, contact form (Google Sheets backed) and mobile-first layout — deployable on GitHub Pages at zero hosting cost.',
    tech: ['HTML5','CSS3','JavaScript','GitHub Pages','Google Sheets'],
    features: [
      'Fully responsive — works on all screen sizes',
      'Contact form with Google Sheets lead capture',
      'SEO meta tags, sitemap, robots.txt',
      'Sub-2 second load time',
      'Zero hosting cost via GitHub Pages',
    ],
    status: 'Live demo available',
    demoUrl: 'https://jadootechenterprises.github.io/',
    githubUrl: 'https://github.com/jadootechenterprises/jadootechenterprises.github.io',
  },
  'ai-dashboard': {
    title: 'AI Data Analyst',
    type: 'demo',
    typeLabel: 'Demo Project',
    problem: 'Business owners often have data in spreadsheets but no easy way to analyse trends, spot problems or generate reports without knowing Python or Excel formulas.',
    solution: 'A Streamlit web app where you upload any CSV file and get instant AI-generated analysis — charts, trend summaries, anomaly detection and a Q&A interface to ask questions about your data.',
    tech: ['Python','Streamlit','Pandas','Plotly','OpenAI API'],
    features: [
      'Upload any CSV — automatic column detection',
      'Auto-generated charts (bar, line, scatter, pie)',
      'AI trend summary using LLM API',
      'Ask questions about your data in plain English',
      'Export cleaned report as PDF',
    ],
    status: 'Demo coming soon',
    demoUrl: null,
    githubUrl: null,
  },
  'python-automation': {
    title: 'Python Automation System',
    type: 'demo',
    typeLabel: 'Demo Project',
    problem: 'A team was spending 2–3 hours every morning manually copying order data from emails into Excel, then calculating summaries and sending a report to management.',
    solution: 'A Python script runs at 8am daily — reads the inbox, extracts structured data, updates the master Excel file, calculates all summaries and emails the finished report automatically. Zero human involvement.',
    tech: ['Python','Pandas','OpenPyXL','SMTP','IMAP','Scheduling'],
    features: [
      'Email inbox reader with regex data extraction',
      'Auto-updates master Excel workbook',
      'Calculates daily and weekly summaries',
      'Sends formatted report email with attachment',
      'Error logging — alerts you if something fails',
      'Runs headlessly on Windows Task Scheduler',
    ],
    status: 'Demo coming soon',
    demoUrl: null,
    githubUrl: null,
  },
  'bms': {
    title: 'Business Management System',
    type: 'concept',
    typeLabel: 'Concept Project',
    problem: 'Growing businesses managing orders, inventory and invoicing through separate spreadsheets and WhatsApp messages lose track of stock, miss payments and duplicate work.',
    solution: 'A custom web-based BMS with modules for inventory, orders, customer management, invoicing and reports — all in one system accessible from any browser.',
    tech: ['PHP','Laravel','MySQL','HTML5','CSS3','JavaScript'],
    features: [
      'Product catalogue and inventory tracking',
      'Order management with status workflow',
      'Customer database with order history',
      'Invoice generation and PDF export',
      'Role-based access (Admin / Staff / View)',
      'Dashboard with live sales and stock metrics',
    ],
    status: 'Concept — available to build on request',
    demoUrl: null,
    githubUrl: null,
  },
  'api-platform': {
    title: 'API Integration Platform',
    type: 'demo',
    typeLabel: 'Demo Project',
    problem: 'An e-commerce business was manually syncing orders from Shopify to their ERP, triggering WhatsApp notifications and updating stock — three separate tasks done by hand after every sale.',
    solution: 'A Python-based integration middleware that listens for Shopify webhooks, automatically pushes order data to the ERP, sends a WhatsApp notification via the Cloud API and updates stock levels — all within seconds of each order.',
    tech: ['REST APIs','Python','PHP','JavaScript','Webhooks','OAuth'],
    features: [
      'Shopify webhook listener — triggers on new order',
      'ERP order push via REST API',
      'WhatsApp Business API notification',
      'Stock level sync across platforms',
      'Error handling with retry logic',
      'Admin log view for every transaction',
    ],
    status: 'Demo coming soon',
    demoUrl: null,
    githubUrl: null,
  },
  'automation-dashboard': {
    title: 'Automation Dashboard',
    type: 'demo',
    typeLabel: 'Demo Project',
    problem: 'When multiple automation scripts run in the background, you have no visibility into which jobs ran, which failed or how performance has changed over time.',
    solution: 'A Streamlit dashboard that reads from a central log database and shows all automation job statuses, run times, error rates and historical trends — giving full operational visibility in real time.',
    tech: ['Python','Streamlit','Pandas','SQLite','Plotly','APIs'],
    features: [
      'Live job status — running / success / failed',
      'Run time and performance trend charts',
      'Error rate monitoring with alert threshold',
      'Last 30 days execution history table',
      'Manual trigger buttons for each automation',
      'Exportable log reports',
    ],
    status: 'Demo coming soon',
    demoUrl: null,
    githubUrl: null,
  },
};

/* ============================================================
   DOM READY
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
  initActiveNavLink();
  initBackToTop();
  initContactForm();
  initModals();
});

/* ============================================================
   1. NAVBAR
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  let ticking = false;

  function update() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });

  update();
}

/* ============================================================
   2. MOBILE MENU
   ============================================================ */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  const open  = () => { hamburger.setAttribute('aria-expanded','true'); mobileMenu.setAttribute('aria-hidden','false'); mobileMenu.classList.add('open'); document.body.style.overflow='hidden'; };
  const close = () => { hamburger.setAttribute('aria-expanded','false'); mobileMenu.setAttribute('aria-hidden','true'); mobileMenu.classList.remove('open'); document.body.style.overflow=''; };
  const toggle = () => hamburger.getAttribute('aria-expanded')==='true' ? close() : open();

  hamburger.addEventListener('click', toggle);
  mobileMenu.querySelectorAll('.mobile-link,.mobile-cta').forEach(l => l.addEventListener('click', close));
  document.addEventListener('click', e => { if (!document.getElementById('navbar').contains(e.target)) close(); });
  document.addEventListener('keydown', e => { if (e.key==='Escape') close(); });
  window.addEventListener('resize', () => { if (window.innerWidth>1024) close(); }, { passive: true });
}

/* ============================================================
   3. SMOOTH SCROLL
   ============================================================ */
function initSmoothScroll() {
  const OFFSET = 76;
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (!id || id === '#') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - OFFSET, behavior: 'smooth' });
  });
}

/* ============================================================
   4. ACTIVE NAV LINK
   ============================================================ */
function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  if (!sections.length || !links.length) return;

  function setActive() {
    let id = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 110) id = s.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
    });
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(() => { setActive(); ticking = false; }); ticking = true; }
  }, { passive: true });
  setActive();
}

/* ============================================================
   5. SCROLL REVEAL
   ============================================================ */
function initScrollReveal() {
  const selectors = [
    '.service-card','.portfolio-card','.del-card','.tech-badge',
    '.process-step','.why-card','.section-header',
    '.about-content','.about-visual','.contact-info',
    '.contact-form-wrap','.hero-content','.hero-visual',
    '.cta-content','.problem-example',
  ];

  const els = document.querySelectorAll(selectors.join(','));
  els.forEach(el => {
    el.classList.add('reveal');
    const siblings = Array.from(el.parentElement?.querySelectorAll(':scope > .reveal') || []);
    const pos = siblings.indexOf(el);
    if (pos > 0 && pos <= 3) el.classList.add(`reveal-delay-${pos}`);
  });

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ============================================================
   6. BACK TO TOP
   ============================================================ */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
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

/* ============================================================
   7. SERVICE MODAL
   ============================================================ */
function openServiceModal(key) {
  const data = SERVICE_DATA[key];
  if (!data) return;

  const content = document.getElementById('service-modal-content');
  content.innerHTML = `
    <h2 id="smodal-title">${data.title}</h2>
    <span class="modal-type svc">Service</span>

    <div class="modal-section">
      <h3>Overview</h3>
      <p>${data.overview}</p>
    </div>

    <div class="modal-section">
      <h3>What We Deliver</h3>
      <ul class="modal-list">
        ${data.delivers.map(d => `<li>${d}</li>`).join('')}
      </ul>
    </div>

    <div class="modal-section">
      <h3>Typical Process</h3>
      <div style="display:flex;flex-wrap:wrap;gap:.5rem;align-items:center">
        ${data.process.map((s, i) => `
          <span class="modal-tech">${i + 1}. ${s}</span>
          ${i < data.process.length - 1 ? '<span style="color:var(--gray-600);font-size:.8rem">→</span>' : ''}
        `).join('')}
      </div>
    </div>

    <div class="modal-section">
      <h3>Technology</h3>
      <div class="modal-tech-row">
        ${data.tech.map(t => `<span class="modal-tech">${t}</span>`).join('')}
      </div>
    </div>

    <div class="modal-actions">
      <button class="btn btn-primary" onclick="requestService('${data.service}')">Request This Service</button>
      <button class="btn btn-ghost" onclick="closeModal('service-modal')">Close</button>
    </div>
  `;

  showModal('service-modal');
}

/* ============================================================
   8. PROJECT MODAL
   ============================================================ */
function openProjectModal(key) {
  const data = PROJECT_DATA[key];
  if (!data) return;

  const demoBtn = data.demoUrl
    ? `<a href="${data.demoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Live Demo ↗</a>`
    : `<button class="btn btn-ghost btn-disabled" disabled title="Demo coming soon">Demo Coming Soon</button>`;

  const ghBtn = data.githubUrl
    ? `<a href="${data.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost">GitHub Repository ↗</a>`
    : '';

  const content = document.getElementById('project-modal-content');
  content.innerHTML = `
    <h2 id="pmodal-title">${data.title}</h2>
    <span class="modal-type ${data.type}">${data.typeLabel}</span>

    <div class="modal-section">
      <h3>The Problem</h3>
      <p>${data.problem}</p>
    </div>

    <div class="modal-section">
      <h3>The Solution</h3>
      <p>${data.solution}</p>
    </div>

    <div class="modal-section">
      <h3>Technology Used</h3>
      <div class="modal-tech-row">
        ${data.tech.map(t => `<span class="modal-tech">${t}</span>`).join('')}
      </div>
    </div>

    <div class="modal-section">
      <h3>Key Features</h3>
      <ul class="modal-list">
        ${data.features.map(f => `<li>${f}</li>`).join('')}
      </ul>
    </div>

    <div class="modal-section">
      <h3>Status</h3>
      <p style="font-size:.85rem;color:var(--cyan-light)">${data.status}</p>
    </div>

    <div class="modal-actions">
      ${demoBtn}
      ${ghBtn}
      <button class="btn btn-ghost" onclick="closeModal('project-modal')">Close</button>
    </div>
  `;

  showModal('project-modal');
}

/* ============================================================
   9. MODAL HELPERS
   ============================================================ */
function showModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  // Focus trap — focus the close button
  requestAnimationFrame(() => {
    overlay.querySelector('.modal-close')?.focus();
  });
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

function initModals() {
  // Close buttons
  document.getElementById('service-modal-close')?.addEventListener('click', () => closeModal('service-modal'));
  document.getElementById('project-modal-close')?.addEventListener('click', () => closeModal('project-modal'));

  // Click outside to close
  document.getElementById('service-modal')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal('service-modal');
  });
  document.getElementById('project-modal')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal('project-modal');
  });

  // Escape to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal('service-modal');
      closeModal('project-modal');
    }
  });
}

/* ============================================================
   10. REQUEST SERVICE — smart form prefill
   ============================================================ */
function requestService(serviceName) {
  // Close any open modal
  closeModal('service-modal');
  closeModal('project-modal');

  // Scroll to contact section
  const contact = document.getElementById('contact');
  if (contact) {
    const offset = 80;
    window.scrollTo({ top: contact.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  }

  // Prefill the service select after scroll animation completes
  setTimeout(() => {
    const select = document.getElementById('serviceRequired');
    if (!select) return;

    // Find and select the matching option
    const opts = Array.from(select.options);
    const match = opts.find(o => o.value === serviceName || o.value.toLowerCase().includes(serviceName.toLowerCase()));
    if (match) {
      select.value = match.value;
      // Dispatch change event so any listeners fire
      select.dispatchEvent(new Event('change', { bubbles: true }));
      // Highlight the field briefly
      select.classList.add('prefilled');
      select.style.borderColor = 'var(--cyan)';
      select.style.boxShadow = '0 0 0 3px rgba(6,182,212,.15)';
      setTimeout(() => {
        select.style.borderColor = '';
        select.style.boxShadow = '';
      }, 2500);
    }

    // Focus the fullName field to guide the user
    document.getElementById('fullName')?.focus();
  }, 700);
}

/* ============================================================
   11. CONTACT FORM — validation + Google Sheets
   ============================================================ */
function initContactForm() {
  const form       = document.getElementById('contact-form');
  const submitBtn  = document.getElementById('submit-btn');
  const btnText    = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const successMsg = document.getElementById('form-success');
  const errorMsg   = document.getElementById('form-error');
  const errorText  = document.getElementById('error-text');

  if (!form) return;

  let lastSubmission = null;
  let isSubmitting   = false;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (isSubmitting) return;

    hideMessage(successMsg);
    hideMessage(errorMsg);
    clearFieldErrors(form);

    const data   = collectFormData(form);
    const errors = validateForm(data);

    if (errors.length > 0) {
      showFieldErrors(form, errors);
      focusFirstError(form);
      return;
    }

    const key = `${data.email}|${data.projectDetails}`.toLowerCase().trim();
    if (lastSubmission === key) {
      showError(errorText, errorMsg, 'This enquiry has already been submitted. Please contact us directly if you need assistance.');
      return;
    }

    isSubmitting = true;
    setLoadingState(submitBtn, btnText, btnSpinner, true);

    try {
      await submitToGoogleSheets(data);
      lastSubmission = key;
      showMessage(successMsg);
      form.reset();
    } catch (err) {
      showError(errorText, errorMsg, getFriendlyError(err));
      console.error('[JadooTech Form]', err);
    } finally {
      isSubmitting = false;
      setLoadingState(submitBtn, btnText, btnSpinner, false);
    }
  });

  // Clear errors on input
  form.querySelectorAll('.form-input,.form-select,.form-textarea').forEach(f => {
    f.addEventListener('input',  () => clearFieldError(f));
    f.addEventListener('change', () => clearFieldError(f));
  });
}

function collectFormData(form) {
  const g = id => (document.getElementById(id)?.value || '').trim();
  return {
    fullName:        g('fullName'),
    companyName:     g('companyName'),
    email:           g('email'),
    phone:           g('phone'),
    serviceRequired: g('serviceRequired'),
    budget:          g('budget'),
    projectDetails:  g('projectDetails'),
  };
}

function validateForm(data) {
  const e = [];
  if (!data.fullName)                      e.push({ field:'fullName',        message:'Please enter your full name.' });
  else if (data.fullName.length < 2)       e.push({ field:'fullName',        message:'Name must be at least 2 characters.' });
  if (!data.email)                         e.push({ field:'email',           message:'Please enter your email address.' });
  else if (!isValidEmail(data.email))      e.push({ field:'email',           message:'Please enter a valid email address.' });
  if (!data.serviceRequired)               e.push({ field:'serviceRequired', message:'Please select a service.' });
  if (!data.projectDetails)                e.push({ field:'projectDetails',  message:'Please provide project details.' });
  else if (data.projectDetails.length < 10) e.push({ field:'projectDetails', message:'Please add a little more detail (at least 10 characters).' });
  return e;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldErrors(form, errors) {
  errors.forEach(({ field, message }) => {
    const input = document.getElementById(field);
    if (!input) return;
    input.classList.add('error');
    const err = document.createElement('span');
    err.className = 'field-error';
    err.textContent = message;
    err.setAttribute('role', 'alert');
    err.style.cssText = 'display:block;font-size:.73rem;color:#FCA5A5;margin-top:4px;font-weight:500';
    input.parentElement.appendChild(err);
  });
}

function clearFieldError(field) {
  field.classList.remove('error');
  field.parentElement.querySelectorAll('.field-error').forEach(el => el.remove());
}

function clearFieldErrors(form) {
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  form.querySelectorAll('.field-error').forEach(el => el.remove());
}

function focusFirstError(form) {
  const first = form.querySelector('.error');
  if (first) { first.focus(); first.scrollIntoView({ behavior:'smooth', block:'center' }); }
}

function setLoadingState(btn, btnText, btnSpinner, loading) {
  btn.disabled = loading;
  btnText.textContent = loading ? 'Sending...' : 'Send Enquiry';
  loading ? btnSpinner.removeAttribute('hidden') : btnSpinner.setAttribute('hidden','');
  loading ? btnSpinner.removeAttribute('aria-hidden') : btnSpinner.setAttribute('aria-hidden','true');
}

function showMessage(el) {
  el.removeAttribute('hidden');
  el.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function hideMessage(el) {
  el.setAttribute('hidden','');
}

function showError(textEl, msgEl, msg) {
  if (textEl) textEl.innerHTML = msg;
  showMessage(msgEl);
  msgEl.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function getFriendlyError(err) {
  if (err.name === 'AbortError' || err.message?.includes('timeout'))
    return 'The request timed out. Please check your connection and try again.';
  if (!navigator.onLine)
    return 'You appear to be offline. Please check your internet connection and try again.';
  if (err.message === 'SCRIPT_URL_NOT_SET')
    return 'The form is not yet configured. Please contact us directly at <a href="mailto:jadootechenterprises@gmail.com">jadootechenterprises@gmail.com</a>.';
  return 'Something went wrong while submitting your enquiry. Please try again or contact us directly at <a href="mailto:jadootechenterprises@gmail.com">jadootechenterprises@gmail.com</a>.';
}

async function submitToGoogleSheets(data) {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL' || !GOOGLE_SCRIPT_URL.trim())
    throw new Error('SCRIPT_URL_NOT_SET');

  // Google Apps Script requires no-cors mode when called from a browser.
  // We use fetch with mode:'no-cors' — this means we cannot read the response,
  // but the data IS sent and received by the script correctly.
  // We wait 3s and treat no network error = success.
  const payload = new URLSearchParams({
    fullName:        data.fullName,
    companyName:     data.companyName    || '',
    email:           data.email,
    phone:           data.phone          || '',
    serviceRequired: data.serviceRequired,
    budget:          data.budget         || '',
    projectDetails:  data.projectDetails,
    source:          'Website',
  });

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 12000);

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method:  'POST',
      mode:    'no-cors',   // Required for Google Apps Script from browser
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    payload.toString(),
      signal:  controller.signal,
    });
    // no-cors means response is opaque — we cannot read it.
    // If fetch did not throw, the request reached Google's servers.
    return { status: 'success' };
  } finally {
    clearTimeout(timeoutId);
  }
}

/* ============================================================
   INITIAL ACTIVE LINK (on hash in URL)
   ============================================================ */
(function() {
  const hash = window.location.hash;
  if (!hash) return;
  const link = document.querySelector(`.nav-link[href="${hash}"]`);
  if (link) link.classList.add('active');
})();
