/**
 * 從作品集稿內可抽取文字推斷主要書寫系統（啟發式，非語言學級精確）。
 */

export type ContentScriptId =
  | "unknown"
  | "latin"
  | "cjk_trad"
  | "cjk_simp"
  | "cjk"
  | "ja"
  | "ko"
  | "mixed";

/** UI 用：「自動偵測」不寫入 store，僅作選項 id */
export type ContentScriptChoiceId = ContentScriptId | "auto";

/** 手動覆蓋時可選的書寫類型（不含 auto） */
export const CONTENT_SCRIPT_MANUAL_IDS: ContentScriptId[] = [
  "latin",
  "cjk_simp",
  "cjk_trad",
  "cjk",
  "ja",
  "ko",
  "mixed",
  "unknown",
];

type ProjectTextSource = {
  pageSvgs: string[];
  svgPageLayers: { texts: { content: string }[] }[] | null;
  pdfPagesData: { texts: { content: string }[] }[] | null;
};

function stripInnerSvgTags(fragment: string): string {
  return fragment.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeBasicEntities(t: string): string {
  return t
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (all, n) => {
      const c = Number(n);
      if (!Number.isFinite(c) || c <= 0) return all;
      try {
        return String.fromCodePoint(c);
      } catch {
        return all;
      }
    })
    .replace(/&#x([0-9a-f]+);/gi, (all, h) => {
      const c = parseInt(h, 16);
      if (!Number.isFinite(c) || c <= 0) return all;
      try {
        return String.fromCodePoint(c);
      } catch {
        return all;
      }
    });
}

/**
 * 從單頁 SVG 字串再挖一層文字（補 DOM 解析漏掉的 tspan、或僅存於標記中的字串）
 */
function scrapeSvgMarkupStrings(svg: string): string {
  const out: string[] = [];
  const push = (s: string) => {
    const d = decodeBasicEntities(stripInnerSvgTags(s)).trim();
    if (d) out.push(d);
  };

  const reBlock =
    /<(text|tspan|title|desc)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = reBlock.exec(svg)) !== null) {
    push(m[2] ?? "");
  }

  const reAttr =
    /\b(?:aria-label|data-name|data-label|alt)\s*=\s*["']([^"']+)["']/gi;
  while ((m = reAttr.exec(svg)) !== null) {
    push(m[1] ?? "");
  }

  const stripped = svg
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  out.push(decodeBasicEntities(stripped));

  return out.join("\n");
}

/** 從 SVG / 可編輯層 / PDF 文字抽出純文字樣本（多路合併，盡量不放過 <text>/屬性內字串） */
export function extractPortfolioPlainText(src: ProjectTextSource): string {
  const parts: string[] = [];

  if (src.svgPageLayers?.length) {
    for (const layer of src.svgPageLayers) {
      for (const t of layer.texts) {
        if (t.content?.trim()) parts.push(t.content);
      }
    }
  }

  if (src.pdfPagesData?.length) {
    for (const page of src.pdfPagesData) {
      for (const t of page.texts) {
        if (t.content?.trim()) parts.push(t.content);
      }
    }
  }

  for (const page of src.pageSvgs) {
    parts.push(scrapeSvgMarkupStrings(page));
  }

  return parts.join("\n").slice(0, 48_000);
}

const RE_HAN = /[\u4e00-\u9fff\u3400-\u4dbf]/gu;
const RE_HIRA = /[\u3040-\u309f]/gu;
const RE_KATA = /[\u30a0-\u30ff]/gu;
const RE_HANGUL = /[\uac00-\ud7af]/gu;
const RE_LATIN = /[a-zA-Z\u00c0-\u024f]/g;
const RE_DIGITS_PUNCT = /^[\d\s.,:;!?%\-_/\\'"()[\]{}]+$/;

/** 僅常見字，用於粗分繁簡傾向 */
const SIMP_HINT = /[国发实这书东时们]/g;
const TRAD_HINT = /[國發實這書東時們]/g;

function count(re: RegExp, s: string): number {
  const m = s.match(re);
  return m?.length ?? 0;
}

export function detectContentScript(raw: string): ContentScriptId {
  const s = raw.replace(/\s+/g, " ").trim();
  const compact = s.replace(/\s/g, "");

  const han = count(RE_HAN, s);
  const hira = count(RE_HIRA, s);
  const kata = count(RE_KATA, s);
  const kana = hira + kata;
  const hangul = count(RE_HANGUL, s);
  const latin = count(RE_LATIN, s);

  const scriptChars = han + kana + hangul + latin;

  /** 單一漢字即可判為中文向（海報標題常極短） */
  if (han >= 1) {
    const simpScore = count(SIMP_HINT, s);
    const tradScore = count(TRAD_HINT, s);
    let cjk: ContentScriptId = "cjk";
    if (tradScore > simpScore * 1.2) cjk = "cjk_trad";
    else if (simpScore > tradScore * 1.2) cjk = "cjk_simp";
    if (kana >= 2 && kana >= han * 0.25) return "ja";
    if (hangul >= 2 && hangul >= han * 0.35) return "ko";
    if (latin >= 2 && latin >= han * 0.85) return "mixed";
    return cjk;
  }

  if (kana >= 2) return "ja";
  if (hangul >= 2) return "ko";

  /** 短英文標題：少量拉丁字母即判 latin */
  if (latin >= 2 && scriptChars === latin) return "latin";
  if (latin >= 1 && compact.length <= 12 && !han && !kana && !hangul)
    return "latin";

  if (scriptChars < 2 && compact.length < 3) return "unknown";
  if (scriptChars === 0 && RE_DIGITS_PUNCT.test(s)) return "unknown";

  const total = han + kana + hangul + latin + 1;

  if (kana >= 4 && kana / total >= 0.04 && (han >= 3 || kana >= han * 0.15)) {
    return "ja";
  }
  if (hangul >= 6 && hangul >= han * 0.4) return "ko";

  const simpScore = count(SIMP_HINT, s);
  const tradScore = count(TRAD_HINT, s);

  const scripts: { id: ContentScriptId; w: number }[] = [];
  if (han > 0) {
    let cjk: ContentScriptId = "cjk";
    if (tradScore > simpScore * 1.2) cjk = "cjk_trad";
    else if (simpScore > tradScore * 1.2) cjk = "cjk_simp";
    scripts.push({ id: cjk, w: han });
  }
  if (latin > 0) scripts.push({ id: "latin", w: latin });
  if (hangul > 0 && hangul < 6) scripts.push({ id: "ko", w: hangul });

  scripts.sort((a, b) => b.w - a.w);
  if (scripts.length === 0) return "unknown";
  if (scripts.length >= 2) {
    const [a, b] = scripts;
    if (b && a.w > 0 && b.w / a.w >= 0.35) return "mixed";
  }
  return scripts[0]!.id;
}

export function resolveEffectiveScript(
  detected: ContentScriptId,
  override: ContentScriptId | null,
): ContentScriptId {
  if (override === null) return detected;
  return override;
}
