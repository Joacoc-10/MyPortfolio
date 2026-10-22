import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { LuArrowUp } from "react-icons/lu";
import { Container } from "@/components/ui/Container";
import { getLinks } from "@/data";
import { Link } from "@/i18n/navigation";
import { CurrentYear } from "./CurrentYear";
import { contactId, navItems } from "./nav-items";

export async function Footer() {
  const t = await getTranslations("Footer");
  const nav = await getTranslations("Nav");
  const common = await getTranslations("Common");
  const links = getLinks();

  const social =
    "grid size-10 place-items-center rounded-lg border border-line text-ink-muted transition-colors hover:border-brand/60 hover:text-ink";

  return (
    <footer className="border-t border-line">
      <Container className="py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="shrink-0">
            <Image
              src="/brand/logo-white.png"
              alt="JCoding"
              width={800}
              height={183}
              className="h-7 w-auto"
            />
          </Link>

          <nav aria-label={t("label")}>
            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
              {[
                ...navItems.map((item) => ({
                  id: item.id,
                  label: nav(item.labelKey),
                })),
                { id: contactId, label: nav("contact") },
              ].map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="link-underline text-ink-muted transition-colors hover:text-ink"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="flex items-center gap-2">
            <li>
              <a
                href={links.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`GitHub (${common("opensInNewTab")})`}
                className={social}
              >
                <FaGithub size={18} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href={links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`LinkedIn (${common("opensInNewTab")})`}
                className={social}
              >
                <FaLinkedinIn size={18} aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-sm text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> JCoding. {t("rights")}
          </p>
          <a
            href="#main"
            className="link-underline inline-flex items-center gap-1.5 self-start transition-colors hover:text-ink sm:self-auto"
          >
            <LuArrowUp size={14} aria-hidden="true" />
            {t("backToTop")}
          </a>
        </div>
      </Container>
    </footer>
  );
}
