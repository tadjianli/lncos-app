import { Section, SectionHeader } from "@/components/shared/Container";
import { FeatureCard } from "@/components/shared/Card";

const EDITORIALS = [
  {
    id: 1,
    eyebrow: "Skin Ritual",
    title: "The 7-Step\nObsidian Ritual",
    subtitle: "Transform your evening routine into a meditative practice with our signature obsidian collection.",
    cta: "Discover the Ritual",
    bgColor: "linear-gradient(160deg, #0D0C0A 0%, #1A1510 100%)",
    wide: true,
  },
  {
    id: 2,
    eyebrow: "New Arrival",
    title: "Lumière\nEssence",
    cta: "Shop Now",
    bgColor: "linear-gradient(160deg, #0E0C0A 0%, #16120A 100%)",
    wide: false,
  },
  {
    id: 3,
    eyebrow: "Limited Edition",
    title: "Nocturne\nCollection",
    cta: "Explore",
    bgColor: "linear-gradient(160deg, #0A0A10 0%, #0E0C16 100%)",
    wide: false,
  },
];

export function EditorialSection() {
  return (
    <Section className="mt-10">
      <SectionHeader eyebrow="Stories" title="Editorial" />

      <div className="px-5 flex flex-col gap-4">
        {/* Wide hero editorial */}
        <FeatureCard
          eyebrow={EDITORIALS[0].eyebrow}
          title={EDITORIALS[0].title}
          subtitle={EDITORIALS[0].subtitle}
          cta={EDITORIALS[0].cta}
          bgColor={EDITORIALS[0].bgColor}
          aspectRatio="4/5"
        />

        {/* 2-column smaller */}
        <div className="grid grid-cols-2 gap-4">
          {EDITORIALS.slice(1).map((ed) => (
            <FeatureCard
              key={ed.id}
              eyebrow={ed.eyebrow}
              title={ed.title}
              cta={ed.cta}
              bgColor={ed.bgColor}
              aspectRatio="3/4"
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
