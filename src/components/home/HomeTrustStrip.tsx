"use client";

import { Icon } from "@/components/shared/Icon";
import type { HomeSection } from "@/lib/home-sections";
import { parseTrustPills } from "@/lib/trust-pills";

export function HomeTrustStrip({ section }: { section: HomeSection }) {
  const items = parseTrustPills(section);
  if (!items.length) return null;

  return (
    <div className="home-trust noscroll">
      {items.map((it, i) => (
        <span key={`${it.text}-${i}`} className="trust-pill">
          <Icon name={it.icon} size={13} color="var(--gold)" />
          {it.text}
        </span>
      ))}
    </div>
  );
}
