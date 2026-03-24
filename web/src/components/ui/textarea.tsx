import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-xl border border-border/80 bg-card/50 px-3 py-2.5 text-sm shadow-soft placeholder:text-muted-foreground transition-colors focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
