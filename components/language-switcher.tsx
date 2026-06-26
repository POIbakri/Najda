"use client";

import { useI18n } from "@/components/i18n";
import { cn } from "@/lib/utils";
import type { Language } from "@/lib/types";

const LANGS: { code: Language; label: string }[] = [
  { code: "ar", label: "العربية" },
  { code: "en", label: "EN" },
  { code: "ur", label: "اردو" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div
      role="group"
      aria-label="Language"
      className={cn("inline-flex items-center gap-1 rounded-full bg-sand-100 p-1", className)}
    >
      {LANGS.map((l) => {
        const active = l.code === lang;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={active}
            className={cn(
              "min-h-[40px] rounded-full px-3 text-caption font-bold transition-colors",
              active ? "bg-ink-900 text-sand-50" : "text-ink-600 hover:text-ink-900",
            )}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
