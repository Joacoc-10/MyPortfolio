# Conectar EmailJS (guía para tu cuenta personal)

Estado: el formulario (`portfolio/src/features/zaxis/ContactForm.tsx` + `email.ts`) está implementado y probado con mocks de red.
**No hay credenciales en el repo** y no se reutiliza ninguna de otros proyectos. Falta lo que solo vos podés hacer en tu cuenta.
Los nombres de menús de EmailJS pueden variar un poco; si algo no coincide, buscá la opción equivalente en https://dashboard.emailjs.com.

## Lo que tenés que hacer vos (≈10 minutos)
1. **Cuenta**: crear/entrar a tu cuenta personal en https://www.emailjs.com.
2. **Email Service** (*Email Services → Add New Service*): conectar el buzón que va a enviar los mensajes
   (tu `joacoc-10@hotmail.com` es Outlook/Hotmail → servicio *Outlook*; o Gmail). Al terminar copiá el **Service ID** (`service_xxxxxxx`).
3. **Email Template** (*Email Templates → Create New Template*) con estos campos exactos (los que envía el formulario):
   - **To Email**: `joacoc-10@hotmail.com` (fijo en la plantilla; así nadie puede cambiar el destinatario desde el navegador).
   - **From Name**: `{{from_name}}`
   - **Reply To**: `{{reply_to}}` (al responder, le respondés a quien escribió).
   - **Subject**: `Nuevo mensaje desde jcoding · {{from_name}}`
   - **Content** (cuerpo):
     ```
     Nombre: {{from_name}}
     Correo: {{reply_to}}

     {{message}}
     ```
   Guardá y copiá el **Template ID** (`template_xxxxxxx`).
4. **Public Key** (*Account → General*): copiá la **Public Key**.
5. **Restricciones** (*Account → Security*):
   - **Allowed domains / orígenes**: agregá solo `jcoding.vercel.app` (y `localhost` mientras pruebes; quitalo después).
   - **Rate limit**: activá el límite por origen/IP (por ejemplo, pocos envíos por minuto).
   - Si está disponible, deshabilitá las llamadas desde fuera del navegador (*non-browser requests*).
   - Plan gratuito: ~200 correos/mes; el panel muestra el consumo.
6. (Opcional, recomendado si recibís spam) activá **reCAPTCHA** de EmailJS; hoy el formulario ya tiene un campo trampa (honeypot).

## Lo que hago yo cuando me pases los tres valores
Los valores son semi-públicos (van al navegador), pero **no se commitean**:
```bash
cd portfolio
cp .env.example .env.local      # completar:
# NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_...
# NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_...
# NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=...
```
- En Vercel: *Project → Settings → Environment Variables* (las tres, en Production y Preview) y redeploy.
- Con `.env.local` completo verifico un envío real (llega el correo, estados cargando → éxito, y un error provocado) en escritorio y móvil,
  y recién ahí lo doy por probado. Hasta entonces el formulario valida y, al enviar, avisa y ofrece el correo directo.

## Estados ya cubiertos (con mocks)
Validación por campo con foco al primer error · botón con spinner y `aria-busy` · éxito con confirmación y «Enviar otro» ·
error de red/servicio con aviso y correo directo, conservando lo escrito · no configurado → aviso con correo directo.
