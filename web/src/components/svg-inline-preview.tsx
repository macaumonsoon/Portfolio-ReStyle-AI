"use client";

import { cn } from "@/lib/utils";

type Props = {
  svg: string;
  className?: string;
  /** 對比模式：隱藏 .pr-content 上的 SVG filter，凸顯版式差異 */
  suppressFilter?: boolean;
  title?: string;
};

export function SvgInlinePreview({
  svg,
  className,
  suppressFilter,
  title,
}: Props) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/80 bg-muted/30 shadow-inner [&_svg]:h-auto [&_svg]:max-h-full [&_svg]:w-full",
        suppressFilter && "[&_.pr-content]:!filter-none",
        className,
      )}
      title={title}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
