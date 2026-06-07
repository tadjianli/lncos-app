import { Container } from "@/components/shared/Container";

const PILLARS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke="#C9A96E" strokeWidth="1" />
        <circle cx="10" cy="10" r="3.5" stroke="#C9A96E" strokeWidth="1" />
        <path d="M10 2.5v15M2.5 10h15" stroke="#C9A96E" strokeWidth="0.75" strokeLinecap="round" />
      </svg>
    ),
    label: "Precision Science",
    desc: "Formulated with clinically-validated actives at efficacious concentrations.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2.5C6.5 5 3 7 3 11a7 7 0 0014 0c0-4-3.5-6-7-8.5z" stroke="#C9A96E" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Clean Luxury",
    desc: "Free of 1,400+ harmful ingredients. Never compromising performance.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 3l1.8 3.6L16 7.3l-3 2.9.7 4.1L10 12.1 6.3 14.3l.7-4.1L4 7.3l4.2-.7L10 3z" stroke="#C9A96E" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Ritual Grade",
    desc: "Every texture, weight, and finish designed for the complete sensory ritual.",
  },
];

export function PhilosophySection() {
  return (
    <section className="mt-12 relative overflow-hidden">
      {/* Glow bg */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 50%, rgba(201,169,110,0.05) 0%, transparent 70%)",
        }}
      />

      <Container className="relative z-10 py-10">
        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[rgba(201,169,110,0.25)]" />
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 0.5L8.2 5.8L13.5 7L8.2 8.2L7 13.5L5.8 8.2L0.5 7L5.8 5.8L7 0.5Z" fill="rgba(201,169,110,0.4)" />
          </svg>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[rgba(201,169,110,0.25)]" />
        </div>

        {/* Headline */}
        <div className="text-center mb-8">
          <p className="text-[0.6rem] font-light tracking-[0.3em] uppercase text-[--gold] mb-3">
            Our Philosophy
          </p>
          <h2
            className="font-light text-[--cream] leading-tight"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.75rem",
              letterSpacing: "0.03em",
            }}
          >
            Beauty as a
            <br />
            <span className="italic text-gold-gradient">Sacred Practice</span>
          </h2>
        </div>

        {/* Pillars */}
        <div className="flex flex-col gap-5">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.label}
              className="flex items-start gap-4 p-4 rounded-2xl"
              style={{
                background: "rgba(201,169,110,0.04)",
                border: "1px solid rgba(201,169,110,0.08)",
              }}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(201,169,110,0.06)" }}>
                {pillar.icon}
              </div>
              <div>
                <h3 className="text-xs font-light tracking-[0.15em] uppercase text-[--cream] mb-1">
                  {pillar.label}
                </h3>
                <p className="text-xs font-light text-[--cream-muted] leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
