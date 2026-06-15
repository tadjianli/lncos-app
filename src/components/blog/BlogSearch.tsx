"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/shared/Icon";

interface BlogSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function BlogSearch({
  onSearch,
  placeholder = "Rechercher un article…",
}: BlogSearchProps) {
  const [value, setValue] = useState("");

  const handleChange = (next: string) => {
    setValue(next);
    onSearch(next);
  };

  const clearVisible = useMemo(() => value.length > 0, [value]);

  return (
    <div className="blog-search">
      <Icon name="search" size={18} color="var(--ink-mute)" />
      <input
        type="search"
        className="blog-search__input"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Rechercher dans le blog"
      />
      {clearVisible ? (
        <button
          type="button"
          className="blog-search__clear"
          onClick={() => handleChange("")}
          aria-label="Effacer la recherche"
        >
          <Icon name="x" size={16} />
        </button>
      ) : null}
    </div>
  );
}
