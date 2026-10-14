# Changelog — JadooTech Enterprises Website

## v6 — Admin Panel + CMS JSON architecture (2026-10-07)

### Added

| What | Why |
|---|---|
| `/admin/index.html` | Full admin panel — login, dashboard, all section editors |
| `/admin/admin.js`   | ~600 lines: GitHub API auth, CRUD for all data files, media upload, version history |
| `/admin/admin.css`  | Clean, mobile-friendly admin UI |
| `/admin/config.json`| Owner/repo/branch config (not the token) |
| `data/site.json`    | Brand, SEO, contact details, social links, footer, form endpoint |
| `data/home.json`    | Hero kicker, headline, accent word, subtext, CTAs, tags, metrics |
| `data/services.json`| All 10 services with visible/order flags |
| `data/projects.json`| All 3 projects with featured/visible flags |
| `data/about.json`   | Heading, paragraphs, CTA, card tagline |
| `data/process.json` | 5 steps, heading, real example quote/result |
| `data/tools.json`   | 14 tech items |
| `data/settings.json`| Accent/navy/bg colors, font, default theme, section visibility |
| `assets/img/`       | Directory for media library uploads |

### Changed

| What | Why |
|---|---|
| `index.html` | Fully refactored to read from JSON — no hard-coded content except fallback defaults |
| `assets/js/main.js` | Refactored: fetches all 8 JSON files, renders everything dynamically; preserves all existing UI modules (theme, nav, reveal, modals, form) |
| `robots.txt` | Added `Disallow: /admin/` to prevent search engine indexing of admin panel |

### Security notes

- GitHub PAT stored only in `sessionStorage` — cleared on tab close or logout
- Auto-logout after 30 minutes of idle activity
- Admin panel has `noindex,nofollow` meta tag and strict `Content-Security-Policy`
- Dev login (`admin/admin`) only works on `localhost` — does not have GitHub API access
- All user-entered text sanitised before rendering (no raw innerHTML from input)
- Token never logged, never committed, only sent to `api.github.com`

---

## v5 — Reference-matched redesign (2026-10-07)

Ivory/navy/blue palette, Playfair Display, service rows, metrics card, dark mode.

## v4 — Editorial redesign (2026-10-07)

Warm off-white, Fraunces, content.json, modular JS.

## v3 — Responsive fixes (2026-10-07)

Mobile menu fixed, ci-value overflow, code card clipping.

## v2 — CSS logo + modals (2026-10-07)

CSS/SVG logo, service/project modals, smart form prefill.

## v1 — Initial launch (2026-10-06)

Static site, Google Apps Script lead capture.
