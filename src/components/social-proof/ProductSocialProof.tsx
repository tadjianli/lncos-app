"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { useSocialProofSettings, useProductSalesStats } from "@/lib/social-proof-db";
import { computeLiveViewers } from "@/lib/social-proof";

export function ProductLiveViewers({ productId }: { productId: string }) {
  const { settings, loading } = useSocialProofSettings();
  const [viewers, setViewers] = useState(12);

  useEffect(() => {
    if (!settings.liveViewersEnabled || loading) return;
    const tick = () =>
      setViewers(computeLiveViewers(productId, settings.viewersMin, settings.viewersMax));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [productId, settings, loading]);

  if (loading || !settings.liveViewersEnabled) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
        padding: "8px 12px",
        borderRadius: 10,
        background: "rgba(212,175,55,.08)",
        border: "1px solid rgba(212,175,55,.18)",
      }}
    >
      <span style={{ fontSize: 16 }}>👀</span>
      <span style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.4 }}>
        <strong style={{ color: "var(--ink)" }}>{viewers} personnes</strong> regardent ce produit actuellement
      </span>
    </div>
  );
}

export function ProductStockAlert({
  stock,
}: {
  stock: number;
}) {
  const { settings, loading } = useSocialProofSettings();
  if (loading || !settings.stockAlertsEnabled || stock <= 0) return null;

  const low = stock <= settings.stockLowThreshold;
  if (!low) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
        fontSize: 12.5,
        fontWeight: 600,
        color: "var(--tone-orange, #C77A33)",
      }}
    >
      <span>⚠️</span>
      {stock <= 20 ? (
        <span>🔥 Plus que {stock} exemplaire{stock > 1 ? "s" : ""} disponible{stock > 1 ? "s" : ""}</span>
      ) : (
        <span>Stock limité</span>
      )}
    </div>
  );
}

export function ProductSalesCounter({ productId }: { productId: string }) {
  const { settings, loading: settingsLoading } = useSocialProofSettings();
  const { today, week, loading } = useProductSalesStats(productId);

  if (settingsLoading || loading || !settings.salesCounterEnabled) return null;

  const label =
    today >= 3
      ? `🔥 ${today} achat${today > 1 ? "s" : ""} aujourd'hui`
      : `🔥 ${week} vente${week > 1 ? "s" : ""} cette semaine`;

  return (
    <div className="bottom-action-bar__meta">
      {label}
    </div>
  );
}

export function ProductReassuranceLines() {
  const lines = [
    "Livraison rapide Réunion",
    "Paiement sécurisé",
    "Retours faciles",
    "Expédition sous 24h",
  ];

  return (
    <ul
      className="pd-reassurance"
      style={{
        margin: "0 0 14px",
        padding: 0,
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 7,
      }}
    >
      {lines.map((line) => (
        <li
          key={line}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12.5,
            color: "var(--ink-soft)",
            lineHeight: 1.35,
          }}
        >
          <Icon name="check" size={12} color="var(--tone-green, #2F9E68)" stroke={2.8} />
          {line}
        </li>
      ))}
    </ul>
  );
}

export function ProductDeliveryTrustBlock() {
  const items = [
    { emoji: "🚚", label: "Livraison offerte dès 50€" },
    { emoji: "🎁", label: "Échantillon offert" },
    { emoji: "↩️", label: "Retour 30 jours" },
    { emoji: "🔒", label: "Paiement sécurisé" },
  ];

  return (
    <div
      className="pd-trust-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px 10px",
        padding: "12px 14px",
        borderRadius: "var(--r-md)",
        background: "var(--charcoal)",
        border: "1px solid rgba(212,175,55,.12)",
        marginBottom: 24,
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11.5,
            fontWeight: 600,
            color: "var(--ink-soft)",
            lineHeight: 1.3,
            minWidth: 0,
          }}
        >
          <span style={{ fontSize: 14, flexShrink: 0 }} aria-hidden>
            {item.emoji}
          </span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ProductTrustBadges() {
  const { settings, loading } = useSocialProofSettings();
  if (loading) return null;

  const badges = [
    settings.trustFastDelivery && { icon: "truck" as const, label: "Livraison rapide" },
    settings.trustSecurePayment && { icon: "lock" as const, label: "Paiement sécurisé" },
    settings.trustVerifiedPurchase && { icon: "check" as const, label: "Achat vérifié" },
    settings.trustEasyReturns && { icon: "arrowR" as const, label: "Retours faciles" },
  ].filter(Boolean) as { icon: string; label: string }[];

  if (badges.length === 0) return null;

  return (
    <div className="bottom-action-bar__trust">
      {badges.map((b) => (
        <span key={b.label} className="bottom-action-bar__trust-item">
          <Icon name={b.icon} size={10} color="var(--tone-green, #2F9E68)" stroke={2.5} />
          {b.label}
        </span>
      ))}
    </div>
  );
}
