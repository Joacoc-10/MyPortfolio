"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Nav");

  return (
    <div
      role="group"
      aria-label={t("language")}
      className="inline-flex items-center rounded-lg border border-line bg-surface p-0.5 font-mono text-xs"
    >
      {routing.locales.map((target) =>
        target === locale ? (
          <span
            key={target}
            lang={target}
            aria-current="true"
            className="rounded-md bg-surface-raised px-2.5 py-1.5 text-ink"
          >
            {target.toUpperCase()}
          </span>
        ) : (
          // Misma ruta en el otro idioma; scroll={false} conserva la posición en la página.
          <Link
            key={target}
            href={pathname}
            locale={target}
            scroll={false}
            lang={target}
            hrefLang={target}
            aria-label={
              `${target.toUpperCase()}: ${target === "en" ? t("switchToEnglish") : t("switchToSpanish")}`
            }
            className="rounded-md px-2.5 py-1.5 text-ink-muted transition-colors hover:text-ink"
          >
            {target.toUpperCase()}
          </Link>
        ),
      )}
    </div>
  );
}
