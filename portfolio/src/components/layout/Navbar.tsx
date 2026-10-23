"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { LuMenu, LuX } from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { contactId, navItems } from "./nav-items";

export function Navbar() {
  const t = useTranslations("Nav");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Resalta la sección que está en el centro de la pantalla.
  useEffect(() => {
    const targets = [...navItems.map((item) => item.id), contactId]
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
          else setActiveId((current) => (current === entry.target.id ? null : current));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  // Cierra el menú con Escape (devolviendo el foco al botón), al tocar fuera o al pasar a escritorio.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onBreakpoint = () => desktop.matches && setOpen(false);

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
        scrolled || open
          ? cn("border-line backdrop-blur-xl", open ? "bg-canvas" : "bg-canvas/80")
          : "border-transparent bg-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" className="shrink-0" onClick={closeMenu}>
          <Image
            src="/brand/logo-white.png"
            alt="JCoding"
            width={800}
            height={183}
            priority
            fetchPriority="high"
            sizes="123px"
            className="h-7 w-auto"
          />
        </Link>

        <nav aria-label={t("label")} className="hidden lg:block">
          <ul className="flex items-center gap-8 text-sm">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={activeId === item.id ? "location" : undefined}
                  className={cn(
                    "link-underline transition-colors hover:text-ink",
                    activeId === item.id ? "text-ink" : "text-ink-muted",
                  )}
                >
                  {t(item.labelKey)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LocaleSwitcher />
          <Button href={`#${contactId}`}>{t("contact")}</Button>
        </div>

        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? t("closeMenu") : t("openMenu")}
          onClick={() => setOpen((value) => !value)}
          className="grid size-10 place-items-center rounded-lg border border-line bg-surface text-ink transition-colors hover:border-line-strong lg:hidden"
        >
          {open ? <LuX size={20} /> : <LuMenu size={20} />}
        </button>
      </Container>

      {open && (
        <div id="mobile-menu" className="border-t border-line lg:hidden">
          <Container className="flex animate-fade-up flex-col gap-6 py-6 [animation-duration:250ms]">
            <nav aria-label={t("label")}>
              <ul className="flex flex-col">
                {[
                  ...navItems.map((item) => ({
                    id: item.id,
                    label: t(item.labelKey),
                  })),
                ].map((item) => (
                  <li key={item.id} className="border-b border-line">
                    <a
                      href={`#${item.id}`}
                      onClick={closeMenu}
                      aria-current={activeId === item.id ? "location" : undefined}
                      className={cn(
                        "flex h-12 items-center text-lg",
                        activeId === item.id ? "text-brand" : "text-ink",
                      )}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex items-center justify-between gap-4">
              <LocaleSwitcher />
              <Button href={`#${contactId}`} onClick={closeMenu}>
                {t("contact")}
              </Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
