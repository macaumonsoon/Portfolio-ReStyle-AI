/**
 * 解析 SVG 中的 <text>，注入 data-pr-svid 供編輯後序列化回寫。
 * 僅在瀏覽器使用（依賴 DOMParser）。
 */

import type { PdfTextFontKey } from "@/lib/pdf-page-types";
import { PDF_OVERLAY_FONTS, guessFontKey } from "@/lib/pdf-page-types";

export type SvgEditableTextItem = {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  /** 原始 font-family，僅展示 */
  sourceFontFamily: string;
  fontKey: PdfTextFontKey;
};

export type SvgPageLayer = {
  /** 已含 data-pr-svid 的 SVG 字串（單頁根節點） */
  markup: string;
  texts: SvgEditableTextItem[];
};

function readFontSize(el: Element): number {
  const fs = el.getAttribute("font-size");
  if (fs) {
    const n = parseFloat(fs.replace(/px$/i, ""));
    if (!Number.isNaN(n) && n > 0) return n;
  }
  const style = el.getAttribute("style") ?? "";
  const m = style.match(/font-size\s*:\s*([\d.]+)\s*(px)?/i);
  if (m) {
    const n = parseFloat(m[1]);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return 16;
}

function readFontFamily(el: Element): string {
  const ff = el.getAttribute("font-family");
  if (ff) return ff.replace(/^["']|["']$/g, "").trim();
  const style = el.getAttribute("style") ?? "";
  const m = style.match(/font-family\s*:\s*([^;]+)/i);
  return m ? m[1].replace(/^["']|["']$/g, "").trim() : "";
}

function setTextNodeContent(el: Element, doc: Document, content: string) {
  while (el.firstChild) el.removeChild(el.firstChild);
  el.appendChild(doc.createTextNode(content));
}

/** 單頁 SVG 字串 → 可編輯層；解析失敗則 texts 為空、markup 沿用原字串 */
export function parseSvgPageLayer(svgPage: string): SvgPageLayer {
  if (typeof window === "undefined") {
    return { markup: svgPage, texts: [] };
  }
  try {
    const doc = new DOMParser().parseFromString(svgPage, "image/svg+xml");
    const err = doc.querySelector("parsererror");
    if (err) return { markup: svgPage, texts: [] };

    const root = doc.documentElement;
    if (!root || root.tagName.toLowerCase() !== "svg") {
      return { markup: svgPage, texts: [] };
    }

    const nodes = root.querySelectorAll("text");
    const items: SvgEditableTextItem[] = [];
    let idx = 0;

    nodes.forEach((node) => {
      const el = node as SVGTextElement;
      const id = `svgt-${idx}`;
      el.setAttribute("data-pr-svid", id);

      const x = parseFloat(el.getAttribute("x") || "0");
      const y = parseFloat(el.getAttribute("y") || "0");
      const fontSize = readFontSize(el);
      const sourceFontFamily = readFontFamily(el);
      const fontKey = guessFontKey(sourceFontFamily || "sans");

      items.push({
        id,
        content: el.textContent ?? "",
        x,
        y,
        fontSize,
        sourceFontFamily,
        fontKey,
      });
      idx += 1;
    });

    const markup = new XMLSerializer().serializeToString(root);
    return { markup, texts: items };
  } catch {
    return { markup: svgPage, texts: [] };
  }
}

export function serializeSvgPage(layer: SvgPageLayer): string {
  if (typeof window === "undefined") return layer.markup;
  try {
    const doc = new DOMParser().parseFromString(layer.markup, "image/svg+xml");
    const root = doc.documentElement;
    if (!root || root.tagName.toLowerCase() !== "svg") return layer.markup;

    for (const t of layer.texts) {
      const el = root.querySelector(`[data-pr-svid="${t.id}"]`);
      if (!el) continue;
      setTextNodeContent(el, doc, t.content);
      el.setAttribute("font-family", PDF_OVERLAY_FONTS[t.fontKey]);
      if (t.fontSize > 0) el.setAttribute("font-size", String(t.fontSize));
    }

    return new XMLSerializer().serializeToString(root);
  } catch {
    return layer.markup;
  }
}

export function rebuildAllSvgPages(layers: SvgPageLayer[]): string[] {
  return layers.map(serializeSvgPage);
}
