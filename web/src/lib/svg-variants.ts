import type { ProjectState } from "@/store/use-project-store";
import { GRID_PRESETS, PALETTES } from "@/store/use-project-store";
import { applyGridRemix } from "@/lib/grid-remix";

export type CompareMode = "both" | "color" | "layout";

const VARIANT_LAYOUT = [
  { tx: 14, ty: 10, s: 0.96 },
  { tx: 6, ty: 22, s: 0.94 },
  { tx: 18, ty: 6, s: 0.95 },
] as const;

export type BuildVariantsOptions = {
  /** PDF 轉頁為點陣內嵌時，使用強烈雙色調 / 色相重塑 */
  isPdfRaster?: boolean;
};

/**
 * 示範用：在保留原始 markup 的前提下包一層 <g>，做輕量位移縮放；
 * 向量 SVG 用輕量 hue；PDF 點陣頁用強烈著色（雙色調 + 大角度色相）。
 */
export function buildThreeVariants(
  pageSvg: string,
  pageIndex: number,
  ctx: Pick<
    ProjectState,
    "styleKeyword" | "paletteId" | "fontStyleId" | "narrativeId" | "gridPresetId"
  >,
  options?: BuildVariantsOptions,
): [string, string, string] {
  const palette = PALETTES.find((p) => p.id === ctx.paletteId) ?? PALETTES[0];
  const styleBoost =
    ctx.styleKeyword === "Bold"
      ? 1.08
      : ctx.styleKeyword === "Minimal"
        ? 0.98
        : 1;

  const isPdfRaster =
    options?.isPdfRaster === true ||
    isLikelyRasterOnlyPageSvg(pageSvg);

  const gridPreset =
    GRID_PRESETS.find((g) => g.id === ctx.gridPresetId) ?? GRID_PRESETS[0];
  const gridOn =
    gridPreset.cols > 0 &&
    gridPreset.rows > 0;

  return [0, 1, 2].map((i) => {
    const remixed = gridOn
      ? applyGridRemix(pageSvg, {
          cols: gridPreset.cols,
          rows: gridPreset.rows,
          pageIndex,
          variantIndex: i,
        })
      : pageSvg;
    return wrapVariant(remixed, {
      pageIndex,
      index: i as 0 | 1 | 2,
      accent: palette.accent,
      muted: palette.muted,
      text: palette.text,
      styleBoost,
      narrative: ctx.narrativeId,
      fontHint: ctx.fontStyleId,
      isPdfRaster,
    });
  }) as [string, string, string];
}

/** 未傳 isPdf 時，依內容推斷（單張 data:image 內嵌） */
function isLikelyRasterOnlyPageSvg(svg: string): boolean {
  const t = svg.replace(/\s+/g, " ");
  return /<image\b[^>]*href=["']data:image\//i.test(t);
}

type WrapOpts = {
  pageIndex: number;
  index: 0 | 1 | 2;
  accent: string;
  muted: string;
  text: string;
  styleBoost: number;
  narrative: string;
  fontHint: string;
  isPdfRaster: boolean;
};

/** 版本 0 用可讀正文色；1 用主色；2 用次要色 */
function variantTextFill(index: 0 | 1 | 2, o: Pick<WrapOpts, "text" | "accent" | "muted">): string {
  if (index === 0) return o.text;
  if (index === 1) return o.accent;
  return o.muted;
}

/** 向量 SVG：覆寫 text/tspan 的 fill；PDF 點陣頁字已在圖里，由濾鏡統一改色 */
function buildTextPaintCss(fill: string, isPdfRaster: boolean): string {
  if (isPdfRaster) {
    return "/* PDF 點陣頁：字體已栅格化，字色隨整圖濾鏡變化 */";
  }
  const f = fill.replace(/[^\w#.,()%\-]/g, "");
  return `
      .pr-content text:not([fill="none"]),
      .pr-content tspan:not([fill="none"]) {
        fill: ${f} !important;
      }`;
}

function wrapVariant(svg: string, opts: WrapOpts): string {
  const layout = VARIANT_LAYOUT[opts.index];
  const tx = layout.tx * opts.styleBoost;
  const ty = layout.ty * opts.styleBoost;
  const s = layout.s * (opts.index === 1 ? 0.99 : 1) * opts.styleBoost;

  const filterId = `pr-p${opts.pageIndex}-v${opts.index}`;
  const filterInner = opts.isPdfRaster
    ? buildPdfRasterFilter(opts.index, opts.accent, opts.muted)
    : buildVectorSoftFilter(opts.index);

  const textFill = variantTextFill(opts.index, opts);
  const textCss = buildTextPaintCss(textFill, opts.isPdfRaster);

  const withoutXml = stripXmlProlog(svg).trim();
  const injected = injectIntoSvg(withoutXml, (inner) => {
    return `
  <defs>
    <filter id="${filterId}" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
      ${filterInner}
    </filter>
    <style type="text/css"><![CDATA[
      .pr-root { --pr-accent: ${opts.accent}; --pr-muted: ${opts.muted}; --pr-text: ${opts.text}; }
      .pr-content { filter: url(#${filterId}); }
      .pr-meta { font-family: system-ui, sans-serif; }
      ${textCss}
    ]]></style>
  </defs>
  <g class="pr-root pr-meta" data-pr-variant="${opts.index}" data-pr-narrative="${opts.narrative}" data-pr-font="${opts.fontHint}" data-pr-pdf-raster="${opts.isPdfRaster}">
    <g class="pr-content" transform="translate(${tx}, ${ty}) scale(${s})">
      ${inner}
    </g>
  </g>`;
  });

  return injected;
}

/** 向量頁：微調色相與透明度 */
function buildVectorSoftFilter(index: 0 | 1 | 2): string {
  const hueShift = index === 0 ? 0 : index === 1 ? 12 : -8;
  return `
      <feColorMatrix type="hueRotate" values="${hueShift}" />
      <feColorMatrix type="matrix" values="
        1 0 0 0 0
        0 1 0 0 0
        0 0 1 0 0
        0 0 0 0.92 0" />`;
}

/**
 * PDF 點陣頁：強烈改色。
 * v0 主色雙色調、v1 次要色雙色調、v2 大角度色相 + 飽和對比。
 */
function buildPdfRasterFilter(
  index: 0 | 1 | 2,
  accent: string,
  muted: string,
): string {
  const a = escapeXmlAttr(accent);
  const m = escapeXmlAttr(muted);

  const gray = `
      <feColorMatrix in="SourceGraphic" type="matrix"
        values="0.2126 0.7152 0.0722 0 0
                0.2126 0.7152 0.0722 0 0
                0.2126 0.7152 0.0722 0 0
                0 0 0 1 0" result="prGray"/>`;

  if (index === 0) {
    return `
      ${gray}
      <feFlood flood-color="${a}" flood-opacity="0.62" result="prFlood"/>
      <feBlend in="prGray" in2="prFlood" mode="multiply" result="prDuotone"/>
      <feColorMatrix in="prDuotone" type="matrix" values="
        1.12 0 0 0 0.02
        0 1.08 0 0 0.02
        0 0 1.05 0 0.02
        0 0 0 1 0"/>`;
  }

  if (index === 1) {
    return `
      ${gray}
      <feFlood flood-color="${m}" flood-opacity="0.58" result="prFlood"/>
      <feBlend in="prGray" in2="prFlood" mode="multiply" result="prDuotone"/>
      <feColorMatrix in="prDuotone" type="hueRotate" values="28" result="prHue"/>
      <feColorMatrix in="prHue" type="matrix" values="
        1.05 0.08 0 0 0
        0.05 1.1 0.05 0 0
        0 0.08 1.08 0 0
        0 0 0 1 0"/>`;
  }

  return `
      <feColorMatrix in="SourceGraphic" type="hueRotate" values="198" result="prH"/>
      <feColorMatrix in="prH" type="matrix" values="
        1.35 0.12 0.08 0 -0.04
        0.1 1.25 0.1 0 -0.03
        0.08 0.12 1.3 0 -0.04
        0 0 0 1 0" result="prSat"/>
      <feComponentTransfer in="prSat" result="prOut">
        <feFuncR type="linear" slope="1.08" intercept="-0.03"/>
        <feFuncG type="linear" slope="1.08" intercept="-0.03"/>
        <feFuncB type="linear" slope="1.08" intercept="-0.03"/>
      </feComponentTransfer>`;
}

function escapeXmlAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function stripXmlProlog(s: string): string {
  return s.replace(/<\?xml[^?]*\?>/i, "").trim();
}

function injectIntoSvg(svgFragment: string, insert: (inner: string) => string): string {
  const m = svgFragment.match(/^<svg\b([^>]*)>([\s\S]*)<\/svg>$/i);
  if (!m) return `<!-- invalid svg --><svg xmlns="http://www.w3.org/2000/svg"></svg>`;
  const attrs = m[1];
  const inner = m[2];
  return `<svg${attrs}>${insert(inner)}</svg>`;
}
