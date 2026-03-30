"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  buildAppCopy,
  type AppCopy,
  type UiLocale,
} from "@/lib/ui-copy";

const STORAGE_KEY = "portfolio-restyle-ui-locale";

type Ctx = {
  locale: UiLocale;
  setLocale: (l: UiLocale) => void;
  copy: AppCopy;
};

const UiLocaleContext = createContext<Ctx | null>(null);

export function UiLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<UiLocale>("zh");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "en" || raw === "zh") setLocaleState(raw);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const setLocale = useCallback((l: UiLocale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = l === "zh" ? "zh-Hant" : "en";
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = locale === "zh" ? "zh-Hant" : "en";
  }, [locale, hydrated]);

  const copy = useMemo(() => buildAppCopy(locale), [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, copy }),
    [locale, setLocale, copy],
  );

  return (
    <UiLocaleContext.Provider value={value}>{children}</UiLocaleContext.Provider>
  );
}

export function useUiLocale(): Ctx {
  const c = useContext(UiLocaleContext);
  if (!c) {
    throw new Error("useUiLocale must be used within UiLocaleProvider");
  }
  return c;
}
