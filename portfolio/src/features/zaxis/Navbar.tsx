"use client";

import { useTranslations } from "next-intl";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { LogoLayers } from "./Brand";
import { LangSwitch } from "./LangSwitch";
import { SECTIONS, sectionStore } from "./store";

export function Navbar({ first, last }: { first: string; last: string }) {
  const t = useTranslations("Nav");
  const z = useTranslations("Z");
  const c = useTranslations("Common");
  const [open, setOpen] = useState(false);
  const [intro, setIntro] = useState(true);
  const burger = useRef<HTMLButtonElement>(null);
  const cur = useSyncExternalStore(sectionStore.subscribe, sectionStore.get, () => 0);
  const labels: Record<(typeof SECTIONS)[number], string> = { projects: t("projects"), experience: t("experience"), stack: t("stack"), about: t("about"), contact: t("contact") };

  // Al cambiar de idioma se omite la intro del logo (la posición se restaura en ZAxisApp).
  useLayoutEffect(() => {
    try {
      if (sessionStorage.getItem("jcz-restore")) setIntro(false);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("lock", open);
    return () => document.documentElement.classList.remove("lock");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        burger.current?.focus();
      }
    };
    const mq = matchMedia("(min-width: 1061px)");
    const onMq = () => setOpen(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  const activeId = cur > 0 ? SECTIONS[cur - 1] : null;
  const close = () => setOpen(false);

  return (
    <>
      <a className="skip" href="#projects">{c("skipToContent")}</a>
      <header className={`nav${open ? " open" : ""}`} id="nav">
        <div className="nav-in">
          <a className="nav-logo" href="#top" aria-label={z("homeLabel")}>
            <LogoLayers width={124} intro={intro} onIntroEnd={() => setIntro(false)} />
          </a>
          <a className="dock" id="dock" href="#top" aria-label={z("dockLabel")}>
            <span className="d1">{first}</span>
            <span className="d2 serif">{last}</span>
          </a>
          <nav aria-label={t("label")} id="navlinks" className="nav-links">
            {SECTIONS.slice(0, 4).map((id) => (
              <a key={id} href={`#${id}`} data-sec={id} aria-current={activeId === id ? "true" : undefined} onClick={close}>{labels[id]}</a>
            ))}
            <a className="btn primary nav-cta-m" href="#contact" data-sec="contact" aria-current={activeId === "contact" ? "true" : undefined} onClick={close}>{labels.contact}</a>
            <LangSwitch idPrefix="lm" />
          </nav>
          <div className="nav-tools">
            <LangSwitch idPrefix="lt" />
            <a className="btn primary sm nav-cta" href="#contact" data-sec="contact" aria-current={activeId === "contact" ? "true" : undefined}>{labels.contact}</a>
            <button ref={burger} className="burger" type="button" id="burger" aria-expanded={open} aria-controls="navlinks" aria-label={open ? t("closeMenu") : t("openMenu")} onClick={() => setOpen((v) => !v)}>
              <span />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
