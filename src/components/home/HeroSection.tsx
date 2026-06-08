import { Button } from "@/components/shared/Button";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: "92dvh" }}>

      {/* ── Layered background ── */}
      <div className="absolute inset-0 bg-[--obsidian]" />

      {/* Primary gold halo — top center */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 90% 55% at 50% -5%, rgba(201,169,110,0.10) 0%, transparent 68%)`,
        }}
      />

      {/* Secondary glow — bottom right warmth */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 88% 105%, rgba(180,140,80,0.06) 0%, transparent 62%)`,
        }}
      />

      {/* Ambient vignette — edges darker */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 85% 85% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)`,
        }}
      />

      {/* Refined grid texture — very subtle */}
      <div
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg,   transparent, transparent 59px, rgba(201,169,110,1) 60px),
            repeating-linear-gradient(90deg,  transparent, transparent 59px, rgba(201,169,110,1) 60px)
          `,
        }}
      />

      {/* Product silhouette — 3 layered blurs for depth */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Outer halo */}
        <div
          className="absolute w-56 h-80 opacity-[0.04] animate-float"
          style={{
            background: "radial-gradient(ellipse at 50% 40%, #E2C98A, transparent 70%)",
            filter: "blur(32px)",
            animationDelay: "0s",
          }}
        />
        {/* Mid glow */}
        <div
          className="absolute w-32 h-52 opacity-[0.055] animate-float"
          style={{
            background: "radial-gradient(ellipse at 50% 35%, #C9A96E, transparent 65%)",
            filter: "blur(18px)",
            animationDelay: "0.6s",
          }}
        />
        {/* Core bright */}
        <div
          className="absolute w-14 h-24 opacity-[0.07] animate-float"
          style={{
            background: "linear-gradient(160deg, #E2C98A, #C9A96E)",
            borderRadius: "40% 40% 35% 35% / 50% 50% 40% 40%",
            filter: "blur(8px)",
            animationDelay: "1.1s",
          }}
        />
      </div>

      {/* ── Content ── */}
      <div
        className="relative z-10 flex flex-col justify-end h-full px-6"
        style={{ minHeight: "92dvh", paddingBottom: "3rem" }}
      >
        {/* Eyebrow */}
        <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-6 bg-[rgba(201,169,110,0.5)]" />
            <p className="text-[0.58rem] font-light tracking-[0.35em] uppercase text-[--gold]">
              Collection 2025
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="animate-fade-up" style={{ animationDelay: "180ms" }}>
          <h1
            className="text-[--cream-bright] leading-[1.05] mb-4"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.8rem, 13vw, 3.75rem)",
              fontWeight: 300,
              letterSpacing: "0.015em",
            }}
          >
            The Art of
            <br />
            <span className="text-gold-gradient italic">Luminance</span>
          </h1>
        </div>

        {/* Body */}
        <div className="animate-fade-up" style={{ animationDelay: "300ms" }}>
          <p className="text-[0.82rem] font-light text-[--cream-muted] leading-[1.72] mb-8 max-w-[30ch]">
            Precision-crafted luxury for those who understand that beauty is a ritual, not a routine.
          </p>
        </div>

        {/* CTAs */}
        <div className="animate-fade-up flex flex-col gap-3" style={{ animationDelay: "420ms" }}>
          <Button variant="gold" size="lg" className="w-full text-[0.65rem]">
            Shop the Collection
          </Button>
          <Button variant="outline" size="lg" className="w-full text-[0.65rem]">
            Our Story
          </Button>
        </div>

        {/* Scroll cue */}
        <div
          className="animate-fade-up flex flex-col items-center gap-2 mt-10"
          style={{ animationDelay: "600ms", opacity: 0 }}
        >
          <p className="text-[0.5rem] font-light tracking-[0.3em] uppercase text-[--cream-muted] opacity-40">
            Scroll to explore
          </p>
          <div className="relative w-px h-10 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-[rgba(201,169,110,0.5)] to-transparent" />
            <div
              className="absolute inset-x-0 h-4 bg-[--gold] rounded-full"
              style={{ animation: "slideDown 1.8s ease-in-out infinite" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
