"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ScrollRegion } from "@/components/layout/ScrollRegion";
import { SubHeader, GoldBtn } from "@/components/shared/ActionButtons";
import { Icon } from "@/components/shared/Icon";
import { formatOrderRef } from "@/lib/order-ref";
import {
  ORDER_STATUS_LABELS,
  carrierLabel,
  isTrackableStatus,
  resolveOrderTrackingUrl,
  type OrderStatus,
} from "@/lib/order-tracking";
import { getBrowserUser, getSupabase, isSupabaseConfigured } from "@/lib/supabase";

interface TrackingOrder {
  id: string;
  ref: string;
  status: OrderStatus;
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  createdAt: string;
}

function DeliveryProgress({ status }: { status: OrderStatus }) {
  const steps = ["Préparation", "Expédiée", "En livraison", "Livrée"];
  const step =
    status === "preparing" ? 0 : status === "shipped" ? 1 : status === "in_transit" ? 2 : status === "delivered" ? 3 : 0;

  return (
    <div style={{ padding: "8px 0 4px" }}>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {steps.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div
              key={s}
              style={{
                display: "flex",
                alignItems: "flex-start",
                flex: i < steps.length - 1 ? "1 1 auto" : "0 0 auto",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: active ? 14 : 10,
                    height: active ? 14 : 10,
                    borderRadius: "50%",
                    background: done ? "#7BC99A" : active ? "var(--gold)" : "rgba(255,255,255,.12)",
                    boxShadow: active ? "0 0 0 4px rgba(212,175,55,.2)" : "none",
                    flexShrink: 0,
                    marginTop: active ? 0 : 2,
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: active ? 700 : 400,
                    color: done ? "#7BC99A" : active ? "var(--gold)" : "var(--ink-mute)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    margin: "6px 6px 0",
                    borderRadius: 2,
                    background: done
                      ? "#7BC99A"
                      : active
                        ? "linear-gradient(90deg,#D4AF37 30%,rgba(255,255,255,.1) 100%)"
                        : "rgba(255,255,255,.1)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: "var(--r-md)",
        background: "var(--charcoal-2)",
        border: "1px solid rgba(255,255,255,.06)",
      }}
    >
      <p style={{ margin: 0, fontSize: 11, color: "var(--ink-mute)", letterSpacing: ".06em", textTransform: "uppercase" }}>
        {label}
      </p>
      <p style={{ margin: "6px 0 0", fontSize: 15, fontWeight: 600, color: "var(--ink)", wordBreak: "break-word" }}>
        {value}
      </p>
    </div>
  );
}

export function OrderTrackingScreen({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      setError("Service indisponible");
      setLoading(false);
      return;
    }

    const user = await getBrowserUser();
    if (!user) {
      setError("Connectez-vous pour suivre votre commande");
      setLoading(false);
      return;
    }

    const { data, error: fetchErr } = await getSupabase()
      .from("orders")
      .select("id, status, carrier, tracking_number, tracking_url, created_at")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchErr || !data) {
      setError("Commande introuvable");
      setLoading(false);
      return;
    }

    if (!isTrackableStatus(data.status as OrderStatus)) {
      setError("Le suivi n’est pas encore disponible pour cette commande");
      setLoading(false);
      return;
    }

    setOrder({
      id: data.id,
      ref: formatOrderRef(data.id),
      status: data.status as OrderStatus,
      carrier: data.carrier,
      trackingNumber: data.tracking_number,
      trackingUrl: data.tracking_url,
      createdAt: data.created_at,
    });
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const externalUrl = order
    ? resolveOrderTrackingUrl({
        trackingUrl: order.trackingUrl,
        carrier: order.carrier,
        trackingNumber: order.trackingNumber,
      })
    : null;

  const hasTrackingNumber = Boolean(order?.trackingNumber?.trim());
  const carrierName = carrierLabel(order?.carrier);

  return (
    <AppShell>
      <ScrollRegion variant="page" insetX={18}>
        <SubHeader title="Suivi de colis" backHref="/profile" />

        <div style={{ paddingBottom: 32, animation: "fadeUp .45s cubic-bezier(.22,.68,0,1) both" }}>
          {loading ? (
            <div
              style={{
                height: 280,
                borderRadius: "var(--r-lg)",
                background: "var(--charcoal)",
                border: "1px solid rgba(255,255,255,.05)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ) : error ? (
            <div
              style={{
                padding: 32,
                textAlign: "center",
                borderRadius: "var(--r-lg)",
                background: "var(--charcoal)",
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <Icon name="truck" size={36} color="var(--gold)" />
              <p style={{ margin: "16px 0 0", color: "var(--ink-soft)", fontSize: 14, lineHeight: 1.5 }}>{error}</p>
              <Link
                href="/profile"
                style={{
                  display: "inline-block",
                  marginTop: 20,
                  color: "var(--gold)",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Retour au profil
              </Link>
            </div>
          ) : order ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  padding: 20,
                  borderRadius: "var(--r-lg)",
                  background: "linear-gradient(135deg, #1c1610, #241a12)",
                  border: "1px solid rgba(212,175,55,.22)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    fontWeight: 700,
                  }}
                >
                  Commande
                </p>
                <h1 style={{ margin: "8px 0 0", fontSize: 24, fontWeight: 700, color: "var(--ink)" }}>
                  #{order.ref}
                </h1>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--ink-mute)" }}>
                  Passée le{" "}
                  {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div
                style={{
                  padding: 18,
                  borderRadius: "var(--r-lg)",
                  background: "var(--charcoal)",
                  border: "1px solid rgba(255,255,255,.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: "rgba(212,175,55,.12)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Icon name="truck" size={20} color="var(--gold)" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Statut actuel</p>
                    <p style={{ margin: "2px 0 0", fontSize: 14, color: "var(--gold)", fontWeight: 600 }}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </p>
                  </div>
                </div>
                <DeliveryProgress status={order.status} />
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                <DetailCard label="Transporteur" value={carrierName ?? "—"} />
                <DetailCard
                  label="Numéro de suivi"
                  value={
                    hasTrackingNumber ? (
                      order.trackingNumber
                    ) : (
                      <span style={{ color: "var(--ink-soft)", fontWeight: 500, fontSize: 14 }}>
                        Le numéro de suivi sera disponible prochainement.
                      </span>
                    )
                  }
                />
              </div>

              {externalUrl && hasTrackingNumber ? (
                <a href={externalUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <GoldBtn style={{ width: "100%", justifyContent: "center", gap: 8 }}>
                    <Icon name="arrowR" size={16} color="#1a1306" />
                    Voir le suivi complet
                  </GoldBtn>
                </a>
              ) : (
                <div
                  style={{
                    padding: 14,
                    borderRadius: "var(--r-md)",
                    background: "rgba(255,255,255,.04)",
                    border: "1px dashed rgba(255,255,255,.1)",
                    textAlign: "center",
                    fontSize: 13,
                    color: "var(--ink-mute)",
                    lineHeight: 1.5,
                  }}
                >
                  {hasTrackingNumber
                    ? "Le lien de suivi transporteur sera bientôt disponible."
                    : "Le numéro de suivi sera disponible prochainement."}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </ScrollRegion>
    </AppShell>
  );
}
