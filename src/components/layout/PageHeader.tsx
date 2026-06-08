"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
  /** Large left-aligned title style (profile page) vs centered sub-page */
  variant?: "page" | "subpage";
}

export function PageHeader({
  title,
  onBack,
  showBack = true,
  rightAction,
  className,
  variant = "subpage",
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  if (variant === "page") {
    return (
      <div className={cn("flex items-center justify-between px-5 pt-14 pb-6", className)}>
        <h1 className="text-[2rem] font-bold text-white tracking-[-0.01em]">{title}</h1>
        {rightAction && <div>{rightAction}</div>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 pt-14 pb-4",
        className
      )}
    >
      {/* Back button */}
      {showBack ? (
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform duration-100"
          style={{ background: "#1E1E1E" }}
          aria-label="Back"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9l5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <div className="w-10" />
      )}

      {/* Centered title */}
      <h1 className="text-[1.25rem] font-bold text-white tracking-[-0.01em]">{title}</h1>

      {/* Right action */}
      {rightAction ? (
        <div>{rightAction}</div>
      ) : (
        <div className="w-10" />
      )}
    </div>
  );
}
