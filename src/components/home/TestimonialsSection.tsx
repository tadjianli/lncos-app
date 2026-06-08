import { Section, SectionHeader } from "@/components/shared/Container";
import { TestimonialCard } from "@/components/shared/Card";

const TESTIMONIALS = [
  {
    quote: "This serum has completely transformed my skin in three weeks. The texture is unlike anything I've used — silk-like, immediately absorbed.",
    author: "Margaux L.",
    title: "Verified Customer",
    rating: 5,
  },
  {
    quote: "LN COS understands that luxury is in the details. From the packaging to the scent, every element is intentional.",
    author: "Diane K.",
    title: "Beauty Editor",
    rating: 5,
  },
  {
    quote: "The nocturne collection is my evening ritual now. I wake up with a glow that used to take an entire makeup routine to achieve.",
    author: "Isabelle R.",
    title: "Verified Customer",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <Section className="mt-12 mb-0">
      <SectionHeader
        eyebrow="Community"
        title="What They Say"
      />
      <div className="scroll-row px-5 pb-2">
        {TESTIMONIALS.map((t, i) => (
          <TestimonialCard key={i} {...t} />
        ))}
      </div>
    </Section>
  );
}
