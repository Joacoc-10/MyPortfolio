// Motor del coverflow 3D de Proyectos (escritorio/tablet) y del mazo con scroll-snap nativo (móvil).
// Imperativo a propósito: la geometría se escribe como transform/opacity desde un único rAF y React no
// re-renderiza por frame. Imagen y panel cambian en la MISMA función (setActive): no hay líneas de tiempo independientes.
import { clamp, frameThrottle, tintOf } from "./lib";

export interface CoverflowOpts {
  sec: HTMLElement;
  stage: HTMLElement;
  cf: HTMLElement;
  rm: boolean;
  calm: boolean;
  kinds: string[];
  /** Cambió el proyecto activo (React actualiza panel, puntos y accesibilidad). */
  onActive: (i: number, userMoved: boolean) => void;
  /** Clic en la tarjeta ya activa. */
  onOpen: (i: number, from: HTMLElement) => void;
}

export function createCoverflow(o: CoverflowOpts) {
  const { sec, stage, cf, rm, calm, kinds } = o;
  const cards = [...stage.querySelectorAll<HTMLElement>(".card")];
  const tilts = cards.map((c) => c.querySelector<HTMLElement>(".tilt")!);
  const hits = cards.map((c) => c.querySelector<HTMLElement>(".card-hit")!);
  const N = cards.length;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const deckMq = matchMedia("(max-width: 700px)");
  const tints: ([number, number, number] | null)[] = new Array(N).fill(null);
  let deck = deckMq.matches && !rm;
  let c = 0, cT = 0, active = -1, cw = 600, off1 = 400, off2 = 120, raf = 0, last = 0, suppress = false, userMoved = false;
  let drag: { x: number; c0: number; moved: number; id: number } | null = null;
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  const cleanups: (() => void)[] = [];
  let disposed = false;
  const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement | MediaQueryList | Window, type: string, fn: (e: never) => void, opts?: AddEventListenerOptions) => {
    (el as HTMLElement).addEventListener(type as K, fn as never, opts);
    cleanups.push(() => (el as HTMLElement).removeEventListener(type as K, fn as never));
  };

  /* ---------- luz ambiental: el color medio de la captura activa tiñe el entorno ---------- */
  function applyTint(i: number) {
    const t = tints[i] ?? [45, 212, 191];
    sec.style.setProperty("--tr", String(t[0]));
    sec.style.setProperty("--tg", String(t[1]));
    sec.style.setProperty("--tb", String(t[2]));
  }
  const imgs = cards.map((c) => c.querySelector<HTMLImageElement>("img"));
  stage.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
    const i = Number(img.closest<HTMLElement>(".card")!.dataset.i);
    const go = () => {
      if (disposed) return;
      tints[i] = tintOf(img);
      if (i === active) applyTint(i);
    };
    if (img.complete && img.naturalWidth) go();
    else img.addEventListener("load", go, { once: true });
  });

  /* ---------- precarga de portadas ----------
     Las portadas son lazy (no pesan en la carga inicial), pero las tarjetas lejanas del activo quedan con
     visibility:hidden y fuera de la zona visible: el navegador no las pide hasta que aparecen, y la tarjeta se ve negra
     mientras descarga. Se «calientan» por cercanía al proyecto activo: primero el activo y sus vecinos, y el resto de
     a una por vez en tiempo ocioso. Nada se fuerza al cargar la página: solo se arma al acercarse la sección o al navegar. */
  const warmed = new Set<number>();
  let ready = false, queueOn = false, idleId = 0;
  function warm(i: number) {
    const img = imgs[i];
    if (!img || warmed.has(i)) return;
    warmed.add(i);
    if (img.loading !== "eager") img.loading = "eager"; // una imagen lazy pasada a eager se descarga de inmediato
    img.decode?.().catch(() => {}); // decodificada de antemano: sin parpadeo negro al aparecer la tarjeta
  }
  function warmAround(i: number) {
    warm(i);
    warm(i - 1);
    warm(i + 1);
    warm(i + 2);
    warm(i - 2);
  }
  function pumpQueue() {
    if (disposed || idleId) return;
    const pending = cards.map((_, i) => i).filter((i) => !warmed.has(i)).sort((a, b) => Math.abs(a - Math.max(active, 0)) - Math.abs(b - Math.max(active, 0)));
    if (!pending.length) { queueOn = false; return; }
    const run = () => {
      idleId = 0;
      if (disposed) return;
      const i = pending[0];
      warm(i);
      const img = imgs[i];
      const next = () => { img?.removeEventListener("load", next); img?.removeEventListener("error", next); pumpQueue(); };
      if (img && !img.complete) { img.addEventListener("load", next, { once: true }); img.addEventListener("error", next, { once: true }); }
      else next();
    };
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    idleId = ric ? ric(run, { timeout: 1500 }) : window.setTimeout(run, 250);
  }
  /** La sección Proyectos está cerca del viewport: se precargan las portadas, de la más cercana a la más lejana. */
  function prefetch() {
    if (disposed) return;
    ready = true;
    warmAround(Math.max(active, 0));
    if (!queueOn) { queueOn = true; pumpQueue(); }
  }

  /* ---------- geometría ---------- */
  function measure() {
    const w = stage.clientWidth;
    if (!w) return;
    if (deck) {
      stage.style.height = "";
      return;
    }
    const narrow = w < 900;
    cw = calm ? Math.min(w * 0.86, 900) : narrow ? w * 0.6 : Math.min(w * 0.46, 760);
    off1 = cw * (narrow ? 0.74 : 0.8);
    off2 = cw * 0.2;
    stage.style.setProperty("--cw", `${cw}px`);
    stage.style.height = `${Math.round(cw * 0.625 + (narrow ? 58 : 96))}px`;
  }

  function layout() {
    // El mazo móvil se posiciona con scroll-snap y deckUpdate(): esta geometría 3D de escritorio no le corresponde
    // (dejaba visibility:hidden en las tarjetas lejanas del activo y quedaban sin portada).
    if (deck) return;
    for (let i = 0; i < N; i++) {
      const d = i - c, a = Math.abs(d), s = Math.sign(d), k = Math.min(a, 1), k2 = Math.max(a - 1, 0);
      const card = cards[i];
      if (calm) {
        const isOn = i === active;
        card.style.transform = "none";
        card.style.opacity = isOn ? "1" : "0";
        card.style.visibility = isOn ? "visible" : "hidden";
        card.style.zIndex = isOn ? "2" : "0";
        continue;
      }
      const tier = kinds[i] === "bootcamp" ? 0.93 : 1; // el bootcamp pesa un poco menos que el trabajo profesional
      const x = s * (k * off1 + k2 * off2);
      const z = -(k * 250 + k2 * 160);
      const ry = -s * (k * 46 + k2 * 6);
      const sc = (1 - k * 0.12 - k2 * 0.05) * tier;
      const op = clamp(1 - k * 0.42 - k2 * 0.55);
      card.style.transform = `translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      card.style.opacity = op.toFixed(3);
      card.style.visibility = op < 0.03 ? "hidden" : "visible";
      card.style.zIndex = String(100 - Math.round(a * 10));
    }
    const t = tilts[active];
    if (t && !calm) t.style.transform = `rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg)`;
  }

  function tick(now: number) {
    raf = 0;
    if (disposed) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    c += (cT - c) * (1 - Math.exp(-dt * (calm ? 80 : 8)));
    if (Math.abs(cT - c) < 0.0006) c = cT;
    const kt = 1 - Math.exp(-dt * 10);
    tilt.x += (tilt.tx - tilt.x) * kt;
    tilt.y += (tilt.ty - tilt.y) * kt;
    if (Math.abs(tilt.tx - tilt.x) < 0.01) tilt.x = tilt.tx;
    if (Math.abs(tilt.ty - tilt.y) < 0.01) tilt.y = tilt.ty;
    layout();
    if (c !== cT || tilt.x !== tilt.tx || tilt.y !== tilt.ty) raf = requestAnimationFrame(tick);
  }
  const kick = () => {
    if (deck || raf || disposed) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };

  function setActive(i: number) {
    i = clamp(i, 0, N - 1);
    if (i === active) return;
    active = i;
    tilt.x = tilt.y = tilt.tx = tilt.ty = 0;
    tilts.forEach((t) => { t.style.transform = ""; });
    applyTint(i);
    if (ready || userMoved) { ready = true; warmAround(i); }
    o.onActive(i, userMoved);
    kick();
  }

  function goTo(i: number, { smoothScroll = true } = {}) {
    i = clamp(i, 0, N - 1);
    userMoved = true;
    cT = i;
    if (deck) {
      const card = cards[i];
      const left = card.offsetLeft - (stage.clientWidth - card.offsetWidth) / 2;
      stage.scrollTo({ left, behavior: rm || !smoothScroll ? "auto" : "smooth" });
      setActive(i);
    } else {
      setActive(i);
      kick();
    }
  }

  /* ---------- eventos del explorador ---------- */
  hits.forEach((h, i) => on(h, "click", () => {
    if (suppress) return;
    if (i === active) o.onOpen(i, h); else goTo(i);
  }));
  // Un toque o clic sobre una tarjeta que NO está activa la centra (el botón de esa tarjeta aún no es tabulable).
  cards.forEach((card, i) => on(card, "click", ((e: MouseEvent) => {
    if (suppress || ((e.target as HTMLElement).closest(".card-hit") && i === active)) return;
    if (i !== active) goTo(i);
  }) as never));

  // Arrastre con ratón o lápiz (el táctil usa el scroll nativo del mazo o touch-action: pan-y en tablet).
  on(stage, "pointerdown", ((e: PointerEvent) => {
    if (deck || e.button > 0) return;
    drag = { x: e.clientX, c0: cT, moved: 0, id: e.pointerId };
  }) as never);
  on(stage, "pointermove", ((e: PointerEvent) => {
    if (deck) return;
    if (drag && e.pointerId === drag.id) {
      const dx = e.clientX - drag.x;
      drag.moved = Math.max(drag.moved, Math.abs(dx));
      if (drag.moved > 6 && !stage.hasPointerCapture(e.pointerId)) stage.setPointerCapture(e.pointerId);
      if (drag.moved > 6) {
        userMoved = true;
        cT = clamp(drag.c0 - dx / (off1 * 0.85), 0, N - 1);
        setActive(Math.round(cT));
        kick();
      }
      return;
    }
    if (!fine || calm || e.pointerType !== "mouse") return;
    const r = tilts[active]?.getBoundingClientRect();
    if (!r) return;
    const nx = clamp((e.clientX - r.left) / r.width, 0, 1) - 0.5, ny = clamp((e.clientY - r.top) / r.height, 0, 1) - 0.5;
    tilt.ty = nx * 9;
    tilt.tx = -ny * 7;
    cards[active].style.setProperty("--gx", `${(nx + 0.5) * 100}%`);
    cards[active].style.setProperty("--gy", `${(ny + 0.5) * 100}%`);
    kick();
  }) as never);
  const end = () => {
    if (!drag) return;
    suppress = drag.moved > 6;
    drag = null;
    cT = Math.round(cT);
    setActive(cT);
    kick();
    setTimeout(() => { suppress = false; }, 0);
  };
  on(stage, "pointerup", end);
  on(stage, "pointercancel", end);
  on(stage, "pointerleave", (() => { tilt.tx = tilt.ty = 0; kick(); }) as never);

  /* ---------- mazo móvil: scroll-snap nativo; la rotación 3D se deriva de la posición de scroll ---------- */
  const deckUpdate = frameThrottle(() => {
    if (!deck || disposed) return;
    const sc = stage.getBoundingClientRect(), mid = sc.left + sc.width / 2;
    let best = 0, bd = 1e9;
    cards.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const off = clamp((r.left + r.width / 2 - mid) / r.width, -1.6, 1.6);
      const ao = Math.abs(off);
      tilts[i].style.transform = `rotateY(${(-off * 24).toFixed(2)}deg) scale(${(1 - Math.min(ao, 1) * 0.09).toFixed(3)})`;
      card.style.opacity = (1 - Math.min(ao, 1.6) * 0.38).toFixed(3);
      if (ao < bd) { bd = ao; best = i; }
    });
    if (best !== active) { userMoved = true; cT = best; setActive(best); }
  });
  on(stage, "scroll", deckUpdate, { passive: true });

  function applyMode() {
    const wasDeck = deck;
    deck = deckMq.matches && !rm;
    stage.classList.toggle("is-deck", deck);
    cf.classList.toggle("is-deck", deck);
    sec.classList.toggle("is-deck", deck);
    if (!deck) {
      stage.scrollLeft = 0;
      cards.forEach((card) => { card.style.opacity = ""; });
      tilts.forEach((t) => { t.style.transform = ""; });
    } else {
      cards.forEach((card) => { card.style.transform = ""; card.style.visibility = ""; card.style.zIndex = ""; card.style.opacity = ""; });
    }
    measure();
    if (deck) {
      requestAnimationFrame(() => { goTo(Math.max(0, active), { smoothScroll: false }); deckUpdate(); });
    } else {
      if (wasDeck || active < 0) c = cT = Math.max(0, active);
      layout();
      kick();
    }
  }
  on(deckMq, "change", applyMode);
  on(window, "resize", frameThrottle(() => { measure(); layout(); }));

  /* ---------- arranque ---------- */
  stage.classList.toggle("is-deck", deck);
  cf.classList.toggle("is-deck", deck);
  sec.classList.toggle("is-deck", deck);
  measure();
  setActive(0);
  c = cT = 0;
  layout();
  if (deck) { goTo(0, { smoothScroll: false }); deckUpdate(); }
  userMoved = false;
  // Las fuentes cambian el alto del panel; se vuelve a medir cuando están listas.
  document.fonts?.ready.then(() => { if (!disposed) { measure(); layout(); } });

  return {
    goTo,
    prefetch,
    next: () => goTo(active + 1),
    prev: () => goTo(active - 1),
    get active() { return active; },
    get deck() { return deck; },
    /** Tras volver a mostrar la vista «Explorar» (estaba oculta): vuelve a medir y recoloca. */
    refresh() {
      measure();
      layout();
      if (deck) goTo(Math.max(0, active), { smoothScroll: false });
    },
    hit: (i: number) => hits[i],
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      if (idleId) { (window as Window & { cancelIdleCallback?: (n: number) => void }).cancelIdleCallback?.(idleId); clearTimeout(idleId); }
      cleanups.forEach((f) => f());
    },
  };
}
export type Coverflow = ReturnType<typeof createCoverflow>;
