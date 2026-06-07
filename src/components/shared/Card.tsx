import { cn } from "@/lib/utils";

/* ─── Base Luxury Card ──────────────────────────────────────────────────── */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: boolean;
}

export function Card({ children, className, onClick, glow }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "luxury-card",
        glow && "glow-gold",
        onClick && "cursor-pointer active:scale-[0.98] transition-transform duration-150",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ─── Product Card ──────────────────────────────────────────────────────── */

interface ProductCardProps {
  name: string;
  subtitle?: string;
  price: string;
  tag?: string;
  imagePlaceholderColor?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export function ProductCard({
  name,
  subtitle,
  price,
  tag,
  imagePlaceholderColor = "#1A1610",
  size = "md",
  onClick,
}: ProductCardProps) {
  const sizeClasses = {
    sm: "w-40",
    md: "w-52",
    lg: "w-64",
  };

  const imageHeight = {
    sm: "h-44",
    md: "h-60",
    lg: "h-72",
  };

  return (
    <Card
      onClick={onClick}
      className={cn("flex-shrink-0", sizeClasses[size])}
    >
      {/* Image area */}
      <div
        className={cn("relative w-full", imageHeight[size])}
        style={{ background: imagePlaceholderColor }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,8,0.5)] via-transparent to-transparent" />

        {/* Tag */}
        {tag && (
          <div className="absolute top-3 left-3">
            <span className="text-[0.55rem] font-light tracking-[0.2em] uppercase text-[--gold] bg-[rgba(8,8,8,0.7)] px-2.5 py-1 rounded-full border border-[rgba(201,169,110,0.2)]">
              {tag}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[0.55rem] font-light tracking-[0.2em] uppercase text-[--cream-muted] mb-0.5">
          {subtitle}
        </p>
        <h3 className="text-sm font-light tracking-wide text-[--cream] mb-2 leading-tight">
          {name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xs font-light text-[--gold] tracking-wider">
            {price}
          </span>
          <button
            className="h-7 w-7 rounded-full bg-[--gold] flex items-center justify-center active:scale-90 transition-transform duration-150"
            aria-label="Add to bag"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1v8M1 5h8" stroke="#080808" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  );
}

/* ─── Feature Card (full-width editorial) ───────────────────────────────── */

interface FeatureCardProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta?: string;
  bgColor?: string;
  aspectRatio?: string;
  onClick?: () => void;
}

export function FeatureCard({
  eyebrow,
  title,
  subtitle,
  cta = "Explore",
  bgColor = "#0E0C08",
  aspectRatio = "4/5",
  onClick,
}: FeatureCardProps) {
  return (
    <Card
      onClick={onClick}
      className="w-full overflow-hidden"
    >
      <div
        className="relative w-full flex flex-col justify-end p-6"
        style={{ background: bgColor, aspectRatio }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,8,0.85)] via-[rgba(8,8,8,0.2)] to-transparent" />

        <div className="relative z-10">
          {eyebrow && (
            <p className="text-[0.6rem] font-light tracking-[0.25em] uppercase text-[--gold] mb-2">
              {eyebrow}
            </p>
          )}
          <h2
            className="font-light tracking-wide text-[--cream] mb-2 leading-tight"
            style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem" }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs font-light text-[--cream-muted] mb-4 leading-relaxed">
              {subtitle}
            </p>
          )}
          <span className="text-[0.65rem] font-light tracking-[0.2em] uppercase text-[--gold] border-b border-[rgba(201,169,110,0.35)] pb-0.5">
            {cta} →
          </span>
        </div>
      </div>
    </Card>
  );
}

/* ─── Category Pill Card ────────────────────────────────────────────────── */

interface CategoryCardProps {
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}

export function CategoryCard({ label, count, active, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-shrink-0 h-9 px-5 rounded-full text-[0.65rem] font-light tracking-[0.15em] uppercase transition-all duration-200",
        active
          ? "bg-[--gold] text-[--obsidian] shadow-[0_2px_12px_rgba(201,169,110,0.3)]"
          : "bg-[--obsidian-raised] text-[--cream-muted] border border-[--obsidian-border] hover:border-[rgba(201,169,110,0.25)] hover:text-[--cream]"
      )}
    >
      {label}
      {count !== undefined && (
        <span className={cn("ml-1.5", active ? "text-[--obsidian]/60" : "text-[--gold]")}>
          {count}
        </span>
      )}
    </button>
  );
}

/* ─── Testimonial Card ──────────────────────────────────────────────────── */

interface TestimonialCardProps {
  quote: string;
  author: string;
  title?: string;
  rating?: number;
}

export function TestimonialCard({ quote, author, title, rating = 5 }: TestimonialCardProps) {
  return (
    <Card className="p-5 w-72 flex-shrink-0">
      {rating > 0 && (
        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: rating }).map((_, i) => (
            <svg key={i} width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M5 1l1.12 2.27L9 3.64 6.5 6.08l.59 2.92L5 7.77 2.91 9l.59-2.92L1 3.64l2.88-.37z"
                fill="#C9A96E"
              />
            </svg>
          ))}
        </div>
      )}
      <p className="text-xs font-light leading-relaxed text-[--cream-muted] mb-4 italic">
        &ldquo;{quote}&rdquo;
      </p>
      <div>
        <p className="text-xs font-light text-[--cream] tracking-wide">{author}</p>
        {title && (
          <p className="text-[0.6rem] font-light text-[--gold] tracking-wider uppercase mt-0.5">
            {title}
          </p>
        )}
      </div>
    </Card>
  );
}
