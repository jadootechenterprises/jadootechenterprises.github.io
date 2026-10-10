# JadooTech Enterprises — Website

**Live:** https://jadootechenterprises.github.io/  
**Stack:** HTML5, CSS3, Vanilla JS — hosted on GitHub Pages (zero backend)

---

## Project structure

```
/
├── index.html                  Main page
├── assets/
│   ├── css/main.css            All styles (design tokens → components → responsive)
│   ├── js/main.js              All JavaScript (theme, nav, content, form, modals)
│   └── logo/jadootech-logo.png Logo PNG (used as favicon only)
├── data/
│   └── content.json            ← Edit services, projects and tech here
├── google-apps-script/
│   └── Code.gs                 Google Apps Script for form → Google Sheets
├── robots.txt
├── sitemap.xml
├── CHANGELOG.md
└── README.md
```

---

## Editing content

**All editable content lives in `data/content.json`.** You do not need to touch `index.html` for routine updates.

### Add or edit a service

Open `data/content.json` and find the `"services"` array. Each service object:

```json
{
  "id": "website-development",
  "title": "Website Development",
  "summary": "One-line description shown in the list.",
  "detail": "Longer paragraph shown in the expanded row.",
  "includes": ["Item 1", "Item 2", "Item 3"],
  "tech": ["HTML5", "CSS3", "JavaScript"],
  "cta": "Website Development"
}
```

- `"cta"` must match an `<option value="">` in the contact form select.
- `"id"` must be unique and URL-safe (lowercase, hyphens).

### Add or edit a project

Find the `"projects"` array. Each project object:

```json
{
  "id": "my-project",
  "title": "Project Title",
  "problem": "What problem the client had.",
  "solution": "What we built to solve it.",
  "result": "What happened after — specific, honest.",
  "tech": ["Python", "REST APIs"],
  "demoUrl": "https://example.com",
  "githubUrl": "https://github.com/example",
  "terminalLines": [
    { "type": "prompt",  "text": "$ python run.py" },
    { "type": "out",     "text": "Processing..." },
    { "type": "success", "text": "Done" }
  ]
}
```

- Set `"demoUrl"` or `"githubUrl"` to `null` if not available. A disabled button will render instead.
- `terminalLines` types: `"prompt"`, `"out"`, `"success"`, `"kw"`.
- The **first** project in the array renders as the featured (large) card. The rest render smaller.

### Edit the tech stack

Find `"tech"` array at the bottom of `content.json`. It is a simple string array.

---

## Contact form setup

The form posts to Google Apps Script via `fetch` with `mode: 'no-cors'`.

1. Open `assets/js/main.js` and find `CONFIG.GOOGLE_SCRIPT_URL`.
2. Replace the value with your deployed Apps Script Web App URL.

Full Apps Script setup instructions are in `google-apps-script/Code.gs`.

**To test the form locally**, open `index.html` via a local server (not `file://`) so the `data/content.json` fetch works:

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .
```

Then visit `http://localhost:8080`.

---

## Light / dark mode

- Default follows `prefers-color-scheme`.
- User can toggle manually with the moon/sun button in the navbar.
- Choice persists in `localStorage` under key `jt-theme`.
- To change the colour tokens, edit `:root` and `[data-theme="dark"]` in `assets/css/main.css`.

---

## Deployment

Push to the `main` branch of the `jadootechenterprises/jadootechenterprises.github.io` repository.

```bash
git add .
git commit -m "Your message"
git push origin main
```

GitHub Pages serves the site automatically. No build step needed.

---

## Running Lighthouse

**Chrome DevTools (easiest):**  
Open Chrome → `https://jadootechenterprises.github.io/` → DevTools → Lighthouse tab → Analyse page load.

**CLI:**

```bash
npm install -g lighthouse
lighthouse https://jadootechenterprises.github.io/ --view
```

Target scores: Performance 95+, Accessibility 95+, Best Practices 95+, SEO 95+.

**Common fixes if scores drop:**
- Performance: ensure images have `width`/`height` attributes and `loading="lazy"`.
- Accessibility: every interactive element needs an `aria-label` or visible text label.
- SEO: keep `<title>` under 60 characters, `<meta name="description">` under 160.

---

## Design tokens

All visual decisions are CSS custom properties in `assets/css/main.css` under `:root`.
To change brand colour, update `--accent`. To change background, update `--bg` and `--bg-2`.

Dark mode overrides live in `[data-theme="dark"]` immediately below `:root`.

---

## Contact

- **Email:** jadootechenterprises@gmail.com  
- **Phone:** +91 76686 90613  
- **GitHub:** https://github.com/jadootechenterprises
