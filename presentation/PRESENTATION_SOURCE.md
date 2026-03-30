# Presentation source (for slides / Cursor)

Use this markdown as the **content backbone** for your slide deck (PowerPoint, Keynote, Google Slides, or export from Cursor).  
**Focus: design** — purpose, VCD workflow, design thinking, UI/UX decisions. Keep engineering as a short appendix only.

---

## Slide 1 — Title

- **Portfolio ReStyle AI**
- Visual communication design · human–AI layout collaboration
- Names (EN / 中文) + Student IDs

---

## Slide 2 — Problem

- Portfolios = narrative + craft, not only pretty pictures.
- Restructuring decks (order, grid, tone) is repetitive and steals time from concept work.
- Need a tool that **assists** without replacing designer judgment.

---

## Slide 3 — Concept / Why this app

- **Re-interpret** existing SVG/PDF work with clear intent: palette, style keywords, canvas, narrative order.
- **Multiple variants** per page → designer picks; mirrors studio critique loops.
- **Export** as SVG (edit further) or PDF (share/print).

---

## Slide 4 — Role in visual communication design

- Early **direction exploration** (color + style) with immediate feedback.
- **Layout sketching** via grid remix and tile nudge.
- **Presentation packaging** for different audiences (reorder pages, unified look).

---

## Slide 5 — Design thinking (process)

1. Empathize: designers fear losing control to “black box” AI.
2. Define: automate packaging/variation, not final authorship.
3. Ideate: wizard + dock preview + three variants.
4. Prototype: web app, bilingual, accessible flow.
5. Test: iterate on preview clarity, export reliability, grid edge cases.

---

## Slide 6 — UI/UX decisions (with rationale)

| Decision | Rationale |
|----------|-----------|
| Stepper wizard | Reduces cognitive load; one job per step. |
| Persistent preview dock | Tight feedback loop while changing options. |
| Bilingual toggle (header) | Course requirement + real users in mixed locales. |
| 3 variants only | Enough to compare; avoids choice overload. |
| Before/After + color/layout modes | Separates “look” from “composition” for clearer decisions. |
| Grid thumbnails | Quick recognition of 2×2 vs 1×2 vs 2×1. |
| Softer preview / full export | Readability in UI vs. fidelity in deliverables. |

---

## Slide 7 — Demo script (for video)

1. Show language toggle (中文 ↔ English).
2. Upload SVG or PDF → options step: palette + style + optional grid.
3. Optional: AI brief / style suggest (if key configured—say “local only” on slide).
4. Generate pages → pick variant → WebGL preview / compare.
5. Export PDF or SVG.

---

## Slide 8 — Reflection / next steps

- What worked: …
- What to improve: real layout model, finer typography control, accessibility audit.
- Ethical note: API keys local only; no training on user uploads in this prototype.

---

## Optional appendix (1 slide) — Tech stack

- Next.js, Tailwind, Zustand; Gemini optional for text/vision helpers.
- Link: [Google AI Studio](https://aistudio.google.com/apikey) · [Gemini API docs](https://ai.google.dev/gemini-api/docs)
