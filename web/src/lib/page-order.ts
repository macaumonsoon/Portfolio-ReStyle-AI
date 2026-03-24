/**
 * 依敘事與使用者簡述產生「瀏覽順序 → 原始頁碼」對照（示範用決定性演算法，可替換為後端 AI）。
 */
export function computeOrderedSourceIndices(
  narrativeId: string,
  pageCount: number,
  userBrief: string,
): number[] {
  const base = Array.from({ length: pageCount }, (_, i) => i);
  if (pageCount <= 1) return base;

  switch (narrativeId) {
    case "logic":
      return orderByBriefKeywords(base, userBrief);
    case "story":
      return rotateForward(base, 1 + (hashBrief(userBrief) % Math.min(3, pageCount)));
    case "project":
      return interleaveHalves(base);
    default:
      return base;
  }
}

function hashBrief(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** 關鍵詞微調：教學/研究往前，商業/客戶案例往後（仍保持合法排列） */
function orderByBriefKeywords(indices: number[], brief: string): number[] {
  const lower = brief.toLowerCase();
  const edu =
    /教學|研究|學術|論文|thesis|research|education/i.test(brief) ||
    lower.includes("edu");
  const biz =
    /商業|品牌|客戶|commission|client|commercial/i.test(brief) ||
    lower.includes("biz");
  if (edu && !biz) return rotateForward(indices, -1);
  if (biz && !edu) return rotateForward(indices, 1);
  return indices;
}

function rotateForward(indices: number[], delta: number): number[] {
  const n = indices.length;
  const d = ((delta % n) + n) % n;
  if (d === 0) return [...indices];
  return [...indices.slice(d), ...indices.slice(0, d)];
}

/** 前半與後半交錯，模擬「按類型穿插」 */
function interleaveHalves(indices: number[]): number[] {
  const n = indices.length;
  const mid = Math.ceil(n / 2);
  const a = indices.slice(0, mid);
  const b = indices.slice(mid);
  const out: number[] = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (i < a.length) out.push(a[i]!);
    if (i < b.length) out.push(b[i]!);
  }
  return out;
}
