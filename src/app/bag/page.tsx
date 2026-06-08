"use client";
/**
 * LN COS — Cart + Checkout pages (from handoff screens-cart.jsx)
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { SubHeader, PinkBtn, GoldBtn } from "@/components/shared/ActionButtons";
import { Icon } from "@/components/shared/Icon";
import { useStore } from "@/lib/store";

/* ─── Row helper ─────────────────────────────────────────────── */
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

/* ─── Checkout steps ─────────────────────────────────────────── */
function StepAddress() {
  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <h3 style={{ fontWeight: 600, fontSize: 19, color: "var(--ink)", margin: "0 0 16px" }}>
        Adresse de livraison
      </h3>
      {[
        ["Prénom", "Emma", true], ["Nom", "Dubois", true],
        ["Adresse", "24 rue de la Beauté", false],
        ["Code postal", "75008", true], ["Ville", "Paris", true],
        ["Téléphone", "+33 6 12 34 56 78", false],
      ].map(([label, value, half]) => (
        <div key={label as string} style={{ flex: half ? "1 1 0" : "1 1 100%", marginBottom: 14, display: "inline-block", width: half ? "calc(50% - 6px)" : "100%", marginRight: half ? "12px" : 0 }}>
          <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginBottom: 7, fontWeight: 500 }}>{label}</div>
          <div style={{ padding: "13px 16px", borderRadius: "var(--r-sm)", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.07)", color: "var(--ink)", fontSize: 13.5 }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function StepDelivery() {
  const [sel, setSel] = useState("express");
  const opts = [
    { id: "standard", t: "Standard",     s: "3-5 jours ouvrés",     p: "Gratuit", i: "truck" },
    { id: "express",  t: "Express",       s: "24-48h · suivi inclus", p: "6,90 €",  i: "flame" },
    { id: "relais",   t: "Point relais",  s: "à proximité · 3-4 jours", p: "2,90 €",  i: "pin"   },
  ];
  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <h3 style={{ fontWeight: 600, fontSize: 19, color: "var(--ink)", margin: "0 0 16px" }}>
        Mode de livraison
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {opts.map((o) => (
          <button
            key={o.id}
            onClick={() => setSel(o.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "15px 16px",
              borderRadius: "var(--r-md)",
              textAlign: "left",
              background: sel === o.id ? "rgba(212,175,55,.08)" : "var(--charcoal)",
              border: sel === o.id ? "1.5px solid var(--gold)" : "1px solid rgba(255,255,255,.07)",
              width: "100%",
            }}
          >
            <span style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(212,175,55,.1)", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
              <Icon name={o.i} size={20} color="var(--gold)" />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{o.t}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginTop: 2 }}>{o.s}</div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: o.p === "Gratuit" ? "var(--gold)" : "var(--ink)" }}>{o.p}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepPayment({ total }: { total: number }) {
  const [pay, setPay] = useState("card");
  const methods = [
    { id: "card",   t: "Carte bancaire", s: "•••• 4242",            i: "card" },
    { id: "apple",  t: "Apple Pay",      s: "paiement express",     i: "sparkle" },
    { id: "paypal", t: "PayPal",         s: "emma.d@email.com",     i: "card" },
  ];
  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <h3 style={{ fontWeight: 600, fontSize: 19, color: "var(--ink)", margin: "0 0 16px" }}>
        Paiement
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {methods.map((m) => (
          <button key={m.id} onClick={() => setPay(m.id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 16px", borderRadius: "var(--r-md)", textAlign: "left", background: pay === m.id ? "rgba(212,175,55,.08)" : "var(--charcoal)", border: pay === m.id ? "1.5px solid var(--gold)" : "1px solid rgba(255,255,255,.07)", width: "100%" }}>
            <span style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(212,175,55,.1)", display: "grid", placeItems: "center", flex: "0 0 auto" }}><Icon name={m.i} size={20} color="var(--gold)" /></span>
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{m.t}</div><div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginTop: 2 }}>{m.s}</div></div>
            {pay === m.id && <Icon name="check" size={18} color="var(--gold)" stroke={2.5} />}
          </button>
        ))}
      </div>
      <div style={{ padding: 16, borderRadius: "var(--r-md)", background: "var(--charcoal)", border: "1px solid rgba(212,175,55,.2)" }}>
        <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 9, display: "flex", alignItems: "center", gap: 7 }}><Icon name="sparkle" size={13} color="var(--gold)" /> Paiement 100% sécurisé · SSL</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>Total : {total.toFixed(2)} €</div>
      </div>
    </div>
  );
}

function StepConfirm() {
  return (
    <div style={{ textAlign: "center", padding: "40px 0", animation: "fadeUp .4s ease both" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--gold-grad)", display: "grid", placeItems: "center", margin: "0 auto 22px" }}>
        <Icon name="check" size={36} color="#1a1306" stroke={2.5} />
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", margin: "0 0 10px" }}>Commande confirmée !</h3>
      <p style={{ fontSize: 13, color: "var(--ink-mute)", lineHeight: 1.6, margin: "0 0 8px" }}>
        Merci Emma, votre commande <strong style={{ color: "var(--gold)" }}>#LN-2484</strong> a bien été enregistrée.
      </p>
      <p style={{ fontSize: 12, color: "var(--ink-mute)", lineHeight: 1.5 }}>
        Un email de confirmation vous a été envoyé à emma.d@email.com
      </p>
    </div>
  );
}

/* ─── Cart screen ────────────────────────────────────────────── */
function CartScreen({ onCheckout }: { onCheckout: () => void }) {
  const cart       = useStore((s) => s.cart);
  const setQty     = useStore((s) => s.setQty);
  const removeItem = useStore((s) => s.removeFromCart);
  const openProduct = useStore((s) => s.openProduct);

  const [promo, setPromo] = useState("");
  const [applied, setApplied] = useState(false);

  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const discount = applied ? subtotal * 0.1 : 0;
  const shipping  = subtotal > 50 ? 0 : 4.90;
  const total     = subtotal - discount + shipping;

  if (cart.length === 0) {
    return (
      <>
        <div style={{ paddingTop: 4, flex: "0 0 auto" }}>
          <SubHeader title="Mon panier" />
        </div>
        <div style={{ flex: "1 1 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 40px", textAlign: "center" }}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: "var(--charcoal)", display: "grid", placeItems: "center", marginBottom: 22 }}>
            <Icon name="bag" size={38} color="var(--ink-mute)" />
          </div>
          <div style={{ fontWeight: 600, fontSize: 21, color: "var(--ink)", marginBottom: 8 }}>Votre panier est vide</div>
          <div style={{ fontSize: 13, color: "var(--ink-mute)", lineHeight: 1.5, marginBottom: 26 }}>
            Découvrez nos best-sellers et offrez-vous un moment de beauté.
          </div>
          <Link href="/">
            <PinkBtn style={{ width: "auto", padding: "14px 34px" }}>Découvrir la boutique</PinkBtn>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ paddingTop: 4, flex: "0 0 auto" }}>
        <SubHeader title="Mon panier" right={<Icon name="trash" size={19} color="var(--ink-mute)" />} />
      </div>

      <div className="noscroll" style={{ flex: "1 1 auto", overflowY: "auto", padding: "4px 16px 20px" }}>
        <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 14 }}>
          {cart.reduce((s, i) => s + i.qty, 0)} article{cart.reduce((s, i) => s + i.qty, 0) > 1 ? "s" : ""}
        </div>

        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {cart.map((it, i) => (
            <div
              key={it.key}
              style={{
                display: "flex",
                gap: 13,
                padding: 11,
                borderRadius: "var(--r-md)",
                background: "var(--charcoal)",
                border: "1px solid rgba(255,255,255,.05)",
                animation: `fadeUp .4s ease ${i * 0.05}s both`,
              }}
            >
              <button
                onClick={() => openProduct(it)}
                style={{ width: 78, height: 78, borderRadius: 14, flex: "0 0 auto", overflow: "hidden", position: "relative", background: "#181818" }}
              >
                <Image src={`/assets/products/${it.id}.png`} alt={it.name} fill sizes="78px" style={{ objectFit: "cover" }} />
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
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, background: "var(--charcoal)", borderRadius: "var(--r-pill)", padding: "12px 16px", border: "1px solid rgba(255,255,255,.06)" }}>
            <Icon name="tag" size={16} color="var(--gold)" />
            <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Code promo" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--ink)", fontSize: 13 }} />
          </div>
          <button onClick={() => setApplied(promo.length > 0)} style={{ padding: "0 22px", borderRadius: "var(--r-pill)", background: "var(--charcoal-2)", color: "var(--gold)", fontWeight: 600, fontSize: 13, border: "1px solid rgba(212,175,55,.3)" }}>
            Appliquer
          </button>
        </div>
        {applied && (
          <div style={{ fontSize: 11.5, color: "#7BC99A", marginTop: 9, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="check" size={13} color="#7BC99A" /> Code appliqué · -10%
          </div>
        )}

        {/* Summary */}
        <div style={{ marginTop: 22, padding: 18, borderRadius: "var(--r-md)", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.05)" }}>
          <Row l="Sous-total" r={`${subtotal.toFixed(2)} €`} />
          {applied && <Row l="Réduction (10%)" r={`-${discount.toFixed(2)} €`} pink />}
          <Row l="Livraison" r={shipping === 0 ? "Offerte" : `${shipping.toFixed(2)} €`} gold={shipping === 0} />
          <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "12px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>Total</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)" }}>{total.toFixed(2)} €</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 11, color: "var(--ink-mute)" }}>
            <Icon name="truck" size={14} color="var(--ink-mute)" /> Livraison estimée : 2-3 jours ouvrés
          </div>
        </div>
      </div>

      <div style={{ flex: "0 0 auto", padding: "12px 16px 26px", background: "rgba(10,10,10,.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(212,175,55,.14)" }}>
        <PinkBtn icon="arrowR" onClick={onCheckout}>
          Passer la commande · {total.toFixed(2)} €
        </PinkBtn>
      </div>
    </>
  );
}

/* ─── Checkout screen ────────────────────────────────────────── */
function CheckoutScreen({ onBack, onPlaced }: { onBack: () => void; onPlaced: () => void }) {
  const [step, setStep] = useState(0);
  const cart = useStore((s) => s.cart);
  const clearCart = useStore((s) => s.clearCart);

  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const shipping  = subtotal > 50 ? 0 : 4.90;
  const total     = subtotal + shipping;

  const steps = ["Adresse", "Livraison", "Paiement", "Confirmation"];
  const next = () => {
    if (step === 2) { clearCart(); setStep(3); }
    else if (step < 3) setStep(step + 1);
  };
  const back = () => { if (step === 0) onBack(); else setStep(step - 1); };

  return (
    <>
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

      <div className="noscroll" style={{ flex: "1 1 auto", overflowY: "auto", padding: "4px 18px 20px" }}>
        {step === 0 && <StepAddress />}
        {step === 1 && <StepDelivery />}
        {step === 2 && <StepPayment total={total} />}
        {step === 3 && <StepConfirm />}
      </div>

      <div style={{ flex: "0 0 auto", padding: "12px 16px 26px", background: "rgba(10,10,10,.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(212,175,55,.14)" }}>
        {step < 3 ? (
          <PinkBtn icon={step === 2 ? "check" : "arrowR"} onClick={next}>
            {step === 2 ? `Payer ${total.toFixed(2)} €` : "Continuer"}
          </PinkBtn>
        ) : (
          <GoldBtn icon="home" onClick={onPlaced}>Retour à l&apos;accueil</GoldBtn>
        )}
      </div>
    </>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */
export default function BagPage() {
  const [screen, setScreen] = useState<"cart" | "checkout">("cart");

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
        {screen === "cart" ? (
          <CartScreen onCheckout={() => setScreen("checkout")} />
        ) : (
          <CheckoutScreen
            onBack={() => setScreen("cart")}
            onPlaced={() => { setScreen("cart"); window.location.href = "/"; }}
          />
        )}
      </div>
    </AppShell>
  );
}
