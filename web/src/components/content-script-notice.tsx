"use client";

import { useEffect, useMemo, useState } from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  CONTENT_SCRIPT_MANUAL_IDS,
  type ContentScriptChoiceId,
  detectContentScript,
  extractPortfolioPlainText,
  resolveEffectiveScript,
} from "@/lib/detect-content-script";
import { useUiLocale } from "@/contexts/ui-locale-context";
import { useProjectStore } from "@/store/use-project-store";

const INTRO_SESSION_KEY = "pr_content_script_intro_v1";

export function ContentScriptNotice() {
  const { copy } = useUiLocale();
  const o = copy.options;
  const pageSvgs = useProjectStore((s) => s.pageSvgs);
  const svgPageLayers = useProjectStore((s) => s.svgPageLayers);
  const pdfPagesData = useProjectStore((s) => s.pdfPagesData);
  const contentScriptOverride = useProjectStore((s) => s.contentScriptOverride);
  const setOptions = useProjectStore((s) => s.setOptions);

  const sample = useMemo(
    () =>
      extractPortfolioPlainText({
        pageSvgs,
        svgPageLayers,
        pdfPagesData,
      }),
    [pageSvgs, svgPageLayers, pdfPagesData],
  );

  const detected = useMemo(() => detectContentScript(sample), [sample]);
  const effective = resolveEffectiveScript(detected, contentScriptOverride);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<ContentScriptChoiceId>("auto");

  useEffect(() => {
    if (dialogOpen) {
      setDraft(contentScriptOverride === null ? "auto" : contentScriptOverride);
    }
  }, [dialogOpen, contentScriptOverride]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (detected === "unknown") return;
    if (sessionStorage.getItem(INTRO_SESSION_KEY)) return;
    sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    setDialogOpen(true);
  }, [detected]);

  if (pageSvgs.length === 0) return null;

  const applyDraft = () => {
    if (draft === "auto") {
      setOptions({ contentScriptOverride: null });
    } else {
      setOptions({ contentScriptOverride: draft });
    }
    setDialogOpen(false);
  };

  return (
    <>
      <div className="rounded-xl border border-border/80 bg-card/90 p-4 shadow-soft">
        <div className="flex flex-wrap items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Languages className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-sm font-semibold leading-snug">
              {o.contentScriptTitle}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {o.contentScriptSubtitle}
            </p>
            <p className="text-sm text-foreground/95">
              {o.contentScriptDetectedLine(o.contentScriptLabels[detected])}
            </p>
            <p className="text-sm font-medium text-primary">
              {o.contentScriptEffectiveLine(o.contentScriptLabels[effective])}
            </p>
            {contentScriptOverride !== null ? (
              <p className="text-xs text-muted-foreground">
                {o.contentScriptManualNote}
              </p>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="mt-1"
              onClick={() => setDialogOpen(true)}
            >
              {o.contentScriptOpenDialog}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[min(90vh,640px)] max-w-lg gap-4 overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{o.contentScriptDialogTitle}</DialogTitle>
            <DialogDescription>{o.contentScriptDialogIntro}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setDraft("auto")}
              className={cn(
                "w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                draft === "auto"
                  ? "border-primary/50 bg-primary/10 ring-2 ring-primary/25"
                  : "border-border/80 bg-card/80 hover:bg-muted/40",
              )}
            >
              <span className="font-medium">{o.contentScriptOptionAuto}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {o.contentScriptOptionAutoDesc}
              </span>
            </button>
            {CONTENT_SCRIPT_MANUAL_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setDraft(id)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                  draft === id
                    ? "border-primary/50 bg-primary/10 ring-2 ring-primary/25"
                    : "border-border/80 bg-card/80 hover:bg-muted/40",
                )}
              >
                {o.contentScriptLabels[id]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDialogOpen(false)}
            >
              {o.contentScriptClose}
            </Button>
            <Button type="button" onClick={applyDraft}>
              {o.contentScriptApply}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
