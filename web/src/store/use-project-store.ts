import { create } from "zustand";
import type { ContentScriptId } from "@/lib/detect-content-script";
import type { PdfPageLayer, PdfTextFontKey } from "@/lib/pdf-page-types";
import { rebuildAllPdfSvgs } from "@/lib/pdf-composite-svg";
import {
  parseSvgPageLayer,
  rebuildAllSvgPages,
  type SvgPageLayer,
} from "@/lib/svg-text-layer";
import type { GridTileNudges } from "@/lib/grid-tile-nudge";

export type WizardStep = "upload" | "options" | "pages" | "export";

/** 風格關鍵詞：id 供 svg-variants 等邏輯使用，UI 用中英標籤 */
export const STYLE_KEYWORD_PRESETS = [
  {
    id: "Bold",
    labelZh: "粗獷",
    labelEn: "Bold",
    previewHintZh:
      "提高對比與飽和，視覺更強烈；預覽構圖略放大、外擴。",
    previewHintEn:
      "Higher contrast and saturation; preview scales up and outward.",
  },
  {
    id: "Minimal",
    labelZh: "極簡",
    labelEn: "Minimal",
    previewHintZh:
      "強去飽和並提亮，偏冷灰極簡；構圖收緊、略縮小。",
    previewHintEn:
      "Heavy desaturation and lift, cool gray minimal; tighter, smaller layout.",
  },
  {
    id: "Futuristic",
    labelZh: "未來感",
    labelEn: "Futuristic",
    previewHintZh:
      "色相偏青藍、高飽和與通道強化，科技感；構圖略上移。",
    previewHintEn:
      "Cyan-blue hue, high saturation, punchy channels; layout shifts up.",
  },
  {
    id: "Narrative",
    labelZh: "敘事",
    labelEn: "Narrative",
    previewHintZh:
      "略暖、降飽和與柔和對比，像紙本閱讀；構圖略下移。",
    previewHintEn:
      "Warm, softer contrast, book-like; layout shifts down slightly.",
  },
  {
    id: "Vintage",
    labelZh: "復古",
    labelEn: "Vintage",
    previewHintZh:
      "棕黃調與類 sepia 矩陣，偏老照片／印刷感；構圖略內收。",
    previewHintEn:
      "Sepia-like warmth, old print feel; layout pulls inward.",
  },
  {
    id: "Elegant",
    labelZh: "優雅",
    labelEn: "Elegant",
    previewHintZh:
      "低飽和、略提亮，克制高級灰；構圖偏上、略收。",
    previewHintEn:
      "Low saturation, lifted mids, refined gray; composed and slightly tight.",
  },
  {
    id: "Playful",
    labelZh: "俏皮",
    labelEn: "Playful",
    previewHintZh:
      "色相旋轉＋高飽和，色塊更跳；構圖歪斜、略放大。",
    previewHintEn:
      "Hue twists + high saturation; playful skew and slight scale-up.",
  },
] as const;

export type StyleKeywordId = (typeof STYLE_KEYWORD_PRESETS)[number]["id"];

/** 畫布橫豎：以寬高關係決定（豎排＝高≥寬；橫排＝寬≥高）；正方形兩者結果相同 */
export type CanvasOrientation = "portrait" | "landscape";

export const CANVAS_PRESETS = [
  {
    id: "a4",
    labelZh: "A4（210×297mm）",
    labelEn: "A4 (210×297 mm)",
    width: 794,
    height: 1123,
    defaultOrientation: "portrait" as const,
  },
  {
    id: "letter",
    labelZh: "Letter（8.5×11）",
    labelEn: "US Letter (8.5×11)",
    width: 816,
    height: 1056,
    defaultOrientation: "portrait" as const,
  },
  {
    id: "square",
    labelZh: "正方形 1080",
    labelEn: "Square 1080",
    width: 1080,
    height: 1080,
    defaultOrientation: "portrait" as const,
  },
  {
    id: "deck",
    labelZh: "16:9 簡報",
    labelEn: "16:9 deck",
    width: 1920,
    height: 1080,
    defaultOrientation: "landscape" as const,
  },
] as const;

/** 依預設基準尺寸與橫豎，得到實際畫布像素寬高（供預覽與網格示意） */
export function resolveCanvasDimensions(
  preset: (typeof CANVAS_PRESETS)[number],
  orientation: CanvasOrientation,
): { width: number; height: number } {
  const { width: bw, height: bh } = preset;
  if (bw === bh) return { width: bw, height: bh };
  const long = Math.max(bw, bh);
  const short = Math.min(bw, bh);
  return orientation === "landscape"
    ? { width: long, height: short }
    : { width: short, height: long };
}

/** text：向量 SVG 正文預設字色；三版本會在 text / accent / muted 間切換 */
export const PALETTES = [
  {
    id: "mono",
    nameZh: "墨岩",
    nameEn: "Mono Slate",
    accent: "#0f172a",
    muted: "#64748b",
    text: "#0f172a",
  },
  {
    id: "ocean",
    nameZh: "深海",
    nameEn: "Ocean",
    accent: "#0ea5e9",
    muted: "#0369a1",
    text: "#0c4a6e",
  },
  {
    id: "clay",
    nameZh: "陶土",
    nameEn: "Clay",
    accent: "#c2410c",
    muted: "#9a3412",
    text: "#431407",
  },
  {
    id: "vine",
    nameZh: "藤綠",
    nameEn: "Vine",
    accent: "#15803d",
    muted: "#166534",
    text: "#14532d",
  },
  {
    id: "wine",
    nameZh: "酒紅",
    nameEn: "Wine",
    accent: "#9f1239",
    muted: "#881337",
    text: "#500724",
  },
] as const;

export const FONT_STYLES = [
  {
    id: "neo",
    labelZh: "Neo 無襯線",
    labelEn: "Neo grotesque",
    hintZh: "Helvetica / Inter 系",
    hintEn: "Helvetica / Inter family",
  },
  {
    id: "humanist",
    labelZh: "人文無襯線",
    labelEn: "Humanist",
    hintZh: "更柔和易讀",
    hintEn: "Softer, readable",
  },
  {
    id: "serif",
    labelZh: "編輯襯線",
    labelEn: "Serif editorial",
    hintZh: "編輯感襯線",
    hintEn: "Editorial serif tone",
  },
  {
    id: "mono",
    labelZh: "等寬技術",
    labelEn: "Mono technical",
    hintZh: "技術文件感",
    hintEn: "Technical / docs feel",
  },
] as const;

export const NARRATIVES = [
  {
    id: "logic",
    labelZh: "工作邏輯順序",
    labelEn: "Work logic order",
    descZh: "能力 → 流程 → 案例",
    descEn: "Skills → process → case studies",
  },
  {
    id: "story",
    labelZh: "故事線",
    labelEn: "Story arc",
    descZh: "時間線／個人敘事",
    descEn: "Timeline / personal narrative",
  },
  {
    id: "project",
    labelZh: "依專案類型",
    labelEn: "By project type",
    descZh: "品牌／數位／印刷分組",
    descEn: "Brand / digital / print groups",
  },
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
  {
    id: "1x2",
    labelZh: "1×2 橫向分割",
    labelEn: "1×2 horizontal split",
    hintZh: "上下兩區塊：三版本分別為原序、反轉、隨機。適合橫幅式作品。",
    hintEn:
      "Two rows: original, reversed, and shuffled. Good for landscape-format works.",
    cols: 1,
    rows: 2,
  },
  {
    id: "2x1",
    labelZh: "2×1 垂直分割",
    labelEn: "2×1 vertical split",
    hintZh: "左右兩區塊：三版本分別為原序、反轉、隨機。適合對比式排版。",
    hintEn:
      "Two columns: original, reversed, and shuffled. Good for side-by-side comparison layouts.",
    cols: 2,
    rows: 1,
  },
] as const;

/** 快速風格預設：一鍵套用風格 + 色系 + 網格組合 */
export const QUICK_STYLE_PRESETS = [
  {
    id: "professional",
    labelZh: "專業商務",
    labelEn: "Professional",
    descZh: "簡約 + 墨岩 + 無網格 — 乾淨的商務呈現",
    descEn: "Minimal + Mono + No grid — clean business look",
    styleKeyword: "Minimal" as StyleKeywordId,
    paletteId: "mono",
    gridPresetId: "off",
  },
  {
    id: "creative",
    labelZh: "創意展示",
    labelEn: "Creative showcase",
    descZh: "粗獷 + 陶土 + 2×2 網格 — 活力視覺衝擊",
    descEn: "Bold + Clay + 2×2 grid — vibrant visual impact",
    styleKeyword: "Bold" as StyleKeywordId,
    paletteId: "clay",
    gridPresetId: "2x2",
  },
  {
    id: "editorial",
    labelZh: "雜誌編排",
    labelEn: "Editorial",
    descZh: "優雅 + 深海 + 3×2 網格 — 精緻雜誌風",
    descEn: "Elegant + Ocean + 3×2 grid — refined magazine feel",
    styleKeyword: "Elegant" as StyleKeywordId,
    paletteId: "ocean",
    gridPresetId: "3x2",
  },
  {
    id: "storytelling",
    labelZh: "敘事型",
    labelEn: "Storytelling",
    descZh: "復古 + 藤綠 + 無網格 — 溫暖的故事感",
    descEn: "Vintage + Vine + No grid — warm storytelling vibe",
    styleKeyword: "Vintage" as StyleKeywordId,
    paletteId: "vine",
    gridPresetId: "off",
  },
  {
    id: "techforward",
    labelZh: "科技前衛",
    labelEn: "Tech-forward",
    descZh: "未來感 + 深海 + 3×3 網格 — 數位科技風",
    descEn: "Futuristic + Ocean + 3×3 grid — digital tech aesthetic",
    styleKeyword: "Futuristic" as StyleKeywordId,
    paletteId: "ocean",
    gridPresetId: "3x3",
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
  canvasOrientation: CanvasOrientation;
  fontStyleId: (typeof FONT_STYLES)[number]["id"];
  narrativeId: (typeof NARRATIVES)[number]["id"];
  /** 生成想法 / 給 AI 的簡述（示範：影響頁序關鍵詞與後端提示） */
  userBrief: string;
  gridPresetId: (typeof GRID_PRESETS)[number]["id"];
  /**
   * 文稿主要書寫系統：null 表示跟隨自動偵測；非 null 為使用者手動指定。
   */
  contentScriptOverride: ContentScriptId | null;
  /** 瀏覽第 i 步對應的原始頁索引；空陣列表示尚未套用敘事排序 */
  orderedSourceIndices: number[];
  currentPageIndex: number;
  /** 每頁選中的版本 0–2，未選為 null */
  selectionByPage: Record<number, number | null>;
  /** 選定後寫入的 SVG（示範用 mock） */
  finalizedPageSvgs: string[];
  /** 網格重排後各頁 mosaic 區塊的手動位移（viewBox 單位），鍵為精靈頁序索引 */
  gridTileNudgeByPage: Record<number, GridTileNudges>;
  setStep: (s: WizardStep) => void;
  /** 向量檔；PDF 請用 setPdfImport */
  setFile: (
    name: string,
    content: string | null,
    isPdf: boolean,
    pdfPageSvgs?: string[],
  ) => void;
  /** 一次選多個 .svg：依檔名排序後合併為多頁（單檔內多個根級 svg 仍會拆頁） */
  setSvgBulkFiles: (files: { name: string; content: string }[]) => void;
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
        | "canvasOrientation"
        | "fontStyleId"
        | "narrativeId"
        | "userBrief"
        | "gridPresetId"
        | "contentScriptOverride"
      >
    >,
  ) => void;
  setOrderedSourceIndices: (indices: number[]) => void;
  setPageSvgs: (pages: string[]) => void;
  /** 更新向量 SVG 全文與分頁，不清空已選版本（示範頁拖動文字用） */
  patchSourceSvg: (raw: string) => void;
  setCurrentPageIndex: (i: number) => void;
  selectVariant: (pageIndex: number, variantIndex: number, svg: string) => void;
  accumulateGridTileNudge: (
    pageIndex: number,
    tileIndex: number,
    ddx: number,
    ddy: number,
  ) => void;
  clearGridTileNudgesForPage: (pageIndex: number) => void;
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
  canvasOrientation: "portrait" as CanvasOrientation,
  fontStyleId: "neo" as const,
  narrativeId: "logic" as const,
  userBrief: "",
  gridPresetId: "off" as const,
  contentScriptOverride: null as ContentScriptId | null,
  orderedSourceIndices: [] as number[],
  currentPageIndex: 0,
  selectionByPage: {} as Record<number, number | null>,
  finalizedPageSvgs: [] as string[],
  gridTileNudgeByPage: {} as Record<number, GridTileNudges>,
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
        gridTileNudgeByPage: {},
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
        gridTileNudgeByPage: {},
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
      gridTileNudgeByPage: {},
      currentPageIndex: 0,
      orderedSourceIndices: [],
    });
  },
  setSvgBulkFiles: (files) => {
    if (!files.length) return;
    const sorted = [...files].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );
    const allPageStrings: string[] = [];
    for (const f of sorted) {
      const splits = splitSvgPages(f.content);
      allPageStrings.push(...splits);
    }
    if (!allPageStrings.length) return;
    const layers = allPageStrings.map((p) => parseSvgPageLayer(p));
    const svgPageLayers = layers.some((l) => l.texts.length > 0)
      ? layers
      : null;
    const fileCount = sorted.length;
    const pageCount = allPageStrings.length;
    const displayName =
      fileCount === 1 && pageCount === 1
        ? sorted[0]!.name
        : `${sorted[0]!.name} · ${pageCount} 頁（${fileCount} 檔）`;
    set({
      fileName: displayName,
      originalSvg: allPageStrings.join("\n"),
      isPdf: false,
      pdfPagesData: null,
      svgPageLayers,
      pageSvgs: rebuildAllSvgPages(layers),
      selectionByPage: {},
      finalizedPageSvgs: [],
      gridTileNudgeByPage: {},
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
      gridTileNudgeByPage: {},
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
    const gn = { ...get().gridTileNudgeByPage };
    delete gn[pageIndex];
    set({
      pdfPagesData: next,
      pageSvgs: rebuildAllPdfSvgs(next),
      selectionByPage: { ...get().selectionByPage, [pageIndex]: null },
      finalizedPageSvgs: finalized,
      gridTileNudgeByPage: gn,
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
    const gn = { ...get().gridTileNudgeByPage };
    delete gn[pageIndex];
    set({
      svgPageLayers: next,
      pageSvgs: rebuildAllSvgPages(next),
      selectionByPage: { ...get().selectionByPage, [pageIndex]: null },
      finalizedPageSvgs: finalized,
      gridTileNudgeByPage: gn,
    });
  },
  setOptions: (o) =>
    set((s) => {
      const next = { ...s, ...o };
      if (o.gridPresetId != null && o.gridPresetId !== s.gridPresetId) {
        next.gridTileNudgeByPage = {};
      }
      return next;
    }),
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
      gridTileNudgeByPage: {},
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
    const gn = { ...get().gridTileNudgeByPage };
    delete gn[pageIndex];
    set({
      selectionByPage: { ...get().selectionByPage, [pageIndex]: variantIndex },
      finalizedPageSvgs: finalized,
      gridTileNudgeByPage: gn,
    });
  },
  accumulateGridTileNudge: (pageIndex, tileIndex, ddx, ddy) => {
    const sx = Number.isFinite(ddx) ? ddx : 0;
    const sy = Number.isFinite(ddy) ? ddy : 0;
    if (sx === 0 && sy === 0) return;
    set((s) => {
      const page = s.gridTileNudgeByPage[pageIndex] ?? {};
      const prev = page[tileIndex] ?? { dx: 0, dy: 0 };
      return {
        gridTileNudgeByPage: {
          ...s.gridTileNudgeByPage,
          [pageIndex]: {
            ...page,
            [tileIndex]: { dx: prev.dx + sx, dy: prev.dy + sy },
          },
        },
      };
    });
  },
  clearGridTileNudgesForPage: (pageIndex) =>
    set((s) => {
      const next = { ...s.gridTileNudgeByPage };
      delete next[pageIndex];
      return { gridTileNudgeByPage: next };
    }),
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
