import { AppShell } from "@/components/layout/AppShell";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { EditorialSection } from "@/components/home/EditorialSection";
import { RitualSection } from "@/components/home/RitualSection";
import { PhilosophySection } from "@/components/home/PhilosophySection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { FooterSection } from "@/components/home/FooterSection";

export default function HomePage() {
  return (
    <AppShell transparentTopBar cartCount={2}>
      <HeroSection />
      <FeaturedSection />
      <EditorialSection />
      <RitualSection />
      <PhilosophySection />
      <TestimonialsSection />
      <NewsletterSection />
      <FooterSection />
    </AppShell>
  );
}
