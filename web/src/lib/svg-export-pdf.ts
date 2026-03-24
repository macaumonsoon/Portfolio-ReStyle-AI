/**
 * 將多頁成品 SVG 光栅化後合併為單一 PDF（瀏覽器端）。
 * 向量編輯請仍使用 SVG 匯出；PDF 適合分享與列印。
 */

import type { jsPDF } from "jspdf";
import { parseSvgDimensions, rasterizeSvgToCanvas } from "@/lib/svg-rasterize";

export type BuildPdfFromSvgsOptions = {
  maxSide?: number;
  maxDpr?: number;
};

export async function buildPdfFromFinalizedSvgs(
  svgs: (string | null | undefined)[],
  options?: BuildPdfFromSvgsOptions,
): Promise<Blob | null> {
  if (typeof window === "undefined") return null;

  const pages = svgs.filter((s): s is string => Boolean(s?.trim()));
  if (!pages.length) return null;

  const { jsPDF } = await import("jspdf");
  const maxSide = options?.maxSide ?? 2400;
  const maxDpr = options?.maxDpr ?? 2;

  let doc: jsPDF | null = null;

  for (const svg of pages) {
    const { w, h } = parseSvgDimensions(svg);
    const canvas = await rasterizeSvgToCanvas(svg, { maxSide, maxDpr });
    if (!canvas) continue;

    const orient = w >= h ? "landscape" : "portrait";
    if (!doc) {
      doc = new jsPDF({
        unit: "pt",
        format: [w, h],
        orientation: orient,
        compress: true,
      });
    } else {
      doc.addPage([w, h], orient);
    }

    doc.addImage(canvas, "PNG", 0, 0, w, h, undefined, "FAST");
  }

  if (!doc) return null;
  return doc.output("blob");
}
