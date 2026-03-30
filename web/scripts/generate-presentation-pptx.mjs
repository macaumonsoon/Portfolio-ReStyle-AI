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
    "組員 Members\n郭曉玥 (Guo Xiaoyue) · MC569254\n劉佳群 (Liu Jiaqun) · MCxxxxxx",
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
      { text: "Portfolios are narrative + craft—not only pretty pictures.", options: bodyStyle() },
      { text: "作品集是敘事與工藝，不只是漂亮畫面。", options: { ...bodyStyle(), fontSize: 15 } },
      { text: "Restructuring order, grid, and tone is repetitive; it steals time from concept work.", options: bodyStyle() },
      { text: "重排順序、網格、色調很耗時，擠壓概念發想時間。", options: { ...bodyStyle(), fontSize: 15 } },
      { text: "We need a tool that assists without replacing designer judgment.", options: bodyStyle() },
      { text: "需要「輔助」設計師判斷的工具，而非取代。", options: { ...bodyStyle(), fontSize: 15 } },
    ],
    { x: 0.6, y: 1.75, w: 8.8, h: 3.8 },
  );

  // --- Slide 3: Concept ---
  const s3 = slideTitle(pptx, "Concept 核心概念", "Re-interpret, don’t replace");
  s3.addText(
    [
      { text: "Re-interpret SVG/PDF with clear intent: palette, style, canvas, narrative order.", options: bodyStyle() },
      { text: "以色系、風格、畫布、敘事順序重新詮釋既有稿件。", options: { ...bodyStyle(), fontSize: 15 } },
      { text: "Three variants per page → designer chooses (studio critique loop).", options: bodyStyle() },
      { text: "每頁三種版本 → 設計師選擇，貼近工作室評圖流程。", options: { ...bodyStyle(), fontSize: 15 } },
      { text: "Export SVG (edit further) or merged PDF (share / print).", options: bodyStyle() },
      { text: "匯出向量 SVG 或合併 PDF，便於再編輯與交付。", options: { ...bodyStyle(), fontSize: 15 } },
    ],
    { x: 0.6, y: 1.75, w: 8.8, h: 3.8 },
  );

  // --- Slide 4: VCD role ---
  const s4 = slideTitle(
    pptx,
    "In visual communication 在視傳流程中",
    "How designers can use this tool",
  );
  s4.addText(
    [
      { text: "Direction exploration: color + style with immediate preview feedback.", options: bodyStyle() },
      { text: "方向探索：色彩與風格搭配，即時預覽回饋。", options: { ...bodyStyle(), fontSize: 15 } },
      { text: "Layout sketching: grid remix + optional tile nudge.", options: bodyStyle() },
      { text: "版面草圖：網格重排與區塊微調。", options: { ...bodyStyle(), fontSize: 15 } },
      { text: "Presentation packaging: reorder pages, unified look for different audiences.", options: bodyStyle() },
      { text: "展示包裝：調整頁序與整體視覺，面向不同觀眾。", options: { ...bodyStyle(), fontSize: 15 } },
      { text: "Workflow: Upload → set intent (palette/style/canvas/narrative/grid) → review per page → choose variant → export SVG/PDF.", options: bodyStyle() },
      { text: "流程：上傳 → 設定意圖（色系/風格/畫布/敘事/網格）→ 逐頁審閱 → 選擇版本 → 匯出 SVG/PDF。", options: { ...bodyStyle(), fontSize: 15 } },
    ],
    { x: 0.6, y: 1.75, w: 8.8, h: 4.2 },
  );

  // --- Slide 5: Design thinking (process) ---
  const s5 = slideTitle(pptx, "Design thinking 設計思維", "From layout pain → clear workflow");
  s5.addText(
    [
      { text: "Empathize: designers lose time to repetitive layout work (order, grid, spacing).", options: bodyStyle() },
      { text: "同理：設計師把時間花在重複排版（頁序、網格、字距）上。", options: { ...bodyStyle(), fontSize: 15 } },
      { text: "Define: assist decisions, not replace authorship — keep designer in control.", options: bodyStyle() },
      { text: "定義：協助決策而不是取代創作權 — 讓設計師保持控制。", options: { ...bodyStyle(), fontSize: 15 } },
      { text: "Ideate: wizard + persistent dock + only 3 variants per page for faster comparison.", options: bodyStyle() },
      { text: "發想：精靈流程 + 持續側欄預覽 + 每頁僅 3 個版本，提升比對效率。", options: { ...bodyStyle(), fontSize: 15 } },
      { text: "Prototype: bilingual UI, grid remix, tile nudge, before/after compare — designed for readability.", options: bodyStyle() },
      { text: "原型：雙語介面、網格重排、區塊微調、Before/After 對比 — 以可讀性為核心排版。", options: { ...bodyStyle(), fontSize: 15 } },
      { text: "Test: keep previews synchronized across steps and ensure typography hierarchy stays stable.", options: bodyStyle() },
      { text: "測試：讓步驟間預覽同步、並確保字體層級在界面中保持穩定。", options: { ...bodyStyle(), fontSize: 15 } },
    ],
    { x: SAFE_MARGIN_L, y: 1.75, w: 8.8, h: 4.6 },
  );

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
      { text: "Cards use padding + gap; dock preview keeps focus.", options: { fontSize: 12 } },
    ],
    [
      { text: "Visual hierarchy 視覺層級", options: { fontSize: 12 } },
      { text: "Purple titles + muted body; consistent left alignment.", options: { fontSize: 12 } },
    ],
    [
      { text: "Grid as sketch tool 網格即草圖", options: { fontSize: 12 } },
      { text: "2×2 / 1×2 / 2×1 presets + tile nudge for composition iteration.", options: { fontSize: 12 } },
    ],
    [
      { text: "Color contrast 對比與可讀性", options: { fontSize: 12 } },
      { text: "Before/After modes separate hue vs layout for decision confidence.", options: { fontSize: 12 } },
    ],
    [
      { text: "Bilingual clarity 雙語清晰", options: { fontSize: 12 } },
      { text: "Language toggle with persistent preference via localStorage.", options: { fontSize: 12 } },
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
  s7.addText(
    [
      { text: "Show bilingual toggle (中文 ↔ English).", options: bodyStyle() },
      { text: "Upload SVG/PDF → in the dock, change palette/style/grid and watch hierarchy update.", options: bodyStyle() },
      { text: "Switch Before/After modes to separate hue decisions from layout decisions.", options: bodyStyle() },
      { text: "Pick one variant per page; show 1×2 / 2×1 presets for asymmetric composition.", options: bodyStyle() },
      { text: "Export as merged PDF and per-page SVG for further visual refinement.", options: bodyStyle() },
    ],
    { x: SAFE_MARGIN_L, y: 1.75, w: 8.8, h: 3.6 },
  );

  // --- Slide 8: Reflection (design) ---
  const s8 = slideTitle(pptx, "Reflection 反思", "Design focus · Next steps");
  s8.addText(
    [
      { text: "What worked: clear type hierarchy + stable dock preview for confident decisions.", options: bodyStyle() },
      { text: "有效之處：清晰字體層級 + 穩定 dock 預覽，讓決策更有把握。", options: { ...bodyStyle(), fontSize: 15 } },
      { text: "What to improve: finer typography controls and more layout-ready components.", options: bodyStyle() },
      { text: "接續改進：更細字體控制與更多可直接用的版面元件。", options: { ...bodyStyle(), fontSize: 15 } },
      { text: "Ethics: API keys only in .env.local; no training on user uploads in this prototype.", options: bodyStyle() },
      { text: "倫理：API 金鑰只在本機；此原型不對用戶上傳做訓練。", options: { ...bodyStyle(), fontSize: 15 } },
    ],
    { x: SAFE_MARGIN_L, y: 1.75, w: 8.8, h: 3.8 },
  );

  // --- Slide 9: Tech appendix ---
  const s9 = slideTitle(pptx, "Appendix: Tech 技術附錄", "Brief — grading focus stays on design");
  s9.addText(
    [
      { text: "Stack: Next.js, Tailwind, Zustand; optional Gemini for copy / vision / order.", options: bodyStyle() },
      { text: "API: Google AI Studio https://aistudio.google.com/apikey", options: bodyStyle() },
      { text: "Docs: https://ai.google.dev/gemini-api/docs", options: bodyStyle() },
      { text: "Repo: github.com/macaumonsoon/Portfolio-ReStyle-AI", options: bodyStyle() },
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
