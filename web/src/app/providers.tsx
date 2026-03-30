"use client";

import type { ReactNode } from "react";
import { UiLocaleProvider } from "@/contexts/ui-locale-context";

export function Providers({ children }: { children: ReactNode }) {
  return <UiLocaleProvider>{children}</UiLocaleProvider>;
}
