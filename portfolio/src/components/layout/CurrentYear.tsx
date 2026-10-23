"use client";

import { useEffect, useState } from "react";

/** Año actual. Se pre-renderiza con el año del build y se corrige en el cliente. */
export function CurrentYear() {
  const [year, setYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    // Corrige el valor si la página se generó en un año anterior.
    setYear(new Date().getFullYear());
  }, []);

  return <span suppressHydrationWarning>{year}</span>;
}
