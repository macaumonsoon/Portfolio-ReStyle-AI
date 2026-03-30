/**
 * 為網格重排後的 pr-grid-mosaic 區塊注入 translate，供使用者微調區塊位置（示範）。
 */

function fmt(n: number): string {
  const s = n.toFixed(3);
  return s.replace(/\.?0+$/, "") || "0";
}

export type GridTileNudges = Record<number, { dx: number; dy: number }>;

/** 從 SVG 字串解析 viewBox 四元組 */
export function parseViewBoxRect(svg: string): {
  x: number;
  y: number;
  w: number;
  h: number;
} {
  const vb = svg.match(
    /viewBox\s*=\s*["']\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*["']/i,
  );
  if (vb) {
    return {
      x: parseFloat(vb[1]!),
      y: parseFloat(vb[2]!),
      w: parseFloat(vb[3]!),
      h: parseFloat(vb[4]!),
    };
  }
  const wM = svg.match(/\bwidth\s*=\s*["']([\d.]+)/i);
  const hM = svg.match(/\bheight\s*=\s*["']([\d.]+)/i);
  const w = wM ? parseFloat(wM[1]!) : 800;
  const h = hM ? parseFloat(hM[1]!) : 600;
  return { x: 0, y: 0, w, h };
}

function findGridMosaicInnerSpan(svg: string): { start: number; end: number } | null {
  const m = svg.match(/<g\b[^>]*\bclass="pr-grid-mosaic"[^>]*>/i);
  if (!m || m.index === undefined) return null;
  const openEnd = svg.indexOf(">", m.index);
  if (openEnd === -1) return null;
  let depth = 1;
  let pos = openEnd + 1;
  while (pos < svg.length && depth > 0) {
    const nextOpen = svg.indexOf("<g", pos);
    const nextClose = svg.indexOf("</g>", pos);
    if (nextClose === -1) return null;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      pos = nextOpen + 2;
    } else {
      depth--;
      if (depth === 0) {
        return { start: openEnd + 1, end: nextClose };
      }
      pos = nextClose + 4;
    }
  }
  return null;
}

/**
 * 在 pr-grid-mosaic 內為每個頂層 clip 區塊包一層 translate（索引 0..n-1 與 grid-remix dest 順序一致）。
 */
export function injectGridMosaicNudges(
  svg: string,
  nudges: GridTileNudges,
): string {
  if (!svg.includes("pr-grid-mosaic")) return svg;
  const has = Object.values(nudges).some((n) => n && (n.dx !== 0 || n.dy !== 0));
  if (!has) return svg;

  const span = findGridMosaicInnerSpan(svg);
  if (!span) return svg;

  const inner = svg.slice(span.start, span.end);
  const re = /<g\s+clip-path="url\([^)]+\)">[\s\S]*?<\/g>/gi;
  const blocks = inner.match(re);
  if (!blocks?.length) return svg;

  const wrapped = blocks.map((block, i) => {
    const n = nudges[i] ?? { dx: 0, dy: 0 };
    const dx = Number.isFinite(n.dx) ? n.dx : 0;
    const dy = Number.isFinite(n.dy) ? n.dy : 0;
    if (dx === 0 && dy === 0) return block;
    return `<g transform="translate(${fmt(dx)},${fmt(dy)})">${block}</g>`;
  });

  const newInner = "\n    " + wrapped.join("\n    ") + "\n  ";
  return svg.slice(0, span.start) + newInner + svg.slice(span.end);
}
