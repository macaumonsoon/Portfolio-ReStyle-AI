# Portfolio ReStyle AI

**AI-assisted portfolio layout lab** — upload SVG or PDF, choose palette, style keywords, canvas, and optional grid remix; preview three variants per page, then export SVG or merged PDF.

**Course assignment deliverables** (see sections below): repo on `main`, bilingual app, README with API docs link (no keys), group roster, presentation links, GitHub Pages.

---

## Live presentation site (GitHub Pages)

After you enable Pages (**Settings → Pages → Build and deployment → Source: Deploy from a branch → `/docs` → Save**), the site will be available at:

**https://macaumonsoon.github.io/Portfolio-ReStyle-AI/**

*(If your GitHub username or repo name differs, replace accordingly: `https://<username>.github.io/<repo-name>/`.)*

The Pages site summarizes the design narrative, UI/UX decisions, and links back to this repository.

---

## Slide deck (PowerPoint — open directly)

A ready-made **`.pptx`** is in the repo:

**`presentation/Portfolio-ReStyle-AI-Design-Deck.pptx`**

Double-click to open in Microsoft PowerPoint, Keynote, or compatible apps. Edit the title slide to add **real names and student IDs**.

To **regenerate** the file after editing the script:

```bash
cd web
npm run presentation:pptx
```

Markdown source for further edits: `presentation/PRESENTATION_SOURCE.md`.

---

## Video presentation (YouTube)

**[Add your YouTube video URL here after uploading]**  
Example format: `https://www.youtube.com/watch?v=YOUR_VIDEO_ID`

The video should demonstrate the app working and reference your slide deck (design-focused: purpose, VCD use, design thinking, UI/UX decisions).

---

## Group members

Edit this table before submission (English name, Chinese name, student ID).

| English name | 中文姓名 | Student ID |
|--------------|----------|------------|
| Guo Xiaoyue | 郭曉玥 | MC569254 |
| Liu Jiaqun | 劉佳群 | MC569293 |

*If you worked solo, keep one row and remove extras.*

---

## How to run the app

Requires **Node.js 20+**.

```bash
cd web
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

### Bilingual UI

Use the **language button** in the header (shows **English** when the UI is in Chinese, and **中文** when the UI is in English). The choice is saved in `localStorage`.

### Optional: AI features (Gemini)

AI helpers (brief expansion, style recommendation, smart page order) need an API key **only on your machine** — **never commit keys**.

1. Get a free key from **[Google AI Studio](https://aistudio.google.com/apikey)** (Gemini API).
2. Copy `web/.env.example` to `web/.env.local` and set:
   ```bash
   GEMINI_API_KEY=your_key_here
   ```
3. Restart `npm run dev`.

**API documentation:** [Gemini API — Google AI for Developers](https://ai.google.dev/gemini-api/docs)

---

## Project structure

| Path | Description |
|------|-------------|
| `web/` | Next.js application (App Router) |
| `web/src/components/wizard.tsx` | Main wizard flow |
| `web/src/store/use-project-store.ts` | Global state, presets |
| `background.md` | Project background / research context |
| `docs/` | **GitHub Pages** static site (presentation summary) |
| `presentation/PRESENTATION_SOURCE.md` | Markdown source for slides / further editing in Cursor |

---

## License / academic use

This repository is submitted for coursework. Respect your institution’s plagiarism and attribution rules.

---

## Due reminder

Per assignment: **1 April 2026, 10:00** — confirm GitHub `main`, README links, video URL, and Pages deployment before the deadline.
