"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseViewBoxRect } from "@/lib/grid-tile-nudge";
import { useProjectStore } from "@/store/use-project-store";
import { useUiLocale } from "@/contexts/ui-locale-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  svg: string;
  pageIndex: number;
  cols: number;
  rows: number;
  className?: string;
};

export function GridTileDragLayer({
  svg,
  pageIndex,
  cols,
  rows,
  className,
}: Props) {
  const { copy } = useUiLocale();
  const accumulateGridTileNudge = useProjectStore(
    (s) => s.accumulateGridTileNudge,
  );
  const clearGridTileNudgesForPage = useProjectStore(
    (s) => s.clearGridTileNudgesForPage,
  );
  const hasNudges = useProjectStore((s) => {
    const p = s.gridTileNudgeByPage[pageIndex];
    return p && Object.keys(p).length > 0;
  });

  const [drag, setDrag] = useState<{
    tile: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
  } | null>(null);
  const dragRef = useRef(drag);
  useEffect(() => {
    dragRef.current = drag;
  }, [drag]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const vb = parseViewBoxRect(svg);

  const pxToVb = useCallback(
    (dxPx: number, dyPx: number) => {
      const el = wrapRef.current;
      if (!el) return { dx: 0, dy: 0 };
      const r = el.getBoundingClientRect();
      const W = r.width;
      const H = r.height;
      if (W <= 0 || H <= 0 || vb.w <= 0 || vb.h <= 0) return { dx: 0, dy: 0 };
      const scale = Math.min(W / vb.w, H / vb.h);
      if (scale <= 0) return { dx: 0, dy: 0 };
      return { dx: dxPx / scale, dy: dyPx / scale };
    },
    [vb.w, vb.h],
  );

  const finishDrag = useCallback(
    (tile: number, clientX: number, clientY: number, commit: boolean) => {
      const d = dragRef.current;
      if (!d || d.tile !== tile) return;
      if (commit) {
        const { dx, dy } = pxToVb(clientX - d.startX, clientY - d.startY);
        if (dx !== 0 || dy !== 0) {
          accumulateGridTileNudge(pageIndex, tile, dx, dy);
        }
      }
      setDrag(null);
    },
    [pageIndex, accumulateGridTileNudge, pxToVb],
  );

  const onPointerDown = (tile: number, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({
      tile,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
    });
  };

  const onPointerMove = (tile: number, e: React.PointerEvent) => {
    if (!drag || drag.tile !== tile) return;
    setDrag((d) =>
      d ? { ...d, lastX: e.clientX, lastY: e.clientY } : null,
    );
  };

  const onPointerUp = (tile: number, e: React.PointerEvent) => {
    if (dragRef.current?.tile !== tile) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    finishDrag(tile, e.clientX, e.clientY, true);
  };

  const onPointerCancel = (tile: number, e: React.PointerEvent) => {
    if (dragRef.current?.tile !== tile) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* */
    }
    finishDrag(tile, e.clientX, e.clientY, false);
  };

  const onLostPointerCapture = (tile: number) => {
    setDrag((d) => (d?.tile === tile ? null : d));
  };

  const nTiles = cols * rows;
  const cellWpct = 100 / cols;
  const cellHpct = 100 / rows;

  return (
    <div
      ref={wrapRef}
      className={cn("pointer-events-none absolute inset-0 z-10", className)}
    >
      <div className="pointer-events-none absolute bottom-2 left-2 z-20 flex max-w-[min(100%-1rem,20rem)] flex-col gap-1 rounded-md bg-background/85 px-2 py-1.5 text-xs text-muted-foreground shadow-sm ring-1 ring-border/60 backdrop-blur-sm">
        <span>{copy.pages.gridTileDragHint}</span>
        {hasNudges ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="pointer-events-auto h-7 text-xs"
            onClick={() => clearGridTileNudgesForPage(pageIndex)}
          >
            {copy.pages.gridTileNudgeReset}
          </Button>
        ) : null}
      </div>
      {Array.from({ length: nTiles }, (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const isDragging = drag?.tile === i;
        const ddx = isDragging ? drag.lastX - drag.startX : 0;
        const ddy = isDragging ? drag.lastY - drag.startY : 0;
        return (
          <div
            key={i}
            className="pointer-events-auto absolute cursor-grab touch-none border border-transparent hover:border-primary/35 active:cursor-grabbing"
            style={{
              left: `${col * cellWpct}%`,
              top: `${row * cellHpct}%`,
              width: `${cellWpct}%`,
              height: `${cellHpct}%`,
              transform:
                isDragging && (ddx !== 0 || ddy !== 0)
                  ? `translate(${ddx}px,${ddy}px)`
                  : undefined,
            }}
            title={copy.pages.gridTileDragTileTitle(i + 1)}
            onPointerDown={(e) => onPointerDown(i, e)}
            onPointerMove={(e) => onPointerMove(i, e)}
            onPointerUp={(e) => onPointerUp(i, e)}
            onPointerCancel={(e) => onPointerCancel(i, e)}
            onLostPointerCapture={() => onLostPointerCapture(i)}
          />
        );
      })}
    </div>
  );
}
