/**
 * 以網格切分畫布，將各區塊依版本置換排列（單一 <symbol> + 多 <use>，避免重複內嵌點陣 data URL）。
 */

export type GridRemixOpts = {
  cols: number;
  rows: number;
  pageIndex: number;
  variantIndex: number;
};

export function applyGridRemix(pageSvg: string, opts: GridRemixOpts | null): string {
  if (!opts || opts.cols < 2 || opts.rows < 2) return pageSvg;

  const parsed = parseSvgRoot(pageSvg);
  if (!parsed) return pageSvg;

  const { vbX, vbY, vbW, vbH, openAttrs, inner } = parsed;
  if (vbW <= 0 || vbH <= 0) return pageSvg;

  const cols = opts.cols;
  const rows = opts.rows;
  const cw = vbW / cols;
  const ch = vbH / rows;
  const n = cols * rows;

  const perm = permutationForVariant(cols, rows, opts.pageIndex, opts.variantIndex);
  const symId = `pr-grid-sym-p${opts.pageIndex}-v${opts.variantIndex}`;
  const ns = pickXmlns(openAttrs, inner);
  const rootAttrs = ensureViewBoxAttrs(stripXmlnsDecl(openAttrs), vbX, vbY, vbW, vbH);

  const clipDefs: string[] = [];
  const mosaic: string[] = [];

  for (let dest = 0; dest < n; dest++) {
    const src = perm[dest] ?? dest;
    const srcCol = src % cols;
    const srcRow = Math.floor(src / cols);
    const destCol = dest % cols;
    const destRow = Math.floor(dest / cols);
    const sx = vbX + srcCol * cw;
    const sy = vbY + srcRow * ch;
    const dx = vbX + destCol * cw;
    const dy = vbY + destRow * ch;
    const clipId = `pr-grid-clip-p${opts.pageIndex}-v${opts.variantIndex}-d${dest}`;
    clipDefs.push(
      `<clipPath id="${clipId}"><rect x="${fmt(dx)}" y="${fmt(dy)}" width="${fmt(cw)}" height="${fmt(ch)}"/></clipPath>`,
    );
    mosaic.push(
      `<g clip-path="url(#${clipId})"><use href="#${symId}" x="0" y="0" width="${fmt(vbW)}" height="${fmt(vbH)}" transform="translate(${fmt(dx - sx)},${fmt(dy - sy)})"/></g>`,
    );
  }

  return `<svg${rootAttrs} xmlns="${ns}">
  <defs>
    <symbol id="${symId}" viewBox="${fmt(vbX)} ${fmt(vbY)} ${fmt(vbW)} ${fmt(vbH)}">
${inner}
    </symbol>
    ${clipDefs.join("\n    ")}
  </defs>
  <g class="pr-grid-mosaic" data-pr-grid="${cols}x${rows}">
    ${mosaic.join("\n    ")}
  </g>
</svg>`;
}

function fmt(n: number): string {
  const s = n.toFixed(4);
  return s.replace(/\.?0+$/, "") || "0";
}

function stripXmlnsDecl(attrs: string): string {
  return attrs
    .replace(/\s+xmlns\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\s+xmlns:[a-z]+\s*=\s*["'][^"']*["']/gi, "");
}

function pickXmlns(openAttrs: string, inner: string): string {
  const m = openAttrs.match(/\bxmlns\s*=\s*["']([^"']+)["']/i);
  if (m?.[1]) return m[1];
  return inner.includes("xmlns=")
    ? "http://www.w3.org/2000/svg"
    : "http://www.w3.org/2000/svg";
}

function ensureViewBoxAttrs(
  openAttrs: string,
  x: number,
  y: number,
  w: number,
  h: number,
): string {
  let a = openAttrs.replace(/\s+width\s*=\s*["'][^"']*["']/gi, "");
  a = a.replace(/\s+height\s*=\s*["'][^"']*["']/gi, "");
  if (/\bviewBox\s*=/i.test(a)) {
    return a;
  }
  return `${a} viewBox="${fmt(x)} ${fmt(y)} ${fmt(w)} ${fmt(h)}"`;
}

type ParsedSvg = {
  openAttrs: string;
  inner: string;
  vbX: number;
  vbY: number;
  vbW: number;
  vbH: number;
};

function parseSvgRoot(svg: string): ParsedSvg | null {
  const t = svg.replace(/<\?xml[^?]*\?>/i, "").trim();
  const m = t.match(/^<svg\b([^>]*)>([\s\S]*)<\/svg>$/i);
  if (!m) return null;
  const openAttrs = m[1] ?? "";
  const inner = (m[2] ?? "").trim();

  const vb = openAttrs.match(
    /viewBox\s*=\s*["']\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*["']/i,
  );
  if (vb) {
    const vbX = parseFloat(vb[1]!);
    const vbY = parseFloat(vb[2]!);
    const vbW = parseFloat(vb[3]!);
    const vbH = parseFloat(vb[4]!);
    return { openAttrs, inner, vbX, vbY, vbW, vbH };
  }

  const wM = openAttrs.match(/\bwidth\s*=\s*["']([^"']+)["']/i);
  const hM = openAttrs.match(/\bheight\s*=\s*["']([^"']+)["']/i);
  if (wM && hM) {
    const vbW = parseSvgLength(wM[1]!);
    const vbH = parseSvgLength(hM[1]!);
    if (vbW > 0 && vbH > 0) {
      return { openAttrs, inner, vbX: 0, vbY: 0, vbW, vbH };
    }
  }

  return null;
}

function parseSvgLength(raw: string): number {
  const s = raw.trim().replace(/px$/i, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function permutationForVariant(
  cols: number,
  rows: number,
  pageIndex: number,
  variantIndex: number,
): number[] {
  const n = cols * rows;
  const base = Array.from({ length: n }, (_, i) => i);
  if (variantIndex === 0) return base;
  if (variantIndex === 1) return [...base].reverse();
  const seed = pageIndex * 7919 + variantIndex * 104729 + cols * 17 + rows * 31;
  return seededShuffle(base, seed);
}

function seededShuffle(indices: number[], seed: number): number[] {
  const a = [...indices];
  let s = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}
