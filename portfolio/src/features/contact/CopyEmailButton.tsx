"use client";

import { useEffect, useState } from "react";
import { LuCheck, LuCopy } from "react-icons/lu";
import { Button } from "@/components/ui/Button";

type CopyEmailButtonProps = {
  email: string;
  label: string;
  copiedMessage: string;
};

export function CopyEmailButton({ email, label, copiedMessage }: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      // Sin permisos de portapapeles: el email sigue visible y enlazado con mailto.
    }
  };

  return (
    <>
      <Button variant="secondary" size="lg" onClick={copy}>
        {copied ? (
          <LuCheck size={18} aria-hidden="true" className="text-brand" />
        ) : (
          <LuCopy size={18} aria-hidden="true" />
        )}
        {label}
      </Button>
      {/* Anuncia el resultado a lectores de pantalla */}
      <span role="status" className="sr-only">
        {copied ? copiedMessage : ""}
      </span>
    </>
  );
}
