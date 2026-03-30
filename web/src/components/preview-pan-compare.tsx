"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  /** 切頁、換版本、換對比模式時傳新值以重置平移 */
  resetKey: string;
  hint: string;
  resetLabel: string;
  frameClassName?: string;
};

/**
 * 對比預覽外框：overflow 內可拖曳平移內容（檢視網格稿邊緣）。
 */
export function PreviewPanCompareViewport({
  children,
  resetKey,
  hint,
  resetLabel,
  frameClassName,
}: Props) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef(pan);
  const dragRef = useRef<{
    active: boolean;
    sx: number;
    sy: number;
    ox: number;
    oy: number;
  } | null>(null);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  useEffect(() => {
    setPan({ x: 0, y: 0 });
  }, [resetKey]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = panRef.current;
    dragRef.current = {
      active: true,
      sx: e.clientX,
      sy: e.clientY,
      ox: p.x,
      oy: p.y,
    };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d?.active) return;
    setPan({
      x: d.ox + (e.clientX - d.sx),
      y: d.oy + (e.clientY - d.sy),
    });
  }, []);

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (d?.active) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    dragRef.current = null;
  }, []);

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{hint}</p>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-muted/40 to-muted/20 shadow-inner",
          frameClassName,
        )}
      >
        <div
          role="application"
          aria-label={hint}
          className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {children}
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-xs"
        onClick={() => setPan({ x: 0, y: 0 })}
      >
        {resetLabel}
      </Button>
    </div>
  );
}
