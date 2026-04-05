# Portfolio ReStyle AI

**AI-assisted portfolio layout lab** — upload SVG or PDF, choose palette, style keywords, canvas, and optional grid remix; preview three variants per page, then export SVG or merged PDF.

This repository includes the app source, presentation assets, and deployment notes for showcasing the project.

**官方仓库 / Official repository:** [github.com/macaumonsoon/Portfolio-ReStyle-AI](https://github.com/macaumonsoon/Portfolio-ReStyle-AI)

---

## Live presentation site (GitHub Pages)

After you enable Pages (**Settings → Pages → Build and deployment → Source: Deploy from a branch → `/docs` → Save**), the site will be available at:

**https://macaumonsoon.github.io/Portfolio-ReStyle-AI/**

*(If your GitHub username or repo name differs, replace accordingly: `https://<username>.github.io/<repo-name>/`.)*

The Pages site summarizes the design narrative, UI/UX decisions, and links back to this repository.

**Try app link on Pages:** After Vercel shows a successful Production deployment, paste that URL into `docs/assets/prsa-config.js` (`PRSA_PRODUCTION_APP_URL`). Until then, leave it empty. See **Deploy app to Vercel** below.

### Deploy app to Vercel（部署应用并获取 Production URL）

`PRSA_PRODUCTION_APP_URL` **不是在 Vercel 网站里编辑的**：你要在 **Vercel 上先部署成功**，**复制**控制台显示的网址，再到 **本机 Cursor** 里改 `docs/assets/prsa-config.js`，最后 **commit + push** 到 GitHub。

1. **在 Vercel 打开项目** `portfolio-restyle-ai` → **Settings** → **General**。
2. 找到 **Root Directory**，点击 **Edit**，填 **`web`**，**Save**。（Next.js 应用在仓库的 `web/` 子目录；不填会导致构建失败或 “No Production Deployment”。）
3. 打开 **Deployments**，对最新记录点 **⋯** → **Redeploy**（或推送一个新 commit 触发部署）。
4. 等状态变为 **Ready**。若失败，点进该次部署查看 **Build Logs** 里的报错。
5. **部署成功后**，在 **Overview** 或 **Settings → Domains** 可以看到形如 **`https://portfolio-restyle-ai-xxx.vercel.app`** 的地址（以你控制台为准），这就是 **Production URL**。
6. 在 Cursor 中打开 **`docs/assets/prsa-config.js`**，把  
   `var PRSA_PRODUCTION_APP_URL = "";`  
   改成（示例）：  
   `var PRSA_PRODUCTION_APP_URL = "https://你的子域名.vercel.app";`  
   保存后执行 `git add`、`git commit`、`git push`。
7. 等 GitHub Pages 更新后，展示站上的「線上應用」按钮会指向你的真实线上环境。

---

## Slide deck (PowerPoint — open directly)

Download the latest user-edited **`.pptx`** from GitHub Releases:

**[Portfolio-ReStyle-AI-Design-Deck.pptx](https://github.com/macaumonsoon/Portfolio-ReStyle-AI/releases/download/presentation-deck-2026-03-30/Portfolio-ReStyle-AI-Design-Deck.pptx)**

Release page: **[presentation-deck-2026-03-30](https://github.com/macaumonsoon/Portfolio-ReStyle-AI/releases/tag/presentation-deck-2026-03-30)**

Open in Microsoft PowerPoint, Keynote, or compatible apps. Edit the title slide to add **real names and student IDs**.

To **regenerate** the file after editing the script:

```bash
cd web
npm run presentation:pptx
```

Markdown source for further edits: `presentation/PRESENTATION_SOURCE.md`.

---

## Video presentation (YouTube)

Walkthrough of the app in use and how it maps to the slide deck (purpose, visual communication context, design thinking, UI/UX).

- **Watch on YouTube:** [youtu.be/FjQWlJaZMNA](https://youtu.be/FjQWlJaZMNA)
- **Full URL:** https://www.youtube.com/watch?v=FjQWlJaZMNA

---

## Group members

Project contributors (English name, Chinese name, student ID).

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

