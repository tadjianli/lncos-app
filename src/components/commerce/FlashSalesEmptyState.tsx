"use client";

import Link from "next/link";
import { GoldBtn } from "@/components/shared/ActionButtons";
import { DEFAULT_FLASH_SALES_SETTINGS, type FlashSalesSettings } from "@/lib/content-pages";

function FlashSalesIllustration() {
  return (
    <svg
      className="flash-sales-illus"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <radialGradient id="flash-glow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="rgba(212,175,55,.35)" />
          <stop offset="100%" stopColor="rgba(212,175,55,0)" />
        </radialGradient>
        <linearGradient id="flash-flame" x1="100" y1="40" x2="100" y2="160" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F7C6D7" />
          <stop offset=".45" stopColor="#D4AF37" />
          <stop offset="1" stopColor="#8B6914" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="88" fill="url(#flash-glow)" />
      <circle cx="100" cy="100" r="72" stroke="rgba(212,175,55,.22)" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="58" stroke="rgba(247,198,215,.18)" strokeWidth="1" strokeDasharray="4 6" />
      <path
        d="M100 38c-8 22-28 34-28 58 0 18 12 32 28 36 16-4 28-18 28-36 0-24-20-36-28-58Z"
        fill="url(#flash-flame)"
        opacity=".95"
      />
      <path
        d="M100 72c-4 10-12 16-12 26 0 8 5 14 12 16 7-2 12-8 12-16 0-10-8-16-12-26Z"
        fill="rgba(255,255,255,.22)"
      />
      <path
        d="M52 118c6-10 16-14 24-10M148 118c-6-10-16-14-24-10"
        stroke="rgba(212,175,55,.35)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="62" cy="132" r="3" fill="rgba(247,198,215,.55)" />
      <circle cx="138" cy="128" r="2.5" fill="rgba(212,175,55,.6)" />
      <circle cx="118" cy="148" r="2" fill="rgba(247,198,215,.4)" />
    </svg>
  );
}

export function FlashSalesEmptyState({
  settings = DEFAULT_FLASH_SALES_SETTINGS,
  inLayout = false,
}: {
  settings?: Pick<
    FlashSalesSettings,
    "emptyEyebrow" | "emptyTitle" | "emptyBody" | "emptyCtaLabel" | "emptyCtaHref"
  >;
  inLayout?: boolean;
}) {
  return (
    <div className={`flash-sales-empty${inLayout ? " flash-sales-empty--in-layout" : ""}`}>
      <div className="flash-sales-empty__frame">
        <FlashSalesIllustration />
      </div>

      <p className="flash-sales-empty__eyebrow">{settings.emptyEyebrow}</p>

      <h2 className="flash-sales-empty__title">{settings.emptyTitle}</h2>

      <p className="flash-sales-empty__body">{settings.emptyBody}</p>

      <Link href={settings.emptyCtaHref} className="flash-sales-empty__cta">
        <GoldBtn icon="grid">{settings.emptyCtaLabel}</GoldBtn>
      </Link>
    </div>
  );
}
