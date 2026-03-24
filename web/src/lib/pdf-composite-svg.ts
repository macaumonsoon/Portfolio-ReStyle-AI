import type { PdfPageLayer } from "@/lib/pdf-page-types";
import { PDF_OVERLAY_FONTS } from "@/lib/pdf-page-types";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 底圖 + 白塊遮原字 + 向量文字覆蓋 */
export function buildPdfCompositeSvg(page: PdfPageLayer): string {
  const { width: w, height: h, imageDataUrl, texts } = page;
  const pad = 3;

  const masks = texts
    .map((t) => {
      const cx = t.x - pad;
      const cy = t.y - t.fontSize - pad;
      const rw = t.width + pad * 2;
      const rh = t.height + pad * 2;
      return `<rect x="${cx.toFixed(2)}" y="${cy.toFixed(2)}" width="${rw.toFixed(2)}" height="${rh.toFixed(2)}" fill="#ffffff" fill-opacity="0.97"/>`;
    })
    .join("");

  const textEls = texts
    .filter((t) => t.content.trim().length > 0)
    .map((t) => {
      const ff = PDF_OVERLAY_FONTS[t.fontKey];
      const deg = (t.rotation * 180) / Math.PI;
      const inner = escapeXml(t.content);
      const tr =
        Math.abs(deg) < 0.5
          ? ""
          : ` transform="rotate(${deg.toFixed(2)} ${t.x.toFixed(2)} ${t.y.toFixed(2)})"`;
      return `<text x="${t.x.toFixed(2)}" y="${t.y.toFixed(2)}" font-family="${ff}" font-size="${t.fontSize.toFixed(2)}" fill="#0f172a"${tr}>${inner}</text>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<image width="${w}" height="${h}" href="${imageDataUrl}"/>
<g class="pr-pdf-mask">${masks}</g>
<g class="pr-pdf-overlay">${textEls}</g>
</svg>`;
}

export function rebuildAllPdfSvgs(pages: PdfPageLayer[]): string[] {
  return pages.map(buildPdfCompositeSvg);
}
