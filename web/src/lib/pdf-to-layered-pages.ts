/**
 * PDF → 每頁點陣底圖 + 可編輯文字層（座標來自 pdf.js getTextContent）
 */

import type { PdfEditableTextItem, PdfPageLayer } from "@/lib/pdf-page-types";
import { guessFontKey } from "@/lib/pdf-page-types";

const DEFAULT_MAX_PAGES = 48;
const DEFAULT_SCALE = 2;

type Options = { maxPages?: number; scale?: number };

function isTextLike(item: unknown): item is {
  str: string;
  transform: number[];
  width: number;
  fontName?: string;
} {
  if (typeof item !== "object" || item === null) return false;
  const o = item as Record<string, unknown>;
  return (
    typeof o.str === "string" &&
    Array.isArray(o.transform) &&
    o.transform.length >= 6 &&
    typeof o.width === "number"
  );
}

export async function pdfFileToLayeredPages(
  file: File,
  options?: Options,
): Promise<PdfPageLayer[]> {
  if (typeof window === "undefined") {
    throw new Error("pdfFileToLayeredPages 僅能在瀏覽器執行");
  }

  const maxPages = options?.maxPages ?? DEFAULT_MAX_PAGES;
  const scale = options?.scale ?? DEFAULT_SCALE;

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const n = Math.min(pdf.numPages, maxPages);
  const out: PdfPageLayer[] = [];

  for (let pi = 1; pi <= n; pi++) {
    const page = await pdf.getPage(pi);
    const viewport = page.getViewport({ scale });

    const w = Math.floor(viewport.width);
    const h = Math.floor(viewport.height);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("無法建立 Canvas 2D 上下文");
    canvas.width = w;
    canvas.height = h;
    await page.render({ canvasContext: ctx, viewport }).promise;
    const imageDataUrl = canvas.toDataURL("image/png", 0.92);

    const textContent = await page.getTextContent();
    const texts: PdfEditableTextItem[] = [];
    let ti = 0;

    for (const raw of textContent.items) {
      if (!isTextLike(raw)) continue;
      const s = raw.str.replace(/\u00a0/g, " ").trim();
      if (!s) continue;

      const tm = raw.transform;
      const [vx, vy] = viewport.convertToViewportPoint(tm[4], tm[5]);
      const th = Math.hypot(tm[2], tm[3]);
      const p0 = viewport.convertToViewportPoint(0, 0);
      const p1 = viewport.convertToViewportPoint(0, th);
      const fontSizePx = Math.max(6, Math.abs(p1[1] - p0[1]));

      const endX = viewport.convertToViewportPoint(tm[0] * raw.width + tm[4], tm[5]);
      const textWidthPx = Math.max(
        Math.abs(endX[0] - vx),
        s.length * fontSizePx * 0.45,
        fontSizePx * 0.5,
      );

      const rotation = Math.atan2(tm[1], tm[0]);
      const pdfName = raw.fontName ?? "";

      texts.push({
        id: `p${pi - 1}-t${ti++}`,
        sourceStr: s,
        content: s,
        x: vx,
        y: vy,
        fontSize: fontSizePx,
        width: textWidthPx,
        height: fontSizePx * 1.15,
        rotation,
        fontKey: guessFontKey(pdfName),
        pdfFontName: pdfName,
      });
    }

    out.push({ width: w, height: h, imageDataUrl, texts });
  }

  if (pdf.numPages > maxPages) {
    console.warn(
      `[Portfolio ReStyle AI] PDF 共 ${pdf.numPages} 頁，已截取前 ${maxPages} 頁`,
    );
  }

  return out;
}
