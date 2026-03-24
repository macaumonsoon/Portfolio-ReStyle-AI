/**
 * 將 SVG 字串光栅化到 Canvas，供 Three.js CanvasTexture 使用。
 * 僅在瀏覽器執行；與 technical-three.md「紋理烘焙」一致，SSOT 仍為 SVG。
 */

export function parseSvgDimensions(svg: string): { w: number; h: number } {
  const vb = svg.match(/viewBox\s*=\s*["']\s*([\d.\s-]+)\s*["']/i);
  if (vb) {
    const parts = vb[1].trim().split(/\s+/).map(Number);
    if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) {
      return { w: parts[2], h: parts[3] };
    }
  }
  const wMatch = svg.match(/\bwidth\s*=\s*["']([\d.]+)/i);
  const hMatch = svg.match(/\bheight\s*=\s*["']([\d.]+)/i);
  const w = wMatch ? parseFloat(wMatch[1]) : 800;
  const h = hMatch ? parseFloat(hMatch[1]) : 600;
  return { w, h };
}

export type RasterizeOptions = {
  /** 長邊上限（px），對齊 technical-three.md 建議 */
  maxSide?: number;
  maxDpr?: number;
  /**
   * 若為 true（預設），光栅失敗時會去掉示範層上的 `filter: url(#…)` 再試一次。
   * PDF 點陣頁的 feComposite 等濾鏡在部分瀏覽器作為 `<img>` 解碼會失敗，去掉後仍可匯出畫面。
   */
  retryWithoutPrFilter?: boolean;
};

/** 供 PDF 匯出等：移除 wrapVariant 套在 .pr-content 上的濾鏡，避免 Image 解碼失敗 */
export function stripPrContentSvgFilter(svg: string): string {
  return svg.replace(/filter:\s*url\(#[^)]+\)\s*;?/gi, "filter: none;");
}

function loadImageFromSvgSources(svg: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const tryDataUrl = () => {
      const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      const img2 = new Image();
      img2.decoding = "async";
      img2.onload = () => resolve(img2);
      img2.onerror = () => resolve(null);
      img2.src = dataUrl;
    };

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      tryDataUrl();
    };
    img.src = blobUrl;
  });
}

export async function rasterizeSvgToCanvas(
  svg: string,
  options?: RasterizeOptions,
): Promise<HTMLCanvasElement | null> {
  if (typeof window === "undefined") return null;

  const maxSide = options?.maxSide ?? 2048;
  const maxDpr = options?.maxDpr ?? 2;
  const retryFilter = options?.retryWithoutPrFilter !== false;

  const run = async (markup: string): Promise<HTMLCanvasElement | null> => {
    const { w: vw, h: vh } = parseSvgDimensions(markup);
    const long = Math.max(vw, vh, 1);
    const scale = Math.min(1, maxSide / long);
    const cw = vw * scale;
    const ch = vh * scale;

    const dpr = Math.min(maxDpr, window.devicePixelRatio || 1);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(cw * dpr));
    canvas.height = Math.max(1, Math.floor(ch * dpr));

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const img = await loadImageFromSvgSources(markup);
    if (!img) return null;

    try {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.drawImage(img, 0, 0, cw, ch);
    } catch {
      return null;
    }

    return canvas;
  };

  let canvas = await run(svg);
  if (canvas) return canvas;

  if (retryFilter) {
    const stripped = stripPrContentSvgFilter(svg);
    if (stripped !== svg) {
      canvas = await run(stripped);
    }
  }

  return canvas;
}
