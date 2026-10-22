import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { getProfile, localize } from "@/data";

export async function About() {
  const locale = await getLocale();
  const t = await getTranslations("About");
  const [lead, ...rest] = localize(getProfile().about, locale);

  return (
    <Section id="about" index="01" eyebrow={t("eyebrow")} title={t("title")}>
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <Reveal className="mx-auto w-full max-w-xs lg:col-span-4 lg:max-w-none">
          <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="hero-fallback absolute inset-0" aria-hidden="true" />
            <Image
              src="/images/joaquin.png"
              alt={t("photoAlt")}
              fill
              sizes="(min-width: 1024px) 28vw, 320px"
              className="object-cover object-top"
            />
          </div>
        </Reveal>

        <Reveal className="space-y-5 lg:col-span-7 lg:col-start-6" delay={100}>
          <p className="text-xl leading-relaxed text-ink text-pretty sm:text-2xl">
            {lead}
          </p>
          {rest.map((paragraph) => (
            <p
              key={paragraph}
              className="text-lg leading-relaxed text-ink-muted text-pretty"
            >
              {paragraph}
            </p>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
