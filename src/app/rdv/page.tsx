"use client";
/**
 * LN COS — RDV page: service catalog + booking wizard
 * (from handoff screens-rdv.jsx + booking-wizard.jsx)
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Logo } from "@/components/shared/Logo";
import { Icon } from "@/components/shared/Icon";
import { GoldBtn, PinkBtn, SectionHead } from "@/components/shared/ActionButtons";
import { getRdvStore } from "@/lib/rdv-store";
import { services, extras, staff, svcMin, svcPrice } from "@/lib/rdv-data";
import type { Service, Staff } from "@/lib/rdv-data";

const CATS = [
  { id: "all",        name: "Tout" },
  { id: "manucure",   name: "Manucure" },
  { id: "extensions", name: "Extensions" },
];

const DAYS    = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const MONTHS  = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const TIMES   = ["10:00","10:30","11:00","11:30","12:00","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30"];

function fmtDur(min: number) {
  const h = Math.floor(min / 60), m = min % 60;
  if (h && m) return `${h}h${String(m).padStart(2,"0")}`;
  return h ? `${h}h` : `${m} min`;
}
function fmtDate(d: Date) {
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/* ─── Booking wizard ─────────────────────────────────────────── */

interface Draft {
  serviceId: string;
  extrasIds: string[];
  staffId: string;
  date: Date | null;
  time: string;
  name: string;
  phone: string;
  notes: string;
}

function BookingWizard({
  initialService,
  onClose,
  onConfirm,
}: {
  initialService?: string | null;
  onClose: () => void;
  onConfirm: (draft: Draft) => void;
}) {
  const [step, setStep] = useState(initialService ? 1 : 0);
  const [draft, setDraft] = useState<Draft>({
    serviceId: initialService ?? services[0].id,
    extrasIds: [],
    staffId: "any",
    date: null,
    time: "",
    name: "",
    phone: "",
    notes: "",
  });

  const svc    = services.find((s) => s.id === draft.serviceId) ?? services[0];
  const total  = svcPrice(draft.serviceId, draft.extrasIds);
  const durMin = svcMin(draft.serviceId, draft.extrasIds);

  const STEPS = ["Prestation", "Options", "Artiste", "Date", "Heure", "Infos"];

  function next() { if (step < 5) setStep((s) => s + 1); else onConfirm(draft); }
  function back() { if (step === 0) onClose(); else setStep((s) => s - 1); }

  // Build calendar cells for current month
  const today = new Date(); today.setHours(0,0,0,0);
  const monthStart = draft.date
    ? new Date(draft.date.getFullYear(), draft.date.getMonth(), 1)
    : new Date(today.getFullYear(), today.getMonth(), 1);

  const calOffset = (monthStart.getDay() + 6) % 7;
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const calCells: (Date|null)[] = Array(calOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    calCells.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), d));
  }

  // Closed days: Sunday (0) and Monday (1)
  function isClosed(d: Date) { return d.getDay() === 0 || d.getDay() === 1; }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--noir)",
        display: "flex",
        flexDirection: "column",
        zIndex: 90,
        animation: "slideUp .35s cubic-bezier(.2,.8,.2,1) both",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "56px 18px 0",
          flex: "0 0 auto",
        }}
      >
        <button onClick={back} style={{ color: "var(--ink-soft)" }}>
          <Icon name="chevL" size={22} />
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--gold)", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>
            Étape {step + 1}/{STEPS.length}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>{STEPS[step]}</div>
        </div>
        <button onClick={onClose} style={{ color: "var(--ink-mute)" }}>
          <Icon name="x" size={20} />
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: "var(--charcoal)", margin: "12px 18px 0", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${((step + 1) / STEPS.length) * 100}%`, background: "var(--gold-grad)", transition: "width .3s ease", borderRadius: 2 }} />
      </div>

      {/* Step content */}
      <div className="noscroll" style={{ flex: "1 1 auto", overflowY: "auto", padding: "18px 18px 20px" }}>

        {/* Step 0 — Service */}
        {step === 0 && (
          <div>
            <div className="noscroll" style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
              {CATS.map((c) => {
                const on = c.id === "all"
                  ? true
                  : services.some((s) => s.id === draft.serviceId && s.cat === c.id);
                return (
                  <button key={c.id} style={{ flex: "0 0 auto", padding: "9px 16px", borderRadius: "var(--r-pill)", fontSize: 12.5, fontWeight: 600, background: "var(--charcoal)", color: "var(--ink-soft)", border: "1px solid rgba(255,255,255,.07)" }}>
                    {c.name}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setDraft((d) => ({ ...d, serviceId: s.id }))}
                  style={{ display: "flex", alignItems: "center", gap: 13, padding: 14, borderRadius: "var(--r-md)", textAlign: "left", background: draft.serviceId === s.id ? "rgba(212,175,55,.08)" : "var(--charcoal)", border: draft.serviceId === s.id ? "1.5px solid var(--gold)" : "1px solid rgba(255,255,255,.05)", width: "100%" }}
                >
                  <span style={{ width: 44, height: 44, borderRadius: 12, flex: "0 0 auto", background: s.color + "22", display: "grid", placeItems: "center" }}>
                    <Icon name="scissors" size={20} color={s.color} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{s.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginTop: 2, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.desc}</div>
                  </div>
                  <div style={{ textAlign: "right", flex: "0 0 auto" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "var(--gold)" }}>{s.price} €</div>
                    <div style={{ fontSize: 10.5, color: "var(--ink-mute)", marginTop: 2 }}>{fmtDur(s.min)}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — Extras */}
        {step === 1 && (
          <div>
            <p style={{ fontSize: 13, color: "var(--ink-mute)", marginBottom: 18 }}>
              Ajoutez des options à votre prestation.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {extras.map((e) => {
                const on = draft.extrasIds.includes(e.id);
                return (
                  <button
                    key={e.id}
                    onClick={() => setDraft((d) => ({ ...d, extrasIds: on ? d.extrasIds.filter((x) => x !== e.id) : [...d.extrasIds, e.id] }))}
                    style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 14px", borderRadius: "var(--r-md)", textAlign: "left", background: on ? "rgba(212,175,55,.08)" : "var(--charcoal)", border: on ? "1.5px solid var(--gold)" : "1px solid rgba(255,255,255,.05)", width: "100%" }}
                  >
                    <span style={{ width: 26, height: 26, borderRadius: 8, background: on ? "var(--gold-grad)" : "var(--charcoal-2)", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                      <Icon name={on ? "check" : "plus"} size={14} color={on ? "#1a1306" : "var(--ink-mute)"} stroke={2.4} />
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{e.name}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 1 }}>+{fmtDur(e.min)}</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>+{e.price} €</span>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: "var(--r-md)", background: "var(--charcoal)", border: "1px solid rgba(212,175,55,.18)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>Total · {fmtDur(durMin)}</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: "var(--gold)" }}>{total} €</span>
            </div>
          </div>
        )}

        {/* Step 2 — Staff */}
        {step === 2 && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Any */}
              <button
                onClick={() => setDraft((d) => ({ ...d, staffId: "any" }))}
                style={{ display: "flex", alignItems: "center", gap: 13, padding: 14, borderRadius: "var(--r-md)", textAlign: "left", background: draft.staffId === "any" ? "rgba(212,175,55,.08)" : "var(--charcoal)", border: draft.staffId === "any" ? "1.5px solid var(--gold)" : "1px solid rgba(255,255,255,.05)", width: "100%" }}
              >
                <span style={{ width: 50, height: 50, borderRadius: "50%", flex: "0 0 auto", background: "var(--charcoal-2)", display: "grid", placeItems: "center" }}>
                  <Icon name="sparkle" size={22} color="var(--gold)" />
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>Peu importe</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginTop: 2 }}>Premier créneau disponible</div>
                </div>
              </button>

              {/* Staff */}
              {staff.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setDraft((d) => ({ ...d, staffId: a.id }))}
                  style={{ display: "flex", alignItems: "center", gap: 13, padding: 14, borderRadius: "var(--r-md)", textAlign: "left", background: draft.staffId === a.id ? "rgba(212,175,55,.08)" : "var(--charcoal)", border: draft.staffId === a.id ? "1.5px solid var(--gold)" : "1px solid rgba(255,255,255,.05)", width: "100%" }}
                >
                  <span style={{ width: 50, height: 50, borderRadius: "50%", flex: "0 0 auto", background: a.color + "33", display: "grid", placeItems: "center", fontSize: 20, fontWeight: 700, color: a.color }}>
                    {a.name[0]}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{a.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginTop: 2 }}>{a.role}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                      <Icon name="star" size={11} color="var(--gold)" fill="var(--gold)" />
                      <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>{a.rating} · {a.reviews} avis</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Calendar */}
        {step === 3 && (
          <div>
            <div style={{ borderRadius: "var(--r-lg)", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.06)", padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <button
                  onClick={() => {
                    const prev = new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1);
                    if (prev >= new Date(today.getFullYear(), today.getMonth(), 1)) {
                      setDraft((d) => ({ ...d, date: prev }));
                    }
                  }}
                  style={{ width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--charcoal-2)" }}
                >
                  <Icon name="chevL" size={18} color="var(--ink)" />
                </button>
                <div style={{ fontWeight: 600, fontSize: 17, color: "var(--ink)", textTransform: "capitalize" }}>
                  {MONTHS[monthStart.getMonth()]} {monthStart.getFullYear()}
                </div>
                <button
                  onClick={() => setDraft((d) => ({ ...d, date: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1) }))}
                  style={{ width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--charcoal-2)" }}
                >
                  <Icon name="chevR" size={18} color="var(--ink)" />
                </button>
              </div>

              {/* Day headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 }}>
                {["L","M","M","J","V","S","D"].map((d, i) => (
                  <div key={i} style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700, color: "var(--ink-mute)" }}>{d}</div>
                ))}
              </div>

              {/* Days */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                {calCells.map((d, i) => {
                  if (!d) return <div key={i} />;
                  const closed   = isClosed(d);
                  const past     = d < today;
                  const disabled = closed || past;
                  const sel      = draft.date?.toDateString() === d.toDateString();
                  const isToday  = d.toDateString() === today.toDateString();
                  return (
                    <button
                      key={i}
                      disabled={disabled}
                      onClick={() => setDraft((dr) => ({ ...dr, date: d, time: "" }))}
                      style={{
                        aspectRatio: "1",
                        borderRadius: 10,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                        background: sel ? "var(--gold-grad)" : disabled ? "transparent" : "var(--charcoal-2)",
                        color: sel ? "#1a1306" : disabled ? "var(--ink-mute)" : "var(--ink)",
                        border: isToday && !sel ? "1px solid rgba(212,175,55,.5)" : "1px solid transparent",
                        opacity: disabled ? 0.28 : 1,
                        fontWeight: sel ? 800 : 600,
                        fontSize: 13.5,
                        cursor: disabled ? "default" : "pointer",
                      }}
                    >
                      {d.getDate()}
                      {!disabled && !sel && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)" }} />}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{ display: "flex", gap: 14, marginTop: 13, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.06)", flexWrap: "wrap" }}>
                {[{ c: "var(--gold)", t: "Disponible" }, { c: "var(--ink-mute)", t: "Fermé (dim. · lun.)" }].map((l) => (
                  <span key={l.t} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10.5, color: "var(--ink-mute)" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: l.c }} />{l.t}
                  </span>
                ))}
              </div>
            </div>

            {draft.date && (
              <div style={{ marginTop: 14, fontSize: 13, color: "var(--gold)", fontWeight: 600, textAlign: "center" }}>
                {fmtDate(draft.date)} sélectionné
              </div>
            )}
          </div>
        )}

        {/* Step 4 — Time slots */}
        {step === 4 && (
          <div>
            {!draft.date ? (
              <p style={{ color: "var(--ink-mute)", fontSize: 13, textAlign: "center", padding: "40px 0" }}>
                Sélectionnez d'abord une date.
              </p>
            ) : (
              <>
                <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 16, textAlign: "center" }}>
                  {fmtDate(draft.date)} · {fmtDur(durMin)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                  {TIMES.map((t) => {
                    const sel = draft.time === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setDraft((d) => ({ ...d, time: t }))}
                        style={{ padding: "13px 0", borderRadius: "var(--r-md)", fontWeight: 600, fontSize: 14, background: sel ? "var(--gold-grad)" : "var(--charcoal)", color: sel ? "#1a1306" : "var(--ink)", border: sel ? "none" : "1px solid rgba(255,255,255,.07)" }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 5 — Personal info */}
        {step === 5 && (
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 19, color: "var(--ink)", margin: "0 0 20px" }}>
              Vos informations
            </h3>
            {[
              { label: "Prénom & nom", key: "name", value: draft.name, placeholder: "Emma Dubois" },
              { label: "Téléphone", key: "phone", value: draft.phone, placeholder: "+33 6 12 34 56 78" },
              { label: "Notes (optionnel)", key: "notes", value: draft.notes, placeholder: "Allergies, préférences…" },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginBottom: 8, fontWeight: 500 }}>{f.label}</div>
                <input
                  value={f.value}
                  onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: "100%", padding: "13px 16px", borderRadius: "var(--r-sm)", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.08)", color: "var(--ink)", fontSize: 14, outline: "none" }}
                />
              </div>
            ))}

            {/* Summary */}
            <div style={{ padding: 16, borderRadius: "var(--r-md)", background: "linear-gradient(135deg, #241a10, #1a1208)", border: "1px solid rgba(212,175,55,.25)", marginTop: 8 }}>
              <div style={{ fontSize: 12, color: "var(--gold)", fontWeight: 700, letterSpacing: ".08em", marginBottom: 10 }}>RÉCAPITULATIF</div>
              {[
                [svc.name, `${total} €`],
                [draft.date ? fmtDate(draft.date) : "—", draft.time || "—"],
                [draft.staffId === "any" ? "Premier disponible" : staff.find((s) => s.id === draft.staffId)?.name ?? "—", fmtDur(durMin)],
              ].map(([l, r]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--ink-soft)", padding: "4px 0" }}>
                  <span>{l}</span><span style={{ color: "var(--ink)", fontWeight: 600 }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div style={{ flex: "0 0 auto", padding: "12px 18px 30px", background: "rgba(10,10,10,.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(212,175,55,.14)" }}>
        <PinkBtn
          onClick={next}
          disabled={
            (step === 3 && !draft.date) ||
            (step === 4 && !draft.time) ||
            (step === 5 && !draft.name.trim())
          }
          icon={step === 5 ? "check" : "arrowR"}
        >
          {step === 5 ? "Confirmer le rendez-vous" : "Continuer"}
        </PinkBtn>
      </div>
    </div>
  );
}

/* ─── Confirmation overlay ───────────────────────────────────── */
function ConfirmOverlay({ draft, onClose }: { draft: Draft; onClose: () => void }) {
  const svc = services.find((s) => s.id === draft.serviceId)!;
  return (
    <div style={{ position: "absolute", inset: 0, background: "var(--noir)", zIndex: 95, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", animation: "fadeIn .3s ease both" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--gold-grad)", display: "grid", placeItems: "center", marginBottom: 24 }}>
        <Icon name="check" size={36} color="#1a1306" stroke={2.5} />
      </div>
      <h2 style={{ fontWeight: 700, fontSize: 24, color: "var(--ink)", margin: "0 0 12px", textAlign: "center" }}>Rendez-vous confirmé ✨</h2>
      <p style={{ fontSize: 13, color: "var(--ink-mute)", lineHeight: 1.6, textAlign: "center", margin: "0 0 8px" }}>
        <strong style={{ color: "var(--ink)" }}>{svc.name}</strong>
        {draft.date && ` · ${fmtDate(draft.date)}`}
        {draft.time && ` à ${draft.time}`}
      </p>
      <p style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 32, textAlign: "center" }}>
        Un rappel vous sera envoyé 24h avant.
      </p>
      <GoldBtn onClick={onClose} style={{ maxWidth: 280 }}>
        Retour à mes RDV
      </GoldBtn>
    </div>
  );
}

/* ─── RDV Home ────────────────────────────────────────────────── */
export default function RdvPage() {
  const [cat, setCat]         = useState("all");
  const [booking, setBooking] = useState<{ serviceId: string | null } | null>(null);
  const [confirmed, setConfirmed] = useState<Draft | null>(null);

  const list = services.filter((s) => cat === "all" || s.cat === cat);

  function handleConfirm(draft: Draft) {
    // Persist to rdv-store
    const store = getRdvStore();
    const staffId = draft.staffId === "any"
      ? (staff.find((s) => s.services.includes(draft.serviceId)) ?? staff[0]).id
      : draft.staffId;
    const isoDate = draft.date
      ? (() => { const d = new Date(draft.date); const [h, m] = (draft.time || "10:00").split(":").map(Number); d.setHours(h, m, 0, 0); return d.toISOString(); })()
      : new Date().toISOString();

    store.insert("appointments", {
      clientId: "me",
      clientName: draft.name || "Vous",
      phone: draft.phone,
      email: "",
      serviceId: draft.serviceId,
      staffId,
      extras: draft.extrasIds,
      start: isoDate,
      durationMin: svcMin(draft.serviceId, draft.extrasIds),
      price: svcPrice(draft.serviceId, draft.extrasIds),
      deposit: 0,
      paymentStatus: "unpaid" as const,
      status: "confirmed" as const,
      source: "client" as const,
      notes: draft.notes,
      createdAt: new Date().toISOString(),
    });

    setBooking(null);
    setConfirmed(draft);
  }

  return (
    <AppShell>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
        {/* Page content */}
        <div className="noscroll" style={{ flex: "1 1 auto", overflowY: "auto", padding: "6px 0 26px" }}>
          {/* Hero */}
          <div style={{ padding: "6px 18px 4px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 40 }}>
              <Logo size={24} />
              <Link href="/rdv/appointments" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: "var(--r-pill)", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.07)", color: "var(--ink-soft)", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                <Icon name="calCheck" size={16} color="var(--gold)" /> Mes RDV
              </Link>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 10.5, letterSpacing: ".26em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600 }}>Institut onglerie</div>
              <h1 style={{ margin: "9px 0 0", fontWeight: 600, fontSize: 30, lineHeight: 1.12, color: "var(--ink)" }}>
                Réservez votre<br />moment beauté
              </h1>
              <div style={{ marginTop: 9, fontSize: 13, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 7 }}>
                <Icon name="bolt" size={15} color="var(--pink)" /> En moins de 60 secondes, sans appel.
              </div>
            </div>
          </div>

          {/* Main CTA */}
          <div style={{ padding: "18px 18px 4px" }}>
            <GoldBtn icon="calendar" onClick={() => setBooking({ serviceId: null })}>
              Prendre rendez-vous
            </GoldBtn>
          </div>

          {/* Trust strip */}
          <div style={{ display: "flex", gap: 9, padding: "14px 18px 6px" }}>
            {[
              { i: "clock",   t: "Dispo. temps réel" },
              { i: "bell",    t: "Rappel auto."       },
              { i: "sparkle", t: "+ points VIP"       },
            ].map((x) => (
              <div key={x.t} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 6px", borderRadius: "var(--r-md)", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.05)", textAlign: "center" }}>
                <Icon name={x.i} size={19} color="var(--gold)" />
                <span style={{ fontSize: 10.5, color: "var(--ink-soft)", fontWeight: 500, lineHeight: 1.25 }}>{x.t}</span>
              </div>
            ))}
          </div>

          {/* Service list */}
          <div style={{ padding: "18px 18px 0" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "0 0 14px" }}>
              <h3 style={{ margin: 0, fontWeight: 600, fontSize: "var(--fs-h3)", color: "var(--ink)" }}>Nos prestations</h3>
            </div>
            <div className="noscroll" style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
              {CATS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  style={{ flex: "0 0 auto", padding: "9px 16px", borderRadius: "var(--r-pill)", fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", background: cat === c.id ? "var(--gold-grad)" : "var(--charcoal)", color: cat === c.id ? "#1a1306" : "var(--ink-soft)", border: cat === c.id ? "none" : "1px solid rgba(255,255,255,.07)" }}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {list.map((s, i) => (
                <div key={s.id} style={{ display: "flex", gap: 13, padding: 12, borderRadius: "var(--r-md)", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.05)", animation: `fadeUp .4s ease ${i * 0.04}s both` }}>
                  <div style={{ width: 80, height: 80, borderRadius: 14, flex: "0 0 auto", background: s.color + "22", display: "grid", placeItems: "center", position: "relative" }}>
                    <Icon name="scissors" size={32} color={s.color} />
                    {s.pop && <span style={{ position: "absolute", top: 6, left: 6, padding: "3px 8px", borderRadius: "var(--r-pill)", background: "var(--gold-grad)", color: "#1a1306", fontSize: 8.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase" }}>Populaire</span>}
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", lineHeight: 1.25 }}>{s.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginTop: 3, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.desc}</div>
                    <div style={{ marginTop: "auto", paddingTop: 9, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "var(--ink-soft)", whiteSpace: "nowrap" }}>
                          <Icon name="clock" size={13} color="var(--ink-mute)" /> {fmtDur(s.min)}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)", whiteSpace: "nowrap" }}>{s.price} €</span>
                      </div>
                      <button
                        onClick={() => setBooking({ serviceId: s.id })}
                        style={{ padding: "8px 16px", borderRadius: "var(--r-pill)", background: "var(--pink-grad)", color: "#3a1020", fontSize: 12, fontWeight: 700 }}
                      >
                        Réserver
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking wizard overlay */}
        {booking && (
          <BookingWizard
            initialService={booking.serviceId}
            onClose={() => setBooking(null)}
            onConfirm={handleConfirm}
          />
        )}

        {/* Confirmation overlay */}
        {confirmed && (
          <ConfirmOverlay draft={confirmed} onClose={() => setConfirmed(null)} />
        )}
      </div>
    </AppShell>
  );
}
