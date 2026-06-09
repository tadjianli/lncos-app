"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { SubHeader } from "@/components/shared/ActionButtons";
import { Icon } from "@/components/shared/Icon";
import { getSupabase } from "@/lib/supabase";
import { services, staff, svcMin } from "@/lib/rdv-data";
import type { Appointment } from "@/lib/rdv-store";

const MONTHS = ["jan.","fév.","mars","avr.","mai","juin","juil.","août","sep.","oct.","nov.","déc."];

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} à ${String(d.getHours()).padStart(2,"0")}h${String(d.getMinutes()).padStart(2,"0")}`;
}

type DbAppointment = {
  id: string;
  service_id: string;
  staff_id: string;
  extras_ids: string[];
  start_at: string;
  price: number;
  status: Appointment["status"];
};

function mapAppointment(row: DbAppointment): Appointment {
  return {
    id: row.id,
    clientId: "",
    clientName: "",
    phone: "",
    email: "",
    serviceId: row.service_id,
    staffId: row.staff_id,
    extras: row.extras_ids ?? [],
    start: row.start_at,
    durationMin: 0,
    price: Number(row.price),
    deposit: 0,
    paymentStatus: "unpaid",
    status: row.status,
    source: "client",
    notes: "",
    createdAt: "",
  };
}

export default function AppointmentsPage() {
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [tab, setTab] = useState<"upcoming"|"history">("upcoming");
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await getSupabase().auth.getUser();
    if (!user) {
      setIsGuest(true);
      setAppts([]);
      setLoading(false);
      return;
    }
    setIsGuest(false);

    const { data, error } = await getSupabase()
      .from("appointments")
      .select("id, service_id, staff_id, extras_ids, start_at, price, status")
      .eq("user_id", user.id)
      .order("start_at", { ascending: true });

    if (error) {
      console.error("[appointments] load:", error);
      setAppts([]);
    } else {
      setAppts((data ?? []).map((row) => mapAppointment(row as DbAppointment)));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = getSupabase()
      .channel("appointments-user")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, load)
      .subscribe();
    return () => { getSupabase().removeChannel(channel); };
  }, [load]);

  async function handleCancel(id: string) {
    if (!confirm("Annuler ce rendez-vous ?")) return;
    setCancellingId(id);
    const { error } = await getSupabase()
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", id);
    setCancellingId(null);
    if (error) {
      console.error("[appointments] cancel:", error);
      return;
    }
    await load();
  }

  const [now] = useState(() => Date.now());
  const upcoming = appts.filter((a) => a.status !== "cancelled" && new Date(a.start).getTime() > now);
  const history  = appts.filter((a) => a.status === "cancelled" || new Date(a.start).getTime() <= now);

  const list = tab === "upcoming" ? upcoming : history;

  return (
    <AppShell>
      <div style={{ paddingTop: 4, flex: "0 0 auto" }}>
        <SubHeader
          title="Mes rendez-vous"
          backHref="/profile"
          right={
            !isGuest ? (
              <Link href="/rdv" style={{ fontSize: 12.5, color: "var(--gold)", fontWeight: 600, textDecoration: "none" }}>
                + Réserver
              </Link>
            ) : undefined
          }
        />
      </div>

      {/* Tabs */}
      {!isGuest && (
        <div style={{ padding: "0 18px 14px", flex: "0 0 auto" }}>
          <div style={{ display: "flex", gap: 8, background: "var(--charcoal)", padding: 4, borderRadius: "var(--r-pill)" }}>
            {(["upcoming","history"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "var(--r-pill)",
                  fontSize: 13,
                  fontWeight: 700,
                  color: tab === t ? "#1a1306" : "var(--ink-soft)",
                  background: tab === t ? "var(--gold-grad)" : "transparent",
                }}
              >
                {t === "upcoming" ? "À venir" : "Historique"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="noscroll" style={{ flex: "1 1 auto", overflowY: "auto", padding: "0 16px 24px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 8 }}>
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  height: 120,
                  borderRadius: "var(--r-lg)",
                  background: "var(--charcoal)",
                  border: "1px solid rgba(255,255,255,.05)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}
          </div>
        ) : isGuest ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--charcoal)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
              <Icon name="user" size={34} color="var(--ink-mute)" />
            </div>
            <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 700, marginBottom: 10 }}>
              Connexion requise
            </div>
            <div style={{ fontWeight: 600, fontSize: 18, color: "var(--ink)", marginBottom: 8 }}>
              Connectez-vous
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-mute)", lineHeight: 1.5, marginBottom: 24 }}>
              Créez un compte ou connectez-vous pour voir vos rendez-vous.
            </div>
            <Link
              href="/profile"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                borderRadius: "var(--r-pill)",
                background: "var(--gold-grad)",
                color: "#1a1306",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Aller au profil
            </Link>
          </div>
        ) : list.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--charcoal)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
              <Icon name="calendar" size={34} color="var(--ink-mute)" />
            </div>
            <div style={{ fontWeight: 600, fontSize: 18, color: "var(--ink)", marginBottom: 8 }}>
              {tab === "upcoming" ? "Aucun rendez-vous à venir" : "Aucun historique"}
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-mute)", lineHeight: 1.5 }}>
              {tab === "upcoming" && "Réservez votre prochain moment beauté."}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {list.map((a, i) => {
              const svc = services.find((s) => s.id === a.serviceId);
              const art = staff.find((s) => s.id === a.staffId);
              const isCancelled = a.status === "cancelled";
              return (
                <div
                  key={a.id}
                  style={{
                    padding: 16,
                    borderRadius: "var(--r-lg)",
                    background: "linear-gradient(135deg, #1d1612, #241a12)",
                    border: isCancelled ? "1px solid rgba(255,255,255,.05)" : "1px solid rgba(212,175,55,.2)",
                    opacity: isCancelled ? 0.6 : 1,
                    animation: `fadeUp .4s ease ${i * 0.05}s both`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{svc?.name ?? a.serviceId}</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginTop: 3 }}>{fmtDate(a.start)}</div>
                    </div>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "var(--r-pill)",
                        fontSize: 10.5,
                        fontWeight: 700,
                        background: isCancelled ? "rgba(255,255,255,.06)" : "rgba(212,175,55,.15)",
                        color: isCancelled ? "var(--ink-mute)" : "var(--gold)",
                      }}
                    >
                      {isCancelled ? "Annulé" : "Confirmé"}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 32, height: 32, borderRadius: "50%", background: (art?.color ?? "#D4AF37") + "33", display: "grid", placeItems: "center", fontSize: 14, fontWeight: 700, color: art?.color ?? "var(--gold)" }}>
                      {art?.name?.[0] ?? "L"}
                    </span>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>{art?.name ?? "Équipe"}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-mute)" }}>{a.price} € · {svcMin(a.serviceId, a.extras)} min</div>
                    </div>
                  </div>

                  {!isCancelled && tab === "upcoming" && (
                    <div style={{ display: "flex", gap: 9, marginTop: 14 }}>
                      <button style={{ flex: 1, padding: "10px", borderRadius: "var(--r-pill)", fontSize: 12, fontWeight: 700, border: "1px solid rgba(255,255,255,.1)", color: "var(--ink-soft)" }}>
                        Modifier
                      </button>
                      <button
                        onClick={() => handleCancel(a.id)}
                        disabled={cancellingId === a.id}
                        style={{ flex: 1, padding: "10px", borderRadius: "var(--r-pill)", fontSize: 12, fontWeight: 700, border: "1px solid rgba(194,85,122,.3)", color: "#C2557A", opacity: cancellingId === a.id ? 0.6 : 1 }}
                      >
                        {cancellingId === a.id ? "Annulation…" : "Annuler"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
