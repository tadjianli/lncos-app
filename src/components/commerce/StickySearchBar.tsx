"use client";

import { Icon } from "@/components/shared/Icon";
import { useStore } from "@/lib/store";

interface StickySearchBarProps {
  placeholder?: string;
}

/** Barre recherche sticky — ouvre l'overlay SearchScreen (pas d'onglet dédié). */
export function StickySearchBar({
  placeholder = "Rechercher un produit, une catégorie…",
}: StickySearchBarProps) {
  const openSearch = useStore((s) => s.openSearch);

  return (
    <div className="sticky-search-bar">
      <button
        type="button"
        className="sticky-search-bar__trigger"
        onClick={openSearch}
        aria-label="Ouvrir la recherche produits"
      >
        <Icon name="search" size={17} color="var(--gold)" />
        <span className="sticky-search-bar__placeholder">{placeholder}</span>
      </button>
    </div>
  );
}
