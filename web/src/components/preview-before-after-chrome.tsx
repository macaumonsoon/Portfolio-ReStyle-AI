"use client";

import type { ReactNode } from "react";
import { useUiLocale } from "@/contexts/ui-locale-context";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  /** 包住內層預覽（白底／SVG）的額外 class */
  innerClassName?: string;
};

/**
 * 預覽區外層：斜向漸層底圖 + 左「原稿」右「套用後」標籤，示意更改前後流程。
 */
export function PreviewBeforeAfterChrome({
  children,
  className,
  innerClassName,
}: Props) {
  const { copy } = useUiLocale();
  const { before, after } = copy.previewChrome;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/55 p-2.5 shadow-inner",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.92]"
        style={{
          background:
            "linear-gradient(118deg, hsl(220 24% 92%) 0%, hsl(220 18% 96%) 44%, hsl(265 36% 96%) 56%, hsl(265 30% 91%) 100%)",
        }}
        aria-hidden
      />
      <div className="relative z-[1] mb-1.5 flex items-center justify-between gap-2 px-0.5">
        <span className="max-w-[42%] truncate text-[10px] font-semibold tracking-wide text-muted-foreground">
          {before}
        </span>
        <span
          className="h-px min-w-[1rem] flex-1 bg-gradient-to-r from-border/50 via-primary/30 to-border/50"
          aria-hidden
        />
        <span className="max-w-[42%] truncate text-right text-[10px] font-semibold tracking-wide text-primary">
          {after}
        </span>
      </div>
      <div className={cn("relative z-[1]", innerClassName)}>{children}</div>
    </div>
  );
}
