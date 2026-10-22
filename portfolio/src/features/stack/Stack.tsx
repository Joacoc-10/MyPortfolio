import { getTranslations } from "next-intl/server";
import { TechChip } from "@/components/TechChip";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { getStack, stackCategories } from "@/data";

/** Ancho de cada categoría en la grilla de 6 columnas (escritorio). */
const spans: Record<(typeof stackCategories)[number], string> = {
  frontend: "lg:col-span-4",
  backend: "lg:col-span-2",
  database: "lg:col-span-2",
  devops: "lg:col-span-2",
  tools: "lg:col-span-2",
};

export async function Stack() {
  const t = await getTranslations("Stack");
  const categories = await getTranslations("Stack.categories");

  return (
    <Section
      id="stack"
      index="03"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {getStack().map(({ category, items }, index) => (
          <Reveal
            key={category}
            delay={index * 70}
            className={spans[category]}
          >
            <Card className="h-full p-6">
              <h3 className="font-mono text-xs tracking-wide text-brand uppercase">
                {categories(category)}
              </h3>
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {items.map((tech) => (
                  <li key={tech.id}>
                    <TechChip tech={tech} size="md" />
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
