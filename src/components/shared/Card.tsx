import { cn } from "@/lib/utils";

/* ─── Base Luxury Card ──────────────────────────────────────────────────── */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: boolean;
  lift?: boolean;
}

export function Card({ children, className, onClick, glow, lift = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "luxury-card",
        glow && "glow-gold",
        lift && "hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]",
        onClick && "cursor-pointer",
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
  imagePlaceholderColor = "#16130E",
  size = "md",
  onClick,
}: ProductCardProps) {
  const widths = { sm: "w-40", md: "w-[11.5rem]", lg: "w-64" };
  const heights = { sm: "h-44", md: "h-[15rem]", lg: "h-72" };

  return (
    <Card
      onClick={onClick}
      lift
      className={cn("flex-shrink-0 group", widths[size])}
    >
      {/* Image zone */}
      <div
        className={cn("relative w-full", heights[size])}
        style={{
          background: `
            radial-gradient(ellipse 60% 55% at 50% 38%, rgba(201,169,110,0.07) 0%, transparent 70%),
            ${imagePlaceholderColor}
          `,
        }}
      >
        {/* Depth vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,8,0.6)] via-[rgba(8,8,8,0.12)] to-transparent" />

        {/* Side shadow for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,0,0,0.18)] via-transparent to-[rgba(0,0,0,0.12)]" />

        {/* Tag */}
        {tag && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center text-[0.58rem] font-light tracking-[0.18em] uppercase text-[--gold] bg-[rgba(8,8,8,0.78)] px-2.5 py-[0.28rem] rounded-full border border-[rgba(201,169,110,0.22)]">
              {tag}
            </span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          className="absolute top-3 right-3 z-10 h-7 w-7 rounded-full bg-[rgba(8,8,8,0.55)] border border-[rgba(255,255,255,0.07)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 active:scale-90"
          aria-label="Save"
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 10.5C6 10.5 1.5 7.5 1.5 4.5a2.5 2.5 0 015-0c0-.01 0 0 0 0a2.5 2.5 0 015 0c0 3-4.5 6-4.5 6z" stroke="#C9A96E" strokeWidth="1" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Bottom gold accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(201,169,110,0.18)] to-transparent" />
      </div>

      {/* Info */}
      <div className="px-4 pt-3.5 pb-4">
        {subtitle && (
          <p className="text-[0.58rem] font-light tracking-[0.22em] uppercase text-[--cream-muted] mb-0.5">
            {subtitle}
          </p>
        )}
        <h3 className="text-[0.875rem] font-light tracking-[0.02em] text-[--cream] mb-3 leading-snug">
          {name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-[0.8rem] font-light text-[--gold] tracking-wide">
            {price}
          </span>
          <button
            className="relative h-8 w-8 rounded-full bg-[--gold] flex items-center justify-center transition-all duration-150 active:scale-[0.88] hover:shadow-[0_2px_10px_rgba(201,169,110,0.4)] active:shadow-none"
            aria-label="Add to bag"
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 1.5v8M1.5 5.5h8" stroke="#080808" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  );
}

/* ─── Feature Card (editorial) ──────────────────────────────────────────── */

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
    <Card onClick={onClick} className="w-full overflow-hidden group cursor-pointer">
      <div
        className="relative w-full flex flex-col justify-end"
        style={{ background: bgColor, aspectRatio }}
      >
        {/* Deep gradient — bottom-heavy for strong text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,5,5,0.92)] via-[rgba(5,5,5,0.28)] via-50% to-transparent" />

        {/* Top vignette for depth */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[rgba(0,0,0,0.28)] to-transparent" />

        {/* Content */}
        <div className="relative z-10 p-6 pb-7">
          {eyebrow && (
            <p className="text-[0.58rem] font-light tracking-[0.28em] uppercase text-[--gold] mb-2.5">
              {eyebrow}
            </p>
          )}
          <h2
            className="font-light text-[--cream-bright] leading-[1.12] mb-2.5"
            style={{ fontFamily: "var(--font-heading)", fontSize: "1.7rem", letterSpacing: "0.01em" }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-[0.75rem] font-light text-[--cream-muted] mb-5 leading-relaxed max-w-[22ch]">
              {subtitle}
            </p>
          )}
          <div className="inline-flex items-center gap-2">
            <span className="text-[0.62rem] font-light tracking-[0.22em] uppercase text-[--gold]">
              {cta}
            </span>
            {/* Animated underline */}
            <span className="relative inline-flex">
              <span className="block w-6 h-px bg-[rgba(201,169,110,0.4)] group-hover:bg-[--gold] transition-colors duration-300" />
              <span className="absolute right-0 top-0 block h-px w-0 bg-[--gold-bright] group-hover:w-full transition-all duration-500 ease-out" />
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ─── Category Pill ──────────────────────────────────────────────────────── */

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
        "flex-shrink-0 h-9 px-5 rounded-full text-[0.62rem] font-light tracking-[0.14em] uppercase",
        "transition-all duration-220 will-change-transform",
        active
          ? [
              "bg-[--gold] text-[--obsidian]",
              "shadow-[0_2px_10px_rgba(201,169,110,0.28),0_0_0_1px_rgba(201,169,110,0.15)]",
              "scale-[1.02]",
            ]
          : [
              "bg-[--obsidian-raised] text-[--cream-muted]",
              "border border-[--obsidian-border]",
              "hover:border-[rgba(201,169,110,0.22)] hover:text-[--cream] hover:bg-[--obsidian-high]",
              "active:scale-[0.96]",
            ]
      )}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            "ml-1.5 text-[0.56rem] transition-colors duration-200",
            active ? "text-[rgba(8,8,8,0.55)]" : "text-[--gold]"
          )}
        >
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
    <Card className="w-[17rem] flex-shrink-0 flex flex-col">
      {/* Gold left-edge accent */}
      <div className="absolute left-0 top-5 bottom-5 w-[2px] rounded-full bg-gradient-to-b from-transparent via-[rgba(201,169,110,0.35)] to-transparent" />

      <div className="px-6 py-5 flex flex-col flex-1">
        {rating > 0 && (
          <div className="flex gap-1 mb-3.5">
            {Array.from({ length: rating }).map((_, i) => (
              <svg key={i} width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path
                  d="M4.5 1l.94 1.9L7.5 3.27 5.75 5l.47 2.32L4.5 6.65 2.78 7.32 3.25 5 1.5 3.27l2.06-.37L4.5 1z"
                  fill="#C9A96E"
                />
              </svg>
            ))}
          </div>
        )}

        <p className="text-[0.78rem] font-light leading-[1.7] text-[--cream-muted] mb-5 italic flex-1">
          &ldquo;{quote}&rdquo;
        </p>

        <div className="border-t border-[--obsidian-border] pt-3.5">
          <p className="text-[0.78rem] font-light text-[--cream] tracking-wide">{author}</p>
          {title && (
            <p className="text-[0.58rem] font-light text-[--gold] tracking-[0.18em] uppercase mt-0.5">
              {title}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
