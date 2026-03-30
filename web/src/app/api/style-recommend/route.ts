import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_MODEL = "gemini-2.5-flash";

type Body = {
  locale?: string;
  /** base64-encoded PNG thumbnail of the first page */
  thumbnail?: string;
  /** plain text extracted from the portfolio */
  extractedText?: string;
  pageCount?: number;
};

const VALID_STYLES = [
  "Bold",
  "Minimal",
  "Futuristic",
  "Vintage",
  "Narrative",
  "Elegant",
  "Playful",
] as const;
const VALID_PALETTES = [
  "mono",
  "ocean",
  "clay",
  "vine",
  "wine",
] as const;
const VALID_GRIDS = ["off", "2x2", "3x2", "3x3", "1x2", "2x1"] as const;

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    return NextResponse.json(
      { error: "not_configured" },
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
  const thumbnail = body.thumbnail ?? "";
  const extractedText = (body.extractedText ?? "").slice(0, 4000);
  const pageCount = body.pageCount ?? 1;

  const systemPrompt = locale === "zh"
    ? `你是設計作品集風格分析助手。分析使用者上傳的作品集內容，推薦最合適的風格設定。
回覆必須是嚴格 JSON，格式：
{
  "styleKeyword": "Bold|Minimal|Futuristic|Vintage|Narrative|Elegant|Playful",
  "paletteId": "mono|ocean|clay|vine|wine",
  "gridPresetId": "off|2x2|3x2|3x3|1x2|2x1",
  "briefSuggestion": "3-5句風格建議說明",
  "reasoning": "為什麼推薦這個組合（2-3句）"
}
規則：
- styleKeyword 必須是上面 7 個之一
- paletteId 必須是上面 5 個之一
- gridPresetId 必須是上面 6 個之一
- 根據作品集的視覺風格、色調、內容類型來推薦
- briefSuggestion 用中文
- 只輸出 JSON，不要其他文字`
    : `You are a portfolio style analysis assistant. Analyze the uploaded portfolio content and recommend the best style settings.
Reply in strict JSON:
{
  "styleKeyword": "Bold|Minimal|Futuristic|Vintage|Narrative|Elegant|Playful",
  "paletteId": "mono|ocean|clay|vine|wine",
  "gridPresetId": "off|2x2|3x2|3x3|1x2|2x1",
  "briefSuggestion": "3-5 sentence style recommendation",
  "reasoning": "Why this combination (2-3 sentences)"
}
Rules:
- styleKeyword must be one of the 7 listed
- paletteId must be one of the 5 listed
- gridPresetId must be one of the 6 listed
- Base recommendations on visual style, color tone, and content type
- Only output JSON, no other text`;

  const userParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

  if (thumbnail) {
    userParts.push({
      inlineData: {
        mimeType: "image/png",
        data: thumbnail,
      },
    });
  }

  const textBlock = locale === "zh"
    ? `作品集資訊：
- 總頁數：${pageCount}
- 擷取文字（前 4000 字）：${extractedText || "（無可擷取文字，可能為純圖片）"}

請分析並推薦最合適的風格組合。`
    : `Portfolio info:
- Total pages: ${pageCount}
- Extracted text (first 4000 chars): ${extractedText || "(no extractable text, likely image-only)"}

Analyze and recommend the best style combination.`;

  userParts.push({ text: textBlock });

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: userParts }],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    }),
  });

  const raw = (await res.json()) as {
    error?: { message?: string };
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  if (!res.ok) {
    return NextResponse.json(
      { error: "upstream", message: raw.error?.message ?? "Gemini error" },
      { status: 502 },
    );
  }

  let text =
    raw.candidates?.[0]?.content?.parts
      ?.map((p) => p.text)
      .filter(Boolean)
      .join("")
      .trim() ?? "";

  if (!text) {
    return NextResponse.json(
      { error: "empty", message: "Model returned no text." },
      { status: 502 },
    );
  }

  // Strip markdown code fences if present (gemini-2.5+ sometimes wraps JSON)
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;

    const style = VALID_STYLES.includes(parsed.styleKeyword as typeof VALID_STYLES[number])
      ? (parsed.styleKeyword as string)
      : "Bold";
    const palette = VALID_PALETTES.includes(parsed.paletteId as typeof VALID_PALETTES[number])
      ? (parsed.paletteId as string)
      : "mono";
    const grid = VALID_GRIDS.includes(parsed.gridPresetId as typeof VALID_GRIDS[number])
      ? (parsed.gridPresetId as string)
      : "off";

    return NextResponse.json({
      styleKeyword: style,
      paletteId: palette,
      gridPresetId: grid,
      briefSuggestion: typeof parsed.briefSuggestion === "string" ? parsed.briefSuggestion : "",
      reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "",
    });
  } catch {
    return NextResponse.json(
      { error: "parse_error", message: "Could not parse model response as JSON" },
      { status: 502 },
    );
  }
}
