import { parseSvgDimensions } from "@/lib/svg-rasterize";

/**
 * 將單頁 SVG 以「完整置入」方式縮放進指定畫布（contain），供即時預覽反映畫布比例。
 */
export function fitSvgIntoCanvasViewport(
  svg: string,
  canvasW: number,
  canvasH: number,
): string {
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
  <rect width="100%" height="100%" fill="hsl(225 24% 97%)" />
  <g transform="translate(${tx},${ty}) scale(${scale})">
    ${inner}
  </g>
</svg>`;
}
