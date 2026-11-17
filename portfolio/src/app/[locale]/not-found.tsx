import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <main id="main" className="nf">
      <p className="mono nf-code">404</p>
      <h1 className="nf-title">{t("title")}</h1>
      <p className="nf-text">{t("description")}</p>
      <Link href="/" className="btn primary">{t("back")}</Link>
    </main>
  );
}
