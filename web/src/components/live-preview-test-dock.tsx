"use client";

import { useState } from "react";
import { AppWindow, Maximize2 } from "lucide-react";
import { useUiLocale } from "@/contexts/ui-locale-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PreviewBeforeAfterChrome } from "@/components/preview-before-after-chrome";
import { SvgInlinePreview } from "@/components/svg-inline-preview";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { openSvgPreviewWindow } from "@/lib/open-preview-window";
import { cn } from "@/lib/utils";

type Props = {
  svg: string;
  caption: string;
  /** 預設取自當前介面語言的 copy.dock.windowTitle */
  windowTitle?: string;
};

function PreviewFrame({
  svg,
  zoomPercent,
  className,
  emptyLabel,
}: {
  svg: string;
  zoomPercent: number;
  className?: string;
  emptyLabel: string;
}) {
  const z = zoomPercent / 100;
  if (!svg) {
    return (
      <PreviewBeforeAfterChrome className={className}>
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/90 text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      </PreviewBeforeAfterChrome>
    );
  }
  return (
    <PreviewBeforeAfterChrome
      className={cn("flex min-h-0 flex-col", className)}
      innerClassName="min-h-0 flex-1 overflow-hidden rounded-xl border border-border/70 bg-white shadow-inner ring-1 ring-slate-950/5"
    >
      <div className="max-h-[min(72vh,820px)] overflow-auto">
        <div
          className="origin-top p-2"
          style={{
            transform: `scale(${z})`,
            transformOrigin: "top center",
            width: z ? `${100 / z}%` : "100%",
          }}
        >
          <SvgInlinePreview svg={svg} className="border-0 bg-transparent" />
        </div>
      </div>
    </PreviewBeforeAfterChrome>
  );
}

export function LivePreviewTestDock({
  svg,
  caption,
  windowTitle: windowTitleProp,
}: Props) {
  const { copy } = useUiLocale();
  const d = copy.dock;
  const windowTitle = windowTitleProp ?? d.windowTitle;

  const [zoom, setZoom] = useState(100);
  const [mobileOpen, setMobileOpen] = useState(false);

  const popOut = () => {
    const w = openSvgPreviewWindow(svg, windowTitle);
    if (!w) {
      window.alert(d.popoutFail);
    }
  };

  const dockBody = (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-1.5"
          disabled={!svg}
          onClick={popOut}
        >
          <AppWindow className="size-4 shrink-0" />
          {d.popout}
        </Button>
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">{d.zoom(zoom)}</Label>
        <Slider
          value={[zoom]}
          min={40}
          max={160}
          step={5}
          onValueChange={(v) => setZoom(v[0] ?? 100)}
        />
      </div>
      <PreviewFrame
        svg={svg}
        zoomPercent={zoom}
        className="min-h-[220px] flex-1"
        emptyLabel={d.emptySvg}
      />
    </div>
  );

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 lg:hidden">
        <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              size="lg"
              className="h-12 gap-2 rounded-full border-0 bg-gradient-to-r from-primary to-violet-600 px-5 shadow-lift"
            >
              <Maximize2 className="size-5" />
              {d.mobileFab}
            </Button>
          </DialogTrigger>
          <DialogContent className="flex max-h-[90vh] w-[min(100vw-1.5rem,920px)] max-w-none flex-col gap-3 overflow-hidden rounded-2xl border-border/60 p-5 sm:p-6">
            <DialogHeader className="shrink-0 text-left">
              <DialogTitle>{d.dialogTitle}</DialogTitle>
              <p className="text-sm text-muted-foreground">{caption}</p>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-hidden">{dockBody}</div>
          </DialogContent>
        </Dialog>
      </div>

      <aside className="hidden min-h-0 w-full min-w-0 shrink-0 lg:flex lg:w-[min(100%,400px)] lg:flex-col xl:w-[420px]">
        <Card className="sticky top-6 z-30 flex max-h-[calc(100vh-2rem)] w-full flex-col border-primary/10 shadow-lift">
          <CardHeader className="shrink-0 space-y-1.5 pb-3">
            <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Maximize2 className="size-4" />
              </span>
              {d.cardTitle}
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              {caption}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden pt-0">
            {dockBody}
          </CardContent>
        </Card>
      </aside>
    </>
  );
}
