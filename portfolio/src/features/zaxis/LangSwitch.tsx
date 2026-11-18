"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LangSwitch({ idPrefix }: { idPrefix: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Nav");
  const remember = () => {
    try {
      sessionStorage.setItem("jcz-restore", JSON.stringify({ y: scrollY }));
    } catch {}
  };
  return (
    <div className="seg" role="group" aria-label={t("language")}>
      {routing.locales.map((target) =>
        target === locale ? (
          <button key={target} id={`${idPrefix}-${target}`} type="button" aria-pressed="true" aria-current="true" lang={target}>
            {target.toUpperCase()}
          </button>
        ) : (
          // Mismo contenido en el otro idioma. scroll={false}: la posición se restaura al montar (ver ZAxisApp).
          <Link
            key={target}
            id={`${idPrefix}-${target}`}
            href={pathname}
            locale={target}
            scroll={false}
            lang={target}
            hrefLang={target}
            aria-label={`${target.toUpperCase()}: ${target === "en" ? t("switchToEnglish") : t("switchToSpanish")}`}
            onClick={remember}
            className="seg-link"
          >
            {target.toUpperCase()}
          </Link>
        ),
      )}
    </div>
  );
}
