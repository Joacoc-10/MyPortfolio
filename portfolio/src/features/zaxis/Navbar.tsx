"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { LogoLayers } from "./Brand";
import { LangSwitch } from "./LangSwitch";
import { SECTIONS, sectionStore } from "./store";

export function Navbar({ role }: { role: string }) {
  const t = useTranslations("Nav");
  const z = useTranslations("Z");
  const c = useTranslations("Common");
  const [open, setOpen] = useState(false);
  const [intro, setIntro] = useState(true);
  const burger = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const cur = useSyncExternalStore(sectionStore.subscribe, sectionStore.get, () => 0);
  const labels: Record<(typeof SECTIONS)[number], string> = { projects: t("projects"), experience: t("experience"), stack: t("stack"), about: t("about"), contact: t("contact") };

  // Al cambiar de idioma se omite la intro del logo (la posición se restaura en ZAxisApp).
  useLayoutEffect(() => {
    try {
      if (sessionStorage.getItem("jcz-restore")) setIntro(false);
    } catch {}
  }, []);

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) burger.current?.focus();
  }, []);

  // Mientras está abierto: Escape, clic/toque fuera, desplazamiento, paso a escritorio y trampa de foco. Todo se limpia al cerrar.
  useEffect(() => {
    if (!open) return;
    const h = header.current;
    const startY = scrollY;
    const links = () => [...(h?.querySelectorAll<HTMLElement>("#navlinks a, #navlinks button") ?? []), burger.current!].filter((el) => el.offsetParent !== null || el === burger.current);
    requestAnimationFrame(() => h?.querySelector<HTMLElement>("#navlinks a")?.focus({ preventScroll: true }));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(true); return; }
      if (e.key !== "Tab") return;
      const f = links();
      const i = f.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    };
    const onPointer = (e: PointerEvent) => { if (!h?.contains(e.target as Node)) close(); };
    const onScroll = () => { if (Math.abs(scrollY - startY) > 24) close(); };
    const mq = matchMedia("(min-width: 1061px)");
    const onMq = () => close();
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    addEventListener("scroll", onScroll, { passive: true });
    mq.addEventListener("change", onMq);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      removeEventListener("scroll", onScroll);
      mq.removeEventListener("change", onMq);
    };
  }, [open, close]);

  // Contacto inmersivo (≤960px, donde la escena queda fija arriba): el navbar se oculta al entrar en Message Portal,
  // vuelve al desplazarse hacia arriba y permanece oculto mientras el teclado virtual está abierto con un campo enfocado.
  // Se restaura al salir de Contacto. Solo escribe atributos en el DOM (sin re-render por frame). Con movimiento reducido el cambio es instantáneo (CSS).
  useEffect(() => {
    const h = header.current, mp = document.querySelector<HTMLElement>(".mp"), stage = mp?.querySelector<HTMLElement>(".mp-stage");
    if (!h || !mp || !stage) return;
    const mq = matchMedia("(max-width: 960px)");
    const html = document.documentElement;
    const navH = () => h.offsetHeight || 68;
    let lastY = scrollY, dir: "up" | "down" = "down", raf = 0, fieldFocus = false, base = visualViewport?.height ?? innerHeight, hidden = false;
    const isField = (el: EventTarget | null) => el instanceof HTMLElement && el.closest(".mp-form") !== null && /^(INPUT|TEXTAREA)$/.test(el.tagName);
    const apply = () => {
      raf = 0;
      let hide = false;
      if (mq.matches && !h.classList.contains("open")) {
        const vvh = visualViewport?.height ?? innerHeight;
        const kb = fieldFocus && vvh < Math.max(base, 1) * 0.85;
        const inZone = stage.getBoundingClientRect().top <= navH() + 2 && (document.getElementById("foot")?.getBoundingClientRect().top ?? Infinity) > innerHeight * 0.92; // el pie de página marca la salida de Contacto
        hide = kb || (inZone && dir === "down");
      }
      if (hide === hidden) return;
      hidden = hide;
      h.toggleAttribute("data-hide", hide);
      if (hide) html.dataset.nav = "hidden"; else delete html.dataset.nav;
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(apply); };
    const onScroll = () => {
      const y = scrollY, dy = y - lastY;
      if (Math.abs(dy) >= 6) { dir = dy > 0 ? "down" : "up"; lastY = y; }
      queue();
    };
    const onFocusIn = (e: FocusEvent) => { if (isField(e.target)) { fieldFocus = true; queue(); } };
    const onFocusOut = (e: FocusEvent) => { if (isField(e.target)) { fieldFocus = false; base = visualViewport?.height ?? innerHeight; queue(); } };
    const onVv = () => { if (!fieldFocus) base = visualViewport?.height ?? innerHeight; queue(); };
    addEventListener("scroll", onScroll, { passive: true });
    mp.addEventListener("focusin", onFocusIn);
    mp.addEventListener("focusout", onFocusOut);
    visualViewport?.addEventListener("resize", onVv);
    addEventListener("resize", queue);
    mq.addEventListener("change", queue);
    queue();
    return () => {
      removeEventListener("scroll", onScroll);
      mp.removeEventListener("focusin", onFocusIn);
      mp.removeEventListener("focusout", onFocusOut);
      visualViewport?.removeEventListener("resize", onVv);
      removeEventListener("resize", queue);
      mq.removeEventListener("change", queue);
      cancelAnimationFrame(raf);
      h.removeAttribute("data-hide"); delete html.dataset.nav;
    };
  }, [open]);

  const activeId = cur > 0 ? SECTIONS[cur - 1] : null;
  const item = (i: number) => ({ "--i": i }) as CSSProperties;

  return (
    <>
      <a className="skip" href="#projects">{c("skipToContent")}</a>
      <header className={`nav${open ? " open" : ""}`} id="nav" ref={header}>
        <div className="nav-in">
          <a className="nav-logo" href="#top" aria-label={z("homeLabel")}>
            <LogoLayers width={124} intro={intro} onIntroEnd={() => setIntro(false)} />
          </a>
          {/* Decorativo: repite el enlace al inicio del logo, por eso no entra en la navegación por teclado ni en el árbol accesible. */}
          <a className="dock" id="dock" href="#top" aria-hidden="true" tabIndex={-1}><span className="dock-role">{role}</span></a>
          <nav aria-label={t("label")} id="navlinks" className="nav-links">
            {SECTIONS.slice(0, 4).map((id, i) => (
              <a key={id} href={`#${id}`} data-sec={id} style={item(i)} aria-current={activeId === id ? "true" : undefined} onClick={() => close()}>
                <span className="nl-n" aria-hidden="true">0{i + 1}</span><span>{labels[id]}</span><span className="nl-arrow" aria-hidden="true">→</span>
              </a>
            ))}
            <a className="btn primary nav-cta-m" href="#contact" data-sec="contact" style={item(4)} aria-current={activeId === "contact" ? "true" : undefined} onClick={() => close()}>{labels.contact}</a>
            <div className="nl-lang" style={item(5)}>
              <span className="mono">{t("language")}</span>
              <LangSwitch idPrefix="lm" />
            </div>
          </nav>
          <div className="nav-tools">
            <LangSwitch idPrefix="lt" />
            <a className="btn primary sm nav-cta" href="#contact" data-sec="contact" aria-current={activeId === "contact" ? "true" : undefined}>{labels.contact}</a>
            <button ref={burger} className="burger" type="button" id="burger" aria-expanded={open} aria-controls="navlinks" aria-label={open ? t("closeMenu") : t("openMenu")} onClick={() => (open ? close() : setOpen(true))}>
              <span className="bars" aria-hidden="true"><i /><i /><i /></span>
            </button>
          </div>
        </div>
        <button type="button" className="nav-scrim" tabIndex={-1} aria-hidden="true" onClick={() => close()} />
      </header>
    </>
  );
}
