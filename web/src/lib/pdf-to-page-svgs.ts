/**
 * 瀏覽器端將 PDF 每頁光栅化後包成 SVG（<image href="data:..."/>），
 * 以便沿用現有預覽 / 三版本 / WebGL 紋理管線。向量文字編輯需後續 OCR/向量化。
 */

const DEFAULT_MAX_PAGES = 48;
const DEFAULT_SCALE = 2;

export type PdfToSvgsOptions = {
  maxPages?: number;
  /** 渲染倍率，越大越清晰但越耗記憶體 */
  scale?: number;
};

export async function pdfFileToPageSvgStrings(
  file: File,
  options?: PdfToSvgsOptions,
): Promise<string[]> {
  if (typeof window === "undefined") {
    throw new Error("pdfFileToPageSvgStrings 僅能在瀏覽器執行");
  }

  const maxPages = options?.maxPages ?? DEFAULT_MAX_PAGES;
  const scale = options?.scale ?? DEFAULT_SCALE;

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const n = Math.min(pdf.numPages, maxPages);
  const out: string[] = [];

  for (let i = 1; i <= n; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("無法建立 Canvas 2D 上下文");

    const w = Math.floor(viewport.width);
    const h = Math.floor(viewport.height);
    canvas.width = w;
    canvas.height = h;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const dataUrl = canvas.toDataURL("image/png", 0.92);
    out.push(
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><image width="${w}" height="${h}" href="${dataUrl}" /></svg>`,
    );
  }

  if (pdf.numPages > maxPages) {
    console.warn(
      `[Portfolio ReStyle AI] PDF 共 ${pdf.numPages} 頁，已截取前 ${maxPages} 頁`,
    );
  }

  return out;
}
