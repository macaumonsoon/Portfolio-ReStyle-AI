import type { ProjectState, StyleKeywordId } from "@/store/use-project-store";

/** PDF 點陣頁：依風格微調雙色調強度與色相（與向量頁語意對齊） */
function pdfStyleHueBase(keyword: StyleKeywordId): number {
  const map: Record<StyleKeywordId, number> = {
    Vintage: 8,
    Minimal: -6,
    Futuristic: 52,
    Bold: 4,
    Narrative: -2,
    Elegant: -4,
    Playful: 28,
  };
  return map[keyword];
}
import { GRID_PRESETS, PALETTES } from "@/store/use-project-store";
import { applyGridRemix } from "@/lib/grid-remix";

export type CompareMode = "both" | "color" | "layout";

const VARIANT_LAYOUT = [
  { tx: 14, ty: 10, s: 0.96 },
  { tx: 6, ty: 22, s: 0.94 },
  { tx: 18, ty: 6, s: 0.95 },
] as const;

/**
 * 風格關鍵詞：版面位移/縮放（與濾鏡疊加，切換關鍵詞時構圖感明顯不同）
 */
function styleKeywordNudge(keyword: StyleKeywordId): { tx: number; ty: number; scaleMul: number } {
  const map: Record<StyleKeywordId, { tx: number; ty: number; scaleMul: number }> = {
    Bold: { tx: 8, ty: 6, scaleMul: 1.045 },
    Minimal: { tx: -14, ty: -16, scaleMul: 0.91 },
    Futuristic: { tx: -18, ty: 20, scaleMul: 1.03 },
    Narrative: { tx: 4, ty: 24, scaleMul: 0.965 },
    Vintage: { tx: 14, ty: 12, scaleMul: 0.93 },
    Elegant: { tx: -10, ty: 14, scaleMul: 0.94 },
    Playful: { tx: 28, ty: -26, scaleMul: 1.055 },
  };
  return map[keyword];
}

function styleKeywordBoost(keyword: StyleKeywordId): number {
  const map: Record<StyleKeywordId, number> = {
    Bold: 1.08,
    Minimal: 0.9,
    Futuristic: 1.04,
    Narrative: 1.0,
    Vintage: 0.94,
    Elegant: 0.95,
    Playful: 1.07,
  };
  return map[keyword];
}

export type BuildVariantsOptions = {
  /** PDF 轉頁為點陣內嵌時，使用強烈雙色調 / 色相重塑 */
  isPdfRaster?: boolean;
  /**
   * 選項步 dock 預覽：
   * - 強制向量濾鏡（跳過 raster duotone）
   * - 濾鏡結果與原圖 35/65 混合，確保內容永遠清晰
   */
  dockPreview?: boolean;
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
  const styleBoost = styleKeywordBoost(ctx.styleKeyword);

  const isPdfRaster =
    !options?.dockPreview &&
    (options?.isPdfRaster === true ||
      isLikelyRasterOnlyPageSvg(pageSvg));

  const gridPreset =
    GRID_PRESETS.find((g) => g.id === ctx.gridPresetId) ?? GRID_PRESETS[0];
  const gridOn =
    gridPreset.cols > 0 &&
    gridPreset.rows > 0;

  const nudge = styleKeywordNudge(ctx.styleKeyword);

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
      paletteId: palette.id,
      accent: palette.accent,
      muted: palette.muted,
      text: palette.text,
      styleBoost,
      styleNudge: nudge,
      styleKeyword: ctx.styleKeyword,
      narrative: ctx.narrativeId,
      fontHint: ctx.fontStyleId,
      isPdfRaster,
      dockPreview: !!options?.dockPreview,
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
  paletteId: string;
  accent: string;
  muted: string;
  text: string;
  styleBoost: number;
  styleNudge: { tx: number; ty: number; scaleMul: number };
  styleKeyword: StyleKeywordId;
  narrative: string;
  fontHint: string;
  isPdfRaster: boolean;
  dockPreview: boolean;
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
  const tx = (layout.tx + opts.styleNudge.tx) * opts.styleBoost;
  const ty = (layout.ty + opts.styleNudge.ty) * opts.styleBoost;
  const s =
    layout.s *
    (opts.index === 1 ? 0.99 : 1) *
    opts.styleBoost *
    opts.styleNudge.scaleMul;

  const filterId = `pr-p${opts.pageIndex}-v${opts.index}-${opts.paletteId}-${opts.styleKeyword}`.replace(
    /[^a-zA-Z0-9_-]/g,
    "",
  );
  const filterInner = opts.isPdfRaster
    ? buildPdfRasterFilter(opts.index, opts.accent, opts.muted, opts.styleKeyword)
    : `${buildVectorStyleFilter(opts.styleKeyword, opts.index)}${buildVectorPaletteTint(opts.accent, opts.muted, opts.index)}${
        opts.dockPreview
          ? `\n      <feComposite operator="arithmetic" k1="0" k2="0.35" k3="0.65" k4="0" in2="SourceGraphic"/>`
          : ""
      }`;

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

/**
 * 向量頁：依「風格關鍵詞」套用差異明顯的濾鏡鏈（色調、飽和、對比、色相），
 * 三版本在共用基調上再微調 hue，避免三格完全一樣。
 */
function buildVectorStyleFilter(keyword: StyleKeywordId, index: 0 | 1 | 2): string {
  const vHue = index === 0 ? 0 : index === 1 ? 16 : -14;

  switch (keyword) {
    case "Vintage":
      return `
      <feColorMatrix in="SourceGraphic" type="matrix" values="
        0.40 0.74 0.14 0 0.06
        0.32 0.64 0.12 0 0.04
        0.22 0.48 0.10 0 0.02
        0 0 0 1 0"/>
      <feColorMatrix type="hueRotate" values="${6 + vHue}" />
      <feComponentTransfer>
        <feFuncR type="linear" slope="1.06" intercept="-0.03"/>
        <feFuncG type="linear" slope="1.02" intercept="-0.03"/>
        <feFuncB type="linear" slope="0.94" intercept="-0.02"/>
      </feComponentTransfer>`;

    case "Minimal":
      return `
      <feColorMatrix in="SourceGraphic" type="saturate" values="0.38"/>
      <feColorMatrix type="matrix" values="
        1 0 0 0 0.04
        0 0.99 0 0 0.04
        0 0 1.02 0 0.05
        0 0 0 1 0"/>
      <feComponentTransfer>
        <feFuncR type="gamma" amplitude="1" exponent="0.92" offset="0.04"/>
        <feFuncG type="gamma" amplitude="1" exponent="0.92" offset="0.04"/>
        <feFuncB type="gamma" amplitude="1" exponent="0.92" offset="0.04"/>
      </feComponentTransfer>`;

    case "Futuristic":
      return `
      <feColorMatrix in="SourceGraphic" type="hueRotate" values="${175 + vHue}" />
      <feColorMatrix type="saturate" values="1.45"/>
      <feColorMatrix type="matrix" values="
        1.08 0.02 0.06 0 0
        0.04 1.12 0.08 0 0
        0.06 0.10 1.18 0 0
        0 0 0 1 0"/>
      <feComponentTransfer>
        <feFuncR type="linear" slope="1.05" intercept="-0.02"/>
        <feFuncG type="linear" slope="1.05" intercept="-0.02"/>
        <feFuncB type="linear" slope="1.08" intercept="-0.03"/>
      </feComponentTransfer>`;

    case "Bold":
      return `
      <feColorMatrix in="SourceGraphic" type="saturate" values="1.28"/>
      <feComponentTransfer>
        <feFuncR type="linear" slope="1.14" intercept="-0.07"/>
        <feFuncG type="linear" slope="1.12" intercept="-0.07"/>
        <feFuncB type="linear" slope="1.10" intercept="-0.07"/>
      </feComponentTransfer>
      <feColorMatrix type="hueRotate" values="${vHue * 0.6}" />`;

    case "Narrative":
      return `
      <feColorMatrix in="SourceGraphic" type="matrix" values="
        1.06 0.04 0 0 0.03
        0.02 1.02 0 0 0.02
        0 0 0.96 0 0.01
        0 0 0 1 0"/>
      <feColorMatrix type="saturate" values="0.82"/>
      <feColorMatrix type="hueRotate" values="${-4 + vHue}" />
      <feComponentTransfer>
        <feFuncR type="linear" slope="0.96" intercept="0.03"/>
        <feFuncG type="linear" slope="0.96" intercept="0.03"/>
        <feFuncB type="linear" slope="0.94" intercept="0.03"/>
      </feComponentTransfer>`;

    case "Elegant":
      return `
      <feColorMatrix in="SourceGraphic" type="saturate" values="0.68"/>
      <feColorMatrix type="hueRotate" values="${-2 + vHue * 0.5}" />
      <feComponentTransfer>
        <feFuncR type="linear" slope="0.98" intercept="0.04"/>
        <feFuncG type="linear" slope="0.98" intercept="0.04"/>
        <feFuncB type="linear" slope="1.02" intercept="0.02"/>
      </feComponentTransfer>`;

    case "Playful":
      return `
      <feColorMatrix in="SourceGraphic" type="hueRotate" values="${22 + index * 38 + vHue}" />
      <feColorMatrix type="saturate" values="1.38"/>
      <feColorMatrix type="matrix" values="
        1.05 0.06 0.02 0 0
        0.04 1.08 0.04 0 0
        0.02 0.04 1.06 0 0
        0 0 0 1 0"/>`;
  }
}

/**
 * 向量頁：風格濾鏡後再疊主／次色（multiply），換色系時整體才明顯變化；
 * 先前僅改 text fill，海報類（路徑字、點陣）會像「換顏色沒反應」。
 */
function buildVectorPaletteTint(
  accent: string,
  muted: string,
  index: 0 | 1 | 2,
): string {
  const color = index === 0 ? accent : index === 1 ? muted : accent;
  const c = escapeXmlAttr(color);
  const op = index === 0 ? "0.2" : index === 1 ? "0.22" : "0.14";
  return `
      <feFlood flood-color="${c}" flood-opacity="${op}" result="prPalFlood"/>
      <feBlend mode="multiply" in2="prPalFlood"/>`;
}

/**
 * PDF / 內嵌點陣：示範用「色系調和」——保留大部分原圖，只混入少量主色傾向；
 * 非逐張圖內容分析（那需後端 CV / 生成模型）。
 */
function buildPdfRasterFilter(
  index: 0 | 1 | 2,
  accent: string,
  muted: string,
  styleKeyword: StyleKeywordId,
): string {
  const a = escapeXmlAttr(accent);
  const m = escapeXmlAttr(muted);
  const hueBase = pdfStyleHueBase(styleKeyword);
  const satMul =
    styleKeyword === "Futuristic" || styleKeyword === "Playful"
      ? 1.12
      : styleKeyword === "Minimal" || styleKeyword === "Elegant"
        ? 0.88
        : 1;
  const floodBoost =
    styleKeyword === "Vintage" || styleKeyword === "Bold" ? 1.12 : 1;

  const gray = `
      <feColorMatrix in="SourceGraphic" type="matrix"
        values="0.2126 0.7152 0.0722 0 0
                0.2126 0.7152 0.0722 0 0
                0.2126 0.7152 0.0722 0 0
                0 0 0 1 0" result="prGray"/>`;

  /** 較輕的雙色調層，再與原圖算術混合 → 不像整張濾鏡 */
  const softDuo = (color: string, floodOp: string, hueExtra: string) => `
      ${gray}
      <feFlood flood-color="${color}" flood-opacity="${floodOp}" result="prFlood"/>
      <feBlend in="prGray" in2="prFlood" mode="multiply" result="prDuotone"/>
      ${hueExtra}`;

  if (index === 0) {
    const flood = (0.38 * floodBoost).toFixed(2);
    return `
      ${softDuo(
        a,
        flood,
        `<feColorMatrix in="prDuotone" type="hueRotate" values="${hueBase}" result="prHue0"/>
        <feColorMatrix in="prHue0" type="matrix" values="
        ${(1.06 * satMul).toFixed(3)} 0 0 0 0.01
        0 ${(1.04 * satMul).toFixed(3)} 0 0 0.01
        0 0 ${(1.03 * satMul).toFixed(3)} 0 0.01
        0 0 0 1 0" result="prTint"/>`,
      )}
      <feComposite in="SourceGraphic" in2="prTint" operator="arithmetic"
        k1="0" k2="0.82" k3="0.18" k4="0" result="prOut"/>`;
  }

  if (index === 1) {
    const flood = (0.36 * floodBoost).toFixed(2);
    return `
      ${softDuo(
        m,
        flood,
        `<feColorMatrix in="prDuotone" type="hueRotate" values="${18 + hueBase}" result="prHue"/>
      <feColorMatrix in="prHue" type="matrix" values="
        1.03 0.04 0 0 0
        0.03 1.05 0.03 0 0
        0 0.04 1.04 0 0
        0 0 0 1 0" result="prTint"/>`,
      )}
      <feComposite in="SourceGraphic" in2="prTint" operator="arithmetic"
        k1="0" k2="0.76" k3="0.24" k4="0" result="prOut"/>`;
  }

  return `
      <feColorMatrix in="SourceGraphic" type="hueRotate" values="${12 + hueBase}" result="prH1"/>
      <feColorMatrix in="prH1" type="saturate" values="${(1.06 * satMul).toFixed(2)}" result="prH2"/>
      <feColorMatrix in="prH2" type="matrix" values="
        1.04 0.02 0.02 0 -0.01
        0.02 1.08 0.03 0 -0.01
        0.02 0.03 1.05 0 -0.01
        0 0 0 1 0" result="prSat"/>
      <feComponentTransfer in="prSat" result="prOut">
        <feFuncR type="linear" slope="1.02" intercept="-0.01"/>
        <feFuncG type="linear" slope="1.02" intercept="-0.01"/>
        <feFuncB type="linear" slope="1.02" intercept="-0.01"/>
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
