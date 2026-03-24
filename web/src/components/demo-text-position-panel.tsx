"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DEMO_TEXT_DEFAULT, type DemoTextLayout } from "@/lib/demo-svg";

const X_MAX = 720;
const Y_MAX = 560;
const Y_MIN = 32;

type RowProps = {
  label: string;
  x: number;
  y: number;
  onX: (v: number) => void;
  onY: (v: number) => void;
};

function Row({ label, x, y, onX, onY }: RowProps) {
  return (
    <div className="space-y-3 rounded-md border border-border bg-muted/20 p-3">
      <p className="text-sm font-medium">{label}</p>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Label className="w-8 shrink-0 text-xs text-muted-foreground">X</Label>
          <Slider
            value={[x]}
            min={0}
            max={X_MAX}
            step={2}
            onValueChange={(v) => onX(v[0] ?? 0)}
          />
          <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
            {Math.round(x)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Label className="w-8 shrink-0 text-xs text-muted-foreground">Y</Label>
          <Slider
            value={[y]}
            min={Y_MIN}
            max={Y_MAX}
            step={2}
            onValueChange={(v) => onY(v[0] ?? Y_MIN)}
          />
          <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
            {Math.round(y)}
          </span>
        </div>
      </div>
    </div>
  );
}

type Props = {
  layout: DemoTextLayout;
  onLayoutChange: (next: DemoTextLayout) => void;
};

export function DemoTextPositionPanel({ layout, onLayoutChange }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">示範文案位置</CardTitle>
        <CardDescription>
          拖動滑桿調整內建三段文字在畫布上的座標（X/Y），預覽即時更新；進入下一步後版面會保留。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Row
          label="大標題 · Capabilities"
          x={layout.title.x}
          y={layout.title.y}
          onX={(x) => onLayoutChange({ ...layout, title: { ...layout.title, x } })}
          onY={(y) => onLayoutChange({ ...layout, title: { ...layout.title, y } })}
        />
        <Row
          label="副標題 · Bold Studio…"
          x={layout.subtitle.x}
          y={layout.subtitle.y}
          onX={(x) =>
            onLayoutChange({ ...layout, subtitle: { ...layout.subtitle, x } })
          }
          onY={(y) =>
            onLayoutChange({ ...layout, subtitle: { ...layout.subtitle, y } })
          }
        />
        <Row
          label="頁尾 · Strategy · Brand…"
          x={layout.footer.x}
          y={layout.footer.y}
          onX={(x) =>
            onLayoutChange({ ...layout, footer: { ...layout.footer, x } })
          }
          onY={(y) =>
            onLayoutChange({ ...layout, footer: { ...layout.footer, y } })
          }
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onLayoutChange({ ...DEMO_TEXT_DEFAULT })}
        >
          還原預設位置
        </Button>
      </CardContent>
    </Card>
  );
}
