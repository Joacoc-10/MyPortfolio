// Estado mínimo de «sección actual» compartido entre el manejador de scroll, el navbar y el riel.
// Cambia solo al cruzar el borde de una sección (no por frame), así que useSyncExternalStore no re-renderiza de más.
export const SECTIONS = ["projects", "experience", "stack", "about", "contact"] as const;
export type SectionId = (typeof SECTIONS)[number];

let current = 0; // 0 = superficie (hero), 1..5 = SECTIONS
const listeners = new Set<() => void>();
export const sectionStore = {
  get: () => current,
  set(n: number) {
    if (n === current) return;
    current = n;
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};
