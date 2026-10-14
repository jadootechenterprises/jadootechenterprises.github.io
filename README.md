# JadooTech Enterprises — Website

**Live:** https://jadootechenterprises.github.io/  
**Admin:** https://jadootechenterprises.github.io/admin/  
**Stack:** HTML5, CSS3, Vanilla JS — GitHub Pages (zero backend)

---

## Admin Panel — Setup & Login

### One-time: create a GitHub Personal Access Token

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. Click **Generate new token**
3. Set:
   - **Token name:** JadooTech Admin
   - **Expiration:** 90 days (recommended)
   - **Repository access:** Only select repositories → `jadootechenterprises.github.io`
   - **Permissions → Contents:** Read and Write
4. Click **Generate token** and copy it immediately (shown only once)

### Login

1. Go to **https://jadootechenterprises.github.io/admin/**
2. Paste your GitHub token into the "Personal Access Token" field
3. Click **Sign In with Token**

The token is stored only in your browser's `sessionStorage`. It is never saved to disk, never committed, never sent anywhere except `api.github.com`. It disappears when you close the tab. Auto-logout happens after 30 minutes of inactivity.

### Dev login (localhost only)

For local testing without a real token, use **Dev Login** tab:
- Username: `admin`  
- Password: `admin`

This only works on `localhost` and does not have GitHub API access (read-only UI preview).

---

## Security notes

- **The admin URL is not secret.** Real protection comes from the GitHub token.
- Use a **fine-grained token** limited to this one repository only.
- Set a **90-day expiry** and revoke immediately if a device is lost.
- The admin panel has `noindex,nofollow` meta tags and is excluded from `robots.txt` and `sitemap.xml`.
- All user-entered text is sanitised before rendering (no raw HTML injection).
- Token is never logged or echoed.

---

## Editing content

**All content lives in `/data/*.json`.** You do not need to touch `index.html` for routine updates. Use the Admin Panel or edit the JSON files directly.

| File | Controls |
|---|---|
| `data/site.json`     | Brand name, logo, phone, email, WhatsApp, social links, SEO title/description, footer text, form endpoint |
| `data/home.json`     | Hero headline, subtext, CTA buttons, service tags, metrics card |
| `data/services.json` | All 10 services — title, description, tech tags, visible/hidden, order |
| `data/projects.json` | All 3 projects — problem, solution, result, tech, links, featured flag |
| `data/about.json`    | About heading, paragraphs, card tagline |
| `data/process.json`  | 5 process steps, real example quote and result |
| `data/tools.json`    | Tech stack chips |
| `data/settings.json` | Accent colour, heading font, light/dark default, section visibility |

---

## Admin Panel features

- **Dashboard** — last commit time, quick links, view live site
- **Site Settings** — brand, contact, social, SEO, footer, form endpoint
- **Hero** — all text, CTA buttons, service tags, metrics
- **Services** — add/edit/delete/reorder, show/hide toggle, tech tags, includes list
- **Projects** — add/edit/delete/reorder, featured flag, show/hide
- **About, Process, Tools** — edit all text
- **Theme** — accent colour picker, heading font, dark/light default
- **Section Visibility** — toggle entire sections on/off
- **Media Library** — upload images (auto-converted to WebP, max 1600px), delete, copy path
- **Version History** — view last 20 commits per file, one-click restore

---

## Deployment

```bash
git add .
git commit -m "Your message"
git push origin main
```

GitHub Pages builds automatically. Changes go live in ~1–2 minutes.

---

## Running Lighthouse

```bash
# CLI
npm install -g lighthouse
lighthouse https://jadootechenterprises.github.io/ --view
```

Or: Chrome DevTools → Lighthouse tab → Analyse page load.

---

## Contact form

The form posts to Google Apps Script. Enquiries are saved to your [Google Sheet](https://docs.google.com/spreadsheets/d/1Jv7NJhN-TXhAnxDjzscMLJDAUshOR14PsYfok8f7WrI/edit). You can change the form endpoint URL from the Admin Panel → Site Settings.

---

## Contact

- **Email:** jadootechenterprises@gmail.com  
- **Phone:** +91 76686 90613  
- **GitHub:** https://github.com/jadootechenterprises

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
