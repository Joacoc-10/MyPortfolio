import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getZContent } from "@/features/zaxis/content";
import { ZAxisApp } from "@/features/zaxis/ZAxisApp";
import { profile } from "@/data/profile";
import { links, siteUrl } from "@/data/links";
import { ogImage } from "@/data/seo";
import { getStackTechnologies } from "@/data";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const ogAlt = t("ogAlt");
  const image = { url: ogImage.path, width: ogImage.width, height: ogImage.height, type: ogImage.type, alt: ogAlt };

  return {
    robots: { index: true, follow: true },
    title: t("title"),
    description: t("description"),
    icons: { apple: "/apple-touch-icon.png" },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [{ url: ogImage.path, alt: ogAlt }],
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        es: "/es",
        en: "/en",
        "x-default": "/es",
      },
    },
    openGraph: {
      type: "website",
      images: [image],
      url: `/${locale}`,
      siteName: "JCoding",
      title: t("title"),
      description: t("description"),
      locale: locale === "es" ? "es_ES" : "en_US",
      alternateLocale: locale === "es" ? "en_US" : "es_ES",
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Person",
            "@id": `${siteUrl}/#person`,
            name: profile.name,
            alternateName: "JCoding",
            jobTitle: profile.headline[locale as "es" | "en"],
            url: `${siteUrl}/${locale}`,
            image: `${siteUrl}/images/joaquin.png`,
            knowsAbout: getStackTechnologies().map((t) => t.name),
            sameAs: [links.github, links.linkedin],
          },
          { "@type": "WebSite", "@id": `${siteUrl}/#website`, name: "JCoding", url: `${siteUrl}/${locale}`, inLanguage: ["es", "en"], publisher: { "@id": `${siteUrl}/#person` }, author: { "@id": `${siteUrl}/#person` } },
        ],
      }).replace(/</g, "\\u003c") }} />
      <ZAxisApp content={getZContent(locale)} />
    </>
  );
}
