"use client";

import { useState } from "react";
import { Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SvgInlinePreview } from "@/components/svg-inline-preview";
import SvgWebglPreview from "@/components/webgl/svg-webgl-preview";

type Props = {
  /** 與 2D 預覽相同的 SVG SSOT（通常為當前選定版本） */
  svg: string;
};

/**
 * Three.js 預覽層：本檔由 wizard 外層 dynamic(ssr:false) 載入，此處不再嵌套 dynamic，
 * 避免 dev 下 Webpack 雙重 async chunk 觸發 `reading 'call'`。
 */
export function WebglPreviewPanel({ svg }: Props) {
  const [motion, setMotion] = useState(true);
  const [fallback2d, setFallback2d] = useState(false);
  /** 每次重試遞增，強制 remount Canvas + 可下調光栅負載 */
  const [webglRetryGen, setWebglRetryGen] = useState(0);

  if (fallback2d) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          WebGL 或紋理烘焙失敗，已回退為 2D 向量預覽。
        </p>
        <SvgInlinePreview svg={svg} className="h-80 border bg-white" />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            setWebglRetryGen((n) => n + 1);
            setFallback2d(false);
          }}
        >
          重試 WebGL
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Box className="size-4 text-muted-foreground" aria-hidden />
          <Label className="text-sm font-medium">WebGL 預覽（紋理烘焙）</Label>
        </div>
        <Button
          type="button"
          size="sm"
          variant={motion ? "default" : "secondary"}
          onClick={() => setMotion((v) => !v)}
        >
          {motion ? "關閉微動效" : "開啟微動效"}
        </Button>
      </div>
      <div className="relative h-80 w-full overflow-hidden rounded-lg border border-border bg-muted/20">
        <SvgWebglPreview
          key={`webgl-${webglRetryGen}`}
          svg={svg}
          motion={motion}
          className="h-full w-full"
          rasterDownshift={webglRetryGen > 0}
          onRasterError={() => setFallback2d(true)}
        />
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        畫面為當前 SVG 的光栅預覽，可旋轉檢視；<strong className="font-medium text-foreground">匯出仍為可編輯 SVG</strong>
        ，不使用 WebGL 截圖作為交付物。
      </p>
    </div>
  );
}
