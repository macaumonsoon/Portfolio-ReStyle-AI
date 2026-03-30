import { parseSvgDimensions } from "@/lib/svg-rasterize";

/** 預覽用「畫布紙」：淡紅底，尺寸即所選畫布；上層為原稿 contain 置入 */
export const PREVIEW_CANVAS_FILL = "hsl(350 42% 94%)";

function buildGridGuideOverlay(
  canvasW: number,
  canvasH: number,
  cols: number,
  rows: number,
): string {
  if (cols < 2 || rows < 2) return "";
  const stroke = "hsl(262 83% 52%)";
  const w = Math.max(1, Math.min(canvasW, canvasH) * 0.004);
  const parts: string[] = [];
  for (let i = 1; i < cols; i++) {
    const x = (canvasW * i) / cols;
    parts.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${canvasH}" stroke="${stroke}" stroke-width="${w}" stroke-opacity="0.5" stroke-dasharray="8 5" />`,
    );
  }
  for (let j = 1; j < rows; j++) {
    const y = (canvasH * j) / rows;
    parts.push(
      `<line x1="0" y1="${y}" x2="${canvasW}" y2="${y}" stroke="${stroke}" stroke-width="${w}" stroke-opacity="0.5" stroke-dasharray="8 5" />`,
    );
  }
  return `<g class="pr-grid-guide" pointer-events="none" fill="none">${parts.join("")}</g>`;
}

export type FitCanvasOptions = {
  canvasFill?: string;
  /** 網格分區示意：與 GRID_PRESETS 的 cols×rows 一致，畫在畫布最上層 */
  grid?: { cols: number; rows: number };
};

/**
 * 將單頁 SVG 以「完整置入」方式縮放進指定畫布（contain），供即時預覽反映畫布比例。
 * 底層為滿版畫布色（預設淡紅示意紙張），上層為原內容；可選在最上層疊加網格示意線。
 */
export function fitSvgIntoCanvasViewport(
  svg: string,
  canvasW: number,
  canvasH: number,
  options?: FitCanvasOptions,
): string {
  const fill = options?.canvasFill ?? PREVIEW_CANVAS_FILL;
  const gridFrag =
    options?.grid &&
    options.grid.cols > 0 &&
    options.grid.rows > 0
      ? buildGridGuideOverlay(canvasW, canvasH, options.grid.cols, options.grid.rows)
      : "";
  const trimmed = svg.trim();
  const m = trimmed.match(/^<svg\b[^>]*>([\s\S]*)<\/svg>\s*$/i);
  if (!m) return svg;
  const inner = m[1].trim();
  const { w, h } = parseSvgDimensions(trimmed);
  const sw = Math.max(w, 1);
  const sh = Math.max(h, 1);
  const scale = Math.min(canvasW / sw, canvasH / sh);
  const tx = (canvasW - sw * scale) / 2;
  const ty = (canvasH - sh * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}">
  <rect width="100%" height="100%" fill="${fill}" />
  <g transform="translate(${tx},${ty}) scale(${scale})">
    ${inner}
  </g>
  ${gridFrag}
</svg>`;
}
