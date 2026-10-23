"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

type ExpandableTextProps = {
  text: string;
  moreLabel: string;
  lessLabel: string;
  /** Textos más largos que este valor se recortan con botón "Leer más". */
  threshold?: number;
  className?: string;
};

export function ExpandableText({
  text,
  moreLabel,
  lessLabel,
  threshold = 190,
  className,
}: ExpandableTextProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const isLong = text.length > threshold;

  return (
    <div>
      <p
        id={id}
        className={cn(className, isLong && !open && "line-clamp-4")}
      >
        {text}
      </p>
      {isLong && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((value) => !value)}
          className="mt-2 text-sm font-medium text-brand transition-colors hover:text-ink"
        >
          {open ? lessLabel : moreLabel}
        </button>
      )}
    </div>
  );
}
