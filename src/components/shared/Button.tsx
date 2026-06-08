"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 overflow-hidden",
    "font-sans font-light tracking-[0.14em] uppercase",
    "select-none cursor-pointer",
    "transition-[transform,box-shadow,background-color,border-color,color,opacity]",
    "duration-[160ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
    "disabled:opacity-35 disabled:pointer-events-none",
    "focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-[--ring] focus-visible:ring-offset-1 focus-visible:ring-offset-[--background]",
    "will-change-transform",
  ],
  {
    variants: {
      variant: {
        gold: [
          "bg-[--gold] text-[--obsidian] rounded-full",
          "shadow-[0_2px_8px_rgba(201,169,110,0.22),0_6px_20px_rgba(201,169,110,0.14)]",
          "hover:bg-[--gold-light]",
          "hover:shadow-[0_4px_14px_rgba(201,169,110,0.34),0_8px_32px_rgba(201,169,110,0.20)]",
          "active:scale-[0.964] active:shadow-[0_1px_4px_rgba(201,169,110,0.20)]",
          "active:duration-[80ms]",
        ],
        outline: [
          "bg-transparent text-[--gold] rounded-full",
          "border border-[rgba(201,169,110,0.30)]",
          "hover:border-[rgba(201,169,110,0.65)]",
          "hover:bg-[rgba(201,169,110,0.055)]",
          "hover:shadow-[0_0_16px_rgba(201,169,110,0.10),inset_0_0_12px_rgba(201,169,110,0.04)]",
          "active:scale-[0.964] active:border-[rgba(201,169,110,0.45)]",
          "active:duration-[80ms]",
        ],
        ghost: [
          "bg-transparent text-[--cream-muted] rounded-full",
          "hover:text-[--cream] hover:bg-[rgba(255,255,255,0.045)]",
          "active:scale-[0.96] active:bg-[rgba(255,255,255,0.03)]",
          "active:duration-[80ms]",
        ],
        dark: [
          "bg-[--obsidian-raised] text-[--cream] rounded-full",
          "border border-[--obsidian-border]",
          "hover:border-[rgba(201,169,110,0.22)] hover:bg-[--obsidian-high]",
          "active:scale-[0.964]",
          "active:duration-[80ms]",
        ],
        icon: [
          "bg-[--obsidian-card] text-[--cream-muted] rounded-full",
          "border border-[--obsidian-border]",
          "hover:text-[--gold] hover:border-[rgba(201,169,110,0.28)]",
          "hover:bg-[rgba(201,169,110,0.04)]",
          "active:scale-[0.92] active:duration-[80ms]",
        ],
      },
      size: {
        sm:       "h-8    px-4    text-[0.6rem]",
        md:       "h-11   px-6    text-[0.68rem]",
        lg:       "h-[3.125rem] px-8 text-[0.68rem]",
        xl:       "h-14   px-10   text-[0.68rem]",
        icon:     "h-10   w-10",
        "icon-sm":"h-8    w-8",
        "icon-lg":"h-12   w-12",
      },
    },
    defaultVariants: {
      variant: "gold",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {/* Gold shimmer sweep — only on gold variant via group */}
        {variant === "gold" && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
            style={{ animation: "slideRight 2.8s ease-in-out infinite 1.2s" }}
          />
        )}

        {loading ? (
          <span className="h-3.5 w-3.5 rounded-full border-[1.5px] border-current border-t-transparent animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
