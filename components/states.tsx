"use client";

import { Loader2, AlertTriangle, Inbox } from "lucide-react";
import { useI18n } from "@/components/i18n";
import { Button } from "@/components/ui/button";

/** Loading state — required on every screen (Readiness). */
export function LoadingState({ label }: { label?: string }) {
  const { t } = useI18n();
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3 py-16 text-ink-600">
      <Loader2 className="size-8 animate-spin" aria-hidden />
      <p className="text-body">{label ?? t("common.loading")}</p>
    </div>
  );
}

/** Error state — explains what to do, in the interface's voice, never apologetic. */
export function ErrorState({
  title,
  body,
  onRetry,
}: {
  title?: string;
  body?: string;
  onRetry?: () => void;
}) {
  const { t } = useI18n();
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <AlertTriangle className="size-8 text-amber-500" aria-hidden />
      <p className="text-title font-bold text-ink-900">{title ?? t("common.errorTitle")}</p>
      <p className="max-w-xs text-body text-ink-600">{body ?? t("common.errorBody")}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-2">
          {t("common.retry")}
        </Button>
      )}
    </div>
  );
}

/** Empty state — required on list screens (Readiness). */
export function EmptyState({ title, body, icon }: { title: string; body?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="text-ink-600">{icon ?? <Inbox className="size-8" aria-hidden />}</div>
      <p className="text-title font-bold text-ink-900">{title}</p>
      {body && <p className="max-w-xs text-body text-ink-600">{body}</p>}
    </div>
  );
}
