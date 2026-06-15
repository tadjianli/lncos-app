"use client";

import Link from "next/link";
import { Icon } from "@/components/shared/Icon";

interface BlogJournalSectionProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  cta?: string;
}

export function BlogJournalSection({
  title = "LE JOURNAL BEAUTÉ LN COS",
  subtitle = "Conseils, tutoriels et tendances curated by LN COS.",
  eyebrow = "Magazine",
  cta = "Voir tous les articles",
}: BlogJournalSectionProps) {
  return (
    <section className="blog-journal blog-journal--teaser" aria-labelledby="blog-journal-title">
      <div className="blog-journal__head">
        <span className="blog-journal__eyebrow">
          <Icon name="edit" size={13} color="var(--gold)" />
          {eyebrow}
        </span>
        <h2 id="blog-journal-title" className="blog-journal__title">
          {title}
        </h2>
        {subtitle ? <p className="blog-journal__sub">{subtitle}</p> : null}
      </div>

      <Link href="/blog" className="blog-journal__cta">
        {cta}
        <Icon name="arrowR" size={16} />
      </Link>
    </section>
  );
}
