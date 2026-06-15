"use client";

import { Icon } from "@/components/shared/Icon";

interface FlashSalesBannerProps {
  productCount: number;
}

export function FlashSalesBanner({ productCount }: FlashSalesBannerProps) {
  return (
    <div className="flash-sales-banner">
      <div className="flash-sales-banner__glow" aria-hidden />
      <div className="flash-sales-banner__content">
        <span className="flash-sales-banner__eyebrow">
          <Icon name="flame" size={13} color="var(--gold)" fill="rgba(212,175,55,.3)" />
          Offres limitées
        </span>
        <h1 className="flash-sales-banner__title">Ventes Flash LN COS</h1>
        <p className="flash-sales-banner__sub">
          {productCount} promotion{productCount > 1 ? "s" : ""} en cours — prix exclusifs, stocks limités.
        </p>
      </div>
    </div>
  );
}
