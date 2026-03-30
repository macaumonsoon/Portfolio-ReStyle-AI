import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BRIEF = 12_000;
/** 免費層配額較穩；若仍報 quota 可改 env GEMINI_MODEL */
const DEFAULT_MODEL = "gemini-2.5-flash";

type Body = {
  locale?: string;
  brief?: string;
  narrative?: string;
  styleKeyword?: string;
  palette?: string;
  canvas?: string;
  contentScript?: string;
};

function trimText(s: unknown, max: number): string {
  if (typeof s !== "string") return "";
  return s.slice(0, max).trim();
}

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    return NextResponse.json(
      {
        error: "not_configured",
        message:
          "Server missing GEMINI_API_KEY. Add a free key from Google AI Studio to .env.local.",
      },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const locale = body.locale === "en" ? "en" : "zh";
  const brief = trimText(body.brief, MAX_BRIEF);
  const narrative = trimText(body.narrative, 500);
  const styleKeyword = trimText(body.styleKeyword, 200);
  const palette = trimText(body.palette, 200);
  const canvas = trimText(body.canvas, 200);
  const contentScript = trimText(body.contentScript, 200);

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const systemZh = `你是作品集排版與視覺敘事助手，為「Portfolio ReStyle」類工具撰寫「創作簡述」提示詞。
要求：
- 輸出 3～8 句連貫段落，可直接貼進產品的多行文字框。
- 結合使用者已選：敘事邏輯、風格關鍵詞、色系、畫布規格；若使用者草稿非空，在其基礎上擴寫、補全語氣與結構，不要完全丟棄原意。
- 內容側重：希望強調的作品類型、閱讀順序、留白與層次、交付場景（如 PDF／演講／印刷）。
- 只輸出正文，不要標題、不要 Markdown、不要列表符號、不要「好的」「以下是」等套話。`;

  const systemEn = `You write creative briefs for a portfolio restyle / layout demo tool.
Rules:
- Produce 3–8 flowing sentences suitable for a multi-line text field.
- Weave in the user's selected narrative logic, style keyword, palette, and canvas; if a draft exists, expand and refine it without discarding intent.
- Mention emphasis (e.g. case studies, research, brand), pacing, whitespace, and intended output (deck, print, PDF) when relevant.
- Output plain prose only: no headings, no markdown, no bullets, no filler like "Here is".`;

  const userBlockZh = `【介面語言】中文
【目前選項】
- 敘事邏輯：${narrative || "（未提供）"}
- 風格關鍵詞：${styleKeyword || "（未提供）"}
- 色系：${palette || "（未提供）"}
- 畫布：${canvas || "（未提供）"}
- 文稿文字類型（使用者介面偵測／指定）：${contentScript || "（未提供）"}

【使用者草稿】
${brief || "（尚未填寫——請依上述選項生成一版可用的創作簡述）"}`;

  const userBlockEn = `【UI locale】English
【Current choices】
- Narrative: ${narrative || "(not provided)"}
- Style keyword: ${styleKeyword || "(not provided)"}
- Palette: ${palette || "(not provided)"}
- Canvas: ${canvas || "(not provided)"}
- Document script (UI-detected / user override): ${contentScript || "(not provided)"}

【User draft】
${brief || "(empty — generate a usable brief from the choices above)"}`;

  const systemInstruction = locale === "zh" ? systemZh : systemEn;
  const userText = locale === "zh" ? userBlockZh : userBlockEn;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userText }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.65,
      },
    }),
  });

  const raw = (await res.json()) as {
    error?: { message?: string; code?: number };
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    promptFeedback?: { blockReason?: string };
  };

  if (!res.ok) {
    const msg =
      raw.error?.message ??
      `Gemini API error (${res.status}). Check GEMINI_MODEL and quota.`;
    return NextResponse.json({ error: "upstream", message: msg }, { status: 502 });
  }

  const blocked = raw.promptFeedback?.blockReason;
  if (blocked) {
    return NextResponse.json(
      { error: "blocked", message: `Prompt blocked: ${blocked}` },
      { status: 422 },
    );
  }

  const text =
    raw.candidates?.[0]?.content?.parts
      ?.map((p) => p.text)
      .filter(Boolean)
      .join("\n")
      .trim() ?? "";

  if (!text) {
    return NextResponse.json(
      { error: "empty", message: "Model returned no text." },
      { status: 502 },
    );
  }

  return NextResponse.json({ suggestion: text });
}
