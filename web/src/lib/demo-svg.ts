/** 內建示範頁（單頁）：三段文字位置可調 */

export const DEMO_FILE_NAME = "demo-capabilities.svg";

export type DemoTextPos = { x: number; y: number };

export type DemoTextLayout = {
  title: DemoTextPos;
  subtitle: DemoTextPos;
  footer: DemoTextPos;
};

export const DEMO_TEXT_DEFAULT: DemoTextLayout = {
  title: { x: 64, y: 140 },
  subtitle: { x: 64, y: 188 },
  footer: { x: 80, y: 460 },
};

/** 與舊常數相容：預設版面 */
export const DEMO_SVG = buildDemoSvg(DEMO_TEXT_DEFAULT);

export function buildDemoSvg(pos: DemoTextLayout): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#f1f5f9"/>
  <rect x="64" y="64" width="672" height="4" fill="#0f172a" opacity="0.85"/>
  <text id="pr-demo-title" x="${pos.title.x}" y="${pos.title.y}" font-family="system-ui, sans-serif" font-size="42" font-weight="600" fill="#0f172a">Capabilities</text>
  <text id="pr-demo-subtitle" x="${pos.subtitle.x}" y="${pos.subtitle.y}" font-family="system-ui, sans-serif" font-size="18" fill="#64748b">Bold Studio · Deck 2025（示範）</text>
  <rect x="64" y="240" width="280" height="180" rx="12" fill="#cbd5e1"/>
  <rect x="372" y="240" width="364" height="88" rx="12" fill="#e2e8f0"/>
  <rect x="372" y="348" width="240" height="72" rx="12" fill="#e2e8f0"/>
  <text id="pr-demo-footer" x="${pos.footer.x}" y="${pos.footer.y}" font-family="system-ui, sans-serif" font-size="14" fill="#475569">Strategy · Brand · Digital</text>
</svg>`;
}
