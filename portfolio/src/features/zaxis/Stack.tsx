"use client";

// STACK · Capas del desarrollo. Full Stack es trabajar en profundidad: Interfaz, Lógica, Datos y Entrega.
// Cada tecnología lleva su logo; al elegirla se ve en qué proyectos se usó. Cierra con el carrusel de logos,
// que hace de transición hacia «Sobre mí».
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { TechCategory } from "@/data";
import { useZ } from "./ctx";
import { createLoop, getMotionPrefs, bindPointer, pointer } from "./lib";
import { TechLogo } from "./TechLogo";
import type { ZTech } from "./types";

const LAYER_MAP: Record<string, TechCategory[]> = { interface: ["frontend"], logic: ["backend", "services"], data: ["database"], delivery: ["devops", "tools"] };
const brand = (t: ZTech) => (t.brandColor ? ({ "--c": t.brandColor } as CSSProperties) : undefined);

function Marquee({ techs, label }: { techs: ZTech[]; label: string }) {
  // Decorativo: la lista completa ya está en las capas de arriba, por eso se oculta a lectores de pantalla.
  const set = (dup?: boolean) => (
    <ul className="marquee-set" data-duplicate={dup ? "" : undefined}>
      {techs.map((t) => (
        <li key={t.id} className="marquee-item tc" style={brand(t)}>
          <TechLogo tech={t} size={34} />
          <span>{t.name}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee" aria-hidden="true" data-label={label}>
      <div className="marquee-track">{set()}{set(true)}</div>
    </div>
  );
}

export function Stack() {
  const { content, projects, openDetail } = useZ();
  const t = useTranslations("Stack");
  const z = useTranslations("Z");
  const layersRaw = z.raw("layers") as { id: string; name: string; sub: string }[];
  const [pressed, setPressed] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const layers = useRef<HTMLOListElement>(null);

  const label = (c: TechCategory) => (c === "services" ? z("services") : t(`categories.${c}` as "categories.frontend"));
  const used = pressed ? projects.filter((p) => p.techs.some((tc) => tc.id === pressed)) : [];
  const pressedTech = pressed ? Object.values(content.stack).flat().find((tc) => tc.id === pressed) : undefined;

  // Profundidad sutil: las capas se inclinan un par de grados con el puntero (solo ratón, sin movimiento reducido).
  useEffect(() => {
    bindPointer();
    const { calm } = getMotionPrefs();
    const w = wrap.current, ly = layers.current;
    if (calm || !pointer.fine || !w || !ly) return;
    let rx = 0, ry = 0, tx = 0, ty = 0, over = false;
    const loop = createLoop(() => {
      rx += (tx - rx) * 0.08; ry += (ty - ry) * 0.08;
      ly.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      if (!over && Math.abs(rx) < 0.01 && Math.abs(ry) < 0.01) { ly.style.transform = ""; loop.stop(); }
    });
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = w.getBoundingClientRect();
      ty = ((e.clientX - r.left) / r.width - 0.5) * 3.2;
      tx = -((e.clientY - r.top) / r.height - 0.5) * 3.2;
      over = true; loop.start();
    };
    const leave = () => { over = false; tx = ty = 0; loop.start(); };
    w.addEventListener("pointermove", move);
    w.addEventListener("pointerleave", leave);
    return () => { w.removeEventListener("pointermove", move); w.removeEventListener("pointerleave", leave); loop.stop(); };
  }, []);

  return (
    <section className="sec stack" id="stack" aria-labelledby="st-h">
      <div className="sec-rule" data-io />
      <div className="plane-grid st-floor" aria-hidden="true"><i /></div>
      <div className="wrap">
        <header className="sec-head" data-io>
          <p className="eyebrow mono"><b>Z·03</b> {t("eyebrow")}</p>
          <h2 className="sec-title" id="st-h"><span className="mask-line"><span>{t("title")}</span></span></h2>
          <p className="sec-lead" data-reveal>{t("description")}</p>
        </header>
        <div className="layers-wrap" id="layersWrap" ref={wrap}>
          <ol className="layers" id="layers" ref={layers} aria-label={z("layerLabel")}>
            {layersRaw.map((ly, n) => {
              const cats = LAYER_MAP[ly.id].filter((c) => content.stack[c]?.length);
              const multi = cats.length > 1;
              return (
                <li className="layer glow" data-spot data-layer={ly.id} style={{ "--n": n } as CSSProperties} data-reveal key={ly.id}>
                  <div className="ly-head">
                    <span className="ly-n mono" aria-hidden="true">0{n + 1}</span>
                    <h3 className="ly-name">{ly.name}</h3>
                    <p className="ly-sub mono">{ly.sub}</p>
                  </div>
                  <div className="ly-body">
                    {cats.map((c) => (
                      <div className="ly-group" key={c}>
                        {multi && <p className="ly-gl mono">{label(c)}</p>}
                        <ul className="ly-chips">
                          {content.stack[c].map((tc) => (
                            <li key={tc.id}>
                              <button type="button" className="tech tc" aria-pressed={pressed === tc.id} style={brand(tc)} onClick={() => setPressed((cur) => (cur === tc.id ? null : tc.id))}>
                                <TechLogo tech={tc} size={17} />{tc.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="usage" id="usage" role="status" aria-live="polite">
          {!pressedTech ? (
            <p className="usage-hint">{z("pickTech")}</p>
          ) : used.length ? (
            <>
              <p className="usage-h mono">{pressedTech.name} · {z("usedIn")}</p>
              <ul className="usage-list">
                {used.map((p) => (
                  <li key={p.id}><button type="button" className="btn sm" onClick={(e) => openDetail(p.id, e.currentTarget)}>{p.name} <span aria-hidden="true">→</span></button></li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <p className="usage-h mono">{pressedTech.name}</p>
              <p className="usage-hint">{z("noUse")}</p>
            </>
          )}
        </div>
      </div>
      <Marquee techs={content.allStack} label={z("marqueeLabel")} />
    </section>
  );
}
