"use client";

import { Icon } from "@/components/shared/Icon";

export type AdminToastVariant = "success" | "error";

interface AdminToastProps {
  msg: string;
  variant?: AdminToastVariant;
}

export function AdminToast({ msg, variant = "success" }: AdminToastProps) {
  const isError = variant === "error";

  return (
    <div
      className={`adm-toast adm-toast--${variant}`}
      role="status"
      aria-live="polite"
    >
      <span className="adm-toast-icon" aria-hidden>
        <Icon
          name={isError ? "alert" : "check"}
          size={15}
          color={isError ? "#C2557A" : "#2F9E68"}
        />
      </span>
      <span className="adm-toast-msg">{msg}</span>
    </div>
  );
}
