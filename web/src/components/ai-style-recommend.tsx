"use client";

import { useCallback, useState } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUiLocale } from "@/contexts/ui-locale-context";
import { rasterizeSvgToCanvas } from "@/lib/svg-rasterize";
import {
  PALETTES,
  STYLE_KEYWORD_PRESETS,
  GRID_PRESETS,
  useProjectStore,
  type StyleKeywordId,
} from "@/store/use-project-store";

type Recommendation = {
  styleKeyword: string;
  paletteId: string;
  gridPresetId: string;
  briefSuggestion: string;
  reasoning: string;
};

type Props = {
  extractedText: string;
};

export function AiStyleRecommend({ extractedText }: Props) {
  const { locale, copy } = useUiLocale();
  const isZh = locale === "zh";
  const a = copy.aiStyle;

  const pageSvgs = useProjectStore((s) => s.pageSvgs);
  const setOptions = useProjectStore((s) => s.setOptions);

  const [loading, setLoading] = useState(false);
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const analyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    setApplied(false);
    try {
      let thumbnail = "";
      const first = pageSvgs[0];
      if (first) {
        try {
          const canvas = await rasterizeSvgToCanvas(first, { maxSide: 512 });
          if (canvas) {
            thumbnail = canvas.toDataURL("image/png").split(",")[1] ?? "";
          }
        } catch {
          /* rasterization can fail for complex SVGs; continue without thumbnail */
        }
      }

      const res = await fetch("/api/style-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          thumbnail,
          extractedText,
          pageCount: pageSvgs.length,
        }),
      });

      const data = (await res.json()) as Recommendation & {
        error?: string;
        message?: string;
      };

      if (!res.ok) {
        if (data.error === "not_configured") {
          setError("__MISSING_KEY__");
        } else {
          setError(data.message ?? a.error);
        }
        return;
      }

      setRec(data);
    } catch {
      setError(a.error);
    } finally {
      setLoading(false);
    }
  }, [pageSvgs, extractedText, locale, a.error]);

  const applyRec = useCallback(() => {
    if (!rec) return;
    setOptions({
      styleKeyword: rec.styleKeyword as StyleKeywordId,
      paletteId: rec.paletteId as typeof PALETTES[number]["id"],
      gridPresetId: rec.gridPresetId as typeof GRID_PRESETS[number]["id"],
      userBrief: rec.briefSuggestion || undefined,
    });
    setApplied(true);
  }, [rec, setOptions]);

  const styleMeta = rec
    ? STYLE_KEYWORD_PRESETS.find((k) => k.id === rec.styleKeyword)
    : null;
  const paletteMeta = rec
    ? PALETTES.find((p) => p.id === rec.paletteId)
    : null;
  const gridMeta = rec
    ? GRID_PRESETS.find((g) => g.id === rec.gridPresetId)
    : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-1.5"
          disabled={loading || pageSvgs.length === 0}
          onClick={analyze}
        >
          {loading ? (
            <Loader2 className="size-4 shrink-0 animate-spin" />
          ) : (
            <Wand2 className="size-4 shrink-0" />
          )}
          {a.button}
        </Button>
        <span className="text-xs text-muted-foreground">{a.footnote}</span>
      </div>

      {error === "__MISSING_KEY__" ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {a.missingKey}
        </p>
      ) : error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}

      {rec && (
        <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span className="text-sm font-semibold">{a.resultTitle}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {styleMeta && (
              <Badge variant="secondary">
                {isZh ? styleMeta.labelZh : styleMeta.labelEn}
              </Badge>
            )}
            {paletteMeta && (
              <Badge variant="secondary" className="gap-1.5">
                <span
                  className="inline-block size-2.5 rounded-full border border-border/50"
                  style={{
                    background: `linear-gradient(135deg, ${paletteMeta.accent}, ${paletteMeta.muted})`,
                  }}
                />
                {isZh ? paletteMeta.nameZh : paletteMeta.nameEn}
              </Badge>
            )}
            {gridMeta && (
              <Badge variant="secondary">
                {isZh ? gridMeta.labelZh : gridMeta.labelEn}
              </Badge>
            )}
          </div>

          {rec.reasoning && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {rec.reasoning}
            </p>
          )}

          <Button
            type="button"
            size="sm"
            variant={applied ? "secondary" : "default"}
            className="gap-1.5"
            onClick={applyRec}
            disabled={applied}
          >
            {applied ? a.applied : a.apply}
          </Button>
        </div>
      )}
    </div>
  );
}
