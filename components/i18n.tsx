"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Language } from "@/lib/types";
import { ar, dicts, en, type TKey } from "@/lib/i18n/dict";

const LANG_KEY = "najda:lang";

type Vars = Record<string, string | number>;

interface I18nValue {
  lang: Language;
  dir: "rtl" | "ltr";
  setLang: (l: Language) => void;
  t: (key: TKey, vars?: Vars) => string;
  num: (n: number | string) => string; // locale-aware digits
}

const I18nContext = createContext<I18nValue | null>(null);

const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

function toArabicDigits(input: string): string {
  return input.replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);
}

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("ar");

  // hydrate from storage on mount (default ar)
  useEffect(() => {
    const saved = (typeof window !== "undefined" && window.localStorage.getItem(LANG_KEY)) as Language | null;
    if (saved === "ar" || saved === "en" || saved === "ur") setLangState(saved);
  }, []);

  const dir: "rtl" | "ltr" = lang === "en" ? "ltr" : "rtl";

  // keep <html> dir/lang in sync so RTL + fonts + scrollbars are correct
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem(LANG_KEY, l);
  }, []);

  const num = useCallback(
    (n: number | string) => (lang === "ar" ? toArabicDigits(String(n)) : String(n)),
    [lang],
  );

  const t = useCallback(
    (key: TKey, vars?: Vars): string => {
      const dict = dicts[lang] as Partial<Record<TKey, string>>;
      const raw = dict[key] ?? en[key] ?? ar[key] ?? key;
      // interpolate, then localise any digits that came from vars
      const out = interpolate(raw, vars);
      return lang === "ar" ? toArabicDigits(out) : out;
    },
    [lang],
  );

  const value = useMemo<I18nValue>(() => ({ lang, dir, setLang, t, num }), [lang, dir, setLang, t, num]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
