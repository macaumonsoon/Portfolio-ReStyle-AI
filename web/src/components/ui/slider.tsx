"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted/90 shadow-inner ring-1 ring-slate-950/5">
      <SliderPrimitive.Range className="absolute h-full rounded-full bg-gradient-to-r from-primary to-primary/85" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block size-4 rounded-full border border-primary/20 bg-card shadow-soft transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
