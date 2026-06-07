"use client";

import { useState } from "react";
import { Section, SectionHeader } from "@/components/shared/Container";
import { ProductCard, CategoryCard } from "@/components/shared/Card";

const CATEGORIES = [
  { label: "All", count: 24 },
  { label: "Skin", count: 9 },
  { label: "Eyes", count: 7 },
  { label: "Lips", count: 5 },
  { label: "Body", count: 3 },
];

const PRODUCTS = [
  {
    id: 1,
    name: "Velvet Noir Serum",
    subtitle: "Skin Elixir",
    price: "$148",
    tag: "Best Seller",
    color: "#1A1510",
    category: "Skin",
  },
  {
    id: 2,
    name: "Obsidian Eye Ritual",
    subtitle: "Eye Treatment",
    price: "$96",
    tag: "New",
    color: "#100E14",
    category: "Eyes",
  },
  {
    id: 3,
    name: "Golden Hour Glow",
    subtitle: "Illuminating Oil",
    price: "$124",
    color: "#1A1308",
    category: "Skin",
  },
  {
    id: 4,
    name: "Satin Lip Lacquer",
    subtitle: "Lip Treatment",
    price: "$68",
    tag: "Limited",
    color: "#1A0C10",
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
    <Section className="mt-10">
      <SectionHeader
        eyebrow="Curated Edit"
        title="Featured Products"
        action={
          <button className="text-[0.6rem] font-light tracking-[0.15em] uppercase text-[--gold] border-b border-[rgba(201,169,110,0.35)] pb-px">
            View All
          </button>
        }
      />

      {/* Category Filter */}
      <div className="scroll-row px-5 mb-5">
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

      {/* Product Scroll */}
      <div className="scroll-row px-5">
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
