"use client";

import { useEffect, useState } from "react";
import { Type } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDF_FONT_OPTIONS } from "@/lib/pdf-page-types";
import { useUiLocale } from "@/contexts/ui-locale-context";
import { useProjectStore } from "@/store/use-project-store";
import { useResolvedSourcePageIndex } from "@/hooks/use-resolved-source-page-index";

export function SvgTextEditorPanel() {
  const { copy, locale } = useUiLocale();
  const isZh = locale === "zh";
  const e = copy.svgEditor;

  const svgPageLayers = useProjectStore((s) => s.svgPageLayers);
  const sourcePageIndex = useResolvedSourcePageIndex();
  const updateSvgTextItem = useProjectStore((s) => s.updateSvgTextItem);

  const page = svgPageLayers?.[sourcePageIndex];
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    const p = useProjectStore.getState().svgPageLayers?.[sourcePageIndex];
    if (!p) {
      setDrafts({});
      return;
    }
    const m: Record<string, string> = {};
    for (const t of p.texts) m[t.id] = t.content;
    setDrafts(m);
  }, [sourcePageIndex]);

  if (!svgPageLayers || !page) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Type className="size-4" />
          {e.title}
        </CardTitle>
        <CardDescription>{e.desc}</CardDescription>
      </CardHeader>
      <CardContent>
        {page.texts.length === 0 ? (
          <p className="text-sm text-muted-foreground">{e.empty}</p>
        ) : (
          <ul className="max-h-[min(420px,50vh)] space-y-4 overflow-y-auto pr-1">
            {page.texts.map((t, idx) => (
              <li
                key={t.id}
                className="space-y-2 rounded-lg border border-border bg-muted/20 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {e.block(idx + 1)}
                    {t.sourceFontFamily ? (
                      <span className="ml-1 font-normal opacity-80">
                        · {t.sourceFontFamily.slice(0, 40)}
                      </span>
                    ) : null}
                  </span>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{e.content}</Label>
                  <Input
                    value={drafts[t.id] ?? t.content}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [t.id]: e.target.value }))
                    }
                    onBlur={() => {
                      const v = (drafts[t.id] ?? t.content).trim();
                      if (v !== t.content.trim()) {
                        updateSvgTextItem(sourcePageIndex, t.id, {
                          content: v,
                        });
                      }
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{e.font}</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-border bg-card px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    value={t.fontKey}
                    onChange={(e) =>
                      updateSvgTextItem(sourcePageIndex, t.id, {
                        fontKey: e.target.value as (typeof PDF_FONT_OPTIONS)[number]["id"],
                      })
                    }
                  >
                    {PDF_FONT_OPTIONS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {isZh ? f.labelZh : f.labelEn}
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
