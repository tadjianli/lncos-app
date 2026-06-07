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
          <p className="text-[0.625rem] font-light tracking-[0.25em] uppercase text-[--gold] mb-1">
            {eyebrow}
          </p>
        )}
        <h2
          className="font-heading text-xl font-light tracking-wide text-[--cream]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-[--cream-muted] mt-0.5 font-light">
            {subtitle}
          </p>
        )}
      </div>
      {action && align === "left" && (
        <div className="flex-shrink-0">{action}</div>
      )}
    </div>
  );
}
