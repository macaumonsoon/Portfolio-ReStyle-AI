"use client";

import { useCallback, useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { PdfPageLayer } from "@/lib/pdf-page-types";
import { pdfFileToLayeredPages } from "@/lib/pdf-to-layered-pages";
import { cn } from "@/lib/utils";

type Props = {
  onImported: (fileName: string, pages: PdfPageLayer[]) => void;
  disabled?: boolean;
};

export function UploadPdfDialog({ onImported, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const runImport = useCallback(
    async (file: File) => {
      setError(null);
      setBusy(true);
      try {
        const pages = await pdfFileToLayeredPages(file);
        if (!pages.length) {
          setError("未能從 PDF 解析出任何頁面。");
          return;
        }
        onImported(file.name, pages);
        setOpen(false);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "PDF 解析失敗";
        setError(msg);
      } finally {
        setBusy(false);
      }
    },
    [onImported],
  );

  const onPick = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".pdf") && f.type !== "application/pdf") {
      setError("請選擇 .pdf 檔案");
      return;
    }
    void runImport(f);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary" className="w-full" disabled={disabled}>
          <FileUp className="size-4" />
          上傳 PDF…
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => busy && e.preventDefault()}
        onEscapeKeyDown={(e) => busy && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>上傳 PDF 作品集</DialogTitle>
          <DialogDescription>
            將在瀏覽器內以 pdf.js 逐頁渲染，並抽出文字座標；在「頁面」步驟可修改文字內容與字體類型（覆蓋在底圖上）。最多
            48 頁。
          </DialogDescription>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            onPick(e.target.files);
            e.target.value = "";
          }}
        />

        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            onPick(e.dataTransfer.files);
          }}
          onClick={() => !busy && inputRef.current?.click()}
          className={cn(
            "flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center text-sm transition-colors",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/30 hover:bg-muted/50",
            busy && "pointer-events-none opacity-60",
          )}
        >
          {busy ? (
            <>
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
              <span>正在解析 PDF…</span>
            </>
          ) : (
            <>
              <FileUp className="size-8 text-muted-foreground" />
              <span className="font-medium">拖放 PDF 到此，或點擊選擇檔案</span>
              <span className="text-xs text-muted-foreground">僅限 .pdf</span>
            </>
          )}
        </div>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/80 dark:text-red-200">
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
