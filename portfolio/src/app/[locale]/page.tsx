import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/layout/Footer";
import { About } from "@/features/about/About";
import { Contact } from "@/features/contact/Contact";
import { Experience } from "@/features/experience/Experience";
import { Hero } from "@/features/hero/Hero";
import { Projects } from "@/features/projects/Projects";
import { Stack } from "@/features/stack/Stack";
import { routing } from "@/i18n/routing";

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
