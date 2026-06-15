"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { formatOrderRef } from "@/lib/order-ref";
import {
  ORDER_CARRIERS,
  buildCarrierTrackingUrl,
  resolveOrderTrackingUrl,
} from "@/lib/order-tracking";

export type OrderStatus = "preparing" | "shipped" | "in_transit" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "refunded";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  variant: string | null;
}

export interface ShippingAddressRow {
  firstName?: string;
  lastName?: string;
  address?: string;
  zip?: string;
  city?: string;
  phone?: string;
  email?: string;
}

export interface AdminOrder {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  promo_code: string | null;
  total: number;
  tracking_number: string | null;
  carrier: string | null;
  tracking_url: string | null;
  shipping_address: ShippingAddressRow | null;
  stripe_session_id: string | null;
  payment_provider: string;
  confirmation_email_sent_at: string | null;
  shipped_email_sent_at: string | null;
  estimated_delivery: string | null;
  delivered_at: string | null;
  created_at: string;
  order_items: OrderItem[];
}

export const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  preparing:  { label: "En préparation", color: "var(--tone-blue)",   bg: "rgba(59,125,216,.1)" },
  shipped:    { label: "Expédié",         color: "var(--tone-orange)", bg: "rgba(199,122,51,.1)" },
  in_transit: { label: "En transit",      color: "var(--tone-orange)", bg: "rgba(199,122,51,.1)" },
  delivered:  { label: "Livré",           color: "var(--tone-green)",  bg: "rgba(47,158,104,.1)" },
  cancelled:  { label: "Annulé",          color: "var(--tone-pink)",   bg: "rgba(194,85,122,.1)" },
};

export const PAY_META: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
  paid:     { label: "Payé",       color: "var(--tone-green)",  bg: "rgba(47,158,104,.1)" },
  pending:  { label: "En attente", color: "var(--tone-orange)", bg: "rgba(199,122,51,.1)" },
  refunded: { label: "Remboursé",  color: "var(--tone-pink)",   bg: "rgba(194,85,122,.1)" },
};

export const STATUS_OPTIONS: OrderStatus[] = ["preparing", "shipped", "in_transit", "delivered", "cancelled"];

export function formatShippingAddress(addr: ShippingAddressRow | null): string | null {
  if (!addr) return null;
  const name = [addr.firstName, addr.lastName].filter(Boolean).join(" ");
  const line = [addr.address, [addr.zip, addr.city].filter(Boolean).join(" "), addr.phone]
    .filter(Boolean)
    .join(" · ");
  return [name, line].filter(Boolean).join(" — ");
}

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtShort(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="adm-order-detail-row">
      <span className="adm-order-detail-label">{label}</span>
      <span className="adm-order-detail-value">{value}</span>
    </div>
  );
}

export interface OrderSavePayload {
  status: OrderStatus;
  trackingNumber: string | null;
  carrier: string | null;
  trackingUrl: string | null;
}

interface OrderDetailModalProps {
  order: AdminOrder;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: OrderSavePayload) => void;
}

function resolveCarrierSelectValue(carrier: string | null): { select: string; custom: string } {
  if (!carrier?.trim()) return { select: "", custom: "" };
  const preset = ORDER_CARRIERS.find((c) => c.id === carrier);
  if (preset && preset.id !== "other") return { select: preset.id, custom: "" };
  const byLabel = ORDER_CARRIERS.find((c) => c.label.toLowerCase() === carrier.toLowerCase());
  if (byLabel && byLabel.id !== "other") return { select: byLabel.id, custom: "" };
  return { select: "other", custom: carrier };
}

export function OrderDetailModal({ order, saving, onClose, onSave }: OrderDetailModalProps) {
  const initialCarrier = resolveCarrierSelectValue(order.carrier);
  const [status, setStatus] = useState(order.status);
  const [tracking, setTracking] = useState(order.tracking_number ?? "");
  const [carrierSelect, setCarrierSelect] = useState(initialCarrier.select);
  const [carrierCustom, setCarrierCustom] = useState(initialCarrier.custom);
  const [trackingUrl, setTrackingUrl] = useState(order.tracking_url ?? "");

  useEffect(() => {
    const next = resolveCarrierSelectValue(order.carrier);
    setStatus(order.status);
    setTracking(order.tracking_number ?? "");
    setCarrierSelect(next.select);
    setCarrierCustom(next.custom);
    setTrackingUrl(order.tracking_url ?? "");
  }, [order]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sm = STATUS_META[order.status];
  const pm = PAY_META[order.payment_status];
  const ref = formatOrderRef(order.id);
  const items = order.order_items ?? [];
  const shippingLine = formatShippingAddress(order.shipping_address);
  const addr = order.shipping_address;

  function handleSave() {
    const trackingNumber = tracking.trim() || null;
    const carrier =
      carrierSelect === "other"
        ? carrierCustom.trim() || null
        : carrierSelect.trim() || null;
    const resolvedUrl =
      trackingUrl.trim() ||
      buildCarrierTrackingUrl(carrier, trackingNumber) ||
      null;

    onSave({
      status,
      trackingNumber,
      carrier,
      trackingUrl: resolvedUrl,
    });
  }

  const previewUrl = resolveOrderTrackingUrl({
    trackingUrl,
    carrier: carrierSelect === "other" ? carrierCustom : carrierSelect,
    trackingNumber: tracking,
  });

  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div
        className="ab-modal ab-modal-wide adm-order-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
      >
        <div className="ab-modal-head">
          <div>
            <div className="ab-modal-title" id="order-detail-title">
              Commande {ref}
            </div>
            <div className="mono" style={{ fontSize: 11, marginTop: 4, color: "var(--adm-ink-mute)" }}>
              {order.id}
            </div>
          </div>
          <button type="button" className="adm-iconbtn" onClick={onClose} aria-label="Fermer">
            <Icon name="x" size={17} />
          </button>
        </div>

        <div className="adm-order-modal__body">
        <div className="adm-order-detail-meta">
          <span className="adm-badge" style={{ color: pm.color, background: pm.bg }}>{pm.label}</span>
          <span className="adm-badge" style={{ color: sm.color, background: sm.bg }}>{sm.label}</span>
          <span className="adm-order-detail-date">{fmtDate(order.created_at)}</span>
        </div>

        <div className="adm-order-detail-grid">
          <section className="adm-order-detail-block">
            <h3 className="adm-order-detail-heading">Livraison</h3>
            {shippingLine ? (
              <p className="adm-order-detail-text">{shippingLine}</p>
            ) : (
              <p className="adm-order-detail-muted">Adresse non renseignée</p>
            )}
            {addr?.email && (
              <DetailRow
                label="Email"
                value={
                  <a href={`mailto:${addr.email}`} style={{ color: "var(--adm-gold)" }}>
                    {addr.email}
                  </a>
                }
              />
            )}
          </section>

          <section className="adm-order-detail-block">
            <h3 className="adm-order-detail-heading">Récapitulatif</h3>
            <DetailRow label="Sous-total" value={`${Number(order.subtotal).toFixed(2)} €`} />
            <DetailRow label="Livraison" value={`${Number(order.shipping_cost).toFixed(2)} €`} />
            {Number(order.discount) > 0 && (
              <DetailRow
                label={order.promo_code ? `Promo (${order.promo_code})` : "Remise"}
                value={<span style={{ color: "var(--tone-green)" }}>−{Number(order.discount).toFixed(2)} €</span>}
              />
            )}
            <DetailRow
              label="Total"
              value={<strong style={{ fontSize: 15 }}>{Number(order.total).toFixed(2)} €</strong>}
            />
          </section>
        </div>

        <section className="adm-order-detail-block">
          <h3 className="adm-order-detail-heading">
            Articles ({items.length})
          </h3>
          {items.length === 0 ? (
            <p className="adm-order-detail-warning">
              Aucun article enregistré — vérifier la commande Stripe
            </p>
          ) : (
            <ul className="adm-order-items-list">
              {items.map((it) => (
                <li key={it.id} className="adm-order-item">
                  <div>
                    <span className="adm-order-item-qty">{it.qty}×</span> {it.name}
                    {it.variant ? <span className="adm-order-item-variant"> ({it.variant})</span> : null}
                  </div>
                  <span className="adm-order-item-price">{(Number(it.price) * it.qty).toFixed(2)} €</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="adm-order-detail-grid">
          <section className="adm-order-detail-block">
            <h3 className="adm-order-detail-heading">Suivi & statut</h3>
            <div className="ab-field" style={{ marginBottom: 10 }}>
              <label>Statut</label>
              <select
                className="adm-select"
                value={status}
                disabled={saving}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STATUS_META[s].label}</option>
                ))}
              </select>
            </div>
            <div className="ab-field" style={{ marginBottom: 10 }}>
              <label>Transporteur</label>
              <select
                className="adm-select"
                value={carrierSelect}
                disabled={saving}
                onChange={(e) => setCarrierSelect(e.target.value)}
              >
                <option value="">— Sélectionner —</option>
                {ORDER_CARRIERS.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            {carrierSelect === "other" && (
              <div className="ab-field" style={{ marginBottom: 10 }}>
                <label>Nom du transporteur</label>
                <input
                  className="ab-input"
                  value={carrierCustom}
                  disabled={saving}
                  onChange={(e) => setCarrierCustom(e.target.value)}
                  placeholder="Nom du transporteur"
                />
              </div>
            )}
            <div className="ab-field" style={{ marginBottom: 10 }}>
              <label>N° de suivi</label>
              <input
                className="ab-input"
                value={tracking}
                disabled={saving}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="Ex. 8R12345678901"
              />
            </div>
            <div className="ab-field" style={{ marginBottom: 0 }}>
              <label>URL de suivi (optionnel)</label>
              <input
                className="ab-input"
                value={trackingUrl}
                disabled={saving}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://…"
              />
              {previewUrl && (
                <p className="adm-order-detail-muted" style={{ marginTop: 8, fontSize: 11 }}>
                  Lien client :{" "}
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--adm-gold)" }}>
                    Voir le suivi
                  </a>
                </p>
              )}
            </div>
          </section>

          <section className="adm-order-detail-block">
            <h3 className="adm-order-detail-heading">Notifications & technique</h3>
            <DetailRow
              label="Email confirmation"
              value={order.confirmation_email_sent_at ? fmtShort(order.confirmation_email_sent_at) : "Non envoyé"}
            />
            <DetailRow
              label="Email expédition"
              value={order.shipped_email_sent_at ? fmtShort(order.shipped_email_sent_at) : "Non envoyé"}
            />
            <DetailRow label="Paiement" value={order.payment_provider || "—"} />
            {order.stripe_session_id && (
              <DetailRow
                label="Stripe"
                value={<span className="mono">{order.stripe_session_id.slice(0, 24)}…</span>}
              />
            )}
            {order.estimated_delivery && (
              <DetailRow label="Livraison estimée" value={fmtShort(order.estimated_delivery)} />
            )}
            {order.delivered_at && (
              <DetailRow label="Livré le" value={fmtShort(order.delivered_at)} />
            )}
          </section>
        </div>

        <div className="adm-order-detail-actions">
          <button type="button" className="adm-btn ghost" onClick={onClose} disabled={saving}>
            Fermer
          </button>
          <button
            type="button"
            className="adm-btn gold"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
