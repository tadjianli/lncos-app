import { Section, SectionHeader, Container } from "@/components/shared/Container";
import { Button } from "@/components/shared/Button";

const STEPS = [
  {
    step: "01",
    title: "Cleanse",
    desc: "Begin with our obsidian micellar oil to dissolve impurities without disturbing the skin barrier.",
  },
  {
    step: "02",
    title: "Tone",
    desc: "Apply the golden essence toner to rebalance pH and prepare skin for maximum absorption.",
  },
  {
    step: "03",
    title: "Treat",
    desc: "Layer the velvet serum with targeted actives precisely calibrated for your skin concern.",
  },
  {
    step: "04",
    title: "Seal",
    desc: "Lock in the ritual with the nocturne night cream — a second-skin barrier through the night.",
  },
];

export function RitualSection() {
  return (
    <Section className="mt-12">
      {/* Gold divider */}
      <div className="px-5 mb-10">
        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(201,169,110,0.3)] to-transparent" />
      </div>

      <SectionHeader
        eyebrow="The Method"
        title="Your Nightly Ritual"
        subtitle="Four steps. One transformation."
        align="center"
      />

      <Container className="mt-7">
        <div className="flex flex-col gap-0">
          {STEPS.map((step, idx) => (
            <div key={step.step} className="relative">
              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="absolute left-[1.375rem] top-10 w-px h-full bg-gradient-to-b from-[rgba(201,169,110,0.25)] to-transparent" />
              )}

              <div className="flex gap-5 py-5">
                {/* Step number */}
                <div className="flex-shrink-0 w-11 h-11 rounded-full border border-[rgba(201,169,110,0.25)] flex items-center justify-center bg-[rgba(201,169,110,0.04)]">
                  <span className="text-[0.6rem] font-light tracking-widest text-[--gold]">
                    {step.step}
                  </span>
                </div>

                <div className="flex-1 pt-1.5">
                  <h3 className="text-sm font-light tracking-[0.12em] uppercase text-[--cream] mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-xs font-light text-[--cream-muted] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-7">
          <Button variant="outline" size="lg" className="w-full">
            Build Your Ritual
          </Button>
        </div>
      </Container>
    </Section>
  );
}
