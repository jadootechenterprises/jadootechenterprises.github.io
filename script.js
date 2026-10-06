/* ============================================================
   JADOOTECH ENTERPRISES — script.js
   Vanilla JavaScript — no dependencies required
   ============================================================ */

'use strict';

/* ============================================================
   CONFIGURATION
   Replace GOOGLE_SCRIPT_URL with your deployed Apps Script URL.
   This is the ONLY value you need to change after deploying
   Google Apps Script.
   ============================================================ */
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';

/* ============================================================
   DOM READY — initialise everything
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
  initActiveNavLink();
  initBackToTop();
  initContactForm();
  initTypingAnimation();
});

/* ============================================================
   1. NAVBAR — scroll behaviour + compact on scroll
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;
  let ticking = false;

  function updateNavbar() {
    const currentScroll = window.scrollY;

    // Add/remove scrolled class for glass intensification
    if (currentScroll > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  // Run once on load in case page is already scrolled
  updateNavbar();
}

/* ============================================================
   2. MOBILE MENU — hamburger toggle
   ============================================================ */
function initMobileMenu() {
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');

  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  }

  hamburger.addEventListener('click', toggleMenu);

  // Close when a link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    const navbar = document.getElementById('navbar');
    if (navbar && !navbar.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Close menu on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) closeMenu();
  }, { passive: true });
}

/* ============================================================
   3. SMOOTH SCROLL — for all anchor links
   ============================================================ */
function initSmoothScroll() {
  const OFFSET = 80; // navbar height + padding

  document.addEventListener('click', (e) => {
    const target = e.target.closest('a[href^="#"]');
    if (!target) return;

    const id = target.getAttribute('href');
    if (!id || id === '#') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const section = document.querySelector(id);
    if (!section) return;

    e.preventDefault();

    const top = section.getBoundingClientRect().top + window.scrollY - OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  });
}

/* ============================================================
   4. ACTIVE NAV LINK — highlight current section
   ============================================================ */
function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const OFFSET = 120;

  function setActive() {
    const scrollY = window.scrollY;
    let currentId = '';

    sections.forEach(section => {
      const top    = section.offsetTop - OFFSET;
      const bottom = top + section.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        setActive();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  setActive();
}

/* ============================================================
   5. SCROLL REVEAL — fade-in elements on scroll
   ============================================================ */
function initScrollReveal() {
  // Elements to animate
  const targets = [
    '.value-card',
    '.service-card',
    '.why-card',
    '.portfolio-card',
    '.process-step',
    '.section-header',
    '.about-content',
    '.about-visual',
    '.contact-info',
    '.contact-form-wrap',
    '.hero-content',
    '.hero-visual',
    '.cta-content',
  ];

  const elements = document.querySelectorAll(targets.join(','));

  // Apply reveal class
  elements.forEach((el, index) => {
    el.classList.add('reveal');

    // Stagger grid children
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.querySelectorAll(':scope > .reveal'));
      const position = siblings.indexOf(el);
      if (position > 0 && position <= 3) {
        el.classList.add(`reveal-delay-${position}`);
      }
    }
  });

  // IntersectionObserver for scroll reveal
  if (!('IntersectionObserver' in window)) {
    // Fallback: show all immediately
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ============================================================
   6. BACK TO TOP button
   ============================================================ */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 400) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   7. HERO TYPING ANIMATION (optional subtle effect)
   ============================================================ */
function initTypingAnimation() {
  const headline = document.querySelector('.hero-headline');
  if (!headline) return;

  // Add a subtle cursor blink to "Grow." using a CSS trick
  // This is lightweight — no text rewriting, no layout shift
  const words = headline.querySelectorAll('br');
  // Nothing heavy — just let the CSS animation on .badge-dot do the work
}

/* ============================================================
   8. CONTACT FORM — validation + Google Sheets submission
   ============================================================ */
function initContactForm() {
  const form        = document.getElementById('contact-form');
  const submitBtn   = document.getElementById('submit-btn');
  const btnText     = document.getElementById('btn-text');
  const btnSpinner  = document.getElementById('btn-spinner');
  const successMsg  = document.getElementById('form-success');
  const errorMsg    = document.getElementById('form-error');
  const errorText   = document.getElementById('error-text');

  if (!form) return;

  // Track last submission to prevent duplicates
  let lastSubmission = null;
  let isSubmitting   = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;

    // Clear previous messages
    hideMessage(successMsg);
    hideMessage(errorMsg);
    clearFieldErrors(form);

    // Collect data
    const data = collectFormData(form);

    // --- CLIENT-SIDE VALIDATION ---
    const errors = validateForm(data);
    if (errors.length > 0) {
      showFieldErrors(form, errors);
      focusFirstError(form);
      return;
    }

    // --- DUPLICATE CHECK ---
    const submissionKey = `${data.email}|${data.projectDetails}`.toLowerCase().trim();
    if (lastSubmission === submissionKey) {
      showError(errorText, errorMsg, 'This enquiry has already been submitted. Please check your inbox or contact us directly.');
      return;
    }

    // --- SUBMIT ---
    isSubmitting = true;
    setLoadingState(submitBtn, btnText, btnSpinner, true);

    try {
      await submitToGoogleSheets(data);

      // Success
      lastSubmission = submissionKey;
      showMessage(successMsg);
      form.reset();

    } catch (err) {
      const friendlyMsg = getFriendlyError(err);
      showError(errorText, errorMsg, friendlyMsg);
      console.error('[JadooTech Form] Submission error:', err);

    } finally {
      isSubmitting = false;
      setLoadingState(submitBtn, btnText, btnSpinner, false);
    }
  });

  // Real-time validation — clear error on input
  form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.classList.remove('error');
      const label = form.querySelector(`label[for="${field.id}"]`);
      if (label) {
        const existingError = label.parentElement.querySelector('.field-error');
        if (existingError) existingError.remove();
      }
    });

    field.addEventListener('change', () => {
      field.classList.remove('error');
    });
  });
}

/* -------- Collect form data -------- */
function collectFormData(form) {
  const get = (id) => (document.getElementById(id)?.value || '').trim();
  return {
    fullName       : get('fullName'),
    companyName    : get('companyName'),
    email          : get('email'),
    phone          : get('phone'),
    serviceRequired: get('serviceRequired'),
    budget         : get('budget'),
    projectDetails : get('projectDetails'),
  };
}

/* -------- Validate form -------- */
function validateForm(data) {
  const errors = [];

  if (!data.fullName) {
    errors.push({ field: 'fullName', message: 'Please enter your full name.' });
  } else if (data.fullName.length < 2) {
    errors.push({ field: 'fullName', message: 'Name must be at least 2 characters.' });
  }

  if (!data.email) {
    errors.push({ field: 'email', message: 'Please enter your email address.' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address.' });
  }

  if (!data.serviceRequired) {
    errors.push({ field: 'serviceRequired', message: 'Please select a service.' });
  }

  if (!data.projectDetails) {
    errors.push({ field: 'projectDetails', message: 'Please provide project details.' });
  } else if (data.projectDetails.length < 10) {
    errors.push({ field: 'projectDetails', message: 'Please provide a bit more detail (at least 10 characters).' });
  }

  return errors;
}

/* -------- Email validation -------- */
function isValidEmail(email) {
  // RFC 5322 simplified — reliable for client-side
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* -------- Show field-level errors -------- */
function showFieldErrors(form, errors) {
  errors.forEach(({ field, message }) => {
    const input = document.getElementById(field);
    if (!input) return;

    input.classList.add('error');

    // Create error message element
    const errorEl = document.createElement('span');
    errorEl.className = 'field-error';
    errorEl.textContent = message;
    errorEl.style.cssText = `
      display: block;
      font-size: 0.75rem;
      color: #FCA5A5;
      margin-top: 4px;
      font-weight: 500;
    `;
    errorEl.setAttribute('role', 'alert');

    // Insert after input
    input.parentElement.appendChild(errorEl);
  });
}

/* -------- Clear all field errors -------- */
function clearFieldErrors(form) {
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  form.querySelectorAll('.field-error').forEach(el => el.remove());
}

/* -------- Focus first errored field -------- */
function focusFirstError(form) {
  const firstError = form.querySelector('.error');
  if (firstError) {
    firstError.focus();
    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/* -------- Loading state -------- */
function setLoadingState(btn, btnText, btnSpinner, isLoading) {
  btn.disabled = isLoading;
  btnText.textContent = isLoading ? 'Sending...' : 'Send Enquiry';

  if (isLoading) {
    btnSpinner.removeAttribute('hidden');
    btnSpinner.removeAttribute('aria-hidden');
  } else {
    btnSpinner.setAttribute('hidden', '');
    btnSpinner.setAttribute('aria-hidden', 'true');
  }
}

/* -------- Show success message -------- */
function showMessage(element) {
  element.removeAttribute('hidden');
  element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* -------- Hide message -------- */
function hideMessage(element) {
  element.setAttribute('hidden', '');
}

/* -------- Show error with custom text -------- */
function showError(errorTextEl, errorMsgEl, message) {
  if (errorTextEl) {
    errorTextEl.innerHTML = message;
  }
  showMessage(errorMsgEl);
  errorMsgEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* -------- Get friendly error message -------- */
function getFriendlyError(err) {
  if (err.name === 'AbortError' || err.message?.includes('timeout')) {
    return 'The request timed out. Please check your connection and try again.';
  }
  if (!navigator.onLine) {
    return 'You appear to be offline. Please check your internet connection and try again.';
  }
  if (err.message === 'SCRIPT_URL_NOT_SET') {
    return 'The form is not yet configured. Please contact us directly at <a href="mailto:jadootechenterprises@gmail.com">jadootechenterprises@gmail.com</a>.';
  }
  return 'Something went wrong while submitting your enquiry. Please try again or contact us directly at <a href="mailto:jadootechenterprises@gmail.com">jadootechenterprises@gmail.com</a>.';
}

/* -------- Submit to Google Sheets via Apps Script -------- */
async function submitToGoogleSheets(data) {
  // Guard: check URL is configured
  if (
    !GOOGLE_SCRIPT_URL ||
    GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL' ||
    GOOGLE_SCRIPT_URL.trim() === ''
  ) {
    throw new Error('SCRIPT_URL_NOT_SET');
  }

  // Build URLSearchParams payload
  // Google Apps Script handles application/x-www-form-urlencoded via e.parameter
  const payload = new URLSearchParams({
    fullName       : data.fullName,
    companyName    : data.companyName    || '',
    email          : data.email,
    phone          : data.phone          || '',
    serviceRequired: data.serviceRequired,
    budget         : data.budget         || '',
    projectDetails : data.projectDetails,
    source         : 'Website',
  });

  // AbortController for timeout (10 seconds)
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 10000);

  let response;
  try {
    response = await fetch(GOOGLE_SCRIPT_URL, {
      method : 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body   : payload.toString(),
      signal : controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  // Parse response
  let result;
  try {
    const text = await response.text();
    result = JSON.parse(text);
  } catch {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    // If response is ok but not parseable JSON, treat as success
    return;
  }

  // Check Apps Script response
  if (result.status === 'error') {
    throw new Error(result.message || 'Server error');
  }

  // result.status === 'success' (or any non-error response) → done
  return result;
}

/* ============================================================
   9. UTILITY — Debounce (used internally if needed)
   ============================================================ */
function debounce(fn, wait) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/* ============================================================
   10. NAVBAR ACTIVE LINK on page load (hash in URL)
   ============================================================ */
(function setInitialActiveLink() {
  const hash = window.location.hash;
  if (!hash) return;
  const link = document.querySelector(`.nav-link[href="${hash}"]`);
  if (link) link.classList.add('active');
})();
