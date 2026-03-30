"use client";

import { Button } from "@/components/ui/button";
import { useUiLocale } from "@/contexts/ui-locale-context";
import { NARRATIVES, useProjectStore } from "@/store/use-project-store";

export function NarrativeOrderPicker() {
  const { locale, copy } = useUiLocale();
  const isZh = locale === "zh";
  const narrativeId = useProjectStore((s) => s.narrativeId);
  const setOptions = useProjectStore((s) => s.setOptions);

  return (
    <div className="flex flex-col gap-2">
      {NARRATIVES.map((n) => (
        <Button
          key={n.id}
          type="button"
          variant={narrativeId === n.id ? "default" : "secondary"}
          className="h-auto justify-start py-2 text-left"
          onClick={() => setOptions({ narrativeId: n.id })}
        >
          <span className="block font-medium">
            {isZh ? n.labelZh : n.labelEn}
          </span>
          <span className="block text-xs font-normal opacity-80">
            {isZh ? n.descZh : n.descEn}
          </span>
        </Button>
      ))}
      <p className="text-xs leading-relaxed text-muted-foreground">
        {copy.options.fontNarrativeHint}
      </p>
    </div>
  );
}
