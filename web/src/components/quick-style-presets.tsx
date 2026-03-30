"use client";

import { Button } from "@/components/ui/button";
import { useUiLocale } from "@/contexts/ui-locale-context";
import {
  PALETTES,
  QUICK_STYLE_PRESETS,
  useProjectStore,
} from "@/store/use-project-store";

export function QuickStylePresets() {
  const { locale, copy } = useUiLocale();
  const isZh = locale === "zh";
  const setOptions = useProjectStore((s) => s.setOptions);
  const styleKeyword = useProjectStore((s) => s.styleKeyword);
  const paletteId = useProjectStore((s) => s.paletteId);
  const gridPresetId = useProjectStore((s) => s.gridPresetId);

  const isActive = (p: (typeof QUICK_STYLE_PRESETS)[number]) =>
    p.styleKeyword === styleKeyword &&
    p.paletteId === paletteId &&
    p.gridPresetId === gridPresetId;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground/80">
        {copy.quickPresets.label}
      </p>
      <div className="flex flex-wrap gap-2">
        {QUICK_STYLE_PRESETS.map((p) => {
          const pal = PALETTES.find((x) => x.id === p.paletteId);
          const active = isActive(p);
          return (
            <Button
              key={p.id}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              className="h-auto gap-2 px-3 py-2 text-left"
              onClick={() =>
                setOptions({
                  styleKeyword: p.styleKeyword,
                  paletteId: p.paletteId,
                  gridPresetId: p.gridPresetId,
                })
              }
            >
              {pal && (
                <span
                  className="inline-block size-3 shrink-0 rounded-full border border-border/50"
                  style={{
                    background: `linear-gradient(135deg, ${pal.accent}, ${pal.muted})`,
                  }}
                />
              )}
              <span className="flex flex-col">
                <span className="text-xs font-semibold">
                  {isZh ? p.labelZh : p.labelEn}
                </span>
                <span className="text-[10px] font-normal opacity-70">
                  {isZh ? p.descZh : p.descEn}
                </span>
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
