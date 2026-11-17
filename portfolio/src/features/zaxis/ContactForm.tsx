"use client";

// Formulario de contacto (EmailJS). Validación en cliente, accesible y con estados claros:
// idle → sending → success | error. Campo trampa (honeypot) contra bots; sin dependencias de validación.
import { useTranslations } from "next-intl";
import { useId, useRef, useState, type FormEvent } from "react";
import { EmailNotConfiguredError, sendContactMessage } from "./email";

const MAX = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
type Field = "name" | "email" | "message";
type Status = "idle" | "sending" | "success" | "error" | "unconfigured";

export function ContactForm({ email: directEmail }: { email: string }) {
  const f = useTranslations("ContactForm");
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const trap = useRef<HTMLInputElement>(null);

  const validate = (v: Record<Field, string>): Partial<Record<Field, string>> => {
    const e: Partial<Record<Field, string>> = {};
    if (v.name.trim().length < 2) e.name = f("errName");
    if (!EMAIL_RE.test(v.email.trim())) e.email = f("errEmail");
    if (v.message.trim().length < 10) e.message = f("errMessage");
    else if (v.message.length > MAX) e.message = f("errTooLong", { max: String(MAX) });
    return e;
  };
  const errors = validate(values);
  const show = (k: Field) => ((touched[k] || submitted) && errors[k] ? errors[k] : undefined);
  const set = (k: Field) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }));
  const blur = (k: Field) => () => setTouched((t) => ({ ...t, [k]: true }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setSubmitted(true);
    const errs = validate(values);
    const firstBad = (["name", "email", "message"] as Field[]).find((k) => errs[k]);
    if (firstBad) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus();
      return;
    }
    if (trap.current?.value) { // un bot rellenó el campo oculto: se simula éxito sin enviar nada
      setStatus("success");
      return;
    }
    setStatus("sending");
    try {
      await sendContactMessage({ name: values.name.trim(), email: values.email.trim(), message: values.message.trim() });
      setStatus("success");
      setValues({ name: "", email: "", message: "" });
      setTouched({});
      setSubmitted(false);
    } catch (err) {
      setStatus(err instanceof EmailNotConfiguredError ? "unconfigured" : "error");
    }
  }

  const id = (k: string) => `${uid}-${k}`;
  const invalid = submitted && Object.keys(errors).length > 0;
  const mailLink = <a href={`mailto:${directEmail}`}>{directEmail}</a>;
  const [errBefore, errAfter] = (status === "error" ? (f.raw("errSend") as string) : (f.raw("errUnconfigured") as string)).split("{email}");

  if (status === "success") {
    return (
      <div className="cform cform-done glow" data-spot role="status" aria-live="polite">
        <span className="cform-check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
        <h3 className="cform-ok">{f("okTitle")}</h3>
        <p>{f("okText")}</p>
        <button type="button" className="btn sm" onClick={() => setStatus("idle")}>{f("again")}</button>
      </div>
    );
  }

  return (
    <form ref={formRef} className="cform glow" data-spot noValidate onSubmit={onSubmit} aria-labelledby={id("title")} aria-busy={status === "sending"}>
      <h3 className="cform-title" id={id("title")}>{f("title")}</h3>
      <p className="cform-lead">{f("lead")}</p>
      {invalid && <p className="cform-summary" role="alert">{f("errSummary")}</p>}
      <div className="field">
        <label htmlFor={id("name")}>{f("name")}</label>
        <input id={id("name")} name="name" type="text" autoComplete="name" maxLength={80} placeholder={f("namePh")} value={values.name} onChange={set("name")} onBlur={blur("name")}
          required aria-required="true" aria-invalid={!!show("name")} aria-describedby={show("name") ? id("name-e") : undefined} />
        {show("name") && <p className="field-err" id={id("name-e")}>{show("name")}</p>}
      </div>
      <div className="field">
        <label htmlFor={id("email")}>{f("email")}</label>
        <input id={id("email")} name="email" type="email" autoComplete="email" inputMode="email" maxLength={120} placeholder={f("emailPh")} value={values.email} onChange={set("email")} onBlur={blur("email")}
          required aria-required="true" aria-invalid={!!show("email")} aria-describedby={show("email") ? id("email-e") : undefined} />
        {show("email") && <p className="field-err" id={id("email-e")}>{show("email")}</p>}
      </div>
      <div className="field">
        <label htmlFor={id("message")}>{f("message")}</label>
        <textarea id={id("message")} name="message" rows={5} placeholder={f("messagePh")} value={values.message} onChange={set("message")} onBlur={blur("message")}
          required aria-required="true" aria-invalid={!!show("message")} aria-describedby={`${show("message") ? `${id("message-e")} ` : ""}${id("count")}`} />
        <p className={`field-count mono${values.message.length > MAX ? " over" : ""}`} id={id("count")}>{f("count", { n: String(values.message.length), max: String(MAX) })}</p>
        {show("message") && <p className="field-err" id={id("message-e")}>{show("message")}</p>}
      </div>
      {/* Campo trampa: invisible y fuera del orden de tabulación; los bots suelen rellenarlo. */}
      <div className="hp" aria-hidden="true"><label>Website<input ref={trap} type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {(status === "error" || status === "unconfigured") && (
        <p className="cform-error" role="alert">{errBefore}{mailLink}{errAfter}</p>
      )}
      <button className="btn primary cform-send" type="submit" disabled={status === "sending"}>
        {status === "sending" && <span className="spin" aria-hidden="true" />}
        {status === "sending" ? f("sending") : f("send")}
      </button>
    </form>
  );
}
