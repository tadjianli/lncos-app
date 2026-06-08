import { cn } from "@/lib/utils";

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
        align === "center" && "flex-col items-center text-center",
        className
      )}
    >
      <div>
        {eyebrow && (
          <p className="text-[0.58rem] font-light tracking-[0.28em] uppercase text-[--gold] mb-1.5">
            {eyebrow}
          </p>
        )}
        <h2
          className="font-light tracking-[0.03em] text-[--cream-bright]"
          style={{ fontFamily: "var(--font-heading)", fontSize: "1.35rem" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-[0.75rem] text-[--cream-muted] mt-1 font-light leading-relaxed">
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

/* ─── Gold Diamond Divider ──────────────────────────────────────────────── */

export function GoldDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 px-5", className)}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[rgba(201,169,110,0.22)]" />
      <svg width="7" height="7" viewBox="0 0 7 7" fill="none" className="flex-shrink-0 opacity-50">
        <path d="M3.5 0.5l.9 2.1L7 3.5l-2.6.9L3.5 6.5l-.9-2.1L0 3.5l2.6-.9z" fill="#C9A96E" />
      </svg>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[rgba(201,169,110,0.22)]" />
    </div>
  );
}
