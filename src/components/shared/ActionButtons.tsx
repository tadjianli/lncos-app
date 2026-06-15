"use client";
/**
 * LN COS — Handoff action button primitives
 * PinkBtn, GoldBtn, SubHeader — premium CTA via .lncos-cta (globals.css)
 */
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";

type AppRouter = ReturnType<typeof useRouter>;

interface BtnProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  className?: string;
  icon?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  /** @deprecated Taille premium identique partout — conservé pour compatibilité API */
  compact?: boolean;
  /** Largeur auto (CTA secondaires : panier vide, favoris…) */
  inline?: boolean;
}

function ctaClass(
  variant: "pink" | "gold",
  { disabled, inline, className }: Pick<BtnProps, "disabled" | "inline" | "className">
) {
  return [
    "lncos-cta",
    variant === "pink" ? "lncos-cta--pink" : "lncos-cta--gold",
    inline ? "lncos-cta--inline" : "",
    disabled ? "lncos-cta--disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function PinkBtn({
  children,
  onClick,
  style,
  className,
  icon,
  disabled,
  type = "button",
  inline,
}: BtnProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={ctaClass("pink", { disabled, inline, className })}
      style={style}
    >
      {icon && <Icon name={icon} size={17} stroke={2.2} />}
      {children}
    </button>
  );
}

export function GoldBtn({
  children,
  onClick,
  style,
  className,
  icon,
  disabled,
  type = "button",
  inline,
}: BtnProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={ctaClass("gold", { disabled, inline, className })}
      style={style}
    >
      {icon && <Icon name={icon} size={17} stroke={2.2} />}
      {children}
    </button>
  );
}

/* ─── Smart back navigation ─────────────────────────────────────────── */

export function handleSmartBack(
  router: AppRouter,
  options?: { onBack?: () => void; backHref?: string },
) {
  const { onBack, backHref = "/profile" } = options ?? {};
  if (onBack) {
    onBack();
    return;
  }
  if (typeof window !== "undefined" && window.history.length > 1) {
    router.back();
    return;
  }
  router.push(backHref);
}

/* ─── Mobile back button (shared touch target) ──────────────────────── */

interface MobileBackButtonProps {
  onClick: () => void;
  floating?: boolean;
  "aria-label"?: string;
}

export function MobileBackButton({
  onClick,
  floating = false,
  "aria-label": ariaLabel = "Retour",
}: MobileBackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mobile-screen-header__back${floating ? " mobile-screen-header__back--floating" : ""}`}
      aria-label={ariaLabel}
    >
      <Icon name="chevL" size={20} />
    </button>
  );
}

/* ─── SubHeader (back + title + optional right) ─────────────────────── */

interface SubHeaderProps {
  title: string;
  onBack?: () => void;
  /** Navigation explicite si pas d'historique (défaut : /profile) */
  backHref?: string;
  right?: React.ReactNode;
  /** true pour les overlays plein écran (ignorent le padding safe du shell) */
  safeArea?: boolean;
  className?: string;
}

export function SubHeader({
  title,
  onBack,
  backHref = "/profile",
  right,
  safeArea = false,
  className = "",
}: SubHeaderProps) {
  const router = useRouter();

  function handleBack() {
    handleSmartBack(router, { onBack, backHref });
  }

  const headerClass = [
    "mobile-screen-header",
    safeArea ? "mobile-screen-header--safe" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={headerClass}>
      <MobileBackButton onClick={handleBack} />
      <h2 className="mobile-screen-header__title">{title}</h2>
      <div className="mobile-screen-header__slot">{right}</div>
    </div>
  );
}

/* ─── SectionHead ────────────────────────────────────────────────────── */

interface SectionHeadProps {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHead({ title, subtitle, action, onAction }: SectionHeadProps) {
  return (
    <div style={{ margin: "0 0 14px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <h3 style={{ margin: 0, fontWeight: 600, fontSize: "var(--fs-h3)", color: "var(--ink)" }}>
          {title}
        </h3>
        {action && (
          <button
            type="button"
            onClick={onAction}
            style={{ color: "var(--gold)", fontSize: 12.5, fontWeight: 600, letterSpacing: ".04em" }}
          >
            {action}
          </button>
        )}
      </div>
      {subtitle ? (
        <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.45, color: "var(--ink-soft)" }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
