import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_MODEL = "gemini-2.5-flash";

type Body = {
  locale?: string;
  narrativeId?: string;
  userBrief?: string;
  pageCount?: number;
  /** Short text summaries per page (extracted text snippets) */
  pageSummaries?: string[];
};

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const locale = body.locale === "en" ? "en" : "zh";
  const narrativeId = body.narrativeId ?? "logic";
  const userBrief = (body.userBrief ?? "").slice(0, 4000);
  const pageCount = body.pageCount ?? 0;
  const summaries = (body.pageSummaries ?? []).map((s) =>
    typeof s === "string" ? s.slice(0, 500) : "",
  );

  if (pageCount < 2) {
    return NextResponse.json({ order: [0], reasoning: "" });
  }

  const pageList = summaries
    .map((s, i) => `Page ${i + 1}: ${s || "(no text)"}`)
    .join("\n");

  const narrativeMap: Record<string, string> = {
    logic: locale === "zh" ? "工作邏輯順序（能力→流程→案例）" : "Work logic (skills → process → case studies)",
    story: locale === "zh" ? "故事線（時間線/敘事）" : "Story arc (timeline/narrative)",
    project: locale === "zh" ? "依專案類型分組" : "By project type",
  };

  const systemPrompt = locale === "zh"
    ? `你是作品集頁序規劃助手。根據使用者選擇的敘事邏輯、簡述和各頁內容，推薦最佳瀏覽順序。
回覆嚴格 JSON：
{
  "order": [0, 2, 1, ...],
  "reasoning": "為什麼這個順序最好（2-3句）"
}
- order 是 0-based 頁碼陣列，長度必須等於頁數
- 每個頁碼只能出現一次
- 只輸出 JSON`
    : `You are a portfolio page order assistant. Recommend the best browse order based on narrative logic, brief, and page contents.
Reply in strict JSON:
{
  "order": [0, 2, 1, ...],
  "reasoning": "Why this order works best (2-3 sentences)"
}
- order is a 0-based page index array, length must equal page count
- Each index appears exactly once
- Only output JSON`;

  const userText = locale === "zh"
    ? `敘事邏輯：${narrativeMap[narrativeId] ?? narrativeId}
簡述：${userBrief || "（無）"}
總頁數：${pageCount}

各頁內容摘要：
${pageList}

請推薦最佳瀏覽順序。`
    : `Narrative: ${narrativeMap[narrativeId] ?? narrativeId}
Brief: ${userBrief || "(none)"}
Total pages: ${pageCount}

Page summaries:
${pageList}

Recommend the best browse order.`;

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userText }] }],
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.3,
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

  // Strip markdown code fences if present
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  try {
    const parsed = JSON.parse(text) as { order?: number[]; reasoning?: string };
    const order = parsed.order;

    if (
      !Array.isArray(order) ||
      order.length !== pageCount ||
      !order.every((v) => typeof v === "number" && v >= 0 && v < pageCount)
    ) {
      return NextResponse.json({
        order: Array.from({ length: pageCount }, (_, i) => i),
        reasoning: "",
      });
    }

    const unique = new Set(order);
    if (unique.size !== pageCount) {
      return NextResponse.json({
        order: Array.from({ length: pageCount }, (_, i) => i),
        reasoning: "",
      });
    }

    return NextResponse.json({
      order,
      reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "",
    });
  } catch {
    return NextResponse.json({
      order: Array.from({ length: pageCount }, (_, i) => i),
      reasoning: "",
    });
  }
}
