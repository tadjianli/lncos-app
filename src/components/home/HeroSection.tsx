import { Button } from "@/components/shared/Button";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: "88dvh" }}>
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,169,110,0.08) 0%, transparent 65%),
            radial-gradient(ellipse 60% 80% at 80% 100%, rgba(201,169,110,0.04) 0%, transparent 60%),
            #080808
          `,
        }}
      />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(201,169,110,0.5) 80px),
                            repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(201,169,110,0.5) 80px)`,
        }}
      />

      {/* Hero product silhouette area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-40 h-64 opacity-[0.06]"
          style={{
            background: "linear-gradient(135deg, #C9A96E, #E2C98A)",
            borderRadius: "50% 50% 40% 40% / 60% 60% 40% 40%",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full px-6" style={{ minHeight: "88dvh", paddingBottom: "2.5rem" }}>
        <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
          <p className="text-[0.6rem] font-light tracking-[0.35em] uppercase text-[--gold] mb-4">
            Collection 2025
          </p>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
          <h1
            className="font-light text-[--cream] leading-[1.08] mb-3"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.5rem, 12vw, 3.5rem)",
              letterSpacing: "0.02em",
            }}
          >
            The Art of
            <br />
            <span className="text-gold-gradient italic">Luminance</span>
          </h1>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "320ms" }}>
          <p className="text-xs font-light text-[--cream-muted] leading-relaxed mb-7 max-w-xs">
            Precision-crafted luxury for those who understand that beauty is a ritual, not a routine.
          </p>
        </div>

        <div className="animate-fade-up flex flex-col gap-3" style={{ animationDelay: "440ms" }}>
          <Button variant="gold" size="lg" className="w-full">
            Shop the Collection
          </Button>
          <Button variant="outline" size="lg" className="w-full">
            Our Story
          </Button>
        </div>

        {/* Scroll indicator */}
        <div className="flex flex-col items-center gap-2 mt-8 opacity-40 animate-fade-up" style={{ animationDelay: "600ms" }}>
          <span className="text-[0.5rem] tracking-[0.25em] uppercase text-[--cream-muted]">
            Scroll
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-[--gold] to-transparent" />
        </div>
      </div>
    </section>
  );
}
