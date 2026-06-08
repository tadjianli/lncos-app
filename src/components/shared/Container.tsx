import { cn } from "@/lib/utils";

/* ─── Container ─────────────────────────────────────────────────────────── */

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  padded?: boolean;
}

export function Container({
  children,
  className,
  as: Tag = "div",
  padded = true,
}: ContainerProps) {
  return (
    <Tag className={cn(padded && "px-5", "w-full", className)}>
      {children}
    </Tag>
  );
}

/* ─── Section ────────────────────────────────────────────────────────────── */

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("w-full", className)}>
      {children}
    </section>
  );
}

/* ─── SectionHeader ─────────────────────────────────────────────────────── */

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
  className,
  align = "left",
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-end justify-between gap-4 px-5 mb-5",
        align === "center" && "flex-col items-center text-center mb-6",
        className
      )}
    >
      <div>
        {eyebrow && (
          <p className="text-[0.58rem] font-light tracking-[0.3em] uppercase text-[#C9A96E] mb-2">
            {eyebrow}
          </p>
        )}
        <h2
          className="font-light text-white leading-tight"
          style={{ fontFamily: "var(--font-heading)", fontSize: "1.45rem", letterSpacing: "0.025em" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-[0.76rem] text-[#666058] mt-1.5 font-light leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && align === "left" && (
        <div className="flex-shrink-0 pb-0.5">{action}</div>
      )}
    </div>
  );
}

/* ─── GoldDivider ────────────────────────────────────────────────────────── */

export function GoldDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 px-5", className)}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[rgba(201,169,110,0.20)]" />
      <svg width="6" height="6" viewBox="0 0 6 6" fill="none" className="flex-shrink-0 opacity-40">
        <path d="M3 0L3.9 2.1 6 3l-2.1.9L3 6l-.9-2.1L0 3l2.1-.9z" fill="#C9A96E" />
      </svg>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[rgba(201,169,110,0.20)]" />
    </div>
  );
}
