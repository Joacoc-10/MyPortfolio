import type { MetadataRoute } from "next";
import { siteUrl } from "@/data/links";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.map(locale => ({
    url: `${siteUrl}/${locale}`,
    alternates: { languages: { es: `${siteUrl}/es`, en: `${siteUrl}/en`, "x-default": `${siteUrl}/es` } },
  }));
}
