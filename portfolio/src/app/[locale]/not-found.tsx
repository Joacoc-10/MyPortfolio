import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <main id="main" className="grid min-h-screen place-items-center">
      <Container className="text-center">
        <p className="font-mono text-sm text-brand">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-ink-muted">{t("description")}</p>
        <Button href="/" className="mt-8">
          {t("back")}
        </Button>
      </Container>
    </main>
  );
}
