"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  cloneElement,
  type ReactElement,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type Props = {
  hint: string;
  hintId: string;
  children: ReactElement<{ "aria-describedby"?: string }>;
};

/**
 * 風格關鍵詞懸浮說明：用 portal 掛到 body + fixed + 極高 z-index，
 * 避免被卡片 overflow 裁切或被右欄「色系」蓋住；視覺上在觸發按鈕右側。
 */
export function StyleKeywordHintPortal({ hint, hintId, children }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    transform: string;
  } | null>(null);

  const place = useCallback(() => {
    const el = wrapRef.current;
    if (!el || typeof window === "undefined") return;
    const r = el.getBoundingClientRect();
    const gap = 8;
    const top = r.top + r.height / 2;
    const estW = Math.min(15 * 16, window.innerWidth - 16);
    const placeRight = r.right + gap + estW <= window.innerWidth - 8;
    if (placeRight) {
      setPos({
        top,
        left: r.right + gap,
        transform: "translateY(-50%)",
      });
    } else {
      setPos({
        top,
        left: r.left - gap,
        transform: "translate(-100%, -50%)",
      });
    }
  }, []);

  useLayoutEffect(() => {
    if (!show) return;
    place();
  }, [show, place]);

  useEffect(() => {
    if (!show) return;
    const ro = () => place();
    window.addEventListener("scroll", ro, true);
    window.addEventListener("resize", ro);
    return () => {
      window.removeEventListener("scroll", ro, true);
      window.removeEventListener("resize", ro);
    };
  }, [show, place]);

  const child = cloneElement(children, {
    "aria-describedby": hintId,
  });

  const portal =
    show && pos && typeof document !== "undefined"
      ? createPortal(
          <div
            id={`${hintId}-tip`}
            role="tooltip"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              transform: pos.transform,
              zIndex: 99999,
              maxWidth: "min(15rem, calc(100vw - 1rem))",
            }}
            className={cn(
              "pointer-events-none rounded-md border border-border bg-card px-2.5 py-2 text-left text-xs leading-snug text-card-foreground shadow-xl ring-1 ring-black/5 dark:ring-white/10",
            )}
          >
            {hint}
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={wrapRef}
      className="inline-flex max-w-full"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocusCapture={() => setShow(true)}
      onBlurCapture={() => setShow(false)}
    >
      {child}
      <span id={hintId} className="sr-only">
        {hint}
      </span>
      {portal}
    </div>
  );
}
