"use client";

import { useState } from "react";
import { useAllAppointments, useRdvNotifications } from "@/lib/admin-supabase";
import type { Appointment, Notification } from "@/lib/rdv-store";
import { staff, availability, type Service } from "@/lib/rdv-data";
import { useAdminServiceCategories } from "@/lib/rdv-services-db";
import { Icon } from "@/components/shared/Icon";
import { AdminAccordion, AdminAccordionStack } from "@/components/admin/AdminAccordion";
import { AdminToast } from "@/components/admin/AdminToast";
import { ServiceCategoriesModule } from "@/components/admin/ServiceCategoriesModule";

/* ── helpers ────────────────────────────────────────────────────────── */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 2) return "il y a quelques secondes";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.floor(h / 24)} j`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function fmtPrice(n: number): string {
  return n.toLocaleString("fr-FR") + " €";
}

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ── Week navigation ────────────────────────────────────────────────── */
function getWeekDays(offset = 0): Date[] {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_LABELS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 08:00 → 19:00
const STAFF_COLOR: Record<string, string> = { lea: "#D4AF37", ines: "#EFA9C0", maya: "#6FA8C9" };

/* ── Appointment detail drawer ──────────────────────────────────────── */
function ApptDrawer({ appt, services, onClose, onStatusChange }: {
  appt: Appointment;
  services: Service[];
  onClose: () => void;
  onStatusChange: (id: string, status: Appointment["status"]) => void;
}) {
  const svc = services.find((s) => s.id === appt.serviceId) ?? null;
  const staffMember = staff.find((s) => s.id === appt.staffId) ?? null;
  const end = new Date(new Date(appt.start).getTime() + appt.durationMin * 60000);

  const statusBadge: Record<string, { label: string; color: string; bg: string }> = {
    pending:   { label: "En attente",  color: "#C77A33", bg: "rgba(199,122,51,.14)" },
    confirmed: { label: "Confirmé",    color: "#3B7DD8", bg: "rgba(59,125,216,.14)" },
    completed: { label: "Terminé",     color: "#2F9E68", bg: "rgba(47,158,104,.14)" },
    cancelled: { label: "Annulé",      color: "#C2557A", bg: "rgba(194,85,122,.14)" },
  };
  const payBadge: Record<string, { label: string; color: string; bg: string }> = {
    unpaid:  { label: "Non payé",    color: "#C2557A", bg: "rgba(194,85,122,.14)" },
    deposit: { label: "Acompte",     color: "#C77A33", bg: "rgba(199,122,51,.14)" },
    paid:    { label: "Payé",        color: "#2F9E68", bg: "rgba(47,158,104,.14)" },
  };
  const sb = statusBadge[appt.status];
  const pb = payBadge[appt.paymentStatus];
  const staffColor = STAFF_COLOR[appt.staffId] ?? "#999";

  return (
    <div className={`rdv-drawer-overlay open`} onClick={onClose}>
      <div className="rdv-drawer-scrim" />
      <div className="rdv-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="rdv-drawer-head">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="rdv-drawer-title">{svc?.name ?? appt.serviceId}</div>
              <div className="rdv-drawer-svc">{appt.clientName}</div>
            </div>
            <button className="adm-iconbtn" onClick={onClose}><Icon name="x" size={17} /></button>
          </div>
          <div className="rdv-drawer-badges">
            <span className="adm-badge" style={{ color: sb.color, background: sb.bg }}>{sb.label}</span>
            <span className="adm-badge" style={{ color: pb.color, background: pb.bg }}>{pb.label}</span>
          </div>
        </div>

        <div className="rdv-drawer-body">
          <div className="rdv-client-row">
            <div className="rdv-client-av" style={{ background: staffColor }}>
              {initials(appt.clientName)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--adm-ink)" }}>{appt.clientName}</div>
              <div style={{ fontSize: 13, color: "var(--adm-ink-mute)" }}>{appt.phone}</div>
            </div>
            <button className="adm-iconbtn"><Icon name="phone" size={17} /></button>
          </div>

          {[
            { icon: "calendar", key: "Date",        val: fmtDate(appt.start) },
            { icon: "clock",    key: "Heure",        val: `${fmtTime(appt.start)} → ${fmtTime(end.toISOString())} · ${appt.durationMin} min` },
            { icon: "user",     key: "Prothésiste",  val: staffMember?.name ?? appt.staffId },
            { icon: "phone",    key: "Téléphone",    val: appt.phone },
            { icon: "mail",     key: "Email",         val: appt.email },
            { icon: "card",     key: "Paiement",     val: appt.deposit > 0 ? `Acompte ${appt.deposit} € · reste ${appt.price - appt.deposit} €` : `${appt.price} €` },
          ].map(({ icon, key, val }) => (
            <div key={key} className="rdv-info-row">
              <div className="rdv-info-key"><Icon name={icon} size={17} color="var(--adm-gold)" />{key}</div>
              <div className="rdv-info-val">{val}</div>
            </div>
          ))}

          {appt.notes && (
            <div className="rdv-drawer-section">
              <div className="rdv-drawer-section-title">Note du client</div>
              <div className="rdv-drawer-note">{appt.notes}</div>
            </div>
          )}
        </div>

        <div className="rdv-drawer-foot">
          {appt.status === "pending" && (
            <button className="adm-btn gold" style={{ flex: 1 }} onClick={() => onStatusChange(appt.id, "confirmed")}>
              <Icon name="check" size={15} /> Confirmer
            </button>
          )}
          {appt.status !== "completed" && appt.status !== "cancelled" && (
            <button className="adm-btn ghost" style={{ flex: 1, color: "var(--tone-pink)", borderColor: "rgba(194,85,122,.3)" }}
              onClick={() => onStatusChange(appt.id, "cancelled")}>
              <Icon name="x" size={15} /> Annuler
            </button>
          )}
          {appt.status === "confirmed" && (
            <button className="adm-btn ghost" style={{ flex: 1, color: "var(--tone-green)" }}
              onClick={() => onStatusChange(appt.id, "completed")}>
              <Icon name="check" size={15} /> Terminé
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard tab ──────────────────────────────────────────────────── */
function Dashboard({ appointments, notifications, services, onOpenCalendar }: {
  appointments: Appointment[];
  notifications: Notification[];
  services: Service[];
  onOpenCalendar: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const todayAppts = appointments.filter((a) => a.status !== "cancelled" && a.start.startsWith(today));
  const upcoming   = appointments.filter((a) => a.status !== "cancelled" && a.start > new Date().toISOString());
  const cancelled  = appointments.filter((a) => a.status === "cancelled" && a.start.slice(0, 10) >= (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10); })());
  const weekRevenue = appointments
    .filter((a) => a.status !== "cancelled" && a.start.slice(0, 10) >= (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10); })())
    .reduce((t, a) => t + a.price, 0);

  const statCards = [
    { icon: "calendar",  iconColor: "#C77A33", iconBg: "rgba(199,122,51,.14)", val: todayAppts.length, label: "Rendez-vous aujourd'hui", sub: todayAppts.length === 0 ? "Aucun pour le moment" : `${todayAppts.length} prestation(s)` },
    { icon: "calCheck",  iconColor: "#3B7DD8", iconBg: "rgba(59,125,216,.14)", val: upcoming.length,   label: "À venir",                sub: "cette semaine et au-delà" },
    { icon: "x",         iconColor: "#C2557A", iconBg: "rgba(194,85,122,.14)", val: cancelled.length,  label: "Annulés (semaine)",       sub: "sur la semaine en cours" },
    { icon: "card",      iconColor: "#2F9E68", iconBg: "rgba(47,158,104,.14)", val: fmtPrice(weekRevenue), label: "Chiffre généré",   sub: "réservations de la semaine" },
    { icon: "sliders",   iconColor: "#7C756B", iconBg: "rgba(124,117,107,.14)", val: "—",              label: "Taux de remplissage",    sub: "salon fermé" },
  ];

  // Staff occupation: count appointments per staff member today
  const staffOcc = staff.map((s) => ({
    ...s,
    count: todayAppts.filter((a) => a.staffId === s.id).length,
  }));
  const maxOcc = Math.max(1, ...staffOcc.map((s) => s.count));

  // Real-time activity: last 5 notifications
  const recentNotifs = [...notifications].sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPI strip */}
      <div className="rdv-stat-row">
        {statCards.map((c) => (
          <div key={c.label} className="adm-card rdv-stat">
            <div className="rdv-stat-icon" style={{ background: c.iconBg }}>
              <Icon name={c.icon} size={20} color={c.iconColor} />
            </div>
            <div className="rdv-stat-val">{c.val}</div>
            <div className="rdv-stat-label">{c.label}</div>
            <div className="rdv-stat-sub">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="rdv-dash-grid">
        {/* Upcoming appointments */}
        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <div className="adm-card-title">Prochaines réservations</div>
              <div className="adm-card-sub">{upcoming.length} à venir · cliquez pour le détail</div>
            </div>
            <button className="adm-link" onClick={onOpenCalendar} style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
              Calendrier <Icon name="arrowR" size={14} color="var(--adm-gold)" />
            </button>
          </div>
          {upcoming.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--adm-ink-mute)" }}>
              <Icon name="calendar" size={32} color="var(--adm-border)" />
              <div style={{ marginTop: 10, fontSize: 13 }}>Aucune réservation à venir</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {upcoming.slice(0, 6).map((appt) => {
                const svc = services.find((s) => s.id === appt.serviceId) ?? null;
                const staffM = staff.find((s) => s.id === appt.staffId);
                const sc = STAFF_COLOR[appt.staffId] ?? "#999";
                return (
                  <div key={appt.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid var(--adm-border-2)" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: sc + "20", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <Icon name="calendar" size={16} color={sc} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--adm-ink)" }}>{appt.clientName}</div>
                      <div style={{ fontSize: 11.5, color: "var(--adm-ink-mute)" }}>{svc?.name ?? appt.serviceId} · {staffM?.name}</div>
                    </div>
                    <div style={{ textAlign: "right", fontSize: 12, color: "var(--adm-ink-soft)", flexShrink: 0 }}>
                      <div style={{ fontWeight: 700 }}>{new Date(appt.start).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })}</div>
                      <div style={{ color: "var(--adm-ink-mute)" }}>{fmtTime(appt.start)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Real-time activity + occupation */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="adm-card">
            <div className="adm-card-head">
              <div>
                <div className="adm-card-title">Activité temps réel</div>
                <div className="adm-card-sub" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="rdv-live-dot" style={{ boxShadow: "0 0 6px var(--tone-green)", animation: "dpulse 1.6s infinite" }} />
                  en direct
                </div>
              </div>
            </div>
            {recentNotifs.length === 0 ? (
              <div style={{ padding: "20px 0", textAlign: "center", color: "var(--adm-ink-mute)", fontSize: 13 }}>Aucune activité récente</div>
            ) : (
              recentNotifs.map((n) => {
                const svc = services.find((s) => s.id === n.serviceId) ?? null;
                return (
                  <div key={n.id} className="rdv-activity-item">
                    <div className="rdv-activity-icon" style={{ background: "rgba(47,158,104,.14)" }}>
                      <Icon name="calendar" size={16} color="#2F9E68" />
                    </div>
                    <div>
                      <div className="rdv-activity-name">{n.clientName} <span style={{ fontWeight: 400, color: "var(--adm-ink-soft)" }}>a réservé · {svc?.name ?? n.serviceId}</span></div>
                      <div className="rdv-activity-time">{timeAgo(n.ts)}</div>
                    </div>
                    {!n.read && <div className="rdv-live-dot" style={{ marginLeft: "auto" }} />}
                  </div>
                );
              })
            )}
          </div>

          <div className="adm-card">
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--adm-ink-mute)", marginBottom: 14 }}>Occupation du jour</div>
            {staffOcc.map((s) => (
              <div key={s.id} className="rdv-occ-row">
                <div className="rdv-occ-av" style={{ background: STAFF_COLOR[s.id] ?? "#999" }}>{s.name[0]}</div>
                <div className="rdv-occ-name">{s.name}</div>
                <div className="rdv-occ-bar-wrap">
                  <div className="rdv-occ-bar" style={{ width: `${(s.count / maxOcc) * 100}%`, background: STAFF_COLOR[s.id] ?? "#999" }} />
                </div>
                <div className="rdv-occ-count">{s.count} RDV</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Calendar tab ───────────────────────────────────────────────────── */
function CalendarView({ appointments, services, onSelectAppt }: {
  appointments: Appointment[];
  services: Service[];
  onSelectAppt: (a: Appointment) => void;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [staffFilter, setStaffFilter] = useState<string | null>(null);
  const days = getWeekDays(weekOffset);
  const todayStr = new Date().toISOString().slice(0, 10);

  const weekLabel = `${days[0].toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} — ${days[6].toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`;

  function getAppts(day: Date): Appointment[] {
    const dateStr = day.toISOString().slice(0, 10);
    return appointments.filter((a) => {
      if (a.status === "cancelled") return false;
      if (!a.start.startsWith(dateStr)) return false;
      if (staffFilter && a.staffId !== staffFilter) return false;
      return true;
    });
  }

  function isClosedDay(day: Date): boolean {
    const av = availability.find((a) => a.day === day.getDay());
    return !av || av.closed;
  }

  // Position appt block in the time grid
  function apptStyle(appt: Appointment): React.CSSProperties {
    const start = new Date(appt.start);
    const startMinFromBase = (start.getHours() - 8) * 60 + start.getMinutes();
    const top = (startMinFromBase / 60) * 60; // 60px per hour
    const height = (appt.durationMin / 60) * 60;
    const sc = STAFF_COLOR[appt.staffId] ?? "#999";
    return {
      top, height: Math.max(height, 30),
      background: sc + "22",
      borderLeftColor: sc,
      color: "var(--adm-ink)",
    };
  }

  return (
    <div>
      <div className="rdv-cal-nav">
        <button className="rdv-cal-today-btn" onClick={() => setWeekOffset(0)}>Aujourd&apos;hui</button>
        <button className="rdv-cal-nav-btn" onClick={() => setWeekOffset((p) => p - 1)}>
          <Icon name="chevL" size={16} />
        </button>
        <button className="rdv-cal-nav-btn" onClick={() => setWeekOffset((p) => p + 1)}>
          <Icon name="chevR" size={16} />
        </button>
        <div className="rdv-cal-title">{weekLabel}</div>

        <div className="rdv-staff-filter">
          <button
            className={`rdv-staff-chip${staffFilter === null ? " on" : ""}`}
            style={staffFilter === null ? { borderColor: "var(--adm-sidebar-bg)", background: "var(--adm-sidebar-bg)", color: "#fff" } : {}}
            onClick={() => setStaffFilter(null)}
          >Toute l&apos;équipe</button>
          {staff.map((s) => (
            <button
              key={s.id}
              className={`rdv-staff-chip${staffFilter === s.id ? " on" : ""}`}
              style={staffFilter === s.id ? { borderColor: STAFF_COLOR[s.id], color: STAFF_COLOR[s.id] } : {}}
              onClick={() => setStaffFilter((p) => p === s.id ? null : s.id)}
            >
              <span className="dot" style={{ background: STAFF_COLOR[s.id] ?? "#999" }} />
              {s.name}
            </button>
          ))}
        </div>

        <div className="rdv-view-btns">
          <button className="rdv-view-btn on">Semaine</button>
          <button className="rdv-view-btn">Mois</button>
        </div>
      </div>

      <div className="rdv-cal-wrap adm-card" style={{ padding: 0 }}>
        <div className="rdv-calendar">
          {/* Header row */}
          <div className="rdv-cal-head-row">
            <div className="rdv-cal-head-cell" style={{ borderBottom: "1px solid var(--adm-border)" }} />
            {days.map((d, i) => {
              const dateStr = d.toISOString().slice(0, 10);
              const isToday = dateStr === todayStr;
              return (
                <div key={i} className={`rdv-cal-head-cell${isToday ? " today" : ""}`} style={{ borderBottom: "1px solid var(--adm-border)" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--adm-ink-mute)", letterSpacing: ".06em" }}>{DAY_LABELS[i]}</div>
                  <span className="daynum">{d.getDate()}</span>
                </div>
              );
            })}
          </div>

          {/* Body */}
          <div className="rdv-cal-body">
            {/* Time gutter */}
            <div className="rdv-time-col">
              {HOURS.map((h) => (
                <div key={h} className="rdv-time-cell">{h}:00</div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day, di) => {
              const closed = isClosedDay(day);
              const dayAppts = getAppts(day);
              return (
                <div key={di} className={`rdv-day-col${closed ? " closed" : ""}`}>
                  {/* Grid lines */}
                  {HOURS.map((h, hi) => (
                    <div key={h} className="rdv-day-grid-line" style={{ top: hi * 60 }} />
                  ))}

                  {/* Appointments */}
                  {!closed && dayAppts.map((appt) => {
                    const sc = STAFF_COLOR[appt.staffId] ?? "#999";
                    const svc = services.find((s) => s.id === appt.serviceId) ?? null;
                    return (
                      <div
                        key={appt.id}
                        className="rdv-appt"
                        style={apptStyle(appt)}
                        onClick={() => onSelectAppt(appt)}
                      >
                        <div className="rdv-appt-time">{fmtTime(appt.start)}</div>
                        <div className="rdv-appt-name">{appt.clientName}</div>
                        <div className="rdv-appt-svc">{svc?.name ?? appt.serviceId}</div>
                        <div className="rdv-appt-av" style={{ background: sc + "30", color: sc, fontSize: 8, fontWeight: 800, width: 16, height: 16 }}>
                          {appt.staffId[0].toUpperCase()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Availability tab ───────────────────────────────────────────────── */
function AvailabilityView() {
  const [avail, setAvail] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lncos-avail");
      if (saved) return JSON.parse(saved) as typeof availability;
    }
    return availability.map((a) => ({ ...a }));
  });
  const [saved, setSaved] = useState(false);

  function toggle(day: number) {
    setAvail((prev) => prev.map((a) => a.day === day ? { ...a, closed: !a.closed } : a));
  }

  function handleSave() {
    localStorage.setItem("lncos-avail", JSON.stringify(avail));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="adm-card adm-list-card">
      <div className="adm-list-card-head">
        <div>
          <div className="adm-card-title">Horaires d&apos;ouverture</div>
          <div className="adm-card-sub">Configurez les créneaux disponibles pour vos clientes</div>
        </div>
        <button className="adm-btn gold sm" onClick={handleSave}>
          <Icon name="check" size={14} /> {saved ? "Enregistré ✓" : "Enregistrer"}
        </button>
      </div>
      {avail.map((av) => (
        <div key={av.day} className="rdv-avail-row">
          <div className="rdv-avail-day">{av.label}</div>
          {av.closed ? (
            <div className="rdv-avail-closed">Fermé</div>
          ) : (
            <div className="rdv-avail-time">
              <input className="rdv-avail-input" type="time" value={av.open}
                onChange={(e) => setAvail((p) => p.map((a) => a.day === av.day ? { ...a, open: e.target.value } : a))} />
              <span style={{ color: "var(--adm-ink-mute)" }}>→</span>
              <input className="rdv-avail-input" type="time" value={av.close}
                onChange={(e) => setAvail((p) => p.map((a) => a.day === av.day ? { ...a, close: e.target.value } : a))} />
            </div>
          )}
          <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--adm-ink-mute)" }}>
            <input type="checkbox" checked={av.closed} onChange={() => toggle(av.day)} />
            Fermé
          </label>
        </div>
      ))}
    </div>
  );
}

/* ── Service edit modal ─────────────────────────────────────────────── */
function ServiceModal({
  svc,
  categories,
  defaultCategoryId,
  onClose,
  onSave,
}: {
  svc?: Service;
  categories: { id: string; name: string; isActive: boolean }[];
  defaultCategoryId: string;
  onClose: () => void;
  onSave: (s: Service) => void;
}) {
  const isNew = !svc;
  const activeCategories = categories.filter((c) => c.isActive);
  const [form, setForm] = useState<Service>(() => svc ?? {
    id: `svc-${Date.now()}`,
    categoryId: defaultCategoryId,
    name: "",
    price: 0,
    min: 60,
    color: "#D4AF37",
    active: true,
    desc: "",
  });

  function set<K extends keyof Service>(key: K, val: Service[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div className="ab-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ab-modal-head">
          <div className="ab-modal-title">{isNew ? "Ajouter une prestation" : `Modifier · ${svc.name}`}</div>
          <button className="adm-iconbtn" onClick={onClose}><Icon name="x" size={17} /></button>
        </div>
        {([
          { label: "Nom de la prestation", key: "name" as const, type: "text", placeholder: "ex : Vernis semi-permanent" },
          { label: "Description", key: "desc" as const, type: "text", placeholder: "Courte description" },
          { label: "Prix (€)", key: "price" as const, type: "number" },
          { label: "Durée (min)", key: "min" as const, type: "number" },
        ]).map(({ label, key, type, placeholder }) => (
          <div key={key} className="ab-field">
            <label>{label}</label>
            <input
              className="ab-input"
              type={type}
              value={String(form[key] ?? "")}
              placeholder={placeholder}
              onChange={(e) => set(key, (type === "number" ? Number(e.target.value) : e.target.value) as Service[typeof key])}
            />
          </div>
        ))}
        <div className="ab-field">
          <label>Catégorie *</label>
          <select
            className="ab-input"
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            required
          >
            {activeCategories.length === 0 && (
              <option value="">Aucune catégorie — créez-en une dans Catégories</option>
            )}
            {activeCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="ab-field" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ margin: 0 }}>Prestation active</label>
          <label className="ab-toggle" style={{ cursor: "pointer" }}>
            <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} />
            <div className="ab-toggle-track" />
            <div className="ab-toggle-thumb" />
          </label>
        </div>
        <div className="ab-modal-foot">
          <button className="adm-btn ghost" onClick={onClose}>Annuler</button>
          <button className="adm-btn gold" onClick={() => onSave(form)} disabled={!form.name.trim() || !form.categoryId}>
            <Icon name="check" size={15} /> {isNew ? "Créer" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Services tab ───────────────────────────────────────────────────── */
function ServicesView() {
  const { categories, services: svcList, loading, upsertService, deleteService } = useAdminServiceCategories();
  const [addingSvc, setAddingSvc] = useState(false);
  const [editingSvc, setEditingSvc] = useState<Service | null>(null);
  const [confirmDeleteSvc, setConfirmDeleteSvc] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const defaultCategoryId = categories.find((c) => c.isActive)?.id ?? categories[0]?.id ?? "";

  function categoryName(id: string): string {
    return categories.find((c) => c.id === id)?.name ?? id;
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function handleSave(s: Service) {
    const existing = svcList.findIndex((x) => x.id === s.id);
    const { error } = await upsertService(s);
    if (error) {
      showToast(`Erreur : ${error}`);
      return;
    }
    setAddingSvc(false);
    setEditingSvc(null);
    showToast(existing >= 0 ? "Prestation mise à jour" : "Prestation créée");
  }

  async function deleteSvc(id: string) {
    const { error } = await deleteService(id);
    if (error) {
      showToast(`Erreur : ${error}`);
      return;
    }
    setConfirmDeleteSvc(null);
    showToast("Prestation supprimée");
  }

  return (
    <>
      <div className="adm-card adm-list-card">
        <div className="adm-list-card-head">
          <div>
            <div className="adm-card-title">Prestations</div>
            <div className="adm-card-sub">{svcList.length} services · {svcList.filter((s) => s.active).length} actifs</div>
          </div>
          <button className="adm-btn gold sm" onClick={() => setAddingSvc(true)}><Icon name="plus" size={14} /> Ajouter</button>
        </div>
        {loading && (
          <div style={{ padding: 24, textAlign: "center", color: "var(--adm-ink-mute)", fontSize: 13 }}>Chargement…</div>
        )}
        {!loading && svcList.map((svc) => (
          <div key={svc.id} className="rdv-svc-row">
            <div className="rdv-svc-dot" style={{ background: svc.color }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="rdv-svc-name">{svc.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--adm-ink-mute)", marginTop: 2 }}>{svc.desc}</div>
            </div>
            <span className="rdv-svc-cat">{categoryName(svc.categoryId)}</span>
            <div className="rdv-svc-dur">{svc.min} min</div>
            <div className="rdv-svc-price">{svc.price} €</div>
            <div className="adm-rowactions">
              <button className="adm-act" onClick={() => setEditingSvc(svc)}><Icon name="edit" size={14} /></button>
              {confirmDeleteSvc === svc.id ? (
                <button className="adm-act" onClick={() => deleteSvc(svc.id)} style={{ color: "var(--tone-pink)", fontWeight: 700, fontSize: 10, width: "auto", padding: "0 6px" }}>Confirmer</button>
              ) : (
                <button className="adm-act danger" onClick={() => setConfirmDeleteSvc(svc.id)}><Icon name="trash" size={14} /></button>
              )}
            </div>
          </div>
        ))}
        {svcList.length === 0 && (
          <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--adm-ink-mute)", fontSize: 13 }}>
            Aucune prestation — <button className="adm-link" onClick={() => setAddingSvc(true)}>Ajouter la première</button>
          </div>
        )}
      </div>
      {addingSvc && (
        <ServiceModal
          categories={categories}
          defaultCategoryId={defaultCategoryId}
          onClose={() => setAddingSvc(false)}
          onSave={handleSave}
        />
      )}
      {editingSvc && (
        <ServiceModal
          svc={editingSvc}
          categories={categories}
          defaultCategoryId={defaultCategoryId}
          onClose={() => setEditingSvc(null)}
          onSave={handleSave}
        />
      )}
      {toast && <AdminToast msg={toast} />}
    </>
  );
}

/* ── Staff tab ──────────────────────────────────────────────────────── */
function StaffView() {
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <>
    <div className="adm-card adm-list-card">
      <div className="adm-list-card-head">
        <div>
          <div className="adm-card-title">Prothésistes</div>
          <div className="adm-card-sub">{staff.filter((s) => s.active).length} actives</div>
        </div>
        <button className="adm-btn ghost sm" onClick={() => showToast("Ajout de prothésiste — bientôt disponible")}>
          <Icon name="plus" size={14} /> Ajouter
        </button>
      </div>
      {staff.map((s) => (
        <div key={s.id} className="rdv-staff-row">
          <div className="rdv-staff-av-lg" style={{ background: STAFF_COLOR[s.id] ?? "#999" }}>{s.name[0]}</div>
          <div style={{ flex: 1 }}>
            <div className="rdv-staff-name">{s.name}</div>
            <div className="rdv-staff-role">{s.role}</div>
            <div className="rdv-staff-specialties" style={{ marginTop: 6 }}>
              {s.specialties.map((sp) => <span key={sp} className="rdv-staff-spec-tag">{sp}</span>)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="rdv-staff-rating">
              <Icon name="star" size={14} color="#B8902B" fill="#B8902B" />
              {s.rating}
            </div>
            <div style={{ fontSize: 11, color: "var(--adm-ink-mute)", marginTop: 3 }}>{s.reviews} avis</div>
          </div>
          <div className="adm-rowactions" style={{ marginLeft: 16 }}>
            <button className="adm-act" onClick={() => showToast("Modification prothésiste — bientôt disponible")}><Icon name="edit" size={14} /></button>
          </div>
        </div>
      ))}
    </div>
    {toast && <AdminToast msg={toast} />}
    </>
  );
}

/* ── Notifications tab ──────────────────────────────────────────────── */
function NotificationsView({ notifications, services, onMarkAllRead }: {
  notifications: Notification[];
  services: Service[];
  onMarkAllRead: () => void;
}) {
  const sorted = [...notifications].sort((a, b) => b.ts.localeCompare(a.ts));

  const typeLabel: Record<string, string> = {
    new: "a réservé",
    cancel: "a annulé",
    move: "a modifié",
    update: "a mis à jour",
  };

  return (
    <div className="adm-card adm-list-card">
      <div className="adm-list-card-head">
        <div>
          <div className="adm-card-title">Notifications</div>
          <div className="adm-card-sub">{notifications.filter((n) => !n.read).length} non lue(s)</div>
        </div>
        {notifications.some((n) => !n.read) && (
          <button className="adm-btn ghost sm" onClick={onMarkAllRead}>Tout marquer lu</button>
        )}
      </div>
      {sorted.length === 0 ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--adm-ink-mute)", fontSize: 13 }}>
          <Icon name="bell" size={32} color="var(--adm-border)" />
          <div style={{ marginTop: 10 }}>Aucune notification</div>
        </div>
      ) : sorted.map((n) => {
        const svc = services.find((s) => s.id === n.serviceId) ?? null;
        return (
          <div key={n.id} className={`rdv-notif-item${!n.read ? " unread" : ""}`}>
            <div className="rdv-notif-icon" style={{ background: n.type === "cancel" ? "rgba(194,85,122,.14)" : "rgba(47,158,104,.14)" }}>
              <Icon name={n.type === "cancel" ? "x" : "calendar"} size={16} color={n.type === "cancel" ? "#C2557A" : "#2F9E68"} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="rdv-notif-name">{n.clientName} <span style={{ fontWeight: 400, color: "var(--adm-ink-soft)" }}>{typeLabel[n.type] ?? "a modifié"} · {svc?.name ?? n.serviceId}</span></div>
              <div className="rdv-notif-time">{timeAgo(n.ts)}</div>
            </div>
            {!n.read && <div className="rdv-notif-unread-dot" />}
          </div>
        );
      })}
    </div>
  );
}

/* ── Root RDV module ────────────────────────────────────────────────── */
export function RdvModule() {
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const { appointments, updateStatus } = useAllAppointments();
  const { notifications: rawNotifications } = useRdvNotifications();
  const { services: catalogServices } = useAdminServiceCategories();

  const notifications = rawNotifications.map((n) => ({ ...n, read: readIds.has(n.id) }));

  async function handleStatusChange(id: string, status: Appointment["status"]) {
    await updateStatus(id, status);
    setSelectedAppt(null);
  }

  function handleMarkAllRead() {
    setReadIds(new Set(rawNotifications.map((n) => n.id)));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div className="adm-content">
        {/* Header */}
        <div className="adm-topbar">
          <div>
            <div className="adm-page-eyebrow"><span className="dot" />SYSTÈME CONNECTÉ · TEMPS RÉEL</div>
            <h1 className="adm-h1">Rendez-vous</h1>
          </div>
          <div className="adm-topbar-right">
            <button type="button" className="adm-notif-btn" aria-label="Notifications">
              <Icon name="bell" size={18} />
              {unreadCount > 0 && <span className="adm-notif-badge">{unreadCount}</span>}
            </button>
            <button type="button" className="adm-btn gold sm">
              <Icon name="calendar" size={15} /> Ouvrir le calendrier
            </button>
          </div>
        </div>

        <AdminAccordionStack>
          <AdminAccordion title="Vue d'ensemble">
            <Dashboard
              appointments={appointments}
              notifications={notifications}
              services={catalogServices}
              onOpenCalendar={() => {}}
            />
          </AdminAccordion>

          <AdminAccordion title="Calendrier">
            <CalendarView appointments={appointments} services={catalogServices} onSelectAppt={setSelectedAppt} />
          </AdminAccordion>

          <AdminAccordion title="Horaires">
            <AvailabilityView />
          </AdminAccordion>

          <AdminAccordion title="Prestations">
            <ServicesView />
          </AdminAccordion>

          <AdminAccordion title="Catégories">
            <ServiceCategoriesModule embedded />
          </AdminAccordion>

          <AdminAccordion title="Prothésistes">
            <StaffView />
          </AdminAccordion>

          <AdminAccordion title="Notifications">
            <NotificationsView notifications={notifications} services={catalogServices} onMarkAllRead={handleMarkAllRead} />
          </AdminAccordion>
        </AdminAccordionStack>
      </div>

      {/* Appointment detail drawer */}
      {selectedAppt && (
        <ApptDrawer
          appt={selectedAppt}
          services={catalogServices}
          onClose={() => setSelectedAppt(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}
