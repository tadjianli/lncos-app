"use client";
/**
 * LN COS — Handoff action button primitives
 * PinkBtn, GoldBtn, SubHeader — exact from handoff ui.jsx
 */
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";

type AppRouter = ReturnType<typeof useRouter>;

interface BtnProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  icon?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  /** Barre d’action fixe — bouton plus compact (Sephora / Shopify) */
  compact?: boolean;
}

export function PinkBtn({ children, onClick, style, icon, disabled, type = "button", compact }: BtnProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: "100%",
        padding: compact ? "11px 14px" : "16px",
        minHeight: compact ? "var(--bottom-action-cta-h, 40px)" : undefined,
        borderRadius: "var(--r-pill)",
        background: "var(--pink-grad)",
        color: "#3a1020",
        fontWeight: 700,
        fontSize: compact ? 13 : "var(--fs-lg)",
        letterSpacing: ".02em",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        boxShadow: compact ? "0 8px 22px -12px rgba(239,169,192,.65)" : "0 12px 30px -12px rgba(239,169,192,.7)",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={compact ? 17 : 19} stroke={2.2} />}
      {children}
    </button>
  );
}

export function GoldBtn({ children, onClick, style, icon, disabled, type = "button", compact }: BtnProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: "100%",
        padding: compact ? "11px 14px" : "16px",
        minHeight: compact ? "var(--bottom-action-cta-h, 40px)" : undefined,
        borderRadius: "var(--r-pill)",
        background: "var(--gold-grad)",
        color: "#1a1306",
        fontWeight: 700,
        fontSize: compact ? 13 : "var(--fs-lg)",
        letterSpacing: ".02em",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        boxShadow: compact ? "0 8px 22px -12px rgba(212,175,55,.5)" : "0 12px 30px -12px rgba(212,175,55,.55)",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={compact ? 17 : 19} stroke={2.2} />}
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
  action?: string;
  onAction?: () => void;
}

export function SectionHead({ title, action, onAction }: SectionHeadProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        margin: "0 0 14px",
      }}
    >
      <h3 style={{ margin: 0, fontWeight: 600, fontSize: "var(--fs-h3)", color: "var(--ink)" }}>
        {title}
      </h3>
      {action && (
        <button
          onClick={onAction}
          style={{ color: "var(--gold)", fontSize: 12.5, fontWeight: 600, letterSpacing: ".04em" }}
        >
          {action}
        </button>
      )}
    </div>
  );
}
