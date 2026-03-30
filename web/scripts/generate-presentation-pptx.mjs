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

function titleStyle() {
  return {
    fontSize: 32,
    bold: true,
    color: PURPLE,
    fontFace: "Arial",
  };
}

function bodyStyle() {
  return {
    fontSize: 16,
    color: SLATE,
    fontFace: "Arial",
    bullet: true,
    lineSpacingMultiple: 1.15,
  };
}

function slideTitle(pptx, title, subtitle) {
  const s = pptx.addSlide();
  s.background = { fill: "F8FAFC" };
  s.addText(title, {
    x: 0.6,
    y: 0.45,
    w: 8.8,
    h: 0.85,
    ...titleStyle(),
    fontSize: 28,
  });
  if (subtitle) {
    s.addText(subtitle, {
      x: 0.6,
      y: 1.15,
      w: 8.8,
      h: 0.4,
      fontSize: 13,
      color: MUTED,
      fontFace: "Arial",
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
    x: 0.6,
    y: 1.2,
    w: 8.8,
    h: 1,
    fontSize: 40,
    bold: true,
    color: PURPLE,
    fontFace: "Arial",
  });
  s1.addText(
    "視覺傳達設計 · Visual communication design\nHuman–AI layout collaboration · 人機協作版面實驗",
    {
      x: 0.6,
      y: 2.35,
      w: 8.8,
      h: 1,
      fontSize: 18,
      color: SLATE,
      fontFace: "Arial",
    },
  );
  s1.addText(
    "組員 Members（請改為真實姓名學號 · Edit with your names & student IDs）\nEnglish name / 中文姓名 · Student ID 學號",
    {
      x: 0.6,
      y: 4.2,
      w: 8.8,
      h: 1.2,
      fontSize: 14,
      color: MUTED,
      fontFace: "Arial",
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
    ],
    { x: 0.6, y: 1.75, w: 8.8, h: 3.8 },
  );

  // --- Slide 5: Design thinking ---
  const s5 = slideTitle(pptx, "Design thinking 設計思維", "Human–AI collaboration frame");
  s5.addText(
    [
      { text: "Empathize: fear of “black box” AI → keep designer in control.", options: bodyStyle() },
      { text: "同理：怕黑箱 AI → 決策權留在設計師。", options: { ...bodyStyle(), fontSize: 15 } },
      { text: "Define: automate packaging & variation, not final authorship.", options: bodyStyle() },
      { text: "定義：自動化包裝與變體，而非最終創作權。", options: { ...bodyStyle(), fontSize: 15 } },
      { text: "Ideate → Prototype: wizard + dock preview + 3 variants + bilingual UI.", options: bodyStyle() },
      { text: "發想與原型：精靈流程、側欄預覽、三版本、雙語介面。", options: { ...bodyStyle(), fontSize: 15 } },
      { text: "Test: preview clarity, export reliability, edge-case grids (e.g. 1×2).", options: bodyStyle() },
      { text: "測試：預覽可讀性、匯出穩定性、特殊網格情境。", options: { ...bodyStyle(), fontSize: 15 } },
    ],
    { x: 0.6, y: 1.75, w: 8.8, h: 4.2 },
  );

  // --- Slide 6: UI/UX table ---
  const s6 = slideTitle(pptx, "Key UI/UX decisions 介面決策", "What we built and why");
  const tableRows = [
    [
      { text: "Decision 決策", options: { bold: true, fill: { color: "E0E7FF" }, color: SLATE } },
      { text: "Rationale 理由", options: { bold: true, fill: { color: "E0E7FF" }, color: SLATE } },
    ],
    [
      { text: "Stepper wizard 步驟精靈", options: { fontSize: 12 } },
      { text: "Lower cognitive load; one task per step.", options: { fontSize: 12 } },
    ],
    [
      { text: "Preview dock 即時預覽", options: { fontSize: 12 } },
      { text: "Tight feedback loop while editing options.", options: { fontSize: 12 } },
    ],
    [
      { text: "Bilingual toggle 雙語切換", options: { fontSize: 12 } },
      { text: "Course + real mixed-locale users.", options: { fontSize: 12 } },
    ],
    [
      { text: "3 variants 三版本", options: { fontSize: 12 } },
      { text: "Enough to compare; avoids choice overload.", options: { fontSize: 12 } },
    ],
    [
      { text: "Before/After modes", options: { fontSize: 12 } },
      { text: "Separate color vs. layout judgment.", options: { fontSize: 12 } },
    ],
    [
      { text: "Grid thumbnails 網格示意", options: { fontSize: 12 } },
      { text: "Scannable 2×2 / 1×2 / 2×1 layouts.", options: { fontSize: 12 } },
    ],
  ];
  s6.addTable(tableRows, {
    x: 0.5,
    y: 1.65,
    w: 9,
    colW: [2.6, 6.4],
    border: { type: "solid", color: "CBD5E1", pt: 0.5 },
    fontSize: 12,
  });

  // --- Slide 7: Demo ---
  const s7 = slideTitle(pptx, "Demo script 演示腳本", "For your screen recording / video");
  s7.addText(
    [
      { text: "Toggle 中文 ↔ English in the header.", options: bodyStyle() },
      { text: "Upload SVG or PDF → set palette, style, optional grid.", options: bodyStyle() },
      { text: "Optional: AI brief / style suggest (API key local only—never in repo).", options: bodyStyle() },
      { text: "Generate pages → pick a variant → WebGL preview & compare.", options: bodyStyle() },
      { text: "Export PDF or per-page SVG.", options: bodyStyle() },
    ],
    { x: 0.6, y: 1.75, w: 8.8, h: 3.6 },
  );

  // --- Slide 8: Reflection ---
  const s8 = slideTitle(pptx, "Reflection 反思", "Next steps · 可改進方向");
  s8.addText(
    [
      { text: "What worked: fast iteration on look & layout in the browser.", options: bodyStyle() },
      { text: "可改進：接入真實 AI 佈局模型、更細字體控制、無障礙稽核。", options: { ...bodyStyle(), fontSize: 15 } },
      { text: "Ethics: API keys only in .env.local; no training on uploads in this prototype.", options: bodyStyle() },
      { text: "倫理：金鑰僅存本機；本原型不上傳訓練。", options: { ...bodyStyle(), fontSize: 15 } },
    ],
    { x: 0.6, y: 1.75, w: 8.8, h: 3.5 },
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
