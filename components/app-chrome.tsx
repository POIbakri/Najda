"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LifeBuoy, LayoutDashboard, HeartHandshake } from "lucide-react";
import { useI18n } from "@/components/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CallEmergencyBar } from "@/components/call-ems-bar";
import { OfflineBanner } from "@/components/offline-banner";
import { db } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", key: "nav.home" as const, icon: LifeBuoy },
  { href: "/respond", key: "nav.respond" as const, icon: HeartHandshake },
  { href: "/dashboard", key: "nav.dashboard" as const, icon: LayoutDashboard },
];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="sticky top-0 z-30 bg-sand-50/90 backdrop-blur-sm">
        <OfflineBanner />
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <Link href="/" className="flex min-w-0 items-center gap-2" aria-label={t("app.name")}>
            <span className="shrink-0 text-title font-bold text-ink-900">{t("app.name")}</span>
            {db.mode === "demo" && (
              <span className="shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-ink-600">
                {t("common.demoBadge")}
              </span>
            )}
          </Link>
          <LanguageSwitcher className="shrink-0" />
        </div>
        <nav aria-label={t("app.name")} className="flex gap-1 px-2 pb-2">
          {NAV.map(({ href, key, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-card px-1 py-1.5 text-[11px] font-bold transition-colors sm:flex-row sm:gap-1.5 sm:text-caption",
                  active ? "bg-sand-100 text-ink-900" : "text-ink-600 hover:bg-sand-100/60",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="max-w-full truncate">{t(key)}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* pad-bottom clears the fixed Call 998 bar */}
      <main className="flex-1 px-4 pb-28 pt-2">{children}</main>

      <CallEmergencyBar />
    </div>
  );
}
