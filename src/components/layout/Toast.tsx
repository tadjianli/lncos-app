/**
 * LN COS — Toast notification (exact from handoff app.jsx)
 */
import { Icon } from "@/components/shared/Icon";

interface ToastProps {
  msg: string;
  icon?: string;
  onView?: () => void;
}

export function Toast({ msg, icon, onView }: ToastProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "13px 18px",
        borderRadius: "var(--r-pill)",
        background: "rgba(20,20,20,.96)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(212,175,55,.3)",
        boxShadow: "var(--shadow-soft)",
        animation: "fadeUp .35s ease both",
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--gold-grad)",
          display: "grid",
          placeItems: "center",
          flex: "0 0 auto",
        }}
      >
        <Icon name={icon ?? "check"} size={16} color="#1a1306" stroke={2.5} />
      </span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#F6F1EA" }}>
        {msg}
      </span>
      {onView && (
        <button
          onClick={onView}
          style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", pointerEvents: "all" }}
        >
          Voir
        </button>
      )}
    </div>
  );
}
