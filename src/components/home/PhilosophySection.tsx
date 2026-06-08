import { Container } from "@/components/shared/Container";

const PILLARS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="6.5" stroke="#C9A96E" strokeWidth="1" />
        <circle cx="9" cy="9" r="3" stroke="#C9A96E" strokeWidth="0.85" />
        <path d="M9 2.5v13M2.5 9h13" stroke="#C9A96E" strokeWidth="0.75" strokeLinecap="round" />
      </svg>
    ),
    label: "Precision Science",
    desc: "Formulated with clinically-validated actives at efficacious concentrations.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 2.5C6 4.5 3 6.5 3 10a6 6 0 0012 0c0-3.5-3-5.5-6-7.5z"
          stroke="#C9A96E"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    label: "Clean Luxury",
    desc: "Free of 1,400+ harmful ingredients. Never compromising performance.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 2.5l1.6 3.25 3.65.53-2.64 2.57.62 3.63L9 10.6l-3.23 1.88.62-3.63L3.75 6.28l3.65-.53L9 2.5z"
          stroke="#C9A96E"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    label: "Ritual Grade",
    desc: "Every texture, weight, and finish designed for the complete sensory ritual.",
  },
];

export function PhilosophySection() {
  return (
    <section className="mt-12 relative overflow-hidden">
      {/* Ambient gold center glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 120% 65% at 50% 50%,
              rgba(201,169,110,0.055) 0%,
              transparent 68%)
          `,
        }}
      />

      <Container className="relative z-10 py-12">
        {/* Divider with diamond */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[rgba(201,169,110,0.20)]" />
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M4 0.5l1 2.5L7.5 4 5 5l-1 2.5L3 5 0.5 4 3 3z" fill="rgba(201,169,110,0.45)" />
          </svg>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[rgba(201,169,110,0.20)]" />
        </div>

        {/* Headline */}
        <div className="text-center mb-10">
          <p className="text-[0.58rem] font-light tracking-[0.32em] uppercase text-[--gold] mb-3">
            Our Philosophy
          </p>
          <h2
            className="font-light text-[--cream-bright] leading-[1.1]"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2rem",
              letterSpacing: "0.025em",
            }}
          >
            Beauty as a
            <br />
            <span className="italic text-gold-gradient">Sacred Practice</span>
          </h2>
        </div>

        {/* Pillars */}
        <div className="flex flex-col gap-4">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.label}
              className="flex items-start gap-4 p-4 rounded-[1.1rem] transition-all duration-250"
              style={{
                background: "rgba(201,169,110,0.038)",
                border: "1px solid rgba(201,169,110,0.09)",
              }}
            >
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(201,169,110,0.07)",
                  boxShadow: "0 0 10px rgba(201,169,110,0.08)",
                }}
              >
                {pillar.icon}
              </div>
              <div className="pt-0.5">
                <h3 className="text-[0.72rem] font-light tracking-[0.16em] uppercase text-[--cream] mb-1">
                  {pillar.label}
                </h3>
                <p className="text-[0.76rem] font-light text-[--cream-muted] leading-[1.7]">
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
