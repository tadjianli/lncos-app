"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";

function BoutiqueSearchFromUrlInner() {
  const params = useSearchParams();
  const openSearch = useStore((s) => s.openSearch);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    const q = params.get("q")?.trim();
    if (!q) return;
    handled.current = true;
    openSearch(q);
  }, [params, openSearch]);

  return null;
}

/** Ouvre la recherche boutique si ?q= est présent (SearchAction Schema.org). */
export function BoutiqueSearchFromUrl() {
  return (
    <Suspense fallback={null}>
      <BoutiqueSearchFromUrlInner />
    </Suspense>
  );
}
