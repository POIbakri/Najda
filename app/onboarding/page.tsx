"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeartHandshake, LifeBuoy, MapPin, Check } from "lucide-react";
import { useI18n } from "@/components/i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { db } from "@/lib/store";
import { cn } from "@/lib/utils";

const ONBOARDED_KEY = "najda:onboarded";

export default function OnboardingPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [needHelp, setNeedHelp] = useState(true);
  const [helpOthers, setHelpOthers] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  function finishSkip() {
    window.localStorage.setItem(ONBOARDED_KEY, "1");
    router.replace("/");
  }

  async function finish() {
    setSaving(true);
    try {
      if (name.trim() && phone.trim()) {
        await db.saveProfile({
          name: name.trim(),
          phone: phone.trim(),
          is_responder: helpOthers,
          is_available: helpOthers,
        });
      }
      window.localStorage.setItem(ONBOARDED_KEY, "1");
      router.replace(helpOthers && !needHelp ? "/respond" : "/");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 pt-4">
      {/* progress dots */}
      <div className="flex justify-center gap-2" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn("h-2 rounded-full transition-all", i === step ? "w-6 bg-ink-900" : "w-2 bg-ink-900/20")}
          />
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-6 text-center">
          <h1 className="text-title font-bold">{t("onboarding.langTitle")}</h1>
          <div className="flex justify-center">
            <LanguageSwitcher />
          </div>
          <Button size="block" onClick={() => setStep(1)}>
            {t("common.continue")}
          </Button>
          <button onClick={finishSkip} className="text-caption text-ink-600 underline">
            {t("onboarding.skip")}
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <div className="space-y-1 text-center">
            <h1 className="text-title font-bold">{t("onboarding.roleTitle")}</h1>
            <p className="text-caption text-ink-600">{t("onboarding.roleHint")}</p>
          </div>
          <RoleCard
            icon={<LifeBuoy className="size-6 text-flare-600" aria-hidden />}
            title={t("onboarding.roleNeedHelp")}
            desc={t("onboarding.roleNeedHelp.desc")}
            checked={needHelp}
            onToggle={() => setNeedHelp((v) => !v)}
          />
          <RoleCard
            icon={<HeartHandshake className="size-6 text-relief-600" aria-hidden />}
            title={t("onboarding.roleHelpOthers")}
            desc={t("onboarding.roleHelpOthers.desc")}
            checked={helpOthers}
            onToggle={() => setHelpOthers((v) => !v)}
          />
          <Button size="block" onClick={() => setStep(2)} disabled={!needHelp && !helpOthers}>
            {t("common.continue")}
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 text-center">
          <MapPin className="mx-auto size-12 text-flare-600" aria-hidden />
          <h1 className="text-title font-bold">{t("onboarding.permTitle")}</h1>
          <p className="mx-auto max-w-sm text-body text-ink-600">{t("onboarding.permBody")}</p>
          <Button size="block" onClick={() => setStep(3)}>
            {t("common.continue")}
          </Button>
        </div>
      )}

      {step === 3 && (
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            void finish();
          }}
        >
          <h1 className="text-center text-title font-bold">{t("app.name")}</h1>
          <label className="block space-y-1">
            <span className="text-caption font-bold text-ink-600">{t("onboarding.nameLabel")}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("onboarding.namePlaceholder")}
              autoComplete="name"
              className="min-h-touch w-full rounded-card border-2 border-ink-900/15 bg-white px-4 text-body focus-visible:border-ink-900 focus-visible:outline-none"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-caption font-bold text-ink-600">{t("onboarding.phoneLabel")}</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("onboarding.phonePlaceholder")}
              inputMode="tel"
              dir="ltr"
              autoComplete="tel"
              className="min-h-touch w-full rounded-card border-2 border-ink-900/15 bg-white px-4 text-body focus-visible:border-ink-900 focus-visible:outline-none"
            />
          </label>
          <Button type="submit" size="block" disabled={saving}>
            {t("onboarding.start")}
          </Button>
          <button type="button" onClick={finishSkip} className="block w-full text-center text-caption text-ink-600 underline">
            {t("onboarding.skip")}
          </button>
        </form>
      )}
    </div>
  );
}

function RoleCard({
  icon,
  title,
  desc,
  checked,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button type="button" onClick={onToggle} aria-pressed={checked} className="w-full text-start">
      <Card
        className={cn(
          "flex items-center gap-4 border-2 transition-colors",
          checked ? "border-ink-900 bg-white" : "border-transparent",
        )}
      >
        {icon}
        <div className="flex-1">
          <p className="text-body font-bold text-ink-900">{title}</p>
          <p className="text-caption text-ink-600">{desc}</p>
        </div>
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full border-2",
            checked ? "border-ink-900 bg-ink-900 text-white" : "border-ink-900/30",
          )}
          aria-hidden
        >
          {checked && <Check className="size-4" />}
        </span>
      </Card>
    </button>
  );
}
