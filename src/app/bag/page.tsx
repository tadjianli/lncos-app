"use client";
/**
 * LN COS — Cart + Checkout pages
 * Payment: Stripe hosted checkout (redirect flow)
 */

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { SubHeader, PinkBtn, GoldBtn } from "@/components/shared/ActionButtons";
import { FadeImage } from "@/components/shared/FadeImage";
import { Icon } from "@/components/shared/Icon";
import { useStore } from "@/lib/store";
import { findVariantByName, resolveProductImage } from "@/lib/product-catalog";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { useLoyaltyStore } from "@/lib/stores/loyalty-store";
import { formatOrderRef } from "@/lib/order-ref";
import { getBrowserUser, isSupabaseConfigured, subscribeAuthChanges } from "@/lib/supabase";
import {
  useActiveShippingMethods,
  type ShippingMethod,
  type Promo,
  validatePromoCode,
  computePromoDiscount,
  promoGrantsFreeShipping,
} from "@/lib/admin-supabase";
import {
  computeShippingCost,
  filterEligibleShippingMethods,
  formatShippingPriceLabel,
  getShippingClientHints,
} from "@/lib/shipping-rules";
import {
  EMPTY_CHECKOUT_ADDRESS,
  toShippingAddressPayload,
  validateCheckoutAccountPasswords,
  validateCheckoutAddress,
  type CheckoutAddress,
  type CheckoutAddressFieldKey,
} from "@/lib/checkout-address";
import { loadCheckoutPrefill } from "@/lib/checkout-profile";
import { CheckoutAddressStep } from "@/components/checkout/CheckoutAddressStep";
import { CheckoutLoginModal } from "@/components/checkout/CheckoutLoginModal";
import { CheckoutAccountOffer } from "@/components/checkout/CheckoutAccountOffer";

/* ─── Pending checkout shape stored in sessionStorage ────────────── */
interface PendingCheckout {
  session_id: string;
  items: Array<{ id: string; name: string; price: number; qty: number; variant: string }>;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  promo_code?: string;
  total: number;
  shipping_address?: ReturnType<typeof toShippingAddressPayload>;
  customer_email?: string;
  create_account?: boolean;
  account_password?: string;
}

/* ─── Row helper ─────────────────────────────────────────────────── */
function Row({ l, r, gold, pink }: { l: string; r: string; gold?: boolean; pink?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
      <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{l}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: gold ? "var(--gold)" : pink ? "var(--pink)" : "var(--ink)" }}>
        {r}
      </span>
    </div>
  );
}

/* ─── Checkout steps ──────────────────────────────────────────────── */
function StepDelivery({
  methods,
  loading: methodsLoading,
  selected,
  onSelect,
  subtotal,
  promoFreeShipping,
}: {
  methods: ShippingMethod[];
  loading: boolean;
  selected: ShippingMethod | null;
  onSelect: (m: ShippingMethod) => void;
  subtotal: number;
  promoFreeShipping: boolean;
}) {
  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <h3 style={{ fontWeight: 600, fontSize: 19, color: "var(--ink)", margin: "0 0 16px" }}>
        Mode de livraison
      </h3>

      {methodsLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: 72, borderRadius: "var(--r-md)",
                background: "var(--charcoal)",
                border: "1px solid rgba(255,255,255,.07)",
                animation: `fadeUp .4s ease ${i * 0.06}s both`,
                opacity: 0.5,
              }}
            />
          ))}
        </div>
      ) : (methods ?? []).length === 0 ? (
        <div style={{ padding: "32px 0", textAlign: "center", color: "var(--ink-mute)", fontSize: 13 }}>
          Aucune méthode de livraison disponible.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(methods ?? []).map((m, i) => {
            const isSelected = selected?.id === m.id;
            const priceLabel = formatShippingPriceLabel(m, subtotal, promoFreeShipping);
            const hints = getShippingClientHints(m, subtotal);
            const subtitle = [m.estimatedDays || m.description, ...hints].filter(Boolean).join(" · ");
            return (
              <button
                key={m.id}
                onClick={() => onSelect(m)}
                style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "15px 16px",
                  borderRadius: "var(--r-md)", textAlign: "left",
                  background: isSelected ? "rgba(212,175,55,.08)" : "var(--charcoal)",
                  border: isSelected ? "1.5px solid var(--gold)" : "1px solid rgba(255,255,255,.07)",
                  width: "100%",
                  animation: `fadeUp .4s ease ${i * 0.06}s both`,
                  transition: "background .2s, border-color .2s",
                }}
              >
                <span style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(212,175,55,.1)", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                  <Icon name={m.icon as "truck"} size={20} color="var(--gold)" />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{m.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginTop: 2, lineHeight: 1.35 }}>{subtitle}</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: priceLabel === "Gratuit" ? "var(--gold)" : "var(--ink)", flexShrink: 0 }}>
                  {priceLabel}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StepPayment({ total }: { total: number }) {
  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <h3 style={{ fontWeight: 600, fontSize: 19, color: "var(--ink)", margin: "0 0 16px" }}>
        Paiement
      </h3>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "15px 16px",
          borderRadius: "var(--r-md)",
          background: "rgba(212,175,55,.08)",
          border: "1.5px solid var(--gold)",
          marginBottom: 20,
        }}
      >
        <span
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "rgba(212,175,55,.1)",
            display: "grid",
            placeItems: "center",
            flex: "0 0 auto",
          }}
        >
          <Icon name="card" size={20} color="var(--gold)" />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Carte bancaire</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginTop: 2 }}>
            Paiement sécurisé via Stripe Checkout
          </div>
        </div>
        <Icon name="check" size={18} color="var(--gold)" stroke={2.5} />
      </div>
      <div style={{ padding: 16, borderRadius: "var(--r-md)", background: "var(--charcoal)", border: "1px solid rgba(212,175,55,.2)" }}>
        <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 9, display: "flex", alignItems: "center", gap: 7 }}>
          <Icon name="sparkle" size={13} color="var(--gold)" /> Paiement 100% sécurisé · SSL · Stripe
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>Total : {total.toFixed(2)} €</div>
      </div>
    </div>
  );
}

function StepConfirm({ orderRef }: { orderRef: string }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 0", animation: "fadeUp .4s ease both" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--gold-grad)", display: "grid", placeItems: "center", margin: "0 auto 22px" }}>
        <Icon name="check" size={36} color="#1a1306" stroke={2.5} />
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", margin: "0 0 10px" }}>Commande confirmée !</h3>
      <p style={{ fontSize: 13, color: "var(--ink-mute)", lineHeight: 1.6, margin: "0 0 8px" }}>
        Votre commande <strong style={{ color: "var(--gold)" }}>#{orderRef}</strong> a bien été enregistrée.
      </p>
      <p style={{ fontSize: 12, color: "var(--ink-mute)", lineHeight: 1.5 }}>
        Vous recevrez une confirmation par email.
      </p>
    </div>
  );
}

/* ─── Confirming screen (loading / error) ────────────────────────── */
function ConfirmingScreen({
  error,
  onRetry,
  onBack,
}: {
  error: string | null;
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}>
      <div style={{ paddingTop: 4, flex: "0 0 auto" }}>
        <SubHeader title="Commande" onBack={onBack} />
      </div>
      <div style={{ flex: "1 1 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center" }}>
        {error ? (
          <>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(194,85,122,.12)", display: "grid", placeItems: "center", marginBottom: 22, border: "1px solid rgba(194,85,122,.25)" }}>
              <Icon name="x" size={30} color="var(--pink)" />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>Vérification échouée</div>
            <div style={{ fontSize: 13, color: "var(--ink-mute)", lineHeight: 1.6, marginBottom: 28, maxWidth: 280 }}>
              {error}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300 }}>
              <PinkBtn onClick={onRetry}>Réessayer</PinkBtn>
              <button
                onClick={onBack}
                style={{ padding: "14px", borderRadius: "var(--r-pill)", fontSize: 13.5, fontWeight: 600, color: "var(--ink-soft)", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.07)" }}
              >
                Retour au panier
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                width: 56, height: 56, borderRadius: "50%",
                border: "3px solid rgba(212,175,55,.18)",
                borderTopColor: "var(--gold)",
                animation: "spin 1s linear infinite",
                marginBottom: 24,
              }}
            />
            <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
              Vérification du paiement…
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-mute)" }}>
              Merci de patienter
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Confirmed screen ───────────────────────────────────────────── */
function ConfirmedScreen({ orderRef, onHome }: { orderRef: string; onHome: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}>
      <div style={{ paddingTop: 4, flex: "0 0 auto" }}>
        <SubHeader title="Commande" onBack={onHome} />
      </div>
      <div className="noscroll app-scroll-page scroll-region--x18 scroll-region--y4">
        <StepConfirm orderRef={orderRef} />
      </div>
      <div className="bottom-action-bar bottom-action-bar--in-shell">
        <GoldBtn icon="home" onClick={onHome}>Retour à l&apos;accueil</GoldBtn>
      </div>
    </div>
  );
}

/* ─── Cart screen ─────────────────────────────────────────────────── */
function CartScreen({
  onCheckout,
  appliedPromo,
  onApplyPromo,
  onRemovePromo,
}: {
  onCheckout: () => void;
  appliedPromo: Promo | null;
  onApplyPromo: (p: Promo) => void;
  onRemovePromo: () => void;
}) {
  const hydrated    = useStore((s) => s._storeHydrated);
  const cart        = useStore((s) => s.cart);
  const setQty      = useStore((s) => s.setQty);
  const removeItem  = useStore((s) => s.removeFromCart);
  const clearCart   = useStore((s) => s.clearCart);
  const openProduct = useStore((s) => s.openProduct);

  const [promoInput,   setPromoInput]   = useState(appliedPromo?.code ?? "");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError,   setPromoError]   = useState<string | null>(null);

  const { methods: shippingMethods } = useActiveShippingMethods();

  const subtotal     = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const discount     = appliedPromo ? computePromoDiscount(appliedPromo, subtotal) : 0;
  const freeShipping = appliedPromo ? promoGrantsFreeShipping(appliedPromo) : false;
  const eligibleShipping = useMemo(
    () => filterEligibleShippingMethods(shippingMethods, subtotal),
    [shippingMethods, subtotal]
  );
  const defaultShipping = eligibleShipping[0] ?? null;
  const shippingCost = defaultShipping
    ? computeShippingCost(defaultShipping, subtotal, freeShipping)
    : 0;
  const total        = subtotal - discount + shippingCost;

  async function handleApplyPromo() {
    const code = promoInput.trim();
    if (!code) return;
    setPromoLoading(true);
    setPromoError(null);
    const result = await validatePromoCode(code, subtotal);
    setPromoLoading(false);
    if ("error" in result) {
      setPromoError(result.error);
    } else {
      onApplyPromo(result.promo);
      setPromoError(null);
    }
  }

  function handleRemovePromo() {
    onRemovePromo();
    setPromoInput("");
    setPromoError(null);
  }

  if (!hydrated) {
    return (
      <>
        <div style={{ paddingTop: 4, flex: "0 0 auto" }}>
          <SubHeader title="Mon panier" />
        </div>
        <div style={{ flex: "1 1 auto", display: "grid", placeItems: "center" }}>
          <div
            className="skeleton"
            style={{ width: 140, height: 20, borderRadius: 8 }}
            aria-hidden
          />
        </div>
      </>
    );
  }

  if (cart.length === 0) {
    return (
      <>
        <div style={{ paddingTop: 4, flex: "0 0 auto" }}>
          <SubHeader title="Mon panier" />
        </div>
        <div style={{ flex: "1 1 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 40px var(--app-scroll-pad-bottom)", textAlign: "center" }}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: "var(--charcoal)", display: "grid", placeItems: "center", marginBottom: 22 }}>
            <Icon name="bag" size={38} color="var(--ink-mute)" />
          </div>
          <div style={{ fontWeight: 600, fontSize: 21, color: "var(--ink)", marginBottom: 8 }}>Votre panier est vide</div>
          <div style={{ fontSize: 13, color: "var(--ink-mute)", lineHeight: 1.5, marginBottom: 26 }}>
            Découvrez nos best-sellers et offrez-vous un moment de beauté.
          </div>
          <Link href="/boutique">
            <PinkBtn inline>Découvrir la boutique</PinkBtn>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ paddingTop: 4, flex: "0 0 auto" }}>
        <SubHeader
          title="Mon panier"
          right={
            <button
              type="button"
              onClick={() => {
                if (confirm("Vider tout le panier ?")) clearCart();
              }}
              aria-label="Vider le panier"
              style={{ display: "flex", alignItems: "center", padding: 4, background: "none", border: "none", cursor: "pointer" }}
            >
              <Icon name="trash" size={19} color="var(--ink-mute)" />
            </button>
          }
        />
      </div>

      <div className="noscroll bag-page-scroll checkout-flow">
        <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 14 }}>
          {cart.reduce((s, i) => s + i.qty, 0)} article{cart.reduce((s, i) => s + i.qty, 0) > 1 ? "s" : ""}
        </div>

        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {cart.map((it, i) => (
            <div
              key={it.key}
              style={{ display: "flex", gap: 13, padding: 11, borderRadius: "var(--r-md)", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.05)", animation: `fadeUp .4s ease ${i * 0.05}s both` }}
            >
              <button
                onClick={() => openProduct(it)}
                style={{ width: 78, height: 78, borderRadius: 14, flex: "0 0 auto", overflow: "hidden", position: "relative", background: "#181818" }}
              >
                {(() => {
                  const thumb = resolveProductImage(it, findVariantByName(it, it.variant));
                  return thumb ? (
                    <FadeImage src={thumb} alt={it.name} fill sizes="78px" style={{ objectFit: "cover" }} />
                  ) : (
                    <ProductImagePlaceholder label={it.name} />
                  );
                })()}
              </button>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", lineHeight: 1.25 }}>{it.name}</div>
                    <button onClick={() => removeItem(it.key)} style={{ color: "var(--ink-mute)", flex: "0 0 auto" }}>
                      <Icon name="x" size={16} />
                    </button>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginTop: 3 }}>{it.variant}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{it.price.toFixed(2)} €</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--charcoal-2)", borderRadius: "var(--r-pill)", padding: 3 }}>
                    <button onClick={() => setQty(it.key, it.qty - 1)} style={{ width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center", color: "var(--ink)", background: "#000" }}>
                      <Icon name="minus" size={13} />
                    </button>
                    <span style={{ minWidth: 18, textAlign: "center", fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{it.qty}</span>
                    <button onClick={() => setQty(it.key, it.qty + 1)} style={{ width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center", color: "#3a1020", background: "var(--pink)" }}>
                      <Icon name="plus" size={13} stroke={2.4} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Promo */}
        <div style={{ display: "flex", gap: 9, marginTop: 18 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, background: "var(--charcoal)", borderRadius: "var(--r-pill)", padding: "12px 16px", border: appliedPromo ? "1px solid rgba(123,201,154,.3)" : "1px solid rgba(255,255,255,.06)" }}>
            <Icon name="tag" size={16} color={appliedPromo ? "#7BC99A" : "var(--gold)"} />
            <input
              value={promoInput}
              onChange={(e) => { setPromoInput(e.target.value); setPromoError(null); }}
              onKeyDown={(e) => e.key === "Enter" && !appliedPromo && handleApplyPromo()}
              placeholder="Code promo"
              disabled={!!appliedPromo}
              className="lncos-form-control lncos-form-control--inline"
              style={{ opacity: appliedPromo ? 0.7 : 1 }}
            />
          </div>
          {appliedPromo ? (
            <button
              onClick={handleRemovePromo}
              style={{ padding: "0 18px", borderRadius: "var(--r-pill)", background: "rgba(194,85,122,.1)", color: "var(--pink)", fontWeight: 600, fontSize: 13, border: "1px solid rgba(194,85,122,.3)" }}
            >
              Retirer
            </button>
          ) : (
            <button
              onClick={handleApplyPromo}
              disabled={promoLoading || !promoInput.trim()}
              style={{ padding: "0 22px", borderRadius: "var(--r-pill)", background: "var(--charcoal-2)", color: "var(--gold)", fontWeight: 600, fontSize: 13, border: "1px solid rgba(212,175,55,.3)", opacity: promoLoading || !promoInput.trim() ? 0.5 : 1 }}
            >
              {promoLoading ? "…" : "Appliquer"}
            </button>
          )}
        </div>
        {appliedPromo && (
          <div style={{ fontSize: 11.5, color: "#7BC99A", marginTop: 9, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="check" size={13} color="#7BC99A" />
            Code <strong style={{ letterSpacing: ".04em" }}>{appliedPromo.code}</strong> appliqué
            {discount > 0 && ` · -${discount.toFixed(2)} €`}
            {freeShipping && " · Livraison offerte"}
          </div>
        )}
        {promoError && (
          <div style={{ fontSize: 11.5, color: "var(--pink)", marginTop: 9, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="x" size={13} color="var(--pink)" /> {promoError}
          </div>
        )}

        {/* Summary */}
        <div style={{ marginTop: 22, padding: 18, borderRadius: "var(--r-md)", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.05)" }}>
          <Row l="Sous-total" r={`${subtotal.toFixed(2)} €`} />
          {appliedPromo && discount > 0 && (
            <Row
              l={`${appliedPromo.code} (${appliedPromo.type === "percentage" ? `-${appliedPromo.value}%` : `-${appliedPromo.value.toFixed(2)} €`})`}
              r={`-${discount.toFixed(2)} €`}
              pink
            />
          )}
          <Row
            l="Livraison"
            r={freeShipping ? "Gratuit" : shippingCost === 0 ? (defaultShipping?.isFree ? "Gratuit" : "À choisir") : `${shippingCost.toFixed(2)} €`}
            gold={freeShipping || (shippingCost === 0 && !!defaultShipping?.isFree)}
          />
          <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "12px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>Total</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)" }}>{total.toFixed(2)} €</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 11, color: "var(--ink-mute)" }}>
            <Icon name="truck" size={14} color="var(--ink-mute)" />
            {defaultShipping
              ? `Livraison ${defaultShipping.name} · ${defaultShipping.estimatedDays}`
              : "Livraison calculée à l'étape suivante"}
          </div>
        </div>
      </div>

      <div className="bottom-action-bar bottom-action-bar--in-shell">
        <PinkBtn icon="arrowR" onClick={onCheckout}>
          Passer la commande · {total.toFixed(2)} €
        </PinkBtn>
      </div>
    </>
  );
}

/* ─── Checkout screen ─────────────────────────────────────────────── */
function CheckoutScreen({ onBack, appliedPromo }: { onBack: () => void; appliedPromo: Promo | null }) {
  const [step, setStep]         = useState(0);
  const [placing, setPlacing]   = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
  const [address, setAddress] = useState<CheckoutAddress>(EMPTY_CHECKOUT_ADDRESS);
  const [addressErrors, setAddressErrors] = useState<Partial<Record<CheckoutAddressFieldKey, string>>>({});
  const [addressSubmitted, setAddressSubmitted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");
  const [accountPasswordConfirm, setAccountPasswordConfirm] = useState("");
  const [accountSubmitted, setAccountSubmitted] = useState(false);
  const [accountErrors, setAccountErrors] = useState<{ password?: string; confirm?: string }>({});

  const applyPrefill = async (userId: string) => {
    const prefill = await loadCheckoutPrefill(userId);
    setAddress((prev) => ({
      email: prefill.email ?? prev.email,
      firstName: prefill.firstName ?? prev.firstName,
      lastName: prefill.lastName ?? prev.lastName,
      address: prefill.address ?? prev.address,
      zip: prefill.zip ?? prev.zip,
      city: prefill.city ?? prev.city,
      phone: prefill.phone ?? prev.phone,
    }));
    setCreateAccount(false);
    setAccountPassword("");
    setAccountPasswordConfirm("");
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    void getBrowserUser().then(async (user) => {
      if (!user) {
        setIsLoggedIn(false);
        return;
      }
      setIsLoggedIn(true);
      await applyPrefill(user.id);
    });

    return subscribeAuthChanges(async () => {
      const user = await getBrowserUser();
      if (!user) {
        setIsLoggedIn(false);
        return;
      }
      setIsLoggedIn(true);
      await applyPrefill(user.id);
    });
  }, []);

  const patchAddress = (patch: Partial<CheckoutAddress>) => {
    setAddress((prev) => ({ ...prev, ...patch }));
  };

  const { methods: shippingMethodsRaw, loading: shippingLoading } = useActiveShippingMethods();
  const shippingMethods = shippingMethodsRaw ?? [];

  const cart = useStore((s) => s.cart);

  const subtotal     = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const discount     = appliedPromo ? computePromoDiscount(appliedPromo, subtotal) : 0;
  const freeShipping = appliedPromo ? promoGrantsFreeShipping(appliedPromo) : false;
  const eligibleShipping = useMemo(
    () => filterEligibleShippingMethods(shippingMethods, subtotal),
    [shippingMethods, subtotal]
  );

  useEffect(() => {
    if (eligibleShipping.length === 0) {
      setSelectedShipping(null);
      return;
    }
    if (!selectedShipping || !eligibleShipping.some((m) => m.id === selectedShipping.id)) {
      setSelectedShipping(eligibleShipping[0]);
    }
  }, [eligibleShipping, selectedShipping]);

  const shippingCost = selectedShipping
    ? computeShippingCost(selectedShipping, subtotal, freeShipping)
    : 0;
  const total        = subtotal - discount + shippingCost;

  const steps = ["Adresse", "Livraison", "Paiement", "Confirmation"];

  const next = async () => {
    if (step === 0) {
      const errors = validateCheckoutAddress(address);
      let pwdErrors: { password?: string; confirm?: string } = {};
      if (!isLoggedIn && createAccount) {
        pwdErrors = validateCheckoutAccountPasswords(accountPassword, accountPasswordConfirm);
      }
      if (Object.keys(errors).length > 0 || Object.keys(pwdErrors).length > 0) {
        setAddressErrors(errors);
        setAccountErrors(pwdErrors);
        setAddressSubmitted(true);
        setAccountSubmitted(true);
        return;
      }
      setAddressErrors({});
      setAccountErrors({});
      setAddressSubmitted(false);
      setAccountSubmitted(false);
      setStep(1);
      return;
    }

    if (step === 2) {
      // ── Initiate Stripe hosted checkout ────────────────────────────
      setPlacing(true);
      setPayError(null);

      try {
        const items = cart.map((it) => ({
          id: it.id,
          name: it.name,
          price: it.price,
          qty: it.qty,
          variant: it.variant ?? "",
        }));

        const shippingPayload = toShippingAddressPayload(address);

        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            subtotal,
            shipping_cost: shippingCost,
            shipping_method_name: selectedShipping?.name,
            shipping_address: shippingPayload,
            customer_email: address.email.trim(),
            discount,
            ...(appliedPromo ? { promo_code: appliedPromo.code } : {}),
            total,
            returnUrl: window.location.origin,
          }),
        });
        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error ?? "Initialisation du paiement échouée");
        }

        // Store snapshot in sessionStorage before Stripe redirect
        const snapshot: PendingCheckout = {
          session_id: data.session_id,
          items,
          subtotal,
          shipping_cost: shippingCost,
          discount,
          ...(appliedPromo ? { promo_code: appliedPromo.code } : {}),
          total,
          shipping_address: shippingPayload,
          customer_email: address.email.trim(),
          ...(!isLoggedIn && createAccount && accountPassword
            ? { create_account: true, account_password: accountPassword }
            : {}),
        };
        sessionStorage.setItem("lncos-pending-checkout", JSON.stringify(snapshot));

        // Redirect to Stripe hosted checkout page
        window.location.href = data.session_url;
      } catch (err) {
        sessionStorage.removeItem("lncos-pending-checkout");
        setPayError(err instanceof Error ? err.message : "Erreur lors de l'initialisation du paiement");
        setPlacing(false);
      }
    } else if (step < 3) {
      setStep(step + 1);
    }
  };

  const back = () => {
    if (step === 0) onBack();
    else setStep(step - 1);
  };

  return (
    <>
      {/* Stripe redirect loading overlay */}
      {placing && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(10,10,10,.97)", display: "grid", placeItems: "center", backdropFilter: "blur(12px)" }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 56, height: 56, borderRadius: "50%",
                border: "3px solid rgba(212,175,55,.18)",
                borderTopColor: "var(--gold)",
                animation: "spin 1s linear infinite",
                margin: "0 auto 22px",
              }}
            />
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Initialisation du paiement…</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-mute)" }}>Redirection vers Stripe</div>
          </div>
        </div>
      )}

      <div style={{ paddingTop: 4, flex: "0 0 auto" }}>
        <SubHeader title="Commande" onBack={back} />
      </div>

      {/* Stepper */}
      <div style={{ display: "flex", alignItems: "center", padding: "0 24px 18px", flex: "0 0 auto" }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 3 ? "1" : "0 0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700, background: i < step ? "var(--gold-grad)" : i === step ? "rgba(212,175,55,.15)" : "var(--charcoal)", color: i < step ? "#1a1306" : i === step ? "var(--gold)" : "var(--ink-mute)", border: i === step ? "1.5px solid var(--gold)" : "1px solid rgba(255,255,255,.06)" }}>
                {i < step ? <Icon name="check" size={14} color="#1a1306" stroke={2.5} /> : i + 1}
              </div>
              <span style={{ fontSize: 9, color: i <= step ? "var(--gold)" : "var(--ink-mute)", fontWeight: 600, whiteSpace: "nowrap" }}>{s}</span>
            </div>
            {i < 3 && <div style={{ flex: 1, height: 1.5, background: i < step ? "var(--gold)" : "rgba(255,255,255,.1)", margin: "0 4px", marginBottom: 18 }} />}
          </div>
        ))}
      </div>

      <div className="noscroll app-scroll-page scroll-region--x18 scroll-region--y4 checkout-flow">
        {step === 0 && (
          <CheckoutAddressStep
            value={address}
            onChange={patchAddress}
            errors={addressErrors}
            showErrors={addressSubmitted}
            isLoggedIn={isLoggedIn}
            onOpenLogin={() => setLoginOpen(true)}
          />
        )}
        {step === 1 && (
          <StepDelivery
            methods={eligibleShipping}
            loading={shippingLoading}
            selected={selectedShipping}
            onSelect={setSelectedShipping}
            subtotal={subtotal}
            promoFreeShipping={freeShipping}
          />
        )}
        {step === 2 && <StepPayment total={total} />}
      </div>

      {/* Error banner */}
      {payError && !placing && (
        <div style={{ flex: "0 0 auto", margin: "0 16px", padding: "12px 16px", borderRadius: "var(--r-md)", background: "rgba(194,85,122,.1)", border: "1px solid rgba(194,85,122,.25)", display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="x" size={16} color="var(--pink)" />
          <span style={{ fontSize: 12.5, color: "var(--pink)", flex: 1, lineHeight: 1.4 }}>{payError}</span>
        </div>
      )}

      {step === 0 && !isLoggedIn ? (
        <div className="checkout-account-offer-wrap">
          <CheckoutAccountOffer
            checked={createAccount}
            onCheckedChange={setCreateAccount}
            password={accountPassword}
            confirmPassword={accountPasswordConfirm}
            onPasswordChange={setAccountPassword}
            onConfirmChange={setAccountPasswordConfirm}
            showErrors={accountSubmitted}
            passwordError={accountErrors.password}
            confirmError={accountErrors.confirm}
          />
        </div>
      ) : null}

      <CheckoutLoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => {
          void getBrowserUser().then(async (user) => {
            if (!user) return;
            setIsLoggedIn(true);
            await applyPrefill(user.id);
          });
        }}
      />

      <div className="bottom-action-bar bottom-action-bar--in-shell">
        <PinkBtn icon={step === 2 ? "check" : "arrowR"} onClick={next} disabled={placing}>
          {placing ? "Initialisation…" : step === 2 ? `Payer ${total.toFixed(2)} €` : "Continuer"}
        </PinkBtn>
      </div>
    </>
  );
}

/* ─── Page ────────────────────────────────────────────────────────── */
type Screen = "cart" | "checkout" | "confirming" | "confirmed";

export default function BagPage() {
  const [screen,        setScreen]        = useState<Screen>("cart");
  const [confirmedRef,  setConfirmedRef]  = useState("LN-……");
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [pendingId,     setPendingId]     = useState<string | null>(null);
  const [appliedPromo,  setAppliedPromo]  = useState<Promo | null>(null);

  const clearCart  = useStore((s) => s.clearCart);
  const earnPoints = useLoyaltyStore((s) => s.earnPoints);

  /** Verify the Stripe session server-side and create the Supabase order. */
  const completeStripeOrder = async (sessionId: string) => {
    const raw     = sessionStorage.getItem("lncos-pending-checkout");
    const pending: PendingCheckout | null = raw ? JSON.parse(raw) : null;

    setCompleteError(null);
    setScreen("confirming");

    try {
      const res = await fetch("/api/stripe/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          items:         pending?.items         ?? [],
          subtotal:      pending?.subtotal       ?? 0,
          shipping_cost: pending?.shipping_cost  ?? 0,
          discount:      pending?.discount       ?? 0,
          ...(pending?.promo_code ? { promo_code: pending.promo_code } : {}),
          total:         pending?.total          ?? 0,
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error ?? "Vérification du paiement échouée");
      }

      if (pending?.create_account && pending.account_password) {
        try {
          await fetch("/api/checkout/create-account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: sessionId,
              password: pending.account_password,
              email: pending.customer_email ?? "",
            }),
          });
        } catch (accountErr) {
          console.warn("[checkout] create-account after payment:", accountErr);
        }
      }

      sessionStorage.removeItem("lncos-pending-checkout");
      clearCart();

      const pts = Math.floor((pending?.total ?? 0) * 2);
      if (pts > 0) {
        const ref = formatOrderRef(data.ref ?? data.id);
        earnPoints(pts, `Commande #${ref}`, data.id);
      }

      setConfirmedRef(formatOrderRef(data.ref ?? data.id));
      setScreen("confirmed");
    } catch (err) {
      setCompleteError(err instanceof Error ? err.message : "Erreur de vérification du paiement");
    }
  };

  // Detect Stripe return — reads ?stripe_session_id from URL on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const sessionId = params.get("stripe_session_id");
    const cancelled = params.get("payment_cancelled");

    if (sessionId) {
      // Clean URL immediately
      window.history.replaceState({}, "", "/bag");
      setPendingId(sessionId);
      completeStripeOrder(sessionId);
    } else if (cancelled) {
      window.history.replaceState({}, "", "/bag");
      sessionStorage.removeItem("lncos-pending-checkout");
      // Stay on cart screen, user can retry
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const retryComplete = () => {
    const id = pendingId ?? ((): string | null => {
      try { return JSON.parse(sessionStorage.getItem("lncos-pending-checkout") ?? "{}").session_id ?? null; }
      catch { return null; }
    })();
    if (id) completeStripeOrder(id);
    else setScreen("cart");
  };

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}>
        {screen === "cart" && (
          <CartScreen
            onCheckout={() => setScreen("checkout")}
            appliedPromo={appliedPromo}
            onApplyPromo={setAppliedPromo}
            onRemovePromo={() => setAppliedPromo(null)}
          />
        )}
        {screen === "checkout" && (
          <CheckoutScreen onBack={() => setScreen("cart")} appliedPromo={appliedPromo} />
        )}
        {screen === "confirming" && (
          <ConfirmingScreen
            error={completeError}
            onRetry={retryComplete}
            onBack={() => {
              setCompleteError(null);
              setScreen("cart");
            }}
          />
        )}
        {screen === "confirmed" && (
          <ConfirmedScreen
            orderRef={confirmedRef}
            onHome={() => { window.location.href = "/"; }}
          />
        )}
      </div>
    </AppShell>
  );
}
