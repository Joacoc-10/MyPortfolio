"use client";

// Formulario de contacto «Message Portal»: formulario real + escena 3D (Three.js, cargada bajo demanda).
// El estado del envío vive AQUÍ (React); la escena solo lo representa: no confirma el éxito hasta que EmailJS
// responde, y si falla devuelve el sobre en un estado recuperable con los datos intactos.
// Fases de la escena → ver portal/scene.ts. Sin WebGL 2 se usa un respaldo CSS con las mismas fases.
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { EmailNotConfiguredError, sendContactMessage } from "./email";
import { getMotionPrefs } from "./lib";
import { FallbackDriver, type PortalDriver } from "./portal/driver";
import type { FieldName, Phase, Tier } from "./portal/scene";

const MAX = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FIELDS: FieldName[] = ["name", "email", "message"];
type Values = Record<FieldName, string>;
type Status = "idle" | "sending" | "success" | "error" | "resetting";
type Msg = (key: string, vars?: Record<string, string | number>) => string;

const HUD: Record<Phase, string> = {
  idle: "hudIdle", compose: "hudCompose", seal: "hudSeal", portal: "hudPortal", ready: "hudReady", launch: "hudLaunch", cross: "hudLaunch",
  sent: "hudSent", reject: "hudReject", bounce: "hudReject", error: "hudReject", recovered: "hudRecovered", resetting: "hudIdle",
};

function detectTier(lite: boolean): Tier {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const mem = nav.deviceMemory ?? 8, cores = navigator.hardwareConcurrency || 8, coarse = matchMedia("(pointer: coarse)").matches;
  if (lite || mem <= 2 || cores <= 2) return "low";
  if (coarse || mem <= 4 || cores <= 4 || innerWidth < 700) return "mid";
  return "high";
}

const validate = (v: Values, t: Msg) => {
  const e: Partial<Record<FieldName, string>> = {};
  if (v.name.trim().length < 2) e.name = t("errName");
  if (!EMAIL_RE.test(v.email.trim())) e.email = t("errEmail");
  if (v.message.trim().length < 10) e.message = t("errMessage");
  else if (v.message.length > MAX) e.message = t("errTooLong", { max: String(MAX) });
  return e;
};
/** Cuánto «completa» cada campo a su pieza 3D (0..1): gradual al escribir, 1 al ser válido. */
function progress(v: Values) {
  const n = v.name.trim().length, m = v.message.length, em = v.email.trim();
  return {
    name: n >= 2 ? 1 : (n / 2) * 0.55,
    email: EMAIL_RE.test(em) ? 1 : Math.min(0.62, em.length / 22) * (em.includes("@") ? 1 : 0.7),
    message: m >= 10 ? Math.min(1, 0.4 + ((m - 10) / 110) * 0.6) : (m / 10) * 0.32,
  };
}

function Hud({ steps, label, labels }: { steps: { on: number; ok: number }; label: string; labels: string[] }) {
  return (
    <div className="mp-hud" aria-hidden="true">
      <ol className="mp-steps">
        {labels.map((l, i) => <li key={l} className={i + 1 <= steps.ok ? "ok" : i + 1 === steps.on ? "on" : undefined}>{l}</li>)}
      </ol>
      <p className="mono mp-hud-l">{label}</p>
    </div>
  );
}

/** `head` (título + descripción) y `foot` (canales secundarios) se componen DENTRO del portal para compartir su rejilla y su escena. */
export function MessagePortal({ email: directEmail, head, foot }: { email: string; head?: ReactNode; foot?: ReactNode }) {
  const tr = useTranslations("ContactForm");
  const locale = useLocale();
  const t: Msg = (key, vars) => tr(key as Parameters<typeof tr>[0], vars);
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;

  const [values, setValues] = useState<Values>({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [phase, setPhase] = useState<Phase>("idle");
  const [steps, setSteps] = useState({ on: 0, ok: 0 });
  const [bad, setBad] = useState(false);
  const [hud, setHud] = useState("hudIdle");
  const [live, setLive] = useState("");
  const [errKind, setErrKind] = useState<"send" | "unconfigured">("send");
  const [canRetry, setCanRetry] = useState(true);
  const [done, setDone] = useState({ name: "", time: "" });
  const [reduced, setReduced] = useState(false);
  const [focusField, setFocusField] = useState<FieldName | null>(null);
  const [driverReady, setDriverReady] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const doneTitle = useRef<HTMLHeadingElement>(null);
  const sendBtn = useRef<HTMLButtonElement>(null);
  const trap = useRef<HTMLInputElement>(null);
  const inputs = useRef<Record<FieldName, HTMLInputElement | HTMLTextAreaElement | null>>({ name: null, email: null, message: null });
  const driver = useRef<PortalDriver | null>(null);
  const ensure = useRef<() => Promise<PortalDriver>>(() => Promise.reject(new Error("no montado")));
  const token = useRef(0);
  const statusRef = useRef<Status>("idle");
  const valuesRef = useRef(values);
  const celebrated = useRef<Partial<Record<FieldName, boolean>>>({});
  const slow = useRef(0);
  const timers = useRef(new Set<number>());
  const reducedRef = useRef(false);
  const phaseHandler = useRef<(p: Phase) => void>(() => {});

  valuesRef.current = values;
  const setS = useCallback((s: Status) => { statusRef.current = s; setStatus(s); }, []);
  const later = (fn: () => void, ms: number) => { const h = window.setTimeout(() => { timers.current.delete(h); fn(); }, ms); timers.current.add(h); };

  const errors = validate(values, t);
  const show = (k: FieldName) => ((touched[k] || submitted) && errors[k] ? errors[k] : undefined);
  const busy = status === "sending" || (status === "error" && !canRetry);
  const dataS = status === "resetting" ? "idle" : status;

  /* ---------- fases que llegan de la escena ---------- */
  phaseHandler.current = (p: Phase) => {
    setPhase(p); setHud(HUD[p]); clearTimeout(slow.current);
    switch (p) {
      case "compose": setSteps({ on: 1, ok: 0 }); break;
      case "seal": setSteps({ on: 2, ok: 1 }); break;
      case "portal": setSteps({ on: 3, ok: 2 }); break;
      case "ready": setSteps({ on: 4, ok: 3 });
        slow.current = window.setTimeout(() => { if (statusRef.current === "sending") { setHud("hudSlow"); setLive(t("liveSlow")); } }, 5500); break;
      case "launch": case "cross": setSteps({ on: 4, ok: 3 }); break;
      case "sent": {
        const v = valuesRef.current, first = v.name.trim().split(/\s+/)[0] ?? "";
        setDone({ name: first, time: new Date().toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) });
        setSteps({ on: 0, ok: 4 }); setBad(false); setS("success");
        setLive(first ? t("liveSent", { name: first }) : t("liveSentAnon"));
        break;
      }
      case "reject": case "bounce": setBad(true); setSteps({ on: 4, ok: 3 }); break;
      case "error": setBad(true); setSteps({ on: 4, ok: 3 }); setS("error"); setCanRetry(false); break;
      case "recovered": if (statusRef.current === "error") { setCanRetry(true); setSteps({ on: 0, ok: 0 }); } break;
      case "idle": if (statusRef.current === "resetting") setS("idle"); break;
      default: break;
    }
  };

  /* ---------- escena: carga diferida, montaje y limpieza ---------- */
  useEffect(() => {
    const rootEl = root.current, stageEl = stage.current, anchorEl = anchor.current;
    if (!rootEl || !stageEl || !anchorEl) return;
    let disposed = false, promise: Promise<PortalDriver> | null = null;
    const prefs = getMotionPrefs();
    reducedRef.current = prefs.rm; setReduced(prefs.rm);
    const mqMobile = matchMedia("(max-width: 960px)");
    const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
    const currentAnchor = () => (mqMobile.matches ? stageEl : anchorEl);
    const syncFlash = () => {
      const s = stageEl.getBoundingClientRect(), a = currentAnchor().getBoundingClientRect();
      stageEl.style.setProperty("--fx", `${a.left + a.width / 2 - s.left}px`); stageEl.style.setProperty("--fy", `${a.top + a.height / 2 - s.top}px`);
    };
    const onPhase = (p: Phase) => phaseHandler.current(p);

    const load = async (): Promise<PortalDriver> => {
      let d: PortalDriver;
      try {
        const { PortalScene, webglSupported } = await import("./portal/scene"); // Three.js solo se descarga aquí
        if (disposed) throw new Error("desmontado");
        if (!webglSupported()) throw new Error("WebGL 2 no disponible");
        const canvas = document.createElement("canvas");
        stageEl.prepend(canvas);
        const scene = new PortalScene({
          canvas, stage: stageEl, anchor: currentAnchor(), tier: detectTier(prefs.lite), reduced: reducedRef.current, onPhase,
          labels: { head: t("letterHead"), count: t("letterCount"), name: t("letterName"), email: t("letterEmail"), foot: t("letterFoot") },
        });
        await scene.init();
        if (disposed) { scene.dispose(); canvas.remove(); throw new Error("desmontado"); }
        const dispose = scene.dispose.bind(scene);
        scene.dispose = () => { dispose(); canvas.remove(); };
        d = scene; stageEl.dataset.mode = "webgl";
      } catch (err) {
        if (disposed) throw err;
        console.warn("[MessagePortal] escena 3D desactivada:", err instanceof Error ? err.message : err);
        stageEl.dataset.mode = "fallback"; stageEl.querySelector<HTMLElement>(".mp-fallback")?.removeAttribute("hidden");
        d = new FallbackDriver(onPhase);
      }
      if (disposed) { d.dispose(); throw new Error("desmontado"); }
      driver.current = d; setDriverReady(true); syncFlash();
      return d;
    };
    ensure.current = () => (promise ??= load());

    // Carga diferida: solo cuando la zona se acerca a la pantalla (o al interactuar con el formulario).
    const start = () => { void ensure.current().catch(() => {}); };
    let idle = 0;
    const io = new IntersectionObserver((e) => {
      if (!e[0]?.isIntersecting) return;
      io.disconnect();
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(start, { timeout: 1500 }); else idle = setTimeout(start, 200) as unknown as number;
    }, { rootMargin: "1600px 0px" });
    io.observe(rootEl);
    const ro = new ResizeObserver(syncFlash); ro.observe(stageEl); ro.observe(anchorEl);
    const onMobile = () => { const d = driver.current; if (d && d.kind === "webgl") { d.anchor = currentAnchor(); d.relayout(); } syncFlash(); };
    const onReduce = () => { reducedRef.current = getMotionPrefs().rm; setReduced(reducedRef.current); driver.current?.setReducedMotion(reducedRef.current); };
    mqMobile.addEventListener("change", onMobile); mqReduce.addEventListener("change", onReduce);
    // teclado virtual: la escena se compacta para no quitar espacio a los campos
    const vv = window.visualViewport;
    const onVv = () => { if (vv) rootEl.dataset.kb = vv.height < window.innerHeight * 0.74 ? "1" : "0"; };
    vv?.addEventListener("resize", onVv); onVv();
    const poke = (e: PointerEvent) => { if (mqMobile.matches && e.pointerType !== "mouse") driver.current?.poke(); };
    stageEl.addEventListener("pointerdown", poke);
    const pending = timers.current, tok = token;
    if (process.env.NODE_ENV !== "production") {
      Object.defineProperty(window, "__zxPortal", { configurable: true, get: () => ({ driver: driver.current, status: statusRef.current }) });
    }
    return () => {
      disposed = true; io.disconnect(); if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle); clearTimeout(idle); ro.disconnect(); mqMobile.removeEventListener("change", onMobile); mqReduce.removeEventListener("change", onReduce);
      vv?.removeEventListener("resize", onVv); stageEl.removeEventListener("pointerdown", poke);
      pending.forEach(clearTimeout); pending.clear(); clearTimeout(slow.current); tok.current++;
      driver.current?.dispose(); driver.current = null; promise = null; setDriverReady(false);
      ensure.current = () => Promise.reject(new Error("no montado"));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // La escena sigue lo que se escribe (progreso por campo + texto de la carta)
  useEffect(() => { driver.current?.setFields(progress(values), values, focusField); }, [values, focusField, driverReady]);

  // Foco y desplazamiento tras éxito / recuperación
  useEffect(() => {
    if (status !== "success") return;
    doneTitle.current?.focus({ preventScroll: true });
    card.current?.scrollIntoView({ block: "nearest", behavior: reducedRef.current ? "auto" : "smooth" });
  }, [status]);
  useEffect(() => {
    if (status === "error" && canRetry) { const a = document.activeElement; if (!a || a === document.body) sendBtn.current?.focus({ preventScroll: true }); }
  }, [status, canRetry]);

  /* ---------- formulario ---------- */
  const celebrate = (k: FieldName) => { celebrated.current[k] = true; driver.current?.fieldDone(k, inputs.current[k]?.getBoundingClientRect()); };
  const onChange = (k: FieldName) => (e: { target: { value: string } }) => {
    if (statusRef.current === "success") return;
    const next = { ...valuesRef.current, [k]: e.target.value };
    valuesRef.current = next; setValues(next); driver.current?.typed(k);
    const ok = !validate(next, t)[k];
    if (!ok) celebrated.current[k] = false;
    else if (k === "message" && !celebrated.current[k] && next.message.length >= 60) celebrate(k);
  };
  const onBlur = (k: FieldName) => () => {
    setTouched((s) => ({ ...s, [k]: true })); setFocusField(null);
    if (!validate(valuesRef.current, t)[k] && !celebrated.current[k]) celebrate(k);
  };

  async function startSend(v: Values) {
    const mine = ++token.current, isBot = Boolean(trap.current?.value);
    setS("sending"); setBad(false); setCanRetry(true); setLive(t("liveSending")); setSteps({ on: 1, ok: 0 }); setHud("hudCompose");
    // El envío real arranca YA; la escena solo lo representa y espera su respuesta.
    const request: Promise<"success" | "error"> = isBot
      ? Promise.resolve("success") // campo trampa: un bot recibe «éxito» sin enviar nada (comportamiento previo)
      : sendContactMessage({ name: v.name.trim(), email: v.email.trim(), message: v.message.trim() }).then(
          () => "success" as const,
          (err: unknown) => { setErrKind(err instanceof EmailNotConfiguredError ? "unconfigured" : "send"); return "error" as const; },
        );
    let d: PortalDriver;
    try { d = await ensure.current(); } catch { return; }
    if (mine !== token.current) return;
    d.beginSend();
    const kind = await request;
    if (mine !== token.current) return;
    d.resolve(kind);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy || status === "success" || status === "resetting") return;
    setSubmitted(true);
    const errs = validate(valuesRef.current, t), first = FIELDS.find((k) => errs[k]);
    if (first) { inputs.current[first]?.focus(); driver.current?.invalid(); return; }
    void startSend(valuesRef.current);
  }

  function again() {
    if (statusRef.current !== "success") return;
    token.current++; setS("resetting");
    const empty: Values = { name: "", email: "", message: "" };
    valuesRef.current = empty; setValues(empty); setTouched({}); setSubmitted(false); celebrated.current = {};
    setBad(false); setSteps({ on: 0, ok: 0 }); setHud("hudIdle"); setCanRetry(true);
    const d = driver.current;
    d?.setFields(progress(empty), empty, null); d?.reset();
    if (!d) setS("idle");
    later(() => { if (statusRef.current !== "success") inputs.current.name?.focus({ preventScroll: true }); }, reducedRef.current ? 50 : 700);
  }

  const invalid = submitted && Object.keys(errors).length > 0;
  const p = progress(values);
  const stepLabels = [t("stepCompose"), t("stepSeal"), t("stepPortal"), t("stepDelivery")];
  const [errBefore = "", errAfter = ""] = (tr.raw(errKind === "send" ? "errSend" : "errUnconfigured") as string).split("{email}");
  const label = status === "sending" ? t("sending") : status === "error" ? t("retry") : t("send");
  const fieldProps = (k: FieldName) => ({
    id: id(k), name: k, value: values[k], onChange: onChange(k), onBlur: onBlur(k), onFocus: () => setFocusField(k),
    readOnly: busy, "aria-readonly": busy || undefined, required: true, "aria-required": true as const, "aria-invalid": !!show(k),
  });
  const ledStyle = (k: FieldName) => ({ "--p": p[k].toFixed(2) }) as CSSProperties;

  return (
    <>
    <div className="mp" ref={root} data-s={dataS} data-phase={phase} data-bad={bad ? "1" : "0"} data-motion={reduced ? "reduce" : "full"}>
      {/* Escena 3D: decorativa (la información real está en el formulario y en la región en vivo) */}
      <div className="mp-stage" ref={stage} aria-hidden="true">
        <div className="mp-flash" />
        <div className="mp-fallback" hidden><div className="mp-fb-env"><i /><i /><i /></div><div className="mp-fb-portal" /></div>
        <Hud steps={steps} label={t(hud)} labels={stepLabels} />
      </div>

      <div className="mp-grid">
        {head && <div className="mp-head">{head}</div>}
        <div className="mp-card" ref={card}>
          <form className="mp-form" noValidate onSubmit={onSubmit} aria-labelledby={id("title")} aria-busy={status === "sending"}
            onFocusCapture={() => { void ensure.current().catch(() => {}); }}>
            <div className="mp-fields" inert={status === "success"}>
              <div className="mp-fields-in">
                <h3 className="mp-title" id={id("title")}>{t("title")}</h3>
                <p className="mp-lead">{t("lead")}</p>
                {invalid && <p className="mp-summary" role="alert">{t("errSummary")}</p>}

                <div className="mp-field" style={ledStyle("name")}>
                  <label htmlFor={id("name")}>{t("name")}</label>
                  <input {...fieldProps("name")} ref={(el) => { inputs.current.name = el; }} type="text" autoComplete="name" maxLength={80} placeholder={t("namePh")}
                    aria-describedby={show("name") ? id("name-e") : undefined} />
                  {show("name") && <p className="mp-err" id={id("name-e")}>{show("name")}</p>}
                </div>
                <div className="mp-field" style={ledStyle("email")}>
                  <label htmlFor={id("email")}>{t("email")}</label>
                  <input {...fieldProps("email")} ref={(el) => { inputs.current.email = el; }} type="email" autoComplete="email" inputMode="email" maxLength={120} placeholder={t("emailPh")}
                    aria-describedby={show("email") ? id("email-e") : undefined} />
                  {show("email") && <p className="mp-err" id={id("email-e")}>{show("email")}</p>}
                </div>
                <div className="mp-field" style={ledStyle("message")}>
                  <label htmlFor={id("message")}>{t("message")}</label>
                  <textarea {...fieldProps("message")} ref={(el) => { inputs.current.message = el; }} rows={5} placeholder={t("messagePh")}
                    aria-describedby={`${show("message") ? `${id("message-e")} ` : ""}${id("count")}`} />
                  <p className={`mp-count mono${values.message.length > MAX ? " over" : ""}`} id={id("count")}>{t("count", { n: String(values.message.length), max: String(MAX) })}</p>
                  {show("message") && <p className="mp-err" id={id("message-e")}>{show("message")}</p>}
                </div>
                {/* Campo trampa: invisible y fuera del orden de tabulación; los bots suelen rellenarlo. */}
                <div className="mp-hp" aria-hidden="true"><label>Website<input ref={trap} type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div>

                {status === "error" && <p className="mp-error" role="alert">{errBefore}<a href={`mailto:${directEmail}`}>{directEmail}</a>{errAfter}</p>}

                <button ref={sendBtn} className="btn primary mp-send" type="submit" aria-disabled={busy}>
                  <span className="spin" aria-hidden="true" /><span>{label}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Confirmación integrada en la propia experiencia */}
          <div className="mp-done" inert={status !== "success"} aria-hidden={status !== "success"}>
            <div className="mp-done-in">
              <p className="mono mp-done-k"><span className="pulse" aria-hidden="true" />{t("doneStamp", { time: done.time })}</p>
              <h3 className="mp-done-t" ref={doneTitle} tabIndex={-1}>
                <span className="ln"><span>{t("doneL1")}</span></span>{" "}
                <span className="ln"><span>{t("doneL2Pre")} <em className="serif">{t("doneEm")}</em>{t("doneL2Post")}</span></span>
              </h3>
              <p className="mp-done-p">{done.name ? t("doneText", { name: done.name }) : t("doneTextAnon")}</p>
              <div className="mp-done-act">
                <button type="button" className="btn primary" onClick={again}>{t("again")}</button>
                <a className="btn" href={`mailto:${directEmail}`}>{t("mailCta")}</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mp-anchor" ref={anchor}><Hud steps={steps} label={t(hud)} labels={stepLabels} /></div>
      </div>

      <p className="mp-sr" role="status" aria-live="polite" aria-atomic="true">{live}</p>
    </div>
    {/* Fuera de `.mp`: el stage sticky de móvil termina con la tarjeta y nunca se superpone a los canales. */}
    {foot && <div className="mp-foot">{foot}</div>}
    </>
  );
}
