/**
 * LN COS — Toast notification (sous le header, ne masque pas le contenu)
 */
import { Icon } from "@/components/shared/Icon";

interface ToastProps {
  msg: string;
  icon?: string;
  onView?: () => void;
}

export function Toast({ msg, icon, onView }: ToastProps) {
  return (
    <div className="app-toast" role="status" aria-live="polite">
      <span className="app-toast__icon">
        <Icon name={icon ?? "check"} size={16} color="#1a1306" stroke={2.5} />
      </span>
      <span className="app-toast__msg">{msg}</span>
      {onView && (
        <button
          type="button"
          onClick={onView}
          style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", pointerEvents: "all" }}
        >
          Voir
        </button>
      )}
    </div>
  );
}
