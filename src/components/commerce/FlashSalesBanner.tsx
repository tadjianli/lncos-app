"use client";

import { Icon } from "@/components/shared/Icon";
import {
  formatFlashBannerSubtitle,
  DEFAULT_FLASH_SALES_SETTINGS,
  type FlashSalesSettings,
} from "@/lib/content-pages";

interface FlashSalesBannerProps {
  productCount: number;
  settings?: Pick<
    FlashSalesSettings,
    "bannerEyebrow" | "bannerTitle" | "bannerSubtitleTemplate"
  >;
}

export function FlashSalesBanner({
  productCount,
  settings = DEFAULT_FLASH_SALES_SETTINGS,
}: FlashSalesBannerProps) {
  return (
    <div className="flash-sales-banner">
      <div className="flash-sales-banner__glow" aria-hidden />
      <div className="flash-sales-banner__content">
        <span className="flash-sales-banner__eyebrow">
          <Icon name="flame" size={13} color="var(--gold)" fill="rgba(212,175,55,.3)" />
          {settings.bannerEyebrow}
        </span>
        <h1 className="flash-sales-banner__title">{settings.bannerTitle}</h1>
        <p className="flash-sales-banner__sub">
          {formatFlashBannerSubtitle(settings.bannerSubtitleTemplate, productCount)}
        </p>
      </div>
    </div>
  );
}
