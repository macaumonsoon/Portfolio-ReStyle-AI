# Portfolio ReStyle AI — Web

對齊專案根目錄 `background.md` 的 **可互動原型**：Next.js App Router、Tailwind、Radix 風格 UI（shadcn 同級元件）、Zustand 狀態。

## 功能（原型）

1. 上傳 **SVG**，或點 **「上傳 PDF…」**；PDF 以 pdf.js 渲染底圖並 **抽出文字座標**。在 **「頁面」** 步驟可 **修改每段文字內容** 與 **字體類型**（無襯線 / 襯線 / 等寬 / 展示），以白底遮蓋原字後疊加向量 `<text>` 重繪（複雜版面或彩底可能有邊緣瑕疵，最多 48 頁）。
2. 選擇風格關鍵詞、色系、畫布、字體理念、敘事邏輯。
3. **每頁 3 個版本**（示範為包裝層位移縮放 + 色相濾鏡），選定後才進入下一頁。
4. **Before / After** 滑桿；可切換綜合 / 偏顏色 / 偏版式對比。
5. **匯出** 每頁已選 SVG（多檔會間隔觸發下載）。

正式環境請將 `src/lib/svg-variants.ts` 的示範邏輯替換為後端 AI / 規則引擎輸出。

## 本機執行

需安裝 Node.js 20+。

```bash
cd web
npm install
npm run dev
```

瀏覽器開啟 [http://localhost:3000](http://localhost:3000)。

## 目錄摘要

| 路徑 | 說明 |
|------|------|
| `src/components/wizard.tsx` | 主流程 UI |
| `src/store/use-project-store.ts` | 全域步驟與選擇狀態 |
| `src/lib/svg-variants.ts` | 三版本示範生成 |
| `src/lib/demo-svg.ts` | 內建示範頁 |
| `src/lib/svg-rasterize.ts` | SVG → Canvas（供 WebGL 紋理） |
| `src/components/webgl/*` | Three.js 預覽（dynamic / ssr:false） |

Three.js 預覽層見 **`src/components/webgl/`**（`next/dynamic` + `ssr: false`，SVG → Canvas 紋理烘焙）；規範見上層 `technical-three.md`。匯出仍僅使用 SVG SSOT。
