"use client";

import { useState } from "react";
import { Section, SectionHeader } from "@/components/shared/Container";
import { ProductCard, CategoryCard } from "@/components/shared/Card";

const CATEGORIES = [
  { label: "All",  count: 24 },
  { label: "Skin", count: 9  },
  { label: "Eyes", count: 7  },
  { label: "Lips", count: 5  },
  { label: "Body", count: 3  },
];

const PRODUCTS = [
  {
    id: 1,
    name: "Velvet Noir Serum",
    subtitle: "Skin Elixir",
    price: "$148",
    tag: "Best Seller",
    color: "#16130D",
    category: "Skin",
  },
  {
    id: 2,
    name: "Obsidian Eye Ritual",
    subtitle: "Eye Treatment",
    price: "$96",
    tag: "New",
    color: "#0F0D14",
    category: "Eyes",
  },
  {
    id: 3,
    name: "Golden Hour Glow",
    subtitle: "Illuminating Oil",
    price: "$124",
    color: "#181308",
    category: "Skin",
  },
  {
    id: 4,
    name: "Satin Lip Lacquer",
    subtitle: "Lip Treatment",
    price: "$68",
    tag: "Limited",
    color: "#180B10",
    category: "Lips",
  },
];

export function FeaturedSection() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <Section className="mt-12">
      <SectionHeader
        eyebrow="Curated Edit"
        title="Featured Products"
        action={
          <button className="text-[0.58rem] font-light tracking-[0.2em] uppercase text-[#C9A96E] opacity-75 hover:opacity-100 transition-opacity duration-150 active:opacity-50">
            Voir tout →
          </button>
        }
      />

      {/* Category filters */}
      <div className="scroll-row px-5 mb-5 gap-2">
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.label}
            label={cat.label}
            count={cat.count}
            active={activeCategory === cat.label}
            onClick={() => setActiveCategory(cat.label)}
          />
        ))}
      </div>

      {/* Product row */}
      <div className="scroll-row px-5 pb-2">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            subtitle={product.subtitle}
            price={product.price}
            tag={product.tag}
            imagePlaceholderColor={product.color}
          />
        ))}
      </div>
    </Section>
  );
}
