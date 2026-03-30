"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Check,
  Download,
  FileDown,
  ImageIcon,
  Layers,
  Loader2,
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
import { PdfTextEditorPanel } from "@/components/pdf-text-editor-panel";
import { SvgTextEditorPanel } from "@/components/svg-text-editor-panel";
import { UploadPdfDialog } from "@/components/upload-pdf-dialog";
import { LivePreviewTestDock } from "@/components/live-preview-test-dock";
import { PreviewBeforeAfterChrome } from "@/components/preview-before-after-chrome";
import { PreviewPanCompareViewport } from "@/components/preview-pan-compare";
import { BriefAiAssist } from "@/components/brief-ai-assist";
import { ContentScriptNotice } from "@/components/content-script-notice";
import { NarrativeOrderPicker } from "@/components/narrative-order-picker";
import { StyleKeywordHintPortal } from "@/components/style-keyword-hint";
import { AiStyleRecommend } from "@/components/ai-style-recommend";
import { QuickStylePresets } from "@/components/quick-style-presets";
import {
  detectContentScript,
  extractPortfolioPlainText,
  resolveEffectiveScript,
} from "@/lib/detect-content-script";
import { fitSvgIntoCanvasViewport } from "@/lib/svg-canvas-fit";
import { cn } from "@/lib/utils";
import { buildThreeVariants, type CompareMode } from "@/lib/svg-variants";
import { computeOrderedSourceIndices } from "@/lib/page-order";
import { injectGridMosaicNudges } from "@/lib/grid-tile-nudge";
import { downloadBlob, downloadTextFile } from "@/lib/download";
import { useResolvedSourcePageIndex } from "@/hooks/use-resolved-source-page-index";
import { useUiLocale } from "@/contexts/ui-locale-context";
import type { PdfPageLayer } from "@/lib/pdf-page-types";
import {
  CANVAS_PRESETS,
  FONT_STYLES,
  GRID_PRESETS,
  NARRATIVES,
  PALETTES,
  resolveCanvasDimensions,
  STYLE_KEYWORD_PRESETS,
  useProjectStore,
} from "@/store/use-project-store";

function WebglLoadingPlaceholder() {
  const { copy } = useUiLocale();
  return (
    <div className="flex h-80 items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/30 text-sm text-muted-foreground">
      {copy.pages.webglLoading}
    </div>
  );
}

/** 與主流程分 chunk，避免 dev 下 Webpack 模組載入順序導致 `reading 'call'` */
const WebglPreviewPanel = dynamic(
  () =>
    import("@/components/webgl/webgl-preview-panel").then((m) => ({
      default: m.WebglPreviewPanel,
    })),
  {
    ssr: false,
    loading: () => <WebglLoadingPlaceholder />,
  },
);

export function Wizard() {
  const { locale, setLocale, copy } = useUiLocale();
  const isZh = locale === "zh";

  const svgInputRef = useRef<HTMLInputElement>(null);
  const [compare, setCompare] = useState(50);
  const [compareMode, setCompareMode] = useState<CompareMode>("both");
  const [pdfExporting, setPdfExporting] = useState(false);
  const [aiOrderLoading, setAiOrderLoading] = useState(false);
  const [aiOrderReasoning, setAiOrderReasoning] = useState("");

  const step = useProjectStore((s) => s.step);
  const setStep = useProjectStore((s) => s.setStep);
  const setFile = useProjectStore((s) => s.setFile);
  const setSvgBulkFiles = useProjectStore((s) => s.setSvgBulkFiles);
  const setPdfImport = useProjectStore((s) => s.setPdfImport);
  const setOptions = useProjectStore((s) => s.setOptions);
  const setOrderedSourceIndices = useProjectStore((s) => s.setOrderedSourceIndices);
  const reset = useProjectStore((s) => s.reset);

  const fileName = useProjectStore((s) => s.fileName);
  const isPdf = useProjectStore((s) => s.isPdf);
  const pageSvgs = useProjectStore((s) => s.pageSvgs);
  const styleKeyword = useProjectStore((s) => s.styleKeyword);
  const paletteId = useProjectStore((s) => s.paletteId);
  const canvasPresetId = useProjectStore((s) => s.canvasPresetId);
  const canvasOrientation = useProjectStore((s) => s.canvasOrientation);
  const fontStyleId = useProjectStore((s) => s.fontStyleId);
  const narrativeId = useProjectStore((s) => s.narrativeId);
  const userBrief = useProjectStore((s) => s.userBrief);
  const gridPresetId = useProjectStore((s) => s.gridPresetId);
  const currentPageIndex = useProjectStore((s) => s.currentPageIndex);
  const setCurrentPageIndex = useProjectStore((s) => s.setCurrentPageIndex);
  const selectionByPage = useProjectStore((s) => s.selectionByPage);
  const selectVariant = useProjectStore((s) => s.selectVariant);
  const finalizedPageSvgs = useProjectStore((s) => s.finalizedPageSvgs);
  const gridTileNudgeByPage = useProjectStore((s) => s.gridTileNudgeByPage);
  const svgPageLayers = useProjectStore((s) => s.svgPageLayers);
  const pdfPagesData = useProjectStore((s) => s.pdfPagesData);
  const contentScriptOverride = useProjectStore((s) => s.contentScriptOverride);
  const orderedSourceIndices = useProjectStore((s) => s.orderedSourceIndices);

  const sourcePageIndex = useResolvedSourcePageIndex();

  const canvasPreset =
    CANVAS_PRESETS.find((c) => c.id === canvasPresetId) ?? CANVAS_PRESETS[0];
  const canvasForPreview = useMemo(
    () => resolveCanvasDimensions(canvasPreset, canvasOrientation),
    [canvasPreset, canvasOrientation],
  );
  const canvasIsSquare = canvasPreset.width === canvasPreset.height;

  /** 網格分區選項啟用時，預覽畫布上疊加示意分割線（與實際重排網格一致） */
  const gridGuideForPreview = useMemo(() => {
    const g = GRID_PRESETS.find((x) => x.id === gridPresetId);
    if (!g || g.cols < 2 || g.rows < 2) return undefined;
    return { cols: g.cols, rows: g.rows };
  }, [gridPresetId]);

  const briefAiContext = useMemo(() => {
    const nar = NARRATIVES.find((x) => x.id === narrativeId) ?? NARRATIVES[0];
    const st =
      STYLE_KEYWORD_PRESETS.find((x) => x.id === styleKeyword) ??
      STYLE_KEYWORD_PRESETS[0];
    const pal = PALETTES.find((x) => x.id === paletteId) ?? PALETTES[0];
    const canvasLine = `${isZh ? canvasPreset.labelZh : canvasPreset.labelEn} · ${
      canvasOrientation === "landscape"
        ? copy.options.canvasLandscape
        : copy.options.canvasPortrait
    }`;
    const textSample = extractPortfolioPlainText({
      pageSvgs,
      svgPageLayers,
      pdfPagesData,
    });
    const eff = resolveEffectiveScript(
      detectContentScript(textSample),
      contentScriptOverride,
    );
    return {
      locale: isZh ? ("zh" as const) : ("en" as const),
      narrative: isZh ? nar.labelZh : nar.labelEn,
      styleKeyword: isZh ? st.labelZh : st.labelEn,
      palette: isZh ? pal.nameZh : pal.nameEn,
      canvas: canvasLine,
      contentScript: copy.options.contentScriptLabels[eff],
    };
  }, [
    narrativeId,
    styleKeyword,
    paletteId,
    canvasPreset,
    canvasOrientation,
    isZh,
    copy.options.canvasLandscape,
    copy.options.canvasPortrait,
    copy.options.contentScriptLabels,
    pageSvgs,
    svgPageLayers,
    pdfPagesData,
    contentScriptOverride,
  ]);

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

  const portfolioPlainText = useMemo(
    () =>
      extractPortfolioPlainText({ pageSvgs, svgPageLayers, pdfPagesData }),
    [pageSvgs, svgPageLayers, pdfPagesData],
  );

  const currentPageSvg = pageSvgs[sourcePageIndex] ?? "";

  /** 預覽用：dockPreview 混合回原圖，確保內容清晰 */
  const displayVariants = useMemo(
    () =>
      currentPageSvg
        ? buildThreeVariants(currentPageSvg, sourcePageIndex, ctx, {
            isPdfRaster: isPdf,
            dockPreview: true,
          })
        : (["", "", ""] as [string, string, string]),
    [currentPageSvg, sourcePageIndex, ctx, isPdf],
  );

  /** 匯出用：完整濾鏡強度，選定版本後存入 finalizedPageSvgs */
  const exportVariants = useMemo(
    () =>
      currentPageSvg
        ? buildThreeVariants(currentPageSvg, sourcePageIndex, ctx, {
            isPdfRaster: isPdf,
          })
        : (["", "", ""] as [string, string, string]),
    [currentPageSvg, sourcePageIndex, ctx, isPdf],
  );

  /** 匯出步顯示用：對每一頁已選版本重新生成 dockPreview 版（內容清晰） */
  const displayFinalizedPageSvgs = useMemo(() => {
    return pageSvgs.map((_, pageIdx) => {
      const vIdx = selectionByPage[pageIdx];
      if (vIdx == null) return "";
      const srcIdx =
        orderedSourceIndices.length === pageSvgs.length
          ? (orderedSourceIndices[pageIdx] ?? pageIdx)
          : pageIdx;
      const src = pageSvgs[srcIdx] ?? "";
      if (!src) return "";
      return buildThreeVariants(src, srcIdx, ctx, {
        isPdfRaster: isPdf,
        dockPreview: true,
      })[vIdx as 0 | 1 | 2];
    });
  }, [pageSvgs, selectionByPage, orderedSourceIndices, ctx, isPdf]);

  const selectedForPage = selectionByPage[currentPageIndex];
  const previewAfterRaw =
    selectedForPage != null
      ? displayVariants[selectedForPage]
      : displayVariants[0];
  const tileNudgesForCurrentPage = gridTileNudgeByPage[currentPageIndex];
  const previewAfter = useMemo(
    () =>
      injectGridMosaicNudges(
        previewAfterRaw,
        tileNudgesForCurrentPage ?? {},
      ),
    [previewAfterRaw, tileNudgesForCurrentPage],
  );

  const webglGridTileDrag =
    gridPresetId !== "off" &&
    gridGuideForPreview &&
    previewAfterRaw.includes("pr-grid-mosaic")
      ? {
          pageIndex: currentPageIndex,
          cols: gridGuideForPreview.cols,
          rows: gridGuideForPreview.rows,
        }
      : null;

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

  /** 右側「即時預覽測試」面板：隨步驟與選項更新（畫布尺寸會縮放置入預覽框） */
  const livePreviewSvg = useMemo(() => {
    const first = pageSvgs[0] ?? "";
    if (!first) return "";
    const fitOpts = gridGuideForPreview
      ? { grid: gridGuideForPreview }
      : undefined;
    const fit = (svg: string) =>
      fitSvgIntoCanvasViewport(
        svg,
        canvasForPreview.width,
        canvasForPreview.height,
        fitOpts,
      );

    /** 上傳步：淡紅畫布底 + 原稿 contain（與所選畫布尺寸一致，選項步可改尺寸後即反映） */
    if (step === "upload") return fit(first);
    /** 選項步：第一頁套用色系、風格與網格（版本 1），再置入畫布；dock 強制用向量輕量濾鏡，避免 raster 雙色調把整頁壓成灰塊。 */
    if (step === "options") {
      const styled = buildThreeVariants(first, 0, ctx, {
        isPdfRaster: isPdf,
        dockPreview: true,
      })[0];
      return fit(styled);
    }
    if (step === "pages") {
      if (!previewAfter) return "";
      return fit(previewAfter);
    }
    if (step === "export") {
      let hit = "";
      let hitIdx = -1;
      displayFinalizedPageSvgs.forEach((s, i) => {
        if (s && !hit) {
          hit = s;
          hitIdx = i;
        }
      });
      const nudge =
        hitIdx >= 0 ? gridTileNudgeByPage[hitIdx] ?? {} : {};
      return fit(injectGridMosaicNudges(hit || first, nudge));
    }
    return fit(first);
  }, [
    step,
    pageSvgs,
    previewAfter,
    displayFinalizedPageSvgs,
    gridTileNudgeByPage,
    canvasForPreview.width,
    canvasForPreview.height,
    gridGuideForPreview,
    ctx,
    isPdf,
  ]);

  const livePreviewCaption = useMemo(() => {
    const p = copy.preview;
    if (!pageSvgs.length) return p.empty;
    if (step === "upload") return p.upload;
    if (step === "options") return p.options;
    if (step === "pages") {
      return p.pages(currentPageIndex + 1, sourcePageIndex + 1);
    }
    if (step === "export") return p.export;
    return "";
  }, [
    copy.preview,
    step,
    pageSvgs.length,
    currentPageIndex,
    sourcePageIndex,
  ]);

  const onSvgFilesChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      // FileList 與 input 綁定：先複製成陣列再清空 value，否則清空後 list 會變空、多選看似「沒反應」
      const picked = Array.from(e.target.files ?? []);
      e.target.value = "";
      if (!picked.length) return;
      const entries: { name: string; content: string }[] = [];
      for (let i = 0; i < picked.length; i++) {
        const f = picked[i];
        if (!f) continue;
        const lower = f.name.toLowerCase();
        if (!lower.endsWith(".svg") && f.type !== "image/svg+xml") continue;
        try {
          entries.push({ name: f.name, content: await f.text() });
        } catch {
          /* skip */
        }
      }
      if (!entries.length) {
        alert(copy.alerts.svgOnly);
        return;
      }
      if (entries.length === 1) {
        const one = entries[0]!;
        setFile(one.name, one.content, false);
        return;
      }
      setSvgBulkFiles(entries);
    },
    [setFile, setSvgBulkFiles, copy.alerts.svgOnly],
  );

  const onPdfImported = useCallback(
    (name: string, pages: PdfPageLayer[]) => {
      setPdfImport(name, pages);
    },
    [setPdfImport],
  );

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
      const out = injectGridMosaicNudges(svg, gridTileNudgeByPage[i] ?? {});
      window.setTimeout(() => {
        downloadTextFile(`${base}-page-${i + 1}-restyled.svg`, out);
      }, i * 450);
    });
  };

  const exportPdf = useCallback(async () => {
    setPdfExporting(true);
    try {
      const { buildPdfFromFinalizedSvgs } = await import("@/lib/svg-export-pdf");
      const svgsForPdf = finalizedPageSvgs.map((s, i) =>
        s ? injectGridMosaicNudges(s, gridTileNudgeByPage[i] ?? {}) : s,
      );
      const blob = await buildPdfFromFinalizedSvgs(svgsForPdf);
      if (!blob) {
        alert(copy.alerts.pdfNone);
        return;
      }
      const base = (fileName ?? "portfolio").replace(/\.[^.]+$/, "");
      downloadBlob(`${base}-restyled.pdf`, blob);
    } catch (e) {
      console.error(e);
      alert(
        e instanceof Error ? e.message : copy.alerts.pdfFail,
      );
    } finally {
      setPdfExporting(false);
    }
  }, [
    fileName,
    finalizedPageSvgs,
    gridTileNudgeByPage,
    copy.alerts.pdfNone,
    copy.alerts.pdfFail,
  ]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[min(90rem,100%)] flex-col gap-12 px-4 py-10 sm:py-14 lg:flex-row lg:items-stretch lg:gap-10 lg:px-10">
      <div className="flex min-w-0 flex-1 flex-col gap-12 pb-24 lg:pb-0">
      <header className="relative flex flex-col gap-8 border-b border-border/60 pb-10 md:flex-row md:items-end md:justify-between">
        <div className="absolute right-0 top-0 z-10 flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setLocale(isZh ? "en" : "zh")}
          >
            {copy.langToggle}
          </Button>
        </div>
        <div className="max-w-2xl space-y-4 pr-[5.5rem]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/90">
            {copy.header.kicker}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/75 text-primary-foreground shadow-lift ring-4 ring-primary/10">
              <Sparkles className="size-6" aria-hidden />
            </span>
            <div>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl md:leading-tight">
                Portfolio{" "}
                <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                  ReStyle
                </span>{" "}
                AI
              </h1>
              <p className="mt-1 text-sm text-muted-foreground md:text-base">
                {copy.header.subtitle}
              </p>
            </div>
          </div>
          <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-[15px]">
            {copy.header.body}
          </p>
        </div>
        {step !== "upload" && (
          <div className="flex shrink-0 flex-wrap gap-3 md:justify-end">
            <Button variant="outline" type="button" onClick={() => reset()}>
              {copy.nav.restart}
            </Button>
          </div>
        )}
      </header>

      <StepIndicator step={step} steps={copy.steps} />

      {step === "upload" && (
        <section className="grid gap-7 md:grid-cols-2">
          <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-b from-card to-muted/25 shadow-none ring-primary/5 hover:border-primary/35 hover:shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Upload className="size-4" />
                {copy.uploadCard.title}
              </CardTitle>
              <CardDescription>{copy.uploadCard.desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={svgInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                multiple
                className="hidden"
                onChange={onSvgFilesChange}
              />
              <Button
                type="button"
                className="w-full"
                onClick={() => svgInputRef.current?.click()}
              >
                {copy.uploadCard.chooseSvg}
              </Button>
              <UploadPdfDialog onImported={onPdfImported} />
              {fileName && (
                <p className="text-sm text-muted-foreground">
                  {copy.uploadCard.selectedPrefix}
                  <span className="font-medium text-foreground">{fileName}</span>
                  {isPdf && pageSvgs.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {copy.uploadCard.pdfPages(pageSvgs.length)}
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
                {copy.previewCard.title}
              </CardTitle>
              <CardDescription>{copy.previewCard.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              {pageSvgs[0] ? (
                <PreviewBeforeAfterChrome>
                  <SvgInlinePreview
                    svg={fitSvgIntoCanvasViewport(
                      pageSvgs[0],
                      canvasForPreview.width,
                      canvasForPreview.height,
                      gridGuideForPreview
                        ? { grid: gridGuideForPreview }
                        : undefined,
                    )}
                    className="aspect-[4/3] max-h-[280px] bg-card"
                  />
                </PreviewBeforeAfterChrome>
              ) : (
                <PreviewBeforeAfterChrome>
                  <div className="flex aspect-[4/3] max-h-[280px] items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/90 text-sm text-muted-foreground">
                    {copy.previewCard.empty}
                  </div>
                </PreviewBeforeAfterChrome>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-2 flex justify-end">
            <Button
              type="button"
              disabled={!canLeaveUpload}
              onClick={() => setStep("options")}
            >
              {copy.nextToOptions}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </section>
      )}

      {step === "options" && (
        <section className="space-y-8">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {copy.options.flowHint}
          </p>

          <FieldGroup
            label={copy.quickPresets.label}
            className="min-w-0"
            contentClassName="space-y-4"
          >
            <QuickStylePresets />
            <AiStyleRecommend extractedText={portfolioPlainText} />
          </FieldGroup>

          <div className="grid min-w-0 gap-6 md:grid-cols-2 md:items-start">
            <FieldGroup
              label={copy.options.colorScheme}
              className="min-w-0"
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PALETTES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setOptions({ paletteId: p.id })}
                    className={`flex items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition-all duration-200 ${
                      paletteId === p.id
                        ? "border-primary/60 bg-primary/5 shadow-soft ring-2 ring-primary/25"
                        : "border-border/80 bg-card/80 hover:border-primary/20 hover:bg-muted/50"
                    }`}
                  >
                    <span
                      className="size-4 rounded-full border border-border"
                      style={{
                        background: `linear-gradient(135deg, ${p.accent}, ${p.muted})`,
                      }}
                    />
                    {isZh ? p.nameZh : p.nameEn}
                  </button>
                ))}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {copy.options.paletteHint}
              </p>
            </FieldGroup>

            <FieldGroup
              label={copy.options.styleKeywords}
              contentClassName="overflow-visible"
              className="relative z-10 min-w-0"
            >
              <div className="flex flex-wrap gap-2">
                {STYLE_KEYWORD_PRESETS.map((k) => {
                  const selected = styleKeyword === k.id;
                  const hintId = `style-kw-hint-${k.id}`;
                  const hint = isZh ? k.previewHintZh : k.previewHintEn;
                  return (
                    <StyleKeywordHintPortal
                      key={k.id}
                      hint={hint}
                      hintId={hintId}
                    >
                      <Button
                        type="button"
                        size="sm"
                        variant={selected ? "default" : "secondary"}
                        className="h-auto min-h-0 min-w-0 max-w-full flex-col items-stretch gap-0.5 whitespace-normal px-3 py-2 text-left [overflow-wrap:anywhere]"
                        onClick={() => setOptions({ styleKeyword: k.id })}
                      >
                        <span className="text-[13px] font-semibold leading-tight">
                          {isZh ? k.labelZh : k.labelEn}
                        </span>
                      </Button>
                    </StyleKeywordHintPortal>
                  );
                })}
              </div>
            </FieldGroup>

            <FieldGroup label={copy.options.canvasSize} className="min-w-0">
              <div className="flex flex-col gap-2">
                {CANVAS_PRESETS.map((c) => (
                  <Button
                    key={c.id}
                    type="button"
                    variant={canvasPresetId === c.id ? "default" : "secondary"}
                    className="justify-start"
                    onClick={() =>
                      setOptions({
                        canvasPresetId: c.id,
                        canvasOrientation: c.defaultOrientation,
                      })
                    }
                  >
                    {isZh ? c.labelZh : c.labelEn}
                  </Button>
                ))}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {copy.options.canvasOrientationHint}
              </p>
              <p className="text-xs font-medium text-foreground/90">
                {copy.options.canvasOrientation}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    canvasOrientation === "portrait" ? "default" : "secondary"
                  }
                  className="min-w-[5.5rem]"
                  onClick={() => setOptions({ canvasOrientation: "portrait" })}
                >
                  {copy.options.canvasPortrait}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    canvasOrientation === "landscape" ? "default" : "secondary"
                  }
                  className="min-w-[5.5rem]"
                  onClick={() =>
                    setOptions({ canvasOrientation: "landscape" })
                  }
                >
                  {copy.options.canvasLandscape}
                </Button>
              </div>
              {canvasIsSquare ? (
                <p className="text-xs text-muted-foreground">
                  {copy.options.canvasSquareNote}
                </p>
              ) : null}
            </FieldGroup>

            <FieldGroup label={copy.options.briefLabel} className="min-w-0">
              <Textarea
                placeholder={copy.options.briefPlaceholder}
                value={userBrief}
                onChange={(e) => setOptions({ userBrief: e.target.value })}
                className="min-h-[120px] resize-y"
              />
              <BriefAiAssist
                brief={userBrief}
                onApply={(next) => setOptions({ userBrief: next })}
                context={briefAiContext}
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                {copy.options.briefHint}
              </p>
            </FieldGroup>

            <FieldGroup label={copy.options.gridRemix} className="min-w-0">
              <div className="flex flex-col gap-2.5">
                {GRID_PRESETS.map((g) => (
                  <Button
                    key={g.id}
                    type="button"
                    variant={gridPresetId === g.id ? "default" : "secondary"}
                    className="h-auto w-full min-w-0 items-start justify-start gap-3 whitespace-normal rounded-xl px-4 py-3.5 text-left"
                    onClick={() => setOptions({ gridPresetId: g.id })}
                  >
                    <GridPresetIcon
                      cols={g.cols}
                      rows={g.rows}
                      active={gridPresetId === g.id}
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-2 text-left">
                      <span className="break-words text-[15px] font-semibold leading-snug">
                        {isZh ? g.labelZh : g.labelEn}
                      </span>
                      <span
                        className={`min-w-0 border-t pt-2 text-xs leading-relaxed [overflow-wrap:anywhere] ${
                          gridPresetId === g.id
                            ? "border-primary-foreground/25 text-primary-foreground/90"
                            : "border-border/50 text-foreground/85"
                        }`}
                      >
                        {isZh ? g.hintZh : g.hintEn}
                      </span>
                    </span>
                  </Button>
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label={copy.options.fontNarrative} className="min-w-0">
              <div className="space-y-3">
                <ContentScriptNotice />
                <div className="flex flex-col gap-2">
                  {FONT_STYLES.map((f) => (
                    <Button
                      key={f.id}
                      type="button"
                      variant={fontStyleId === f.id ? "default" : "secondary"}
                      className="h-auto justify-start py-2 text-left"
                      onClick={() => setOptions({ fontStyleId: f.id })}
                    >
                      <span className="block font-medium">
                        {isZh ? f.labelZh : f.labelEn}
                      </span>
                      <span className="block text-xs font-normal opacity-80">
                        {isZh ? f.hintZh : f.hintEn}
                      </span>
                    </Button>
                  ))}
                </div>
                <div className="border-t border-border pt-3">
                  <NarrativeOrderPicker />
                </div>
              </div>
            </FieldGroup>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button type="button" variant="ghost" onClick={() => setStep("upload")}>
              {copy.back}
            </Button>
            <div className="flex flex-wrap gap-2">
              {pageSvgs.length > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!canLeaveUpload || aiOrderLoading}
                  onClick={async () => {
                    setAiOrderLoading(true);
                    try {
                      const summaries = pageSvgs.map((svg) => {
                        const t = extractPortfolioPlainText({
                          pageSvgs: [svg],
                          svgPageLayers: null,
                          pdfPagesData: null,
                        });
                        return t.slice(0, 500);
                      });
                      const res = await fetch("/api/page-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          locale,
                          narrativeId,
                          userBrief: userBrief.trim(),
                          pageCount: pageSvgs.length,
                          pageSummaries: summaries,
                        }),
                      });
                      const data = (await res.json()) as {
                        order?: number[];
                        reasoning?: string;
                      };
                      if (data.order && data.order.length === pageSvgs.length) {
                        setOrderedSourceIndices(data.order);
                        if (data.reasoning) {
                          setAiOrderReasoning(data.reasoning);
                        }
                      } else {
                        setOrderedSourceIndices(
                          computeOrderedSourceIndices(
                            narrativeId,
                            pageSvgs.length,
                            userBrief.trim(),
                          ),
                        );
                      }
                    } catch {
                      setOrderedSourceIndices(
                        computeOrderedSourceIndices(
                          narrativeId,
                          pageSvgs.length,
                          userBrief.trim(),
                        ),
                      );
                    } finally {
                      setAiOrderLoading(false);
                      setCurrentPageIndex(0);
                      setStep("pages");
                    }
                  }}
                >
                  {aiOrderLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  {copy.generatePagesAi}
                </Button>
              )}
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
                {copy.generatePages}
                <Layers className="size-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {step === "pages" && totalPages > 0 && (
        <section className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {copy.pages.progress(
                  currentPageIndex + 1,
                  totalPages,
                  sourcePageIndex + 1,
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {gridPresetId !== "off"
                  ? copy.pages.hintGrid
                  : isPdf
                    ? copy.pages.hintPdf
                    : copy.pages.hintSvg}
              </p>
              {aiOrderReasoning && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-primary/80">
                  <Sparkles className="size-3 shrink-0" />
                  {aiOrderReasoning}
                </p>
              )}
            </div>
            <Badge variant="outline" className="border-primary/25 bg-primary/5 px-3 py-1 text-primary">
              {isZh ? canvasPreset.labelZh : canvasPreset.labelEn}
              {" · "}
              {canvasOrientation === "landscape"
                ? copy.options.canvasLandscape
                : copy.options.canvasPortrait}
            </Badge>
          </div>

          {isPdf && <PdfTextEditorPanel />}
          {!isPdf && <SvgTextEditorPanel />}

          <div className="grid gap-4 lg:grid-cols-3">
            {displayVariants.map((svg, i) => (
              <Card
                key={i}
                className={
                  selectedForPage === i
                    ? "border-primary/45 ring-2 ring-primary/35 ring-offset-2 ring-offset-background shadow-lift"
                    : "opacity-[0.97] hover:border-border"
                }
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {copy.pages.version(i + 1)}
                  </CardTitle>
                  <CardDescription>
                    {gridPresetId !== "off"
                      ? copy.pages.gridDesc[i]
                      : copy.pages.plainDesc[i]}
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
                    onClick={() =>
                      selectVariant(currentPageIndex, i, exportVariants[i])
                    }
                  >
                    {selectedForPage === i ? (
                      <>
                        <Check className="size-4" />
                        {copy.pages.chosen}
                      </>
                    ) : (
                      copy.pages.chooseVersion
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {previewAfter ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{copy.pages.threeTitle}</CardTitle>
                <CardDescription>{copy.pages.threeDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <WebglPreviewPanel
                  svg={previewAfter}
                  gridTileDrag={webglGridTileDrag}
                />
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="size-4" />
                {copy.pages.compareTitle}
              </CardTitle>
              <CardDescription>{copy.pages.compareDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs
                value={compareMode}
                onValueChange={(v) => setCompareMode(v as CompareMode)}
              >
                <TabsList>
                  <TabsTrigger value="both">{copy.pages.tabBoth}</TabsTrigger>
                  <TabsTrigger value="color">{copy.pages.tabColor}</TabsTrigger>
                  <TabsTrigger value="layout">{copy.pages.tabLayout}</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{copy.pages.compareSlider}</Label>
                  <Slider
                    value={[compare]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(v) => setCompare(v[0] ?? 0)}
                  />
                </div>
                <PreviewPanCompareViewport
                  resetKey={`${currentPageIndex}-${sourcePageIndex}-${selectedForPage ?? -1}-${compareMode}`}
                  hint={copy.pages.comparePanHint}
                  resetLabel={copy.pages.comparePanReset}
                  frameClassName="aspect-[16/10] min-h-[220px]"
                >
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
                      title={copy.compareSvgLeft}
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
                      title={copy.compareSvgRight}
                    />
                  </div>
                  <div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded bg-background/80 px-2 py-1 text-xs text-foreground shadow">
                    {compareMode === "color"
                      ? copy.pages.filterOff
                      : copy.pages.before}
                  </div>
                  <div className="pointer-events-none absolute bottom-3 right-3 z-10 rounded bg-background/80 px-2 py-1 text-xs text-foreground shadow">
                    {compareMode === "color"
                      ? copy.pages.filterOn
                      : copy.pages.after}
                  </div>
                </PreviewPanCompareViewport>
                {compareMode === "color" && (
                  <p className="text-xs text-muted-foreground">
                    {copy.pages.colorModeNote}
                  </p>
                )}
                {compareMode === "layout" && (
                  <p className="text-xs text-muted-foreground">
                    {copy.pages.layoutModeNote}
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
              {copy.pages.backOptions}
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={currentPageIndex === 0}
                onClick={() => setCurrentPageIndex(currentPageIndex - 1)}
              >
                {copy.pages.prevPage}
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
                    {copy.pages.nextPage}
                    <ArrowRight className="size-4" />
                  </>
                ) : (
                  <>
                    {copy.pages.doneExport}
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
              <CardTitle>{copy.export.title}</CardTitle>
              <CardDescription>{copy.export.desc}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => void exportPdf()}
                disabled={pdfExporting}
              >
                <FileDown className="size-4" />
                {pdfExporting ? copy.export.pdfBusy : copy.export.pdf}
              </Button>
              <Button type="button" variant="secondary" onClick={exportAll}>
                <Download className="size-4" />
                {copy.export.allSvg}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setStep("pages")}>
                {copy.export.backEdit}
              </Button>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            {displayFinalizedPageSvgs.map(
              (svg, i) =>
                svg && (
                  <SvgInlinePreview
                    key={i}
                    svg={injectGridMosaicNudges(
                      svg,
                      gridTileNudgeByPage[i] ?? {},
                    )}
                    className="aspect-[4/3] border border-border/70 bg-white shadow-soft"
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
        windowTitle={copy.dock.windowTitle}
      />
    </div>
  );
}

function StepIndicator({
  step,
  steps: stepCopy,
}: {
  step: string;
  steps: {
    flowAria: string;
    upload: string;
    style: string;
    pages: string;
    export: string;
  };
}) {
  const steps = [
    { id: "upload", label: stepCopy.upload },
    { id: "options", label: stepCopy.style },
    { id: "pages", label: stepCopy.pages },
    { id: "export", label: stepCopy.export },
  ];
  const idx = steps.findIndex((s) => s.id === step);
  return (
    <nav aria-label={stepCopy.flowAria} className="w-full">
      <ol className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-4 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
        {steps.map((s, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <li
              key={s.id}
              className="min-w-[42%] shrink-0 snap-start sm:min-w-[36%] md:min-w-0"
            >
              <div
                className={`flex h-full items-center gap-3 rounded-2xl border px-3 py-3 transition-all duration-200 md:px-4 ${
                  active
                    ? "border-primary/40 bg-primary text-primary-foreground shadow-lift"
                    : done
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-border/70 bg-card/60 text-muted-foreground"
                }`}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    active
                      ? "bg-white/20 text-primary-foreground"
                      : done
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="size-4" strokeWidth={2.5} /> : i + 1}
                </span>
                <span
                  className={`text-sm font-semibold leading-tight ${
                    active ? "text-primary-foreground" : ""
                  }`}
                >
                  {s.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function GridPresetIcon({
  cols,
  rows,
  active,
}: {
  cols: number;
  rows: number;
  active: boolean;
}) {
  const bg = active ? "#ffffff30" : "#6366f118";
  const border = active ? "#ffffffaa" : "#6366f160";
  const cellFill = active ? "#ffffff40" : "#6366f125";
  const cellStroke = active ? "#ffffffcc" : "#6366f180";

  if (cols === 0 || rows === 0) {
    return (
      <svg viewBox="0 0 48 48" className="size-12 shrink-0" aria-hidden>
        <rect x="2" y="2" width="44" height="44" rx="6" fill={bg} stroke={border} strokeWidth="1.5" />
        <line x1="14" y1="24" x2="34" y2="24" stroke={cellStroke} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  const pad = 4;
  const gap = 3;
  const cellW = (48 - pad * 2 - gap * (cols - 1)) / cols;
  const cellH = (48 - pad * 2 - gap * (rows - 1)) / rows;
  const cells: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        x: pad + c * (cellW + gap),
        y: pad + r * (cellH + gap),
      });
    }
  }

  return (
    <svg viewBox="0 0 48 48" className="size-12 shrink-0" aria-hidden>
      {cells.map((cell, i) => (
        <rect
          key={i}
          x={cell.x}
          y={cell.y}
          width={cellW}
          height={cellH}
          rx="3"
          fill={cellFill}
          stroke={cellStroke}
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

function FieldGroup({
  label,
  children,
  contentClassName,
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  /** 例如提示層需超出卡片時設 overflow-visible */
  contentClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-4 overflow-visible rounded-2xl border border-border/60 bg-card/85 p-5 shadow-soft ring-1 ring-slate-950/5 backdrop-blur-sm",
        className,
      )}
    >
      <Label className="block text-sm font-semibold tracking-tight text-foreground">
        {label}
      </Label>
      <div className={cn("space-y-4", contentClassName)}>{children}</div>
    </div>
  );
}
