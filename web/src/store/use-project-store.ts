import { create } from "zustand";
import type { PdfPageLayer, PdfTextFontKey } from "@/lib/pdf-page-types";
import { rebuildAllPdfSvgs } from "@/lib/pdf-composite-svg";
import {
  parseSvgPageLayer,
  rebuildAllSvgPages,
  type SvgPageLayer,
} from "@/lib/svg-text-layer";

export type WizardStep = "upload" | "options" | "pages" | "export";

/** 風格關鍵詞：id 供 svg-variants 等邏輯使用，UI 用中英標籤 */
export const STYLE_KEYWORD_PRESETS = [
  { id: "Bold", labelZh: "粗獷", labelEn: "Bold" },
  { id: "Minimal", labelZh: "極簡", labelEn: "Minimal" },
  { id: "Futuristic", labelZh: "未來感", labelEn: "Futuristic" },
  { id: "Narrative", labelZh: "敘事", labelEn: "Narrative" },
  { id: "Vintage", labelZh: "復古", labelEn: "Vintage" },
  { id: "Elegant", labelZh: "優雅", labelEn: "Elegant" },
  { id: "Playful", labelZh: "俏皮", labelEn: "Playful" },
] as const;

export type StyleKeywordId = (typeof STYLE_KEYWORD_PRESETS)[number]["id"];

export const CANVAS_PRESETS = [
  { id: "a4", label: "A4 (210×297mm)", width: 794, height: 1123 },
  { id: "letter", label: "Letter (8.5×11)", width: 816, height: 1056 },
  { id: "square", label: "Square 1080", width: 1080, height: 1080 },
  { id: "deck", label: "16:9  deck", width: 1920, height: 1080 },
] as const;

/** text：向量 SVG 正文預設字色；三版本會在 text / accent / muted 間切換 */
export const PALETTES = [
  { id: "mono", name: "墨岩 Mono", accent: "#0f172a", muted: "#64748b", text: "#0f172a" },
  { id: "ocean", name: "深海 Ocean", accent: "#0ea5e9", muted: "#0369a1", text: "#0c4a6e" },
  { id: "clay", name: "陶土 Clay", accent: "#c2410c", muted: "#9a3412", text: "#431407" },
  { id: "vine", name: "藤绿 Vine", accent: "#15803d", muted: "#166534", text: "#14532d" },
  { id: "wine", name: "酒红 Wine", accent: "#9f1239", muted: "#881337", text: "#500724" },
] as const;

export const FONT_STYLES = [
  { id: "neo", label: "Neo grotesque", hint: "Helvetica / Inter 系" },
  { id: "humanist", label: "Humanist", hint: "更柔和易读" },
  { id: "serif", label: "Serif editorial", hint: "编辑感衬线" },
  { id: "mono", label: "Mono technical", hint: "技术文档感" },
] as const;

export const NARRATIVES = [
  { id: "logic", label: "工作逻辑顺序", desc: "能力 → 流程 → 案例" },
  { id: "story", label: "故事线", desc: "时间线 / 个人叙事" },
  { id: "project", label: "按项目类型", desc: "品牌 / 数字 / 印刷分组" },
] as const;

/** 網格分區重排：關閉時僅保留位移 / 濾鏡示範（中英雙語供 UI） */
export const GRID_PRESETS = [
  {
    id: "off",
    labelZh: "關閉（僅版式微調 + 濾鏡）",
    labelEn: "Off — nudge + filters only",
    hintZh: "僅版面微移與濾鏡示範。",
    hintEn: "Subtle layout shifts and filter demo only.",
    cols: 0,
    rows: 0,
  },
  {
    id: "2x2",
    labelZh: "2×2 網格重排",
    labelEn: "2×2 grid remix",
    hintZh: "三版本：順序不變、區塊反向、偽隨機重排（每頁種子不同）。",
    hintEn:
      "Three variants: reading order, reversed tiles, seeded shuffle (unique per page).",
    cols: 2,
    rows: 2,
  },
  {
    id: "3x2",
    labelZh: "3×2 網格重排",
    labelEn: "3×2 grid remix",
    hintZh: "三版本：順序不變、區塊反向、偽隨機重排（每頁種子不同）。",
    hintEn:
      "Three variants: reading order, reversed tiles, seeded shuffle (unique per page).",
    cols: 3,
    rows: 2,
  },
  {
    id: "3x3",
    labelZh: "3×3 網格重排",
    labelEn: "3×3 grid remix",
    hintZh: "三版本：順序不變、區塊反向、偽隨機重排（每頁種子不同）。",
    hintEn:
      "Three variants: reading order, reversed tiles, seeded shuffle (unique per page).",
    cols: 3,
    rows: 3,
  },
] as const;

export type ProjectState = {
  step: WizardStep;
  fileName: string | null;
  /** 原始檔案內容（SVG 字串）；PDF 僅記錄檔名供 UI 提示 */
  originalSvg: string | null;
  isPdf: boolean;
  /** PDF 分層資料（可編輯文字）；非 PDF 時為 null */
  pdfPagesData: PdfPageLayer[] | null;
  /** 向量 SVG 各頁 <text> 解析結果；無可編輯文字或 PDF 時為 null */
  svgPageLayers: SvgPageLayer[] | null;
  pageSvgs: string[];
  styleKeyword: StyleKeywordId;
  paletteId: (typeof PALETTES)[number]["id"];
  canvasPresetId: (typeof CANVAS_PRESETS)[number]["id"];
  fontStyleId: (typeof FONT_STYLES)[number]["id"];
  narrativeId: (typeof NARRATIVES)[number]["id"];
  /** 生成想法 / 給 AI 的簡述（示範：影響頁序關鍵詞與後端提示） */
  userBrief: string;
  gridPresetId: (typeof GRID_PRESETS)[number]["id"];
  /** 瀏覽第 i 步對應的原始頁索引；空陣列表示尚未套用敘事排序 */
  orderedSourceIndices: number[];
  currentPageIndex: number;
  /** 每頁選中的版本 0–2，未選為 null */
  selectionByPage: Record<number, number | null>;
  /** 選定後寫入的 SVG（示範用 mock） */
  finalizedPageSvgs: string[];
  setStep: (s: WizardStep) => void;
  /** 向量檔；PDF 請用 setPdfImport */
  setFile: (
    name: string,
    content: string | null,
    isPdf: boolean,
    pdfPageSvgs?: string[],
  ) => void;
  setPdfImport: (fileName: string, pages: PdfPageLayer[]) => void;
  updatePdfTextItem: (
    pageIndex: number,
    textId: string,
    patch: Partial<{ content: string; fontKey: PdfTextFontKey }>,
  ) => void;
  updateSvgTextItem: (
    pageIndex: number,
    textId: string,
    patch: Partial<{ content: string; fontKey: PdfTextFontKey }>,
  ) => void;
  setOptions: (
    o: Partial<
      Pick<
        ProjectState,
        | "styleKeyword"
        | "paletteId"
        | "canvasPresetId"
        | "fontStyleId"
        | "narrativeId"
        | "userBrief"
        | "gridPresetId"
      >
    >,
  ) => void;
  setOrderedSourceIndices: (indices: number[]) => void;
  setPageSvgs: (pages: string[]) => void;
  /** 更新向量 SVG 全文與分頁，不清空已選版本（示範頁拖動文字用） */
  patchSourceSvg: (raw: string) => void;
  setCurrentPageIndex: (i: number) => void;
  selectVariant: (pageIndex: number, variantIndex: number, svg: string) => void;
  reset: () => void;
};

const initial = {
  step: "upload" as WizardStep,
  fileName: null as string | null,
  originalSvg: null as string | null,
  isPdf: false,
  pdfPagesData: null as PdfPageLayer[] | null,
  svgPageLayers: null as SvgPageLayer[] | null,
  pageSvgs: [] as string[],
  styleKeyword: "Minimal" as const,
  paletteId: "mono" as const,
  canvasPresetId: "a4" as const,
  fontStyleId: "neo" as const,
  narrativeId: "logic" as const,
  userBrief: "",
  gridPresetId: "off" as const,
  orderedSourceIndices: [] as number[],
  currentPageIndex: 0,
  selectionByPage: {} as Record<number, number | null>,
  finalizedPageSvgs: [] as string[],
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  ...initial,
  setStep: (step) => set({ step }),
  setFile: (fileName, content, isPdf, pdfPageSvgs) => {
    if (pdfPageSvgs && pdfPageSvgs.length > 0) {
      set({
        fileName,
        originalSvg: content,
        isPdf: true,
        pdfPagesData: null,
        svgPageLayers: null,
        pageSvgs: pdfPageSvgs,
        selectionByPage: {},
        finalizedPageSvgs: [],
        currentPageIndex: 0,
        orderedSourceIndices: [],
      });
      return;
    }
    if (content && !isPdf) {
      const splits = splitSvgPages(content);
      const layers = splits.map((p) => parseSvgPageLayer(p));
      const svgPageLayers = layers.some((l) => l.texts.length > 0)
        ? layers
        : null;
      set({
        fileName,
        originalSvg: content,
        isPdf: false,
        pdfPagesData: null,
        svgPageLayers,
        pageSvgs: rebuildAllSvgPages(layers),
        selectionByPage: {},
        finalizedPageSvgs: [],
        currentPageIndex: 0,
        orderedSourceIndices: [],
      });
      return;
    }
    set({
      fileName,
      originalSvg: content,
      isPdf,
      pdfPagesData: null,
      svgPageLayers: null,
      pageSvgs: [],
      selectionByPage: {},
      finalizedPageSvgs: [],
      currentPageIndex: 0,
      orderedSourceIndices: [],
    });
  },
  setPdfImport: (fileName, pages) => {
    set({
      fileName,
      originalSvg: null,
      isPdf: true,
      pdfPagesData: pages,
      svgPageLayers: null,
      pageSvgs: rebuildAllPdfSvgs(pages),
      selectionByPage: {},
      finalizedPageSvgs: [],
      currentPageIndex: 0,
      orderedSourceIndices: [],
    });
  },
  updatePdfTextItem: (pageIndex, textId, patch) => {
    const pages = get().pdfPagesData;
    if (!pages || !pages[pageIndex]) return;
    const next = pages.map((p, i) => {
      if (i !== pageIndex) return p;
      return {
        ...p,
        texts: p.texts.map((t) =>
          t.id === textId ? { ...t, ...patch } : t,
        ),
      };
    });
    const finalized = Array.from(
      { length: next.length },
      (_, i) => get().finalizedPageSvgs[i] ?? "",
    );
    finalized[pageIndex] = "";
    set({
      pdfPagesData: next,
      pageSvgs: rebuildAllPdfSvgs(next),
      selectionByPage: { ...get().selectionByPage, [pageIndex]: null },
      finalizedPageSvgs: finalized,
    });
  },
  updateSvgTextItem: (pageIndex, textId, patch) => {
    const layers = get().svgPageLayers;
    if (!layers || !layers[pageIndex]) return;
    const next = layers.map((layer, i) => {
      if (i !== pageIndex) return layer;
      return {
        ...layer,
        texts: layer.texts.map((t) =>
          t.id === textId ? { ...t, ...patch } : t,
        ),
      };
    });
    const finalized = Array.from(
      { length: next.length },
      (_, i) => get().finalizedPageSvgs[i] ?? "",
    );
    finalized[pageIndex] = "";
    set({
      svgPageLayers: next,
      pageSvgs: rebuildAllSvgPages(next),
      selectionByPage: { ...get().selectionByPage, [pageIndex]: null },
      finalizedPageSvgs: finalized,
    });
  },
  setOptions: (o) => set(o),
  setOrderedSourceIndices: (orderedSourceIndices) => set({ orderedSourceIndices }),
  setPageSvgs: (pageSvgs) => set({ pageSvgs }),
  patchSourceSvg: (raw) => {
    const splits = splitSvgPages(raw);
    const layers = splits.map((p) => parseSvgPageLayer(p));
    const svgPageLayers = layers.some((l) => l.texts.length > 0)
      ? layers
      : null;
    set({
      originalSvg: raw,
      pageSvgs: rebuildAllSvgPages(layers),
      pdfPagesData: null,
      isPdf: false,
      svgPageLayers,
    });
  },
  setCurrentPageIndex: (currentPageIndex) => set({ currentPageIndex }),
  selectVariant: (pageIndex, variantIndex, svg) => {
    const n = get().pageSvgs.length;
    const finalized = Array.from(
      { length: n },
      (_, i) => get().finalizedPageSvgs[i] ?? "",
    );
    finalized[pageIndex] = svg;
    set({
      selectionByPage: { ...get().selectionByPage, [pageIndex]: variantIndex },
      finalizedPageSvgs: finalized,
    });
  },
  reset: () => set({ ...initial }),
}));

/** 粗略拆分多個根級 <svg>；否則整份為一頁 */
function splitSvgPages(raw: string): string[] {
  const trimmed = raw.trim();
  const re = /<svg\b[^>]*>[\s\S]*?<\/svg>/gi;
  const matches = trimmed.match(re);
  if (matches && matches.length > 1) return matches;
  return [trimmed];
}
