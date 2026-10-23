import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  // HTML y sitemap definen hreflang sin un x-default contradictorio en Link HTTP.
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];
