"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-sans font-light tracking-widest uppercase text-xs transition-all duration-300 select-none disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]",
  {
    variants: {
      variant: {
        gold: [
          "bg-[--gold] text-[--obsidian] rounded-full",
          "hover:bg-[--gold-light] active:scale-[0.97]",
          "shadow-[0_4px_16px_rgba(201,169,110,0.25)]",
          "hover:shadow-[0_6px_24px_rgba(201,169,110,0.38)]",
        ],
        outline: [
          "bg-transparent text-[--gold] rounded-full",
          "border border-[rgba(201,169,110,0.35)]",
          "hover:border-[--gold] hover:bg-[rgba(201,169,110,0.07)]",
          "active:scale-[0.97]",
        ],
        ghost: [
          "bg-transparent text-[--cream-muted] rounded-full",
          "hover:text-[--cream] hover:bg-[rgba(255,255,255,0.04)]",
          "active:scale-[0.97]",
        ],
        dark: [
          "bg-[--obsidian-raised] text-[--cream] rounded-full",
          "border border-[--obsidian-border]",
          "hover:border-[rgba(201,169,110,0.25)]",
          "active:scale-[0.97]",
        ],
        icon: [
          "bg-[--obsidian-card] text-[--cream-muted] rounded-full",
          "border border-[--obsidian-border]",
          "hover:text-[--gold] hover:border-[rgba(201,169,110,0.3)]",
          "active:scale-[0.95]",
        ],
      },
      size: {
        sm: "h-8 px-4 text-[0.625rem]",
        md: "h-11 px-6 text-xs",
        lg: "h-13 px-8 text-xs",
        xl: "h-14 px-10 text-xs",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
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
        {loading ? (
          <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
