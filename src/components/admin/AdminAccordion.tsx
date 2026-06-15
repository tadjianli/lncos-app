"use client";

import { useId, useState, type ReactNode } from "react";

export interface AdminAccordionProps {
  title: string;
  children: ReactNode;
  /** Fermé par défaut */
  defaultOpen?: boolean;
  className?: string;
  /** Ouverture contrôlée (ex. deep-link settings) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AdminAccordion({
  title,
  children,
  defaultOpen = false,
  className = "",
  open: controlledOpen,
  onOpenChange,
}: AdminAccordionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const panelId = useId();

  function toggle() {
    const next = !open;
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }

  return (
    <section
      className={`adm-accordion${open ? " adm-accordion--open" : ""}${className ? ` ${className}` : ""}`}
    >
      <button
        type="button"
        className="adm-accordion__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
      >
        <span className="adm-accordion__sign" aria-hidden>
          {open ? "−" : "+"}
        </span>
        <span className="adm-accordion__title">{title}</span>
      </button>
      <div id={panelId} className="adm-accordion__panel" hidden={!open}>
        <div className="adm-accordion__body">{children}</div>
      </div>
    </section>
  );
}

export function AdminAccordionStack({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`adm-accordion-stack${className ? ` ${className}` : ""}`}>{children}</div>
  );
}
