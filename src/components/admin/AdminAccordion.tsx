"use client";

import { Children, cloneElement, isValidElement, useId, useState, type ReactElement, type ReactNode } from "react";

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
      <div id={panelId} className="adm-accordion__panel">
        <div className="adm-accordion__body">{children}</div>
      </div>
    </section>
  );
}

export function AdminAccordionStack({
  children,
  className = "",
  defaultOpenFirst = true,
}: {
  children: ReactNode;
  className?: string;
  /** Ouvre le premier accordéon par défaut (contenu accessible sans clic préalable) */
  defaultOpenFirst?: boolean;
}) {
  const items = Children.toArray(children);
  return (
    <div className={`adm-accordion-stack${className ? ` ${className}` : ""}`}>
      {items.map((child, index) => {
        if (
          defaultOpenFirst &&
          index === 0 &&
          isValidElement(child) &&
          (child as ReactElement<AdminAccordionProps>).props.open === undefined
        ) {
          return cloneElement(child as ReactElement<AdminAccordionProps>, {
            defaultOpen: (child as ReactElement<AdminAccordionProps>).props.defaultOpen ?? true,
          });
        }
        return child;
      })}
    </div>
  );
}
