/**
 * 將多頁成品 SVG 合併為單一 PDF（瀏覽器端）。
 * 優先光栅化；失敗或 addImage 失敗時以 svg2pdf 的 **svg2pdf()** 直接寫矢量（不依賴 prototype.svg，避免 Webpack 雙份 jspdf）。
 */

import type { jsPDF } from "jspdf";
import {
  parseSvgDimensions,
  rasterizeSvgToCanvas,
  stripSvgFilterElements,
} from "@/lib/svg-rasterize";

export type BuildPdfFromSvgsOptions = {
  maxSide?: number;
  maxDpr?: number;
};

function hasXmlParseError(parsed: Document): boolean {
  const root = parsed.documentElement;
  if (!root) return true;
  if (root.nodeName === "parsererror") return true;
  if (parsed.getElementsByTagName("parsererror").length > 0) return true;
  return false;
}

async function appendSvgVectorPage(
  doc: jsPDF | null,
  svg: string,
  JsPDF: typeof import("jspdf").jsPDF,
  svg2pdf: (
    element: Element,
    pdf: jsPDF,
    options?: { x?: number; y?: number; width?: number; height?: number },
  ) => Promise<jsPDF>,
): Promise<jsPDF | null> {
  const { w, h } = parseSvgDimensions(svg);
  const orient = w >= h ? "landscape" : "portrait";

  const parser = new DOMParser();
  const parsed = parser.parseFromString(svg, "image/svg+xml");
  if (hasXmlParseError(parsed)) return null;
  const root = parsed.documentElement;
  if (!root || root.nodeName.toLowerCase() !== "svg") return null;

  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:-99999px;top:0;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none";
  document.body.appendChild(host);
  host.appendChild(document.importNode(root, true));
  const svgEl = host.querySelector("svg");
  if (!svgEl) {
    host.remove();
    return null;
  }

  try {
    let pdf = doc;
    if (!pdf) {
      pdf = new JsPDF({
        unit: "pt",
        format: [w, h],
        orientation: orient,
        compress: true,
      });
    } else {
      pdf.addPage([w, h], orient);
    }

    await svg2pdf(svgEl, pdf, { x: 0, y: 0, width: w, height: h });
    return pdf;
  } catch {
    return null;
  } finally {
    host.remove();
  }
}

export async function buildPdfFromFinalizedSvgs(
  svgs: (string | null | undefined)[],
  options?: BuildPdfFromSvgsOptions,
): Promise<Blob | null> {
  if (typeof window === "undefined") return null;

  const pages = svgs.filter((s): s is string => Boolean(s?.trim()));
  if (!pages.length) return null;

  const [{ jsPDF: JsPDF }, { svg2pdf }] = await Promise.all([
    import("jspdf"),
    import("svg2pdf.js"),
  ]);

  const maxSide = options?.maxSide ?? 2400;
  const maxDpr = options?.maxDpr ?? 2;

  let doc: jsPDF | null = null;

  for (const svg of pages) {
    const { w, h } = parseSvgDimensions(svg);
    const orient = w >= h ? "landscape" : "portrait";

    const canvas = await rasterizeSvgToCanvas(svg, {
      maxSide,
      maxDpr,
      retryWithoutPrFilter: true,
    });

    let rasterOk = false;
    if (canvas) {
      const docBeforeRaster: jsPDF | null = doc;
      try {
        if (!doc) {
          doc = new JsPDF({
            unit: "pt",
            format: [w, h],
            orientation: orient,
            compress: true,
          });
        } else {
          doc.addPage([w, h], orient);
        }
        doc.addImage(canvas, "PNG", 0, 0, w, h, undefined, "FAST");
        rasterOk = true;
      } catch {
        doc = docBeforeRaster;
      }
    }

    if (rasterOk) continue;

    let next = await appendSvgVectorPage(doc, svg, JsPDF, svg2pdf);
    if (!next) {
      const simp = stripSvgFilterElements(svg);
      if (simp !== svg) {
        next = await appendSvgVectorPage(doc, simp, JsPDF, svg2pdf);
      }
    }
    if (next) {
      doc = next;
      continue;
    }
  }

  if (!doc) return null;
  return doc.output("blob");
}
