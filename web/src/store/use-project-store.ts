import { create } from "zustand";

export type WizardStep = "upload" | "options" | "pages" | "export";

export const STYLE_KEYWORDS = [
  "Bold",
  "Minimal",
  "Futuristic",
  "Narrative",
  "Vintage",
  "Elegant",
  "Playful",
] as const;

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

export type ProjectState = {
  step: WizardStep;
  fileName: string | null;
  /** 原始檔案內容（SVG 字串）；PDF 僅記錄檔名供 UI 提示 */
  originalSvg: string | null;
  isPdf: boolean;
  pageSvgs: string[];
  styleKeyword: (typeof STYLE_KEYWORDS)[number];
  paletteId: (typeof PALETTES)[number]["id"];
  canvasPresetId: (typeof CANVAS_PRESETS)[number]["id"];
  fontStyleId: (typeof FONT_STYLES)[number]["id"];
  narrativeId: (typeof NARRATIVES)[number]["id"];
  currentPageIndex: number;
  /** 每頁選中的版本 0–2，未選為 null */
  selectionByPage: Record<number, number | null>;
  /** 選定後寫入的 SVG（示範用 mock） */
  finalizedPageSvgs: string[];
  setStep: (s: WizardStep) => void;
  /** PDF 時傳入 pdfPageSvgs，由 pdf.js 轉好的每頁 SVG（內嵌點陣） */
  setFile: (
    name: string,
    content: string | null,
    isPdf: boolean,
    pdfPageSvgs?: string[],
  ) => void;
  setOptions: (o: Partial<Pick<ProjectState, "styleKeyword" | "paletteId" | "canvasPresetId" | "fontStyleId" | "narrativeId">>) => void;
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
  pageSvgs: [] as string[],
  styleKeyword: "Minimal" as const,
  paletteId: "mono" as const,
  canvasPresetId: "a4" as const,
  fontStyleId: "neo" as const,
  narrativeId: "logic" as const,
  currentPageIndex: 0,
  selectionByPage: {} as Record<number, number | null>,
  finalizedPageSvgs: [] as string[],
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  ...initial,
  setStep: (step) => set({ step }),
  setFile: (fileName, content, isPdf, pdfPageSvgs) => {
    const pageSvgs =
      pdfPageSvgs && pdfPageSvgs.length > 0
        ? pdfPageSvgs
        : content && !isPdf
          ? splitSvgPages(content)
          : [];
    set({
      fileName,
      originalSvg: content,
      isPdf,
      pageSvgs,
      selectionByPage: {},
      finalizedPageSvgs: [],
      currentPageIndex: 0,
    });
  },
  setOptions: (o) => set(o),
  setPageSvgs: (pageSvgs) => set({ pageSvgs }),
  patchSourceSvg: (raw) =>
    set({
      originalSvg: raw,
      pageSvgs: splitSvgPages(raw),
    }),
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
