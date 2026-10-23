import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "NotFound" });
  return { title: t("title"), alternates: { canonical: null, languages: {} } };
}

// Cualquier ruta desconocida dentro de un idioma muestra el 404 localizado.
export default function CatchAll() {
  notFound();
}
