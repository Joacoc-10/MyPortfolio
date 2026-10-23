import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/layout/Footer";
import { About } from "@/features/about/About";
import { Contact } from "@/features/contact/Contact";
import { Experience } from "@/features/experience/Experience";
import { Hero } from "@/features/hero/Hero";
import { Projects } from "@/features/projects/Projects";
import { Stack } from "@/features/stack/Stack";
import { profile } from "@/data/profile";
import { links, siteUrl } from "@/data/links";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL(siteUrl),
    robots: { index: true, follow: true },
    title: t("title"),
    description: t("description"),
    icons: { apple: "/apple-touch-icon.png" },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [{ url: "/share.png", alt: "JCoding — Joaquín Curbelo, Full Stack Developer" }],
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
      images: [{ url: "/share.png", width: 1200, height: 630, alt: "JCoding — Joaquín Curbelo, Full Stack Developer" }],
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
          { "@type": "Person", "@id": `${siteUrl}/#person`, name: profile.name, url: siteUrl, sameAs: [links.github, links.linkedin] },
          { "@type": "WebSite", "@id": `${siteUrl}/#website`, name: "JCoding", url: siteUrl, inLanguage: ["es", "en"], author: { "@id": `${siteUrl}/#person` } },
        ],
      }).replace(/</g, "\\u003c") }} />
      <main id="main">
        <Hero />
        <About />
        <Experience />
        <Stack />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
