"use client";

import { createContext, useContext } from "react";
import type { ZContent, ZProject } from "./types";

export interface ZCtx {
  content: ZContent;
  projects: ZProject[];
  /** Abre el detalle de un proyecto; `from` recibe el foco al cerrar. */
  openDetail: (id: string, from?: HTMLElement | null) => void;
}

const Ctx = createContext<ZCtx | null>(null);
export const ZProvider = Ctx.Provider;
export function useZ() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useZ debe usarse dentro de <ZProvider>");
  return v;
}

/** Etiqueta de tipo de proyecto: empresa (profesional) o «Proyecto personal» / «Bootcamp Henry». */
export const kindOf = (p: ZProject, companies: ZContent["companies"], personal: string, bootcamp: string) =>
  p.kind === "personal" ? personal : p.kind === "bootcamp" ? bootcamp : (companies.find((c) => c.id === p.companyId)?.name ?? "");
