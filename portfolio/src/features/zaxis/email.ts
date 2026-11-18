// Envío del formulario de contacto con EmailJS (https://www.emailjs.com).
// Las credenciales NO viven en el repositorio: se leen de variables NEXT_PUBLIC_EMAILJS_* (ver .env.example).
// La clave pública de EmailJS está pensada para el navegador; el abuso se limita desde el panel de EmailJS
// (dominios permitidos y límite de envíos), no ocultándola.

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

const cfg = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "",
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "",
};

export const emailConfigured = Boolean(cfg.serviceId && cfg.templateId && cfg.publicKey);

export class EmailNotConfiguredError extends Error {
  constructor() {
    super("EmailJS no está configurado");
    this.name = "EmailNotConfiguredError";
  }
}

/** Parámetros de la plantilla de EmailJS: `from_name`, `reply_to`, `message` (y `to_email` opcional en la plantilla). */
export async function sendContactMessage({ name, email, message }: ContactPayload) {
  if (!emailConfigured) throw new EmailNotConfiguredError();
  const emailjs = (await import("@emailjs/browser")).default;
  await emailjs.send(cfg.serviceId, cfg.templateId, { from_name: name, reply_to: email, message }, { publicKey: cfg.publicKey });
}
