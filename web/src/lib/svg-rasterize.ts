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
};

export async function rasterizeSvgToCanvas(
  svg: string,
  options?: RasterizeOptions,
): Promise<HTMLCanvasElement | null> {
  if (typeof window === "undefined") return null;

  const maxSide = options?.maxSide ?? 2048;
  const maxDpr = options?.maxDpr ?? 2;

  const { w: vw, h: vh } = parseSvgDimensions(svg);
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

  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.drawImage(img, 0, 0, cw, ch);
        resolve();
      };
      img.onerror = () => reject(new Error("SVG raster decode failed"));
      img.src = url;
    });
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }

  return canvas;
}
