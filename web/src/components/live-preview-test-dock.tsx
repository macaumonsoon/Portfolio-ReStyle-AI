"use client";

import { useState } from "react";
import { AppWindow, Maximize2 } from "lucide-react";
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
  windowTitle?: string;
};

function PreviewFrame({
  svg,
  zoomPercent,
  className,
}: {
  svg: string;
  zoomPercent: number;
  className?: string;
}) {
  const z = zoomPercent / 100;
  if (!svg) {
    return (
      <div
        className={cn(
          "flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 text-sm text-muted-foreground",
          className,
        )}
      >
        尚無可預覽內容
      </div>
    );
  }
  return (
    <div
      className={cn("overflow-auto rounded-md border border-border bg-white", className)}
      style={{ maxHeight: "min(72vh, 820px)" }}
    >
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
  );
}

export function LivePreviewTestDock({
  svg,
  caption,
  windowTitle = "Portfolio ReStyle · 即時預覽",
}: Props) {
  const [zoom, setZoom] = useState(100);
  const [mobileOpen, setMobileOpen] = useState(false);

  const popOut = () => {
    const w = openSvgPreviewWindow(svg, windowTitle);
    if (!w) {
      window.alert(
        "無法開啟預覽視窗，請檢查瀏覽器是否阻擋彈出式視窗，並允許本站彈窗後再試。",
      );
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
          獨立視窗
        </Button>
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">縮放測試 · {zoom}%</Label>
        <Slider
          value={[zoom]}
          min={40}
          max={160}
          step={5}
          onValueChange={(v) => setZoom(v[0] ?? 100)}
        />
      </div>
      <PreviewFrame svg={svg} zoomPercent={zoom} className="min-h-[220px] flex-1" />
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
              className="h-12 gap-2 rounded-full px-5 shadow-lg"
            >
              <Maximize2 className="size-5" />
              即時預覽
            </Button>
          </DialogTrigger>
          <DialogContent className="flex max-h-[90vh] w-[min(100vw-1.5rem,920px)] max-w-none flex-col gap-3 overflow-hidden p-5 sm:p-6">
            <DialogHeader className="shrink-0 text-left">
              <DialogTitle>即時預覽測試</DialogTitle>
              <p className="text-sm text-muted-foreground">{caption}</p>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-hidden">{dockBody}</div>
          </DialogContent>
        </Dialog>
      </div>

      <aside className="hidden w-full min-w-0 shrink-0 lg:block lg:w-[min(100%,400px)] xl:w-[420px]">
        <Card className="sticky top-4 flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden shadow-md">
          <CardHeader className="shrink-0 space-y-1 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Maximize2 className="size-4" />
              即時預覽測試
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              {caption}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col pt-0">
            {dockBody}
          </CardContent>
        </Card>
      </aside>
    </>
  );
}
