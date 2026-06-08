import { Section, SectionHeader, Container, GoldDivider } from "@/components/shared/Container";
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
      <GoldDivider className="mb-12" />

      <SectionHeader
        eyebrow="The Method"
        title="Your Nightly Ritual"
        subtitle="Four steps. One transformation."
        align="center"
      />

      <Container className="mt-8">
        <div className="flex flex-col">
          {STEPS.map((step, idx) => {
            const isLast = idx === STEPS.length - 1;
            return (
              <div key={step.step} className="relative flex gap-5">
                {/* Left: step circle + connector */}
                <div className="flex flex-col items-center flex-shrink-0" style={{ width: "2.75rem" }}>
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                      background: "rgba(201,169,110,0.05)",
                      border: "1px solid rgba(201,169,110,0.22)",
                      boxShadow: "0 0 12px rgba(201,169,110,0.06)",
                    }}
                  >
                    <span className="text-[0.58rem] font-light tracking-[0.18em] text-[--gold]">
                      {step.step}
                    </span>
                  </div>

                  {/* Connector line — dashed gold gradient */}
                  {!isLast && (
                    <div className="flex-1 w-px my-1" style={{ minHeight: "2rem" }}>
                      <div
                        className="w-full h-full"
                        style={{
                          background: "linear-gradient(to bottom, rgba(201,169,110,0.22) 0%, rgba(201,169,110,0.04) 100%)",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Right: content */}
                <div className={`flex-1 ${isLast ? "pb-0" : "pb-7"} pt-2`}>
                  <h3 className="text-[0.8rem] font-light tracking-[0.14em] uppercase text-[--cream] mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-[0.78rem] font-light text-[--cream-muted] leading-[1.72]">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-9">
          <Button variant="outline" size="lg" className="w-full">
            Build Your Ritual
          </Button>
        </div>
      </Container>
    </Section>
  );
}
