/**
 * 另開瀏覽器視窗顯示當前 SVG（方便副屏 / 全屏測試）。
 * 若被瀏覽器擋彈窗，回傳 null。
 */
export function openSvgPreviewWindow(svg: string, title: string): Window | null {
  if (!svg.trim()) return null;
  const safeTitle = title.replace(/</g, "");
  const html = `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"><title>${safeTitle}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  html,body{min-height:100%;margin:0;background:#e8eaed;}
  main{display:flex;justify-content:center;align-items:flex-start;min-height:100%;padding:20px;box-sizing:border-box;}
  .frame{background:#fff;box-shadow:0 8px 32px rgba(15,23,42,.12);border-radius:10px;max-width:100%;max-height:calc(100vh - 40px);overflow:auto;padding:16px;}
  .frame svg{max-width:100%;height:auto;display:block;}
</style></head><body><main><div class="frame">${svg}</div></main></body></html>`;
  const w = window.open(
    "",
    "pr-live-preview",
    "popup=yes,width=980,height=1260,menubar=no,toolbar=no",
  );
  if (!w) return null;
  try {
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
  } catch {
    w.close();
    return null;
  }
  return w;
}
