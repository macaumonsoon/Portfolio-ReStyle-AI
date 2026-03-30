"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useUiLocale } from "@/contexts/ui-locale-context";

export type BriefAiContext = {
  locale: "zh" | "en";
  narrative: string;
  styleKeyword: string;
  palette: string;
  canvas: string;
  /** 文稿書寫類型（自動偵測或使用者指定） */
  contentScript: string;
};

type Props = {
  brief: string;
  onApply: (next: string) => void;
  context: BriefAiContext;
};

export function BriefAiAssist({ brief, onApply, context }: Props) {
  const { copy } = useUiLocale();
  const a = copy.options;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/brief-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale: context.locale,
          brief,
          narrative: context.narrative,
          styleKeyword: context.styleKeyword,
          palette: context.palette,
          canvas: context.canvas,
          contentScript: context.contentScript,
        }),
      });
      const data = (await r.json()) as {
        suggestion?: string;
        message?: string;
        error?: string;
      };
      if (!r.ok) {
        if (data.error === "not_configured") {
          setError("__MISSING_KEY__");
        } else {
          setError(data.message ?? a.briefAiError);
        }
        return;
      }
      setSuggestion(data.suggestion ?? "");
      setOpen(true);
    } catch {
      setError(a.briefAiError);
    } finally {
      setLoading(false);
    }
  };

  const apply = () => {
    onApply(suggestion.trim());
    setOpen(false);
    setSuggestion("");
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-1.5"
            disabled={loading}
            onClick={run}
          >
            {loading ? (
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="size-4 shrink-0" aria-hidden />
            )}
            {a.briefAiButton}
          </Button>
          <p className="text-xs text-muted-foreground">{a.briefAiFootnote}</p>
        </div>
        {error === "__MISSING_KEY__" ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-3 text-sm text-foreground"
          >
            <p className="font-semibold text-destructive">
              {a.briefAiMissingKeyTitle}
            </p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-xs leading-relaxed text-foreground/90">
              {a.briefAiMissingKeySteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        ) : error ? (
          <p className="text-xs leading-relaxed text-destructive">{error}</p>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[min(90vh,720px)] max-w-lg gap-4 overflow-hidden sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{a.briefAiDialogTitle}</DialogTitle>
            <DialogDescription>{a.briefAiDialogDesc}</DialogDescription>
          </DialogHeader>
          <Textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            className="min-h-[200px] max-h-[min(50vh,360px)] resize-y text-sm leading-relaxed"
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              {a.briefAiCancel}
            </Button>
            <Button type="button" variant="default" onClick={apply}>
              {a.briefAiApply}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
