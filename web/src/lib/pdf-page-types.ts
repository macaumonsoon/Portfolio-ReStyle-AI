export type PdfTextFontKey = "sans" | "serif" | "mono" | "display";

export type PdfEditableTextItem = {
  id: string;
  /** PDF 抽出原文 */
  sourceStr: string;
  /** 畫面上顯示與匯出用 */
  content: string;
  x: number;
  y: number;
  fontSize: number;
  width: number;
  height: number;
  rotation: number;
  fontKey: PdfTextFontKey;
  pdfFontName: string;
};

export type PdfPageLayer = {
  width: number;
  height: number;
  imageDataUrl: string;
  texts: PdfEditableTextItem[];
};

export const PDF_OVERLAY_FONTS: Record<PdfTextFontKey, string> = {
  sans: "Inter, ui-sans-serif, system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', Times, serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  display: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

export const PDF_FONT_OPTIONS: {
  id: PdfTextFontKey;
  labelZh: string;
  labelEn: string;
}[] = [
  { id: "sans", labelZh: "無襯線 Sans", labelEn: "Sans" },
  { id: "serif", labelZh: "襯線 Serif", labelEn: "Serif" },
  { id: "mono", labelZh: "等寬 Mono", labelEn: "Monospace" },
  { id: "display", labelZh: "展示 Display", labelEn: "Display" },
];

export function guessFontKey(pdfFontName: string): PdfTextFontKey {
  const n = pdfFontName.toLowerCase();
  if (/mono|courier|consolas|code/i.test(n)) return "mono";
  if (/serif|times|minion|garamond|song/i.test(n)) return "serif";
  if (/helvetica|arial|gothic|black/i.test(n)) return "display";
  return "sans";
}
