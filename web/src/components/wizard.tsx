"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  Check,
  Download,
  ImageIcon,
  Layers,
  Palette,
  Sparkles,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SvgInlinePreview } from "@/components/svg-inline-preview";
import { DemoTextPositionPanel } from "@/components/demo-text-position-panel";
import { PdfTextEditorPanel } from "@/components/pdf-text-editor-panel";
import { SvgTextEditorPanel } from "@/components/svg-text-editor-panel";
import { UploadPdfDialog } from "@/components/upload-pdf-dialog";
import { WebglPreviewPanel } from "@/components/webgl/webgl-preview-panel";
import { LivePreviewTestDock } from "@/components/live-preview-test-dock";
import { buildThreeVariants, type CompareMode } from "@/lib/svg-variants";
import { computeOrderedSourceIndices } from "@/lib/page-order";
import { downloadTextFile } from "@/lib/download";
import { useResolvedSourcePageIndex } from "@/hooks/use-resolved-source-page-index";
import {
  DEMO_FILE_NAME,
  DEMO_TEXT_DEFAULT,
  buildDemoSvg,
  type DemoTextLayout,
} from "@/lib/demo-svg";
import type { PdfPageLayer } from "@/lib/pdf-page-types";
import {
  CANVAS_PRESETS,
  FONT_STYLES,
  GRID_PRESETS,
  NARRATIVES,
  PALETTES,
  STYLE_KEYWORDS,
  useProjectStore,
} from "@/store/use-project-store";

export function Wizard() {
  const svgInputRef = useRef<HTMLInputElement>(null);
  const [compare, setCompare] = useState(50);
  const [compareMode, setCompareMode] = useState<CompareMode>("both");
  const [demoLayout, setDemoLayout] = useState<DemoTextLayout>(() => ({
    ...DEMO_TEXT_DEFAULT,
  }));

  const step = useProjectStore((s) => s.step);
  const setStep = useProjectStore((s) => s.setStep);
  const setFile = useProjectStore((s) => s.setFile);
  const setPdfImport = useProjectStore((s) => s.setPdfImport);
  const patchSourceSvg = useProjectStore((s) => s.patchSourceSvg);
  const setOptions = useProjectStore((s) => s.setOptions);
  const setOrderedSourceIndices = useProjectStore((s) => s.setOrderedSourceIndices);
  const reset = useProjectStore((s) => s.reset);

  const fileName = useProjectStore((s) => s.fileName);
  const isPdf = useProjectStore((s) => s.isPdf);
  const pageSvgs = useProjectStore((s) => s.pageSvgs);
  const styleKeyword = useProjectStore((s) => s.styleKeyword);
  const paletteId = useProjectStore((s) => s.paletteId);
  const canvasPresetId = useProjectStore((s) => s.canvasPresetId);
  const fontStyleId = useProjectStore((s) => s.fontStyleId);
  const narrativeId = useProjectStore((s) => s.narrativeId);
  const userBrief = useProjectStore((s) => s.userBrief);
  const gridPresetId = useProjectStore((s) => s.gridPresetId);
  const currentPageIndex = useProjectStore((s) => s.currentPageIndex);
  const setCurrentPageIndex = useProjectStore((s) => s.setCurrentPageIndex);
  const selectionByPage = useProjectStore((s) => s.selectionByPage);
  const selectVariant = useProjectStore((s) => s.selectVariant);
  const finalizedPageSvgs = useProjectStore((s) => s.finalizedPageSvgs);

  const sourcePageIndex = useResolvedSourcePageIndex();

  const ctx = useMemo(
    () => ({
      styleKeyword,
      paletteId,
      fontStyleId,
      narrativeId,
      gridPresetId,
    }),
    [styleKeyword, paletteId, fontStyleId, narrativeId, gridPresetId],
  );

  const currentPageSvg = pageSvgs[sourcePageIndex] ?? "";
  const variants = useMemo(
    () =>
      currentPageSvg
        ? buildThreeVariants(currentPageSvg, sourcePageIndex, ctx, {
            isPdfRaster: isPdf,
          })
        : (["", "", ""] as [string, string, string]),
    [currentPageSvg, sourcePageIndex, ctx, isPdf],
  );

  const selectedForPage = selectionByPage[currentPageIndex];
  const previewAfter =
    selectedForPage != null ? variants[selectedForPage] : variants[0];

  const comparePair = useMemo(() => {
    if (compareMode === "color") {
      return {
        left: previewAfter,
        right: previewAfter,
        leftSuppress: true,
        rightSuppress: false,
      };
    }
    if (compareMode === "layout") {
      return {
        left: currentPageSvg,
        right: previewAfter,
        leftSuppress: false,
        rightSuppress: true,
      };
    }
    return {
      left: currentPageSvg,
      right: previewAfter,
      leftSuppress: false,
      rightSuppress: false,
    };
  }, [compareMode, currentPageSvg, previewAfter]);

  /** 右側「即時預覽測試」面板：隨步驟與選項更新 */
  const livePreviewSvg = useMemo(() => {
    const first = pageSvgs[0] ?? "";
    if (!first) return "";
    if (step === "upload") return first;
    if (step === "options") {
      return buildThreeVariants(first, 0, ctx, { isPdfRaster: isPdf })[0];
    }
    if (step === "pages") return previewAfter;
    if (step === "export") {
      const hit = finalizedPageSvgs.find(Boolean);
      return hit ?? first;
    }
    return first;
  }, [step, pageSvgs, ctx, isPdf, previewAfter, finalizedPageSvgs]);

  const livePreviewCaption = useMemo(() => {
    if (!pageSvgs.length) return "請先上傳 SVG 或 PDF。";
    if (step === "upload") return "第一頁原稿（與上傳步驟內預覽一致）。";
    if (step === "options") {
      return "以第一頁即時套用目前選項：風格、色系、網格、字體等；調整後立即反映。";
    }
    if (step === "pages") {
      return `瀏覽第 ${currentPageIndex + 1} 步 · 原稿第 ${sourcePageIndex + 1} 頁 · 顯示已選版本（未選時為版本 1）。`;
    }
    if (step === "export") {
      return "已選版本匯出預覽（優先顯示第一頁成品）。";
    }
    return "";
  }, [step, pageSvgs.length, currentPageIndex, sourcePageIndex]);

  const onSvgFile = useCallback(
    (f: File | null) => {
      if (!f) return;
      const name = f.name.toLowerCase();
      if (!name.endsWith(".svg")) {
        alert("請上傳 .svg，或使用下方「上傳 PDF」。");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        setFile(f.name, text, false);
      };
      reader.readAsText(f);
    },
    [setFile],
  );

  const onPdfImported = useCallback(
    (name: string, pages: PdfPageLayer[]) => {
      setPdfImport(name, pages);
    },
    [setPdfImport],
  );

  const updateDemoLayout = useCallback(
    (next: DemoTextLayout) => {
      setDemoLayout(next);
      patchSourceSvg(buildDemoSvg(next));
    },
    [patchSourceSvg],
  );

  const loadDemo = useCallback(() => {
    const base = { ...DEMO_TEXT_DEFAULT };
    setDemoLayout(base);
    setFile(DEMO_FILE_NAME, buildDemoSvg(base), false);
  }, [setFile]);

  const isDemoFile = fileName === DEMO_FILE_NAME && !isPdf;

  const canLeaveUpload = pageSvgs.length > 0;
  const totalPages = pageSvgs.length;
  const allPagesChosen =
    totalPages > 0 &&
    pageSvgs.every((_, i) => selectionByPage[i] != null);

  const goExport = () => {
    if (!allPagesChosen) return;
    setStep("export");
  };

  const exportAll = () => {
    const base = (fileName ?? "portfolio").replace(/\.[^.]+$/, "");
    finalizedPageSvgs.forEach((svg, i) => {
      if (!svg) return;
      window.setTimeout(() => {
        downloadTextFile(`${base}-page-${i + 1}-restyled.svg`, svg);
      }, i * 450);
    });
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[min(90rem,100%)] flex-col gap-10 px-4 py-12 lg:flex-row lg:items-start lg:gap-8 md:px-8">
      <div className="flex min-w-0 flex-1 flex-col gap-10 pb-24 lg:pb-0">
      <header className="flex flex-col gap-4 border-b border-border pb-10 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-6 text-foreground" aria-hidden />
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Portfolio ReStyle AI
            </h1>
          </div>
          <p className="max-w-xl text-sm text-muted-foreground md:text-base">
            呼應作品集敘事與網格化重組：上傳 SVG 或 PDF，描述你的生成想法並選擇畫布、色系、字體與敘事邏輯；可選網格分區打亂重排。每頁即時預覽三個版面版本，逐頁選定後再進下一頁。PDF
            在瀏覽器內轉為逐頁預覽（點陣內嵌），正式 AI 佈局可接後端 API。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" type="button" onClick={() => reset()}>
            重新開始
          </Button>
        </div>
      </header>

      <StepIndicator step={step} />

      {step === "upload" && (
        <section className="grid gap-6 md:grid-cols-2">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Upload className="size-4" />
                上傳作品集
              </CardTitle>
              <CardDescription>
                SVG 可直接選檔；PDF 請點「上傳 PDF」開啟專用視窗（拖放或點選）。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={svgInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                className="hidden"
                onChange={(e) => onSvgFile(e.target.files?.[0] ?? null)}
              />
              <Button
                type="button"
                className="w-full"
                onClick={() => svgInputRef.current?.click()}
              >
                選擇 SVG
              </Button>
              <UploadPdfDialog onImported={onPdfImported} />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={loadDemo}
              >
                載入示範 SVG
              </Button>
              {fileName && (
                <p className="text-sm text-muted-foreground">
                  已選：<span className="font-medium text-foreground">{fileName}</span>
                  {isPdf && pageSvgs.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      PDF · {pageSvgs.length} 頁
                    </Badge>
                  )}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="size-4" />
                預覽
              </CardTitle>
              <CardDescription>第一頁縮覽（SVG 向量或 PDF 轉頁）</CardDescription>
            </CardHeader>
            <CardContent>
              {pageSvgs[0] ? (
                <SvgInlinePreview
                  svg={pageSvgs[0]}
                  className="aspect-[4/3] max-h-[280px]"
                />
              ) : (
                <div className="flex aspect-[4/3] max-h-[280px] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
                  尚未載入檔案
                </div>
              )}
            </CardContent>
          </Card>

          {isDemoFile && (
            <div className="md:col-span-2">
              <DemoTextPositionPanel
                layout={demoLayout}
                onLayoutChange={updateDemoLayout}
              />
            </div>
          )}

          <div className="md:col-span-2 flex justify-end">
            <Button
              type="button"
              disabled={!canLeaveUpload}
              onClick={() => setStep("options")}
            >
              下一步：風格與畫布
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </section>
      )}

      {step === "options" && (
        <section className="space-y-8">
          {isDemoFile && (
            <DemoTextPositionPanel
              layout={demoLayout}
              onLayoutChange={updateDemoLayout}
            />
          )}
          <div className="grid gap-6 md:grid-cols-2">
            <FieldGroup label="風格關鍵詞">
              <div className="flex flex-wrap gap-2">
                {STYLE_KEYWORDS.map((k) => (
                  <Button
                    key={k}
                    type="button"
                    size="sm"
                    variant={styleKeyword === k ? "default" : "secondary"}
                    onClick={() => setOptions({ styleKeyword: k })}
                  >
                    {k}
                  </Button>
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="色系">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PALETTES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setOptions({ paletteId: p.id })}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors ${
                      paletteId === p.id
                        ? "border-primary bg-card ring-2 ring-primary/20"
                        : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    <span
                      className="size-4 rounded-full border border-border"
                      style={{
                        background: `linear-gradient(135deg, ${p.accent}, ${p.muted})`,
                      }}
                    />
                    {p.name}
                  </button>
                ))}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                向量 SVG：三版本字色分別為「正文色 / 主色 / 次要色」。PDF
                頁為點陣，字色隨整頁濾鏡一併改變。
              </p>
            </FieldGroup>

            <FieldGroup label="畫布尺寸">
              <div className="flex flex-col gap-2">
                {CANVAS_PRESETS.map((c) => (
                  <Button
                    key={c.id}
                    type="button"
                    variant={canvasPresetId === c.id ? "default" : "secondary"}
                    className="justify-start"
                    onClick={() => setOptions({ canvasPresetId: c.id })}
                  >
                    {c.label}
                  </Button>
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="創作簡述（給 AI / 頁序參考）">
              <Textarea
                placeholder="例：希望突出品牌與 UI 案例，語氣專業、留白多；或：學術向，先研究方法再展示專題……"
                value={userBrief}
                onChange={(e) => setOptions({ userBrief: e.target.value })}
                className="min-h-[120px] resize-y"
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                示範版會依關鍵詞微調「工作邏輯」下的頁序；完整語意排序可接大模型 API。
              </p>
            </FieldGroup>

            <FieldGroup label="網格分區重排">
              <div className="flex flex-col gap-2">
                {GRID_PRESETS.map((g) => (
                  <Button
                    key={g.id}
                    type="button"
                    variant={gridPresetId === g.id ? "default" : "secondary"}
                    className="h-auto justify-start py-2 text-left"
                    onClick={() => setOptions({ gridPresetId: g.id })}
                  >
                    <span className="block font-medium">{g.label}</span>
                    {g.cols > 0 ? (
                      <span className="block text-xs font-normal opacity-80">
                        三版本：順序不變 / 區塊反向 / 偽隨機重排（每頁種子不同）
                      </span>
                    ) : (
                      <span className="block text-xs font-normal opacity-80">
                        僅版面微移與濾鏡示範
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="字體風格 · 敘事邏輯">
              <div className="space-y-3">
                <div className="flex flex-col gap-2">
                  {FONT_STYLES.map((f) => (
                    <Button
                      key={f.id}
                      type="button"
                      variant={fontStyleId === f.id ? "default" : "secondary"}
                      className="h-auto justify-start py-2 text-left"
                      onClick={() => setOptions({ fontStyleId: f.id })}
                    >
                      <span className="block font-medium">{f.label}</span>
                      <span className="block text-xs font-normal opacity-80">
                        {f.hint}
                      </span>
                    </Button>
                  ))}
                </div>
                <div className="flex flex-col gap-2 border-t border-border pt-3">
                  {NARRATIVES.map((n) => (
                    <Button
                      key={n.id}
                      type="button"
                      variant={narrativeId === n.id ? "default" : "secondary"}
                      className="h-auto justify-start py-2 text-left"
                      onClick={() => setOptions({ narrativeId: n.id })}
                    >
                      <span className="block font-medium">{n.label}</span>
                      <span className="block text-xs font-normal opacity-80">
                        {n.desc}
                      </span>
                    </Button>
                  ))}
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  點「開始生成頁面」時，會依敘事與簡述計算瀏覽順序（示範演算法）；匯出順序與精靈步驟一致。
                </p>
              </div>
            </FieldGroup>
          </div>

          <div className="flex flex-wrap justify-between gap-4">
            <Button type="button" variant="ghost" onClick={() => setStep("upload")}>
              返回
            </Button>
            <Button
              type="button"
              disabled={!canLeaveUpload}
              onClick={() => {
                setOrderedSourceIndices(
                  computeOrderedSourceIndices(
                    narrativeId,
                    pageSvgs.length,
                    userBrief.trim(),
                  ),
                );
                setCurrentPageIndex(0);
                setStep("pages");
              }}
            >
              開始生成頁面
              <Layers className="size-4" />
            </Button>
          </div>
        </section>
      )}

      {step === "pages" && totalPages > 0 && (
        <section className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                瀏覽順序第 {currentPageIndex + 1} / {totalPages} 步
                {totalPages > 0 ? (
                  <span className="text-muted-foreground/90">
                    {" "}
                    · 對應原稿第 {sourcePageIndex + 1} 頁
                  </span>
                ) : null}
                {" · "}
                請選擇一個版本後繼續
              </p>
              <p className="text-xs text-muted-foreground">
                {gridPresetId !== "off"
                  ? "已開啟網格重排：三版本為同一網格下不同的區塊置換順序，並疊加濾鏡與位移。"
                  : isPdf
                    ? "PDF 頁面：三版本使用強烈雙色調 / 色相重塑（依你選的色系）；向量 SVG 仍為輕微調色。"
                    : "示範：三版本為不同版式縮放 + 色相微調；正式版由 AI 產出。"}
              </p>
            </div>
            <Badge variant="outline">
              {CANVAS_PRESETS.find((c) => c.id === canvasPresetId)?.label}
            </Badge>
          </div>

          {isPdf && <PdfTextEditorPanel />}
          {!isPdf && <SvgTextEditorPanel />}

          <div className="grid gap-4 lg:grid-cols-3">
            {variants.map((svg, i) => (
              <Card
                key={i}
                className={
                  selectedForPage === i ? "ring-2 ring-primary ring-offset-2" : ""
                }
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    版本 {i + 1}
                  </CardTitle>
                  <CardDescription>
                    {gridPresetId !== "off"
                      ? (
                          [
                            "網格：區塊順序與閱讀向一致",
                            "網格：區塊整體反向",
                            "網格：區塊偽隨機重排",
                          ] as const
                        )[i]
                      : (
                          [
                            "結構穩定",
                            "略低重心",
                            "偏上構圖",
                          ] as const
                        )[i]}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <SvgInlinePreview
                    svg={svg}
                    className="aspect-[4/3] max-h-[200px] bg-white"
                  />
                  <Button
                    type="button"
                    className="w-full"
                    variant={selectedForPage === i ? "default" : "secondary"}
                    onClick={() => selectVariant(currentPageIndex, i, svg)}
                  >
                    {selectedForPage === i ? (
                      <>
                        <Check className="size-4" />
                        已選擇
                      </>
                    ) : (
                      "選擇此版本"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {previewAfter ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Three.js 預覽層</CardTitle>
                <CardDescription>
                  將當前選定版本（或預設版本 1）的 SVG 烘焙為紋理顯示；可拖曳旋轉。行為對齊專案根目錄
                  technical-three.md（SSOT 仍為 SVG，匯出不使用 WebGL 截圖）。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WebglPreviewPanel svg={previewAfter} />
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="size-4" />
                Before / After
              </CardTitle>
              <CardDescription>
                可切換「綜合 / 偏顏色 / 偏版式」對比方式（版式模式會關閉色相濾鏡）。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs
                value={compareMode}
                onValueChange={(v) => setCompareMode(v as CompareMode)}
              >
                <TabsList>
                  <TabsTrigger value="both">綜合</TabsTrigger>
                  <TabsTrigger value="color">顏色</TabsTrigger>
                  <TabsTrigger value="layout">版式</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>對比滑桿</Label>
                  <Slider
                    value={[compare]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(v) => setCompare(v[0] ?? 0)}
                  />
                </div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-border bg-muted/30">
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath: `inset(0 ${100 - compare}% 0 0)`,
                    }}
                  >
                    <SvgInlinePreview
                      svg={comparePair.left}
                      className="h-full border-0 bg-white"
                      suppressFilter={comparePair.leftSuppress}
                      title="對比左側"
                    />
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath: `inset(0 0 0 ${compare}%)`,
                    }}
                  >
                    <SvgInlinePreview
                      svg={comparePair.right}
                      className="h-full border-0 bg-white"
                      suppressFilter={comparePair.rightSuppress}
                      title="對比右側"
                    />
                  </div>
                  <div className="pointer-events-none absolute bottom-3 left-3 rounded bg-background/80 px-2 py-1 text-xs text-foreground shadow">
                    {compareMode === "color" ? "關閉濾鏡" : "Before"}
                  </div>
                  <div className="pointer-events-none absolute bottom-3 right-3 rounded bg-background/80 px-2 py-1 text-xs text-foreground shadow">
                    {compareMode === "color" ? "含濾鏡" : "After"}
                  </div>
                </div>
                {compareMode === "color" && (
                  <p className="text-xs text-muted-foreground">
                    同一版本：左側關閉色相濾鏡、右側保留，方便對比色調差異。
                  </p>
                )}
                {compareMode === "layout" && (
                  <p className="text-xs text-muted-foreground">
                    版式模式：右側關閉濾鏡，對比原始頁面與位移縮放後的構圖。
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap justify-between gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep("options")}
            >
              返回選項
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={currentPageIndex === 0}
                onClick={() => setCurrentPageIndex(currentPageIndex - 1)}
              >
                上一頁
              </Button>
              <Button
                type="button"
                disabled={selectedForPage == null}
                onClick={() => {
                  if (currentPageIndex < totalPages - 1) {
                    setCurrentPageIndex(currentPageIndex + 1);
                  } else {
                    goExport();
                  }
                }}
              >
                {currentPageIndex < totalPages - 1 ? (
                  <>
                    下一頁
                    <ArrowRight className="size-4" />
                  </>
                ) : (
                  <>
                    完成並匯出
                    <Check className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
      )}

      {step === "export" && (
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>匯出</CardTitle>
              <CardDescription>
                下載每頁已選版本的 SVG（示範包裝層可於正式版替換為真實 AI
                重排結果）。Figma 相容 JSON / 插件可後續串接。
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button type="button" onClick={exportAll}>
                <Download className="size-4" />
                下載全部 SVG
              </Button>
              <Button type="button" variant="secondary" onClick={() => setStep("pages")}>
                返回修訂
              </Button>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            {finalizedPageSvgs.map(
              (svg, i) =>
                svg && (
                  <SvgInlinePreview
                    key={i}
                    svg={svg}
                    className="aspect-[4/3] border bg-white"
                  />
                ),
            )}
          </div>
        </section>
      )}
      </div>
      <LivePreviewTestDock
        svg={livePreviewSvg}
        caption={livePreviewCaption}
        windowTitle="Portfolio ReStyle · 即時預覽"
      />
    </div>
  );
}

function StepIndicator({ step }: { step: string }) {
  const steps = [
    { id: "upload", label: "上傳" },
    { id: "options", label: "風格" },
    { id: "pages", label: "頁面 ×3" },
    { id: "export", label: "匯出" },
  ];
  const idx = steps.findIndex((s) => s.id === step);
  return (
    <ol className="flex flex-wrap gap-2 text-xs text-muted-foreground md:text-sm">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2">
          <span
            className={`flex size-7 items-center justify-center rounded-full border text-xs font-medium ${
              i <= idx
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card"
            }`}
          >
            {i + 1}
          </span>
          <span className={i === idx ? "font-medium text-foreground" : ""}>
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <span className="hidden text-border sm:inline">/</span>
          )}
        </li>
      ))}
    </ol>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
      <Label className="text-base">{label}</Label>
      {children}
    </div>
  );
}
