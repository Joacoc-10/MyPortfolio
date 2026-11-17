import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@/styles/globals.css";
import { siteUrl } from "@/data";
import { routing } from "@/i18n/routing";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

// Serif itálica de contraste para las palabras destacadas (apellido, «juntos?», años de la trayectoria).
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "JCoding",
  icons: { apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#05070b",
  colorScheme: "dark",
};

// Se ejecuta antes del primer pintado: marca <html> con `rm` (reducir movimiento) o `lite` (equipo modesto)
// para que el hero y el coverflow nazcan estáticos y no haya salto de diseño al hidratar.
const motionPrefsScript = `(function(){try{var d=document.documentElement,q=new URLSearchParams(location.search),rm=q.get("rm")==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches,c=navigator.connection,lite=!rm&&(q.get("lite")==="1"||(c&&c.saveData)||(navigator.hardwareConcurrency||8)<=2);if(rm)d.classList.add("rm");if(lite)d.classList.add("lite")}catch(e){}})()`;

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionPrefsScript }} />
      </head>
      <body>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
