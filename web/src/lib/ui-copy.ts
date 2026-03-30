import type { ContentScriptId } from "@/lib/detect-content-script";

export type UiLocale = "zh" | "en";

export type AppCopy = {
  langToggle: string;
  header: {
    kicker: string;
    subtitle: string;
    body: string;
  };
  nav: { restart: string };
  steps: {
    flowAria: string;
    upload: string;
    style: string;
    pages: string;
    export: string;
  };
  uploadCard: {
    title: string;
    desc: string;
    chooseSvg: string;
    selectedPrefix: string;
    pdfPages: (n: number) => string;
  };
  previewCard: { title: string; desc: string; empty: string };
  nextToOptions: string;
  options: {
    styleKeywords: string;
    colorScheme: string;
    paletteHint: string;
    canvasSize: string;
    canvasOrientation: string;
    canvasPortrait: string;
    canvasLandscape: string;
    canvasOrientationHint: string;
    canvasSquareNote: string;
    briefLabel: string;
    briefPlaceholder: string;
    briefHint: string;
    briefAiButton: string;
    briefAiFootnote: string;
    briefAiError: string;
    briefAiDialogTitle: string;
    briefAiDialogDesc: string;
    briefAiCancel: string;
    briefAiApply: string;
    /** 未設定 GEMINI_API_KEY 時的醒目說明 */
    briefAiMissingKeyTitle: string;
    briefAiMissingKeySteps: readonly string[];
    gridRemix: string;
    fontNarrative: string;
    fontNarrativeHint: string;
    /** 文稿書寫系統（自動偵測 + 手動覆蓋） */
    contentScriptTitle: string;
    contentScriptSubtitle: string;
    contentScriptDetectedLine: (label: string) => string;
    contentScriptEffectiveLine: (label: string) => string;
    contentScriptManualNote: string;
    contentScriptOpenDialog: string;
    contentScriptDialogTitle: string;
    contentScriptDialogIntro: string;
    contentScriptOptionAuto: string;
    contentScriptOptionAutoDesc: string;
    contentScriptApply: string;
    contentScriptClose: string;
    contentScriptLabels: Record<ContentScriptId, string>;
    /** 說明色系與風格互不鎖定、可任意重選 */
    flowHint: string;
  };
  back: string;
  generatePages: string;
  generatePagesAi: string;
  pages: {
    progress: (stepOneBased: number, total: number, sourcePage: number) => string;
    hintGrid: string;
    hintPdf: string;
    hintSvg: string;
    version: (i: number) => string;
    gridDesc: [string, string, string];
    plainDesc: [string, string, string];
    chooseVersion: string;
    chosen: string;
    threeTitle: string;
    threeDesc: string;
    compareTitle: string;
    compareDesc: string;
    tabBoth: string;
    tabColor: string;
    tabLayout: string;
    compareSlider: string;
    comparePanHint: string;
    comparePanReset: string;
    before: string;
    after: string;
    filterOff: string;
    filterOn: string;
    colorModeNote: string;
    layoutModeNote: string;
    backOptions: string;
    prevPage: string;
    nextPage: string;
    doneExport: string;
    webglLoading: string;
    gridTileDragHint: string;
    gridTileNudgeReset: string;
    gridTileDragTileTitle: (tileOneBased: number) => string;
  };
  export: {
    title: string;
    desc: string;
    pdf: string;
    pdfBusy: string;
    allSvg: string;
    backEdit: string;
  };
  alerts: {
    svgOnly: string;
    pdfNone: string;
    pdfFail: string;
  };
  preview: {
    empty: string;
    upload: string;
    options: string;
    export: string;
    pages: (cur: number, src: number) => string;
  };
  aiStyle: {
    button: string;
    footnote: string;
    error: string;
    missingKey: string;
    resultTitle: string;
    apply: string;
    applied: string;
  };
  quickPresets: {
    label: string;
  };
  /** 預覽框底圖：左／右示意「更改前 → 更改後」 */
  previewChrome: {
    before: string;
    after: string;
  };
  dock: {
    emptySvg: string;
    popoutFail: string;
    popout: string;
    zoom: (z: number) => string;
    mobileFab: string;
    dialogTitle: string;
    cardTitle: string;
    windowTitle: string;
  };
  uploadPdf: {
    trigger: string;
    title: string;
    description: string;
    parsing: string;
    drop: string;
    onlyPdf: string;
    errNoPages: string;
    errPickPdf: string;
    errParse: string;
  };
  svgEditor: {
    title: string;
    desc: string;
    empty: string;
    block: (i: number) => string;
    content: string;
    font: string;
  };
  compareSvgLeft: string;
  compareSvgRight: string;
  pdfEditor: {
    title: string;
    desc: string;
    empty: string;
    block: (i: number) => string;
    content: string;
    font: string;
  };
};

const ZH: AppCopy = {
  langToggle: "English",
  header: {
    kicker: "AI · 作品集重排",
    subtitle: "設計師友好的版面實驗室",
    body:
      "呼應作品集敘事與網格化重組：上傳 SVG 或 PDF，描述生成想法並選擇畫布、色系、字體與敘事邏輯；可選網格分區重排。每頁三種版本即時預覽，逐頁選定後再進下一頁。PDF 在瀏覽器內轉為逐頁預覽（點陣內嵌），正式 AI 佈局可接後端 API。",
  },
  nav: { restart: "重新開始" },
  steps: {
    flowAria: "流程步驟",
    upload: "上傳",
    style: "風格",
    pages: "頁面 ×3",
    export: "匯出",
  },
  uploadCard: {
    title: "上傳作品集",
    desc: "SVG 可單選或多選（Cmd/Ctrl 點選多檔），會依檔名排序合併為多頁；PDF 請點「上傳 PDF」。",
    chooseSvg: "選擇 SVG（可多檔）",
    selectedPrefix: "已選：",
    pdfPages: (n) => `PDF · ${n} 頁`,
  },
  previewCard: {
    title: "預覽",
    desc: "第一頁縮覽（SVG 向量或 PDF 轉頁）",
    empty: "尚未載入檔案",
  },
  nextToOptions: "下一步：風格與畫布",
  options: {
    styleKeywords: "風格關鍵詞",
    colorScheme: "色系",
    paletteHint:
      "向量 SVG：三版本字色為「正文／主色／次要色」。PDF 頁為點陣時，色系以「保留大部分原圖＋輕量主色調和」呈現，避免整張像套濾鏡；若要依每張圖內容單獨調色，需後端影像分析或生成流程。",
    canvasSize: "畫布尺寸",
    canvasOrientation: "橫豎",
    canvasPortrait: "豎排",
    canvasLandscape: "橫排",
    canvasOrientationHint:
      "在相同畫布規格下切換寬高方向；右側預覽與網格示意會跟隨。",
    canvasSquareNote: "正方形畫布橫豎尺寸相同。",
    briefLabel: "創作簡述（給 AI／頁序參考）",
    briefPlaceholder:
      "例：希望突出品牌與 UI 案例，語氣專業、留白多；或：學術向，先研究方法再展示專題……",
    briefHint:
      "示範版會依關鍵詞微調「工作邏輯」下的頁序；下方可用免費大模型擴寫本欄（需自行設定 API 金鑰）。",
    briefAiButton: "AI 生成／擴寫簡述",
    briefAiFootnote:
      "使用 Google Gemini 免費額度；在 web/.env.local 設定 GEMINI_API_KEY（見 Google AI Studio）。",
    briefAiError: "生成失敗，請檢查網路、額度或稍後再試。",
    briefAiDialogTitle: "AI 生成的創作簡述",
    briefAiDialogDesc: "可直接採用填入上方輸入框，或在對話框內微調後再採用。",
    briefAiCancel: "關閉",
    briefAiApply: "採用並填入",
    briefAiMissingKeyTitle: "尚未配置金鑰，所以無法生成（並非按鈕壞了）",
    briefAiMissingKeySteps: [
      "終端機執行：cd web 然後 npm run init:env（會自動在 web 裡建立 .env.local）。",
      "若手動建立：Cmd+P 輸入 web/.env.local（要有 web/ 前綴），勿只在根目錄建 .env.local。",
      "檔案內：GEMINI_API_KEY=你的金鑰（無引號、等號旁無空格）。",
      "Ctrl+C 停掉 dev 後再 npm run dev。若左側看不到該檔：可能被「排除 Git 忽略」隱藏，用 Cmd+Shift+P → File: Open File 貼上磁碟路徑仍可開。",
    ],
    gridRemix: "網格分區重排",
    fontNarrative: "字體風格 · 敘事邏輯",
    fontNarrativeHint:
      "點「開始生成頁面」時，會依敘事與簡述計算瀏覽順序（示範演算法）；匯出順序與精靈步驟一致。",
    contentScriptTitle: "文稿文字類型（自動偵測）",
    contentScriptSubtitle:
      "依上傳稿內可抽取文字粗分書寫系統，與左側「字體風格」不同。若顯示無法辨識，常見原因是字已轉成路徑輪廓或整頁為圖片字，此時請用手動指定。",
    contentScriptDetectedLine: (label) => `演算法偵測：${label}`,
    contentScriptEffectiveLine: (label) => `目前採用：${label}`,
    contentScriptManualNote: "已改為手動指定；按下方可恢復自動偵測。",
    contentScriptOpenDialog: "查看說明並變更類型",
    contentScriptDialogTitle: "文稿主要書寫／語言類型",
    contentScriptDialogIntro:
      "此結果由稿內文字符號粗估（非語言學級判斷）。若與實際不符，請選擇正確類型，後續給 AI 的脈絡會以此為準。",
    contentScriptOptionAuto: "自動偵測（跟隨稿件）",
    contentScriptOptionAutoDesc: "每次偵測會隨你上傳或編輯文字更新。",
    contentScriptApply: "套用",
    contentScriptClose: "關閉",
    contentScriptLabels: {
      unknown: "無法辨識（可抽取文字過少，或已輪廓化／點陣字）",
      latin: "拉丁字母為主（如英文、西文）",
      cjk_trad: "中文為主（偏繁體／港臺用字傾向）",
      cjk_simp: "中文為主（偏簡體傾向）",
      cjk: "中文漢字為主（繁簡混用或不明）",
      ja: "日文（含假名與漢字）",
      ko: "韓文（諺文）",
      mixed: "多種文字混用",
    },
    flowHint:
      "建議先選色系（主色與文字色），再選風格關鍵詞（濾鏡與構圖）。兩者互不鎖定，隨時可改；右側預覽會即時反映。",
  },
  back: "返回",
  generatePages: "開始生成頁面",
  generatePagesAi: "AI 智慧排序並生成",
  pages: {
    progress: (stepOneBased, total, sourcePage) =>
      `瀏覽順序第 ${stepOneBased} / ${total} 步 · 對應原稿第 ${sourcePage} 頁 · 請選擇一個版本後繼續`,
    hintGrid:
      "已開啟網格重排：三版本為同一網格下不同的區塊置換順序，並疊加濾鏡與位移。",
    hintPdf:
      "PDF 頁面：三版本使用強烈雙色調／色相重塑（依你選的色系）；向量 SVG 仍為輕微調色。",
    hintSvg: "示範：三版本為不同版式縮放＋色相微調；正式版由 AI 產出。",
    version: (i) => `版本 ${i}`,
    gridDesc: [
      "網格：區塊順序與閱讀向一致",
      "網格：區塊整體反向",
      "網格：區塊偽隨機重排",
    ],
    plainDesc: ["結構穩定", "略低重心", "偏上構圖"],
    chooseVersion: "選擇此版本",
    chosen: "已選擇",
    threeTitle: "Three.js 預覽層",
    threeDesc:
      "將當前選定版本（或預設版本 1）的 SVG 烘焙為紋理顯示；可拖曳旋轉。行為對齊專案根目錄 technical-three.md（SSOT 仍為 SVG，匯出不使用 WebGL 截圖）。",
    compareTitle: "Before / After",
    compareDesc:
      "可切換「綜合／偏顏色／偏版式」對比方式（版式模式會關閉色相濾鏡）。",
    tabBoth: "綜合",
    tabColor: "顏色",
    tabLayout: "版式",
    compareSlider: "對比滑桿",
    comparePanHint:
      "在預覽區內拖曳可平移畫面（方便查看網格稿邊緣）；換頁或對比模式會重置位置。",
    comparePanReset: "重置平移",
    before: "Before",
    after: "After",
    filterOff: "關閉濾鏡",
    filterOn: "含濾鏡",
    colorModeNote: "同一版本：左側關閉色相濾鏡、右側保留，方便對比色調差異。",
    layoutModeNote: "版式模式：右側關閉濾鏡，對比原始頁面與位移縮放後的構圖。",
    backOptions: "返回選項",
    prevPage: "上一頁",
    nextPage: "下一頁",
    doneExport: "完成並匯出",
    webglLoading: "載入 Three.js 預覽…",
    gridTileDragHint:
      "網格區內拖曳可微調該塊位置（鬆手後寫入）；換版本或網格預設會清除微調。",
    gridTileNudgeReset: "重置網格塊位置",
    gridTileDragTileTitle: (n) => `拖曳以微調網格塊 ${n}`,
  },
  export: {
    title: "匯出",
    desc: "可下載單一 PDF（各頁光栅合併，便於分享列印），或下載每頁向量 SVG 供 Figma／編輯器再改。示範包裝層可於正式版替換為真實 AI 重排。",
    pdf: "下載 PDF（合併）",
    pdfBusy: "正在產生 PDF…",
    allSvg: "下載全部 SVG",
    backEdit: "返回修訂",
  },
  alerts: {
    svgOnly: "請選擇 .svg 檔案；可多選多檔，或使用「上傳 PDF」。",
    pdfNone: "無法產生 PDF（沒有可匯出的頁面或光栅失敗）。",
    pdfFail: "產生 PDF 時發生錯誤",
  },
  preview: {
    empty: "請先上傳 SVG 或 PDF。",
    upload: "第一頁原稿置於所選畫布比例（淡紅底）；與左欄預覽一致。",
    options:
      "右側為第一頁：已套用色系、字體與網格（示範版本 1）並置入所選畫布（淡紅底）；為便于辨識稿面，此處暫不疊加風格關鍵詞的 SVG 濾鏡（「頁面」步三格預覽仍含完整濾鏡）。",
    export: "已選版本匯出預覽（優先顯示第一頁成品）。",
    pages: (cur, src) =>
      `瀏覽第 ${cur} 步 · 原稿第 ${src} 頁 · 顯示已選版本（未選時為版本 1）。`,
  },
  aiStyle: {
    button: "AI 分析風格建議",
    footnote: "使用 Gemini 視覺分析作品集內容，推薦最合適的風格組合。",
    error: "分析失敗，請檢查網路或稍後再試。",
    missingKey: "需先在 web/.env.local 設定 GEMINI_API_KEY 才能使用 AI 分析。",
    resultTitle: "AI 風格推薦",
    apply: "一鍵套用",
    applied: "已套用",
  },
  quickPresets: {
    label: "快速風格預設",
  },
  previewChrome: {
    before: "原稿",
    after: "套用畫布與風格後",
  },
  dock: {
    emptySvg: "尚無可預覽內容",
    popoutFail:
      "無法開啟預覽視窗，請檢查瀏覽器是否阻擋彈出式視窗，並允許本站彈窗後再試。",
    popout: "獨立視窗",
    zoom: (z) => `縮放測試 · ${z}%`,
    mobileFab: "即時預覽",
    dialogTitle: "即時預覽測試",
    cardTitle: "即時預覽測試",
    windowTitle: "Portfolio ReStyle · 即時預覽",
  },
  uploadPdf: {
    trigger: "上傳 PDF…",
    title: "上傳 PDF 作品集",
    description:
      "將在瀏覽器內以 pdf.js 逐頁渲染，並抽出文字座標；在「頁面」步驟可修改文字內容與字體類型（覆蓋在底圖上）。最多 48 頁。",
    parsing: "正在解析 PDF…",
    drop: "拖放 PDF 到此，或點擊選擇檔案",
    onlyPdf: "僅限 .pdf",
    errNoPages: "未能從 PDF 解析出任何頁面。",
    errPickPdf: "請選擇 .pdf 檔案",
    errParse: "PDF 解析失敗",
  },
  compareSvgLeft: "對比左側",
  compareSvgRight: "對比右側",
  svgEditor: {
    title: "本頁 SVG 文字",
    desc: "僅支援 SVG 向量 text 節點；路徑描字或純圖片請在外部編輯。修改內容後在輸入框外點一下即更新預覽；字體類型變更會立即生效。",
    empty: "此頁未偵測到可編輯的向量文字節點。",
    block: (i) => `區塊 ${i}`,
    content: "文字內容",
    font: "字體類型",
  },
  pdfEditor: {
    title: "本頁 PDF 文字",
    desc: "修改內容後在輸入框外點一下（失焦）即更新預覽；字體類型變更會立即生效。白塊會遮蓋底圖上的原字，再以向量字重繪（複雜版面可能需微調位置，正式版可接精準 OCR）。",
    empty: "此頁未偵測到可選取文字（可能為純圖片 PDF）。",
    block: (i) => `區塊 ${i}`,
    content: "文字內容",
    font: "字體類型",
  },
};

const EN: AppCopy = {
  langToggle: "中文",
  header: {
    kicker: "AI · Portfolio remix",
    subtitle: "A designer-friendly layout lab",
    body:
      "Upload SVG or PDF, describe your intent, then pick canvas, palette, type, and narrative; optional grid tile remix. Each page shows three live variants—pick one per page before continuing. PDFs rasterize per page in the browser. Plug in a real layout model via API when ready.",
  },
  nav: { restart: "Start over" },
  steps: {
    flowAria: "Workflow steps",
    upload: "Upload",
    style: "Style",
    pages: "Pages ×3",
    export: "Export",
  },
  uploadCard: {
    title: "Upload portfolio",
    desc: "Pick one or many SVG files (Cmd/Ctrl-click); pages merge in filename order. For PDF, use “Upload PDF”.",
    chooseSvg: "Choose SVG (multi-file)",
    selectedPrefix: "Selected: ",
    pdfPages: (n) => `PDF · ${n} page${n === 1 ? "" : "s"}`,
  },
  previewCard: {
    title: "Preview",
    desc: "First page (vector SVG or PDF raster)",
    empty: "No file loaded",
  },
  nextToOptions: "Next: style & canvas",
  options: {
    styleKeywords: "Style keywords",
    colorScheme: "Color scheme",
    paletteHint:
      "Vector SVG: three variants tint body / accent / muted text. Raster PDF pages blend your palette gently over the photo so it doesn’t look like a flat filter; per-image tuning needs backend vision or generative steps.",
    canvasSize: "Canvas size",
    canvasOrientation: "Orientation",
    canvasPortrait: "Portrait",
    canvasLandscape: "Landscape",
    canvasOrientationHint:
      "Swap width and height for the same preset; the dock preview and grid guides follow.",
    canvasSquareNote: "Square canvases look the same in both orientations.",
    briefLabel: "Creative brief (for AI / page order)",
    briefPlaceholder:
      "e.g. Lead with brand + UI case studies, professional tone, lots of whitespace—or academic: methods first, then projects…",
    briefHint:
      "Demo nudges page order under “work logic”; you can also expand this field with a free LLM (API key required).",
    briefAiButton: "Generate / expand with AI",
    briefAiFootnote:
      "Uses Google Gemini free tier; set GEMINI_API_KEY in web/.env.local (Google AI Studio).",
    briefAiError: "Generation failed. Check network, quota, or try again.",
    briefAiDialogTitle: "AI-generated creative brief",
    briefAiDialogDesc:
      "Apply to fill the field above, or edit here first then apply.",
    briefAiCancel: "Close",
    briefAiApply: "Apply to field",
    briefAiMissingKeyTitle: "API key not configured — generation can’t run (the button is fine)",
    briefAiMissingKeySteps: [
      "In terminal: cd web && npm run init:env (creates web/.env.local from .env.example).",
      "If creating manually: in quick open type web/.env.local (include web/); not only .env.local at repo root.",
      "Inside the file: GEMINI_API_KEY=your_key (no quotes, no spaces around =).",
      "Restart dev after Ctrl+C. If the file is hidden in the sidebar (gitignored), use Cmd+Shift+P → File: Open File and paste the full path.",
    ],
    gridRemix: "Grid partition remix",
    fontNarrative: "Type style · narrative logic",
    fontNarrativeHint:
      "“Generate pages” recomputes browse order from narrative + brief (demo heuristic). Export order follows the wizard.",
    contentScriptTitle: "Document script (auto-detected)",
    contentScriptSubtitle:
      "Inferred from extractable text—not the same as “type style”. If it stays unknown, text may be outlined to paths or raster-only; pick manually.",
    contentScriptDetectedLine: (label) => `Detected: ${label}`,
    contentScriptEffectiveLine: (label) => `In use: ${label}`,
    contentScriptManualNote: "Using your manual choice; open below to switch back to auto.",
    contentScriptOpenDialog: "Explain & change type",
    contentScriptDialogTitle: "Primary script / language of your document",
    contentScriptDialogIntro:
      "This is a heuristic from characters in the file (not linguistic-grade). Pick the closest match so AI prompts use the right context.",
    contentScriptOptionAuto: "Auto (follow the document)",
    contentScriptOptionAutoDesc: "Recomputed when you change uploads or editable text.",
    contentScriptApply: "Apply",
    contentScriptClose: "Close",
    contentScriptLabels: {
      unknown: "Unknown (little extractable text, or outlined / raster type)",
      latin: "Latin script (e.g. English)",
      cjk_trad: "Chinese (Traditional-leaning)",
      cjk_simp: "Chinese (Simplified-leaning)",
      cjk: "Chinese characters (mixed / unclear)",
      ja: "Japanese (kana + kanji)",
      ko: "Korean (Hangul)",
      mixed: "Mixed scripts",
    },
    flowHint:
      "Pick a palette first (accent + text colors), then a style keyword (filters + layout nudge). They don’t lock each other—change anytime; the dock preview updates live.",
  },
  back: "Back",
  generatePages: "Generate pages",
  generatePagesAi: "AI smart order & generate",
  pages: {
    progress: (stepOneBased, total, sourcePage) =>
      `Step ${stepOneBased} of ${total} in browse order · source page ${sourcePage} · pick a variant to continue`,
    hintGrid:
      "Grid remix on: three variants permute tiles within the same grid, plus filters and nudges.",
    hintPdf:
      "PDF pages: strong duotone / hue remap from your palette; vector SVG stays lightly tinted.",
    hintSvg: "Demo: three variants = layout nudge + mild hue; production can swap in AI layouts.",
    version: (i) => `Variant ${i}`,
    gridDesc: [
      "Grid: tile order matches reading flow",
      "Grid: tiles reversed",
      "Grid: seeded pseudo-random shuffle",
    ],
    plainDesc: ["Stable structure", "Lower visual weight", "Top-weighted frame"],
    chooseVersion: "Choose this variant",
    chosen: "Selected",
    threeTitle: "Three.js preview",
    threeDesc:
      "Bakes the chosen SVG (or variant 1) into a textured plane you can orbit. See technical-three.md in the repo—SVG remains source of truth; export is not a WebGL screenshot.",
    compareTitle: "Before / After",
    compareDesc:
      "Switch between full, color-only, or layout compare (layout turns hue filters off on one side).",
    tabBoth: "Full",
    tabColor: "Color",
    tabLayout: "Layout",
    compareSlider: "Compare slider",
    comparePanHint:
      "Drag inside the preview to pan (useful for grid edges). Changing page or mode resets position.",
    comparePanReset: "Reset pan",
    before: "Before",
    after: "After",
    filterOff: "Filter off",
    filterOn: "Filtered",
    colorModeNote: "Same variant: left without hue filter, right with—useful to judge color shifts.",
    layoutModeNote: "Layout mode: right side skips filters to compare raw page vs nudged composition.",
    backOptions: "Back to options",
    prevPage: "Previous",
    nextPage: "Next page",
    doneExport: "Finish & export",
    webglLoading: "Loading Three.js preview…",
    gridTileDragHint:
      "Drag inside a grid cell to nudge that tile (saved on release). Changing variant or grid preset clears nudges.",
    gridTileNudgeReset: "Reset tile positions",
    gridTileDragTileTitle: (n) => `Drag to nudge grid tile ${n}`,
  },
  export: {
    title: "Export",
    desc: "Download one merged PDF (raster pages, easy to share) or per-page SVG for Figma or other editors. Swap this demo wrapper for a real AI relayout pipeline later.",
    pdf: "Download PDF (merged)",
    pdfBusy: "Building PDF…",
    allSvg: "Download all SVG",
    backEdit: "Back to edit",
  },
  alerts: {
    svgOnly: "Choose .svg file(s), multi-select allowed, or use “Upload PDF”.",
    pdfNone: "Could not build PDF (no exportable pages or raster failed).",
    pdfFail: "Error while building PDF",
  },
  preview: {
    empty: "Upload SVG or PDF to begin.",
    upload: "Page 1 fitted on the current canvas preset (light-red “paper”); matches the left preview.",
    options:
      "Dock: page 1 with palette, fonts, and grid (variant 1 demo), fitted on the canvas. Style-keyword SVG filters are off here so the layout stays readable; the Pages step previews still use the full filter stack.",
    export: "Export preview of chosen variants (shows first finished page if available).",
    pages: (cur, src) =>
      `Browsing step ${cur} · source page ${src} · showing chosen variant (defaults to variant 1).`,
  },
  aiStyle: {
    button: "AI style analysis",
    footnote: "Uses Gemini vision to analyze your portfolio and suggest the best style combo.",
    error: "Analysis failed. Check network or try again.",
    missingKey: "Set GEMINI_API_KEY in web/.env.local to use AI analysis.",
    resultTitle: "AI recommendation",
    apply: "Apply all",
    applied: "Applied",
  },
  quickPresets: {
    label: "Quick style presets",
  },
  previewChrome: {
    before: "Source",
    after: "Canvas + style",
  },
  dock: {
    emptySvg: "Nothing to preview yet",
    popoutFail:
      "Could not open the preview window. Allow pop-ups for this site and try again.",
    popout: "Pop out",
    zoom: (z) => `Zoom test · ${z}%`,
    mobileFab: "Live preview",
    dialogTitle: "Live preview",
    cardTitle: "Live preview",
    windowTitle: "Portfolio ReStyle · Live preview",
  },
  uploadPdf: {
    trigger: "Upload PDF…",
    title: "Upload PDF portfolio",
    description:
      "Renders each page with pdf.js in-browser and extracts text boxes you can edit in the Pages step (drawn over the raster). Up to 48 pages.",
    parsing: "Parsing PDF…",
    drop: "Drop a PDF here or click to choose",
    onlyPdf: ".pdf only",
    errNoPages: "Could not extract any pages from this PDF.",
    errPickPdf: "Please choose a .pdf file",
    errParse: "Failed to parse PDF",
  },
  compareSvgLeft: "Compare — left",
  compareSvgRight: "Compare — right",
  svgEditor: {
    title: "SVG text on this page",
    desc: "Only true SVG text nodes are editable; path-set type or images need external edits. Blur inputs to push text changes; font family updates immediately.",
    empty: "No editable vector text found on this page.",
    block: (i) => `Block ${i}`,
    content: "Text",
    font: "Font style",
  },
  pdfEditor: {
    title: "PDF text on this page",
    desc: "Blur a field to apply changes; font style updates immediately. White masks cover the raster letters and we redraw vector text (tight layouts may need nudging; production could add OCR assist).",
    empty: "No selectable text on this page (image-only PDF?).",
    block: (i) => `Block ${i}`,
    content: "Text",
    font: "Font style",
  },
};

export function buildAppCopy(locale: UiLocale): AppCopy {
  return locale === "zh" ? ZH : EN;
}
