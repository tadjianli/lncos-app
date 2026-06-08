import { Section, SectionHeader } from "@/components/shared/Container";
import { FeatureCard } from "@/components/shared/Card";

const EDITORIALS = [
  {
    id: 1,
    eyebrow: "Skin Ritual",
    title: "The 7-Step\nObsidian Ritual",
    subtitle: "Transform your evening routine into a meditative practice with our signature obsidian collection.",
    cta: "Discover the Ritual",
    bgColor: "linear-gradient(160deg, #0D0B08 0%, #1A1510 60%, #0F0C08 100%)",
  },
  {
    id: 2,
    eyebrow: "New Arrival",
    title: "Lumière\nEssence",
    cta: "Shop Now",
    bgColor: "linear-gradient(155deg, #0E0C09 0%, #161208 100%)",
  },
  {
    id: 3,
    eyebrow: "Limited Edition",
    title: "Nocturne\nCollection",
    cta: "Explore",
    bgColor: "linear-gradient(155deg, #0A0A10 0%, #0E0B16 100%)",
  },
];

export function EditorialSection() {
  return (
    <Section className="mt-12">
      <SectionHeader eyebrow="Stories" title="Editorial" />

      <div className="px-5 flex flex-col gap-3.5">
        {/* Hero editorial */}
        <FeatureCard
          eyebrow={EDITORIALS[0].eyebrow}
          title={EDITORIALS[0].title}
          subtitle={EDITORIALS[0].subtitle}
          cta={EDITORIALS[0].cta}
          bgColor={EDITORIALS[0].bgColor}
          aspectRatio="4/5"
        />

        {/* 2-column grid */}
        <div className="grid grid-cols-2 gap-3.5">
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
