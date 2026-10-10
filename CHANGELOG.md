# Changelog — JadooTech Enterprises Website

All notable changes are documented here. Format: **What changed**, **Why**.

---

## v4 — Full redesign (2026-10-07)

### REMOVED — AI-generated tells

| What was removed | Why |
|---|---|
| All-caps eyebrow labels (`WHAT WE BUILD`, `NO SURPRISES`, `OUR STACK`, etc.) on every section | Made every section header look identical and template-generated |
| Em dashes in body copy | Overused; replaced with commas or full stops |
| Filler slogans: "not vague promises", "not whatever's trendy", "turning hours into minutes" | No concrete information; sounds like generated marketing copy |
| 3-column equal card grid for Services | Twelve identical rounded cards look AI-assembled; replaced with a numbered list layout |
| 3-column equal card grid for Deliverables | Merged into the service detail panel where it belongs |
| Identical tinted line-icon on every service card | Icons added no meaning, just visual noise |
| 6 portfolio cards with placeholder wireframe thumbnails | 3 cards (BMS, AI Dashboard, Automation Dashboard) had no real content; removed rather than faking them |
| "DEMO PROJECT" / "CONCEPT PROJECT" badge labels on portfolio cards | Called out the fakeness explicitly |
| Floating emoji badges on hero ("⚡ Fast Delivery", "🤖 AI Powered", "🔗 API Ready") | Decorative AI-template element |
| Glowing hero orbs (`.hero-orb-1`, `.hero-orb-2`) | Common AI-SaaS visual cliché |
| Continuous `heroFloat` bob animation on code card | Made the interface feel like a demo template |
| Duplicate logo in the contact section sidebar | No purpose, just padding |
| Hardcoded footer year `2026` | Will go stale; replaced with JS `new Date().getFullYear()` |
| Inter + Space Grotesk as primary fonts | Default pairing used on thousands of AI-generated sites |
| `rgba` gradient on every button, heading and section heading | Identical blue-to-purple gradients everywhere created a SaaS-template feel |
| `section-tag` pill labels on every section | Same pill repeated 8 times looked templated |
| Excessive `box-shadow` and `border-radius` on every element | Overpolished; softened to purposeful shadows only |
| Generic `placeholder="+91 XXXXX XXXXX"` in phone field | Placeholder, not real copy |

---

### ADDED

| What was added | Why |
|---|---|
| `/data/content.json` | Single source of truth for services, projects and tech list. Edit content without touching HTML |
| `/assets/css/main.css` | New file: editorial design system with warm off-white light mode + true dark mode |
| `/assets/js/main.js` | New file: modular vanilla JS replacing the monolithic `script.js` |
| `data-theme` attribute on `<html>` | Enables CSS-only theme switching without flash |
| `prefers-color-scheme` media query in CSS | Dark mode works even before JS loads |
| Light/dark manual toggle in navbar | Users can override system preference; choice persists via `localStorage` |
| Skip-to-content link | Accessibility: keyboard users can bypass the navbar |
| `aria-labelledby` on every `<section>` | Screen readers announce each section correctly |
| One `<h1>` only | Correct heading hierarchy; was missing before |
| JSON-LD `ProfessionalService` schema in `<head>` | Structured data for search engines |
| Spam honeypot field on contact form | Hidden from real users; bots fill it; submission is silently discarded |
| WhatsApp direct-message fallback link in contact section | Immediate alternative if form fails |
| Services expandable row layout | Click a service row to expand its full detail panel inline, without a modal |
| Projects as stacked featured/small articles | Varied layout; first project is visually dominant |
| Problem / Solution / Result format on project cards | Forces honest, specific project descriptions |
| `Fraunces` display font (Google Fonts, single weight load) | Distinctive editorial serif; breaks from default sans-serif SaaS look |
| `system-ui` body font stack | Fast, native, no font file for body text |
| `Reveal.observeNew()` called after content.json renders | Scroll animations work on dynamically injected DOM nodes |
| `window.requestService()` global | Allows dynamically-injected service rows to call form prefill |
| WCAG AA contrast on all text tokens | `--ink-2` on `--bg` = 7.2:1; `--ink-3` on `--bg` = 4.6:1 |
| `prefers-reduced-motion` media query | Disables all animations for users who need it |
| Print stylesheet | Hides navbar, back-to-top and hero visual when printing |
| `robots.txt` updated to disallow `/data/` | Prevents indexing of the raw JSON file |
| `CHANGELOG.md` (this file) | Documents every decision |
| `README.md` updated | How to edit content, deploy and run Lighthouse |

---

### CHANGED

| What changed | Why |
|---|---|
| `index.html` now references `/assets/css/main.css` and `/assets/js/main.js` | New file paths |
| `style.css` and `script.js` in root are now unused but left for reference | Delete them when confirmed stable |
| Mobile menu now uses `display:none` / `.open { display:flex }` | Previous `max-height: 0` trick caused the menu to appear without clicking |
| Process section: 5-step list on right, sticky real-world example on left | More editorial; avoids the "5 numbered circles in a row" cliché |
| About section: plain text + tech tags; no glowing card wrapper | Removed the decorative `about-card-wrap::before` glow |
| Contact form placeholder text rewritten | Removed "+91 XXXXX XXXXX" placeholder |
| Project cards: removed status labels | Labels like "Demo Project" / "Concept Project" undermined credibility |
| Footer: 3 social icons only (GitHub, LinkedIn, Instagram) | Removed placeholder Facebook link that had no real URL |

---

## v3 — Responsive fix (2026-10-07)

- Fixed mobile menu showing without click (was `display:flex` in media query, not in `.open`)
- Fixed email address overflow on narrow screens (`white-space: normal; word-break: break-all`)
- Fixed hero code card horizontal scroll (`overflow:hidden` on `.hc-body`)
- Added 360px breakpoint

## v2 — Visual direction (2026-10-07)

- Replaced PNG logo with pure CSS/SVG logo
- Replaced `mix-blend-mode: lighten` approach with inline SVG
- Added service modals and project modals
- Added content.json concept (first pass)

## v1 — Initial launch (2026-10-06)

- Static site on GitHub Pages
- Google Apps Script → Google Sheets lead capture
- 10 services, 6 portfolio cards, contact form
