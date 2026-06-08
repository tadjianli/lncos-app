/**
 * LN COS — Handoff action button primitives
 * PinkBtn, GoldBtn, SubHeader — exact from handoff ui.jsx
 */
import { Icon } from "./Icon";

interface BtnProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  icon?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function PinkBtn({ children, onClick, style, icon, disabled, type = "button" }: BtnProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: "100%",
        padding: "16px",
        borderRadius: "var(--r-pill)",
        background: "var(--pink-grad)",
        color: "#3a1020",
        fontWeight: 700,
        fontSize: "var(--fs-lg)",
        letterSpacing: ".02em",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        boxShadow: "0 12px 30px -12px rgba(239,169,192,.7)",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={19} stroke={2.2} />}
      {children}
    </button>
  );
}

export function GoldBtn({ children, onClick, style, icon, disabled, type = "button" }: BtnProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: "100%",
        padding: "16px",
        borderRadius: "var(--r-pill)",
        background: "var(--gold-grad)",
        color: "#1a1306",
        fontWeight: 700,
        fontSize: "var(--fs-lg)",
        letterSpacing: ".02em",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        boxShadow: "0 12px 30px -12px rgba(212,175,55,.55)",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={19} stroke={2.2} />}
      {children}
    </button>
  );
}

/* ─── SubHeader (back + title + optional right) ─────────────────────── */

interface SubHeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function SubHeader({ title, onBack, right }: SubHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "2px 16px 12px",
        flex: "0 0 auto",
      }}
    >
      <button
        onClick={onBack}
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "var(--charcoal)",
          display: "grid",
          placeItems: "center",
          color: "var(--ink)",
          border: "1px solid rgba(255,255,255,.06)",
        }}
        aria-label="Retour"
      >
        <Icon name="chevL" size={20} />
      </button>
      <h2
        style={{
          margin: 0,
          fontWeight: 600,
          fontSize: "var(--fs-h2)",
          color: "var(--ink)",
        }}
      >
        {title}
      </h2>
      <div style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        {right}
      </div>
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
