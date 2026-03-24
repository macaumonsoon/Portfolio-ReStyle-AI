"use client";

import { useMemo } from "react";
import { useProjectStore } from "@/store/use-project-store";

/** 精靈「第 k 步」對應的原始檔案頁索引（敘事排序後） */
export function useResolvedSourcePageIndex(): number {
  const currentPageIndex = useProjectStore((s) => s.currentPageIndex);
  const ordered = useProjectStore((s) => s.orderedSourceIndices);
  const n = useProjectStore((s) => s.pageSvgs.length);

  return useMemo(() => {
    if (ordered.length === n && n > 0) {
      return ordered[currentPageIndex] ?? currentPageIndex;
    }
    return currentPageIndex;
  }, [currentPageIndex, ordered, n]);
}
