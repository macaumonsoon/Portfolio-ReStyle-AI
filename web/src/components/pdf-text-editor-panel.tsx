"use client";

import { useEffect, useState } from "react";
import { Type } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDF_FONT_OPTIONS } from "@/lib/pdf-page-types";
import { useProjectStore } from "@/store/use-project-store";
import { useResolvedSourcePageIndex } from "@/hooks/use-resolved-source-page-index";

export function PdfTextEditorPanel() {
  const pdfPagesData = useProjectStore((s) => s.pdfPagesData);
  const sourcePageIndex = useResolvedSourcePageIndex();
  const updatePdfTextItem = useProjectStore((s) => s.updatePdfTextItem);

  const page = pdfPagesData?.[sourcePageIndex];
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  /** 僅在換頁時同步草稿，避免同一頁編輯多欄位時被 store 刷新覆蓋 */
  useEffect(() => {
    const p = useProjectStore.getState().pdfPagesData?.[sourcePageIndex];
    if (!p) {
      setDrafts({});
      return;
    }
    const m: Record<string, string> = {};
    for (const t of p.texts) m[t.id] = t.content;
    setDrafts(m);
  }, [sourcePageIndex]);

  if (!pdfPagesData || !page) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Type className="size-4" />
          本頁 PDF 文字
        </CardTitle>
        <CardDescription>
          修改內容後在輸入框外點一下（失焦）即更新預覽；字體類型變更會立即生效。白塊會遮蓋底圖上的原字，再以向量字重繪（複雜版面可能需微調位置，正式版可接精準 OCR）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        {page.texts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            此頁未偵測到可選取文字（可能為純圖片 PDF）。
          </p>
        ) : (
          <ul className="max-h-[min(420px,50vh)] space-y-4 overflow-y-auto pr-1">
            {page.texts.map((t, idx) => (
              <li
                key={t.id}
                className="space-y-2 rounded-lg border border-border bg-muted/20 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    區塊 {idx + 1}
                    {t.pdfFontName ? (
                      <span className="ml-1 font-normal opacity-80">
                        · {t.pdfFontName.slice(0, 32)}
                      </span>
                    ) : null}
                  </span>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">文字內容</Label>
                  <Input
                    value={drafts[t.id] ?? t.content}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [t.id]: e.target.value }))
                    }
                    onBlur={() => {
                      const v = (drafts[t.id] ?? t.content).trim();
                      if (v !== t.content.trim()) {
                        updatePdfTextItem(sourcePageIndex, t.id, {
                          content: v,
                        });
                      }
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">字體類型</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-border bg-card px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    value={t.fontKey}
                    onChange={(e) =>
                      updatePdfTextItem(sourcePageIndex, t.id, {
                        fontKey: e.target.value as (typeof PDF_FONT_OPTIONS)[number]["id"],
                      })
                    }
                  >
                    {PDF_FONT_OPTIONS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
