/**
 * Generates presentation/Portfolio-ReStyle-AI-Design-Deck.pptx (design-focused deck).
 * Run: cd web && npm run presentation:pptx
 */
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import PptxGenJS from "pptxgenjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "..", "presentation", "Portfolio-ReStyle-AI-Design-Deck.pptx");

const PURPLE = "4F46E5";
const SLATE = "0F172A";
const MUTED = "64748B";
const FONT_PRIMARY = "Helvetica Neue";
const SAFE_MARGIN_L = 0.6; // slide safe left margin (in PPT units)

// Screenshots (used for function explanation slides)
const IMG_OPTIONS_DOCK =
  "/Users/guoxiaoyue/.cursor/projects/Users-guoxiaoyue-Downloads-cursor-Portfolio-ReStyle-AI/assets/__2026-03-30_15.46.38-49fcc9cf-c541-460f-b822-e381967fc6bf.png";
const IMG_GRID_PRESETS =
  "/Users/guoxiaoyue/.cursor/projects/Users-guoxiaoyue-Downloads-cursor-Portfolio-ReStyle-AI/assets/__2026-03-30_15.38.54-735dd999-a21b-4719-af36-9994ea7d2a6c.png";
const IMG_EXPORT_STEP =
  "/Users/guoxiaoyue/.cursor/projects/Users-guoxiaoyue-Downloads-cursor-Portfolio-ReStyle-AI/assets/__2026-03-30_15.15.55-596f6acd-3360-49c6-8675-49394d0372f5.png";

function titleStyle() {
  return {
    fontSize: 32,
    bold: true,
    color: PURPLE,
    fontFace: FONT_PRIMARY,
  };
}

function bodyStyle() {
  return {
    fontSize: 16,
    color: SLATE,
    fontFace: FONT_PRIMARY,
    bullet: true,
    lineSpacingMultiple: 1.15,
  };
}

function slideTitle(pptx, title, subtitle) {
  const s = pptx.addSlide();
  s.background = { fill: "F8FAFC" };
  s.addText(title, {
    x: SAFE_MARGIN_L,
    y: 0.45,
    w: 8.8,
    h: 0.85,
    ...titleStyle(),
    fontSize: 28,
  });
  if (subtitle) {
    s.addText(subtitle, {
      x: SAFE_MARGIN_L,
      y: 1.15,
      w: 8.8,
      h: 0.4,
      fontSize: 13,
      color: MUTED,
      fontFace: FONT_PRIMARY,
    });
  }
  return s;
}

async function main() {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";
  pptx.author = "Portfolio ReStyle AI";
  pptx.title = "Portfolio ReStyle AI — Design presentation";
  pptx.subject = "Visual communication design coursework";

  // --- Slide 1: Title ---
  const s1 = pptx.addSlide();
  s1.background = { fill: "F8FAFC" };
  s1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 10,
    h: 0.35,
    fill: { color: PURPLE },
    line: { color: PURPLE, width: 0 },
  });
  s1.addText("Portfolio ReStyle AI", {
    x: SAFE_MARGIN_L,
    y: 1.2,
    w: 8.8,
    h: 1,
    fontSize: 40,
    bold: true,
    color: PURPLE,
    fontFace: FONT_PRIMARY,
  });
  s1.addText(
    "視覺傳達設計 · Visual communication design\nHuman–AI layout collaboration · 人機協作版面實驗",
    {
      x: SAFE_MARGIN_L,
      y: 2.35,
      w: 8.8,
      h: 1,
      fontSize: 18,
      color: SLATE,
      fontFace: FONT_PRIMARY,
    },
  );
  s1.addText(
    "組員 Members\n郭曉玥 (Guo Xiaoyue) · MC569254\n劉佳群 (Liu Jiaqun) · MC569293",
    {
      x: SAFE_MARGIN_L,
      y: 4.2,
      w: 8.8,
      h: 1.2,
      fontSize: 14,
      color: MUTED,
      fontFace: FONT_PRIMARY,
      italic: true,
    },
  );

  // --- Slide 2: Problem ---
  const s2 = slideTitle(
    pptx,
    "Why this matters 問題背景",
    "Problem · 作品集不只是「好看」",
  );
  s2.addText(
    [
      {
        text: "Portfolios are narrative + craft—not only pretty pictures. / 作品集是敘事與工藝，不只是漂亮畫面。",
        options: bodyStyle(),
      },
      {
        text: "Restructuring order, grid, and tone is repetitive; it steals time from concept work. / 重排順序、網格、色調很耗時，擠壓概念發想時間。",
        options: { ...bodyStyle(), fontSize: 15 },
      },
      {
        text: "We need a tool that assists without replacing designer judgment. / 需要「輔助」設計師判斷的工具，而非取代。",
        options: { ...bodyStyle(), fontSize: 15 },
      },
    ],
    { x: 0.6, y: 1.75, w: 8.8, h: 3.8 },
  );

  // --- Slide 3: Concept ---
  const s3 = slideTitle(pptx, "Concept 核心概念", "Re-interpret, don’t replace");
  s3.addText(
    [
      {
        text: "Re-interpret SVG/PDF with clear intent: palette, style, canvas, narrative order. / 以色系、風格、畫布、敘事順序重新詮釋既有稿件。",
        options: bodyStyle(),
      },
      {
        text: "Three variants per page → designer chooses (studio critique loop). / 每頁三種版本 → 設計師選擇，貼近工作室評圖流程。",
        options: { ...bodyStyle(), fontSize: 15 },
      },
      {
        text: "Export SVG (edit further) or merged PDF (share / print). / 匯出向量 SVG 或合併 PDF，便於再編輯與交付。",
        options: { ...bodyStyle(), fontSize: 15 },
      },
    ],
    { x: 0.6, y: 1.75, w: 8.8, h: 3.8 },
  );

  // --- Slide 4: UX Flow — Upload ---
  const sFlowUpload = slideTitle(
    pptx,
    "UX Flow 1 上傳導入",
    "Upload / PDF import",
  );
  sFlowUpload.addImage({
    path: IMG_EXPORT_STEP,
    x: 5.25,
    y: 1.65,
    w: 4.7,
    h: 5.1,
    sizing: { type: "contain", w: 4.7, h: 5.1 },
  });
  sFlowUpload.addText(
    [
      { text: "Upload 上傳", options: { bold: true, fontSize: 16, color: SLATE } },
      {
        text: "• SVG：直接導入並分頁 (SVG import & page split)",
        options: { fontSize: 13, color: SLATE },
      },
      {
        text: "• PDF：pdf.js 逐頁渲染 + 抽取文字座標 (render & extract text coords)",
        options: { fontSize: 13, color: SLATE },
      },
      {
        text: "目標：可重排、可選擇的結構 (structure for remix)",
        options: { fontSize: 13, color: SLATE },
      },
    ],
    {
      x: 0.55,
      y: 1.7,
      w: 4.65,
      h: 5.2,
      lineSpacingMultiple: 1.05,
      fontFace: FONT_PRIMARY,
    },
  );

  // --- Slide 5: UX Flow — Options ---
  const sFlowOptions = slideTitle(
    pptx,
    "UX Flow 2 選項 Options",
    "Palette / Style / Canvas / Narrative / Grid",
  );
  sFlowOptions.addImage({
    path: IMG_OPTIONS_DOCK,
    x: 5.25,
    y: 1.65,
    w: 4.7,
    h: 5.1,
    sizing: { type: "contain", w: 4.7, h: 5.1 },
  });
  sFlowOptions.addText(
    [
      { text: "Options 選項", options: { bold: true, fontSize: 16, color: SLATE } },
      {
        text: "• 色系 + 風格關鍵詞：即時濾鏡/字色方向 (live palette/style filters)",
        options: { fontSize: 13, color: SLATE },
      },
      {
        text: "• 畫布尺寸 + 敘事邏輯：影響比例與頁序 (canvas & narrative ordering)",
        options: { fontSize: 13, color: SLATE },
      },
      {
        text: "• 網格重排 + tile 微調：拖曳寫入構圖 (grid remix + tile nudge)",
        options: { fontSize: 13, color: SLATE },
      },
      {
        text: "目標：可視化方向、可比較、可迭代 (visual, compare, iterate)",
        options: { fontSize: 13, color: SLATE },
      },
    ],
    {
      x: 0.55,
      y: 1.7,
      w: 4.65,
      h: 5.2,
      lineSpacingMultiple: 1.05,
      fontFace: FONT_PRIMARY,
    },
  );

  // --- Slide 6: UX Flow — Pages ×3 ---
  const sFlowPages = slideTitle(
    pptx,
    "UX Flow 3 頁面 Pages ×3",
    "Choose a variant per page",
  );
  sFlowPages.addImage({
    path: IMG_EXPORT_STEP,
    x: 5.25,
    y: 1.65,
    w: 4.7,
    h: 5.1,
    sizing: { type: "contain", w: 4.7, h: 5.1 },
  });
  sFlowPages.addText(
    [
      { text: "Pages 頁面×3", options: { bold: true, fontSize: 16, color: SLATE } },
      {
        text: "• 每頁 3 版本：快速比對，再鎖定構圖 (3 variants per page)",
        options: { fontSize: 13, color: SLATE },
      },
      {
        text: "• Before/After：分開看顏色與版式位移 (separate color vs layout)",
        options: { fontSize: 13, color: SLATE },
      },
      {
        text: "• WebGL/2D 預覽：同一套 SVG 來源 (consistent SVG preview)",
        options: { fontSize: 13, color: SLATE },
      },
      {
        text: "目標：降低決策成本、加速定稿 (faster decisions)",
        options: { fontSize: 13, color: SLATE },
      },
    ],
    {
      x: 0.55,
      y: 1.7,
      w: 4.65,
      h: 5.2,
      lineSpacingMultiple: 1.05,
      fontFace: FONT_PRIMARY,
    },
  );

  // --- Slide 7: UX Flow — Export ---
  const sFlowExport = slideTitle(
    pptx,
    "UX Flow 4 匯出 Export",
    "Deliverables: PDF / SVG",
  );
  sFlowExport.addImage({
    path: IMG_EXPORT_STEP,
    x: 5.25,
    y: 1.65,
    w: 4.7,
    h: 5.1,
    sizing: { type: "contain", w: 4.7, h: 5.1 },
  });
  sFlowExport.addText(
    [
      { text: "Export 匯出", options: { bold: true, fontSize: 16, color: SLATE } },
      {
        text: "• 下載合併 PDF：分享/列印用 (merged PDF for share/print)",
        options: { fontSize: 13, color: SLATE },
      },
      {
        text: "• 下載每頁 SVG：給 Figma/編輯器精修 (per-page SVG for refinement)",
        options: { fontSize: 13, color: SLATE },
      },
      {
        text: "• 保留所選版本设置：含網格重排/微調 (keeps chosen settings)",
        options: { fontSize: 13, color: SLATE },
      },
      {
        text: "目標：輸出可交付設計稿 (deliverable output)",
        options: { fontSize: 13, color: SLATE },
      },
    ],
    {
      x: 0.55,
      y: 1.7,
      w: 4.65,
      h: 5.2,
      lineSpacingMultiple: 1.05,
      fontFace: FONT_PRIMARY,
    },
  );

  // --- Slide 8: Design thinking (process) ---
  const s5 = slideTitle(pptx, "Design thinking 設計思維", "From layout pain → clear workflow");
  // Reduce to fewer, denser bullets so text never overflows the slide height.
  const thinkingBullets = [
    {
      text: "Empathize: repetitive layout work (order/grid/spacing) steals time → designer stays in control. / 同理：重复的版面排版（页序/网格/字距）会占用时间 → 设计师保持掌控。",
      options: { ...bodyStyle(), fontSize: 13, lineSpacingMultiple: 1.06 },
    },
    {
      text: "Define: assist decisions, not replace authorship — keep authorship and taste. / 定义：辅助决策而非取代创作权——保留创作主导与审美品味。",
      options: { ...bodyStyle(), fontSize: 13, lineSpacingMultiple: 1.06 },
    },
    {
      text: "Ideate: wizard + persistent dock + only 3 variants per page → faster comparison. / 发想：精灵流程 + 持续侧栏预览 + 每页仅 3 个版本 → 更快对比。",
      options: { ...bodyStyle(), fontSize: 13, lineSpacingMultiple: 1.06 },
    },
    {
      text: "Prototype: bilingual UI + grid remix + tile nudge + before/after compare for readability. / 原型：双语界面 + 网格重排 + tile 微调 + Before/After 对比，用于提升可读性。",
      options: { ...bodyStyle(), fontSize: 13, lineSpacingMultiple: 1.06 },
    },
    {
      text: "Test: synchronize previews across steps and keep typography hierarchy stable (e.g. 1×2 grids). / 测试：各步骤预览保持同步，并确保字体现层级稳定（例如 1×2 网格）。",
      options: { ...bodyStyle(), fontSize: 13, lineSpacingMultiple: 1.06 },
    },
  ];
  s5.addText(thinkingBullets, {
    x: SAFE_MARGIN_L,
    y: 1.75,
    w: 8.8,
    h: 3.75,
  });

  // --- Slide 6: Design system principles (visual design emphasis) ---
  const s6 = slideTitle(
    pptx,
    "Design system principles 版面設計原則",
    "Aesthetic consistency, faster decisions",
  );
  const tableRows = [
    [
      { text: "Principle 原則", options: { bold: true, fill: { color: "E0E7FF" }, color: SLATE } },
      { text: "How it appears in UI 具體呈現在介面", options: { bold: true, fill: { color: "E0E7FF" }, color: SLATE } },
    ],
    [
      { text: "Whitespace 留白", options: { fontSize: 12 } },
      { text: "Cards use padding + gap; dock preview keeps focus. / 卡片使用 padding + gap；dock 預覽保持焦點。", options: { fontSize: 12 } },
    ],
    [
      { text: "Visual hierarchy 視覺層級", options: { fontSize: 12 } },
      { text: "Purple titles + muted body; consistent left alignment. / 紫色標題 + 低飽和正文；左對齊一致。", options: { fontSize: 12 } },
    ],
    [
      { text: "Grid as sketch tool 網格即草圖", options: { fontSize: 12 } },
      { text: "2×2 / 1×2 / 2×1 presets + tile nudge for iteration. / 2×2 / 1×2 / 2×1 預設 + tile nudge 迭代構圖。", options: { fontSize: 12 } },
    ],
    [
      { text: "Color contrast 對比與可讀性", options: { fontSize: 12 } },
      { text: "Before/After separates hue vs layout for confident decisions. / Before/After 分開看色相 vs 版式，提升決策信心。", options: { fontSize: 12 } },
    ],
    [
      { text: "Bilingual clarity 雙語清晰", options: { fontSize: 12 } },
      { text: "Language toggle with persistent preference via localStorage. / 語言切換透過 localStorage 記住偏好。", options: { fontSize: 12 } },
    ],
  ];
  s6.addTable(tableRows, {
    x: 0.45,
    y: 1.65,
    w: 9.1,
    colW: [2.4, 6.7],
    border: { type: "solid", color: "CBD5E1", pt: 0.5 },
    fontSize: 12,
  });

  // --- Slide 7: Demo (visual-focused) ---
  const s7 = slideTitle(pptx, "Demo script 演示腳本", "For your screen recording / video");
  s7.addImage({
    path: IMG_GRID_PRESETS,
    x: 5.25,
    y: 1.65,
    w: 4.7,
    h: 2.65,
    sizing: { type: "contain", w: 4.7, h: 2.65 },
  });
  const demoText = [
    "1. Show language toggle（中文 ↔ English）。/ 展示雙語切換（中文 ↔ English）。",
    "2. Upload SVG/PDF and change palette/style/grid in the Options dock. / 上傳 SVG/PDF 並在 Options dock 改色系/風格/網格。",
    "3. Use Before/After to separate hue decisions from layout decisions. / 使用 Before/After 分開看色相決策與版式決策。",
    "4. Select one variant per page (including 1×2 / 2×1 asymmetric presets). / 每頁選一個版本（含 1×2 / 2×1 非對稱預設）。",
    "5. Export merged PDF + per-page SVG for further refinement. / 匯出合併 PDF + 每頁 SVG 供後續精修。",
  ].join("\n");
  s7.addText(demoText, {
    x: 0.55,
    y: 1.65,
    w: 4.65,
    h: 4.6,
    fontSize: 14,
    color: SLATE,
    fontFace: FONT_PRIMARY,
    lineSpacingMultiple: 1.08,
    bullet: false,
  });

  // --- Slide 8: Reflection (design) ---
  const s8 = slideTitle(pptx, "Reflection 反思", "Design focus · Next steps");
  s8.addText(
    [
      {
        text: "What worked: clear type hierarchy + stable dock preview for confident decisions. / 有效之處：清晰字體層級 + 穩定 dock 預覽，讓決策更有把握。",
        options: bodyStyle(),
      },
      {
        text: "What to improve: finer typography controls and more layout-ready components. / 接續改進：更細字體控制與更多可直接用的版面元件。",
        options: { ...bodyStyle(), fontSize: 15 },
      },
      {
        text: "Ethics: API keys only in .env.local; no training on user uploads in this prototype. / 倫理：API 金鑰只在本機；此原型不對用戶上傳做訓練。",
        options: { ...bodyStyle(), fontSize: 15 },
      },
    ],
    { x: SAFE_MARGIN_L, y: 1.75, w: 8.8, h: 3.8 },
  );

  // --- Slide 9: Tech appendix ---
  const s9 = slideTitle(pptx, "Appendix: Tech 技術附錄", "Brief — grading focus stays on design");
  s9.addText(
    [
      {
        text: "Stack: Next.js, Tailwind, Zustand; optional Gemini for copy / vision / order. / 技術：Next.js、Tailwind、Zustand；可選 Gemini 用於文案/視覺/排序。",
        options: bodyStyle(),
      },
      {
        text: "API: Google AI Studio https://aistudio.google.com/apikey / API：Google AI Studio（https://aistudio.google.com/apikey）",
        options: bodyStyle(),
      },
      {
        text: "Docs: https://ai.google.dev/gemini-api/docs / 文件：https://ai.google.dev/gemini-api/docs",
        options: bodyStyle(),
      },
      {
        text: "Repo: github.com/macaumonsoon/Portfolio-ReStyle-AI / 專案程式庫：https://github.com/macaumonsoon/Portfolio-ReStyle-AI",
        options: bodyStyle(),
      },
    ],
    { x: 0.6, y: 1.75, w: 8.8, h: 3.2 },
  );

  await pptx.writeFile({ fileName: OUT });
  console.log("Wrote:", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
