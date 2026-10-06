# JadooTech Enterprises — Website

**Technology Solutions for Modern Businesses**

Live site: [https://jadootechenterprises.github.io/](https://jadootechenterprises.github.io/)

---

## Project Structure

```
/
├── index.html                  ← Main website (single page)
├── style.css                   ← All styles
├── script.js                   ← All JavaScript + form logic
├── README.md                   ← This file
├── robots.txt                  ← SEO crawler rules
├── sitemap.xml                 ← SEO sitemap
├── assets/
│   ├── logo/
│   │   └── jadootech-logo.png  ← Official company logo
│   ├── images/                 ← Project screenshots / images
│   └── icons/                  ← Additional icons if needed
└── google-apps-script/
    └── Code.gs                 ← Google Apps Script for lead capture
```

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | HTML5, CSS3, Vanilla JavaScript     |
| Hosting    | GitHub Pages (free, static)         |
| Lead DB    | Google Sheets via Google Apps Script|
| No backend | No server, no database, no PHP      |

---

## Lead Capture Flow

```
Visitor
  → GitHub Pages Website
  → Contact Form (script.js)
  → Google Apps Script Web App (Code.gs)
  → Private Google Sheet (Leads tab)
  → New Lead Row Added
```

---

## Setup Instructions

### Step 1 — Add the Logo

Copy your logo file to:

```
assets/logo/jadootech-logo.png
```

The logo is already referenced throughout the site. Keep the filename exactly as shown.

---

### Step 2 — Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet.
2. Name the spreadsheet something like **JadooTech Leads**.
3. Rename the default tab (Sheet1) to exactly: **Leads**
4. Add these headers in row 1 (columns A through J):

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Timestamp | Full Name | Company Name | Email | Phone | Service Required | Budget | Project Details | Source | Status |

> **Note:** The Apps Script will create and format these headers automatically if the sheet is empty when the first enquiry arrives. You can skip the manual step above if you prefer.

5. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```

---

### Step 3 — Set Up Google Apps Script

1. With your Google Sheet open, go to **Extensions → Apps Script**.
2. Delete any existing code in the editor.
3. Open the file `google-apps-script/Code.gs` from this project.
4. Copy and paste the entire contents into the Apps Script editor.
5. In the script, find this line near the top:
   ```javascript
   var SPREADSHEET_ID = 'YOUR_GOOGLE_SPREADSHEET_ID';
   ```
6. Replace `YOUR_GOOGLE_SPREADSHEET_ID` with your actual Spreadsheet ID from Step 2.
7. Click **Save** (Ctrl+S / Cmd+S).

---

### Step 4 — Test the Script (Optional but Recommended)

1. In the Apps Script editor, select the function **testSubmit** from the dropdown.
2. Click **Run**.
3. Approve any permissions it asks for (Google will ask to allow the script to access your Sheet).
4. Open your Google Sheet and verify a test row was added to the **Leads** tab.
5. Delete the test row from the Sheet when done.

---

### Step 5 — Deploy Apps Script as a Web App

1. In the Apps Script editor, click **Deploy → New deployment**.
2. Click the gear icon ⚙️ next to **Select type** and choose **Web app**.
3. Fill in the settings:
   - **Description:** JadooTech Lead Capture v1
   - **Execute as:** Me *(your Google account)*
   - **Who has access:** **Anyone** *(this allows the website form to submit without login)*
4. Click **Deploy**.
5. Google will ask you to authorise the script — click through the permissions.
6. After deployment, you will see a **Web App URL** like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```
7. **Copy this URL** — you will need it in the next step.

> **Important:** Every time you modify Code.gs, you must create a **New deployment** (not update an existing one) to apply the changes.

---

### Step 6 — Add the Web App URL to the Website

1. Open `script.js` in a text editor.
2. Find this line near the top:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
   ```
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL` with the URL you copied in Step 5:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
   ```
4. Save `script.js`.

---

### Step 7 — Push to GitHub

1. Create a new repository named exactly:
   ```
   jadootechenterprises.github.io
   ```
2. Push all files to the **main** branch:
   ```bash
   git init
   git add .
   git commit -m "Initial website launch"
   git remote add origin https://github.com/jadootechenterprises/jadootechenterprises.github.io.git
   git push -u origin main
   ```

---

### Step 8 — Enable GitHub Pages

1. Go to your repository on GitHub.
2. Click **Settings → Pages**.
3. Under **Source**, select **Deploy from a branch**.
4. Select branch: **main**, folder: **/ (root)**.
5. Click **Save**.
6. Wait 1–2 minutes for the site to build.
7. Your site will be live at: **https://jadootechenterprises.github.io/**

---

### Step 9 — Submit a Test Enquiry

1. Open [https://jadootechenterprises.github.io/](https://jadootechenterprises.github.io/).
2. Scroll to the **Contact** section.
3. Fill in the enquiry form with test details.
4. Click **Send Enquiry**.
5. You should see: *"Thank you for contacting JadooTech Enterprises. Your enquiry has been received."*
6. Open your Google Sheet → **Leads** tab.
7. Verify the new row appears with all fields filled in correctly.

---

## Lead Management in Google Sheets

The **Leads** tab acts as a simple CRM. You can manually update the **Status** column for each lead:

| Status Value    | Meaning                        |
|-----------------|--------------------------------|
| New             | Fresh enquiry, not yet reviewed|
| Contacted       | You have reached out            |
| In Discussion   | Active conversation in progress|
| Proposal Sent   | Quote/proposal sent to client  |
| Won             | Project confirmed               |
| Lost            | Did not proceed                 |

The **Source** column will always read **Website** for enquiries submitted through the contact form.

---

## Customisation Guide

### Update Contact Details
Edit `index.html` — search for `7668690613` or `jadootechenterprises@gmail.com`.

### Update Portfolio Projects
In `index.html`, find the `.portfolio-grid` section. Each `.portfolio-card` contains:
- A placeholder icon (replace with a real `<img>` tag)
- Project title (`.pc-title`)
- Description (`.pc-desc`)
- Tech tags (`.pc-tag`)

### Add a Real Project Image
Replace the `.pc-image-placeholder` div inside any `.portfolio-card` with:
```html
<img src="assets/images/your-project.jpg" alt="Project description" loading="lazy" />
```

### Update Social Media Links
In `index.html`, find the `.footer-socials` section and replace the placeholder `href` values with your actual profile URLs.

### Change Colours
All brand colours are defined as CSS variables at the top of `style.css` under `:root`. Change `--color-blue`, `--color-purple`, or `--color-cyan` to update the entire colour palette.

### Update Budget Options
In `index.html`, find the `<select id="budget">` element and edit the `<option>` values.

---

## Security Notes

- The Google Sheet is **private** and never exposed in the frontend code.
- The Apps Script Web App URL does not reveal your Sheet ID or credentials.
- No API keys, passwords, or tokens are committed to GitHub.
- The Apps Script sanitises all input before writing to the Sheet.
- Field length is capped at 2000 characters server-side.

---

## Contact

**JadooTech Enterprises**
- Phone: [7668690613](tel:7668690613)
- Email: [jadootechenterprises@gmail.com](mailto:jadootechenterprises@gmail.com)
- GitHub: [github.com/jadootechenterprises](https://github.com/jadootechenterprises)
- Website: [jadootechenterprises.github.io](https://jadootechenterprises.github.io/)

---

© 2026 JadooTech Enterprises. All Rights Reserved.
