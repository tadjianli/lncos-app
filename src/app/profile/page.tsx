import { AppShell } from "@/components/layout/AppShell";

/* ── Notification Bell ───────────────────────────────────────────────────── */
function NotificationBell() {
  return (
    <button className="relative w-10 h-10 flex items-center justify-center active:scale-90 transition-transform duration-100">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2a7 7 0 00-7 7v4l-2 3h18l-2-3V9a7 7 0 00-7-7z"
          stroke="white"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M9 19a3 3 0 006 0" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {/* Red notification dot */}
      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
    </button>
  );
}

/* ── Stats Card ─────────────────────────────────────────────────────────── */
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center py-4 rounded-[1rem]"
      style={{ background: "#1E1812" }}
    >
      <span className="text-[1.6rem] font-bold leading-none" style={{ color: "#D4A820" }}>
        {value}
      </span>
      <span className="text-[0.72rem] text-[--cream-muted] mt-1.5 font-normal">{label}</span>
    </div>
  );
}

/* ── Menu Row ────────────────────────────────────────────────────────────── */
interface MenuRowProps {
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  subtitle: string;
  subtitleColor?: string;
  isLast?: boolean;
}
function MenuRow({ icon, iconBg = "#2E2418", title, subtitle, subtitleColor = "#8A8888", isLast }: MenuRowProps) {
  return (
    <>
      <button className="flex items-center gap-4 px-5 py-4 w-full active:bg-[rgba(255,255,255,0.03)] transition-colors duration-100">
        {/* Icon container */}
        <div
          className="w-11 h-11 rounded-[0.75rem] flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg }}
        >
          {icon}
        </div>

        {/* Text */}
        <div className="flex-1 text-left">
          <p className="text-[0.95rem] font-bold text-white leading-tight">{title}</p>
          <p className="text-[0.78rem] mt-0.5 leading-tight" style={{ color: subtitleColor }}>
            {subtitle}
          </p>
        </div>

        {/* Chevron */}
        <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
          <path d="M1 1l6 6-6 6" stroke="#4A4540" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Divider */}
      {!isLast && (
        <div className="mx-5 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
      )}
    </>
  );
}

/* ── Profile Page ────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  return (
    <AppShell topBar={false} cartCount={0}>
      {/* Page title row */}
      <div className="flex items-center justify-between px-5 pt-14 pb-5">
        <h1 className="text-[2rem] font-bold text-white tracking-[-0.02em]">Profil</h1>
        <NotificationBell />
      </div>

      <div className="px-4 flex flex-col gap-4">

        {/* ── User card ─────────────────────────────────────────── */}
        <div
          className="rounded-[1.25rem] px-5 py-5 flex items-center gap-4"
          style={{ background: "#1E1812" }}
        >
          {/* Avatar */}
          <div
            className="w-[4.5rem] h-[4.5rem] rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "#EFBDD0" }}
          >
            <span className="text-[1.75rem] font-bold text-white">E</span>
          </div>

          {/* Name / email / badge */}
          <div className="flex flex-col gap-1">
            <p className="text-[1.1rem] font-bold text-white leading-tight">Emma Dubois</p>
            <p className="text-[0.78rem] text-[--cream-muted]">emma.d@email.com</p>
            {/* Membre Or badge */}
            <div
              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full self-start"
              style={{
                border: "1px solid rgba(201,169,110,0.55)",
                background: "rgba(201,169,110,0.08)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L7.2 4.5H11L8 6.5l1 3.5L6 8 3 10l1-3.5L1 4.5H4.8z" fill="#C9A96E" />
              </svg>
              <span className="text-[0.6rem] font-bold tracking-[0.12em] text-[#C9A96E]">MEMBRE OR</span>
            </div>
          </div>
        </div>

        {/* ── Gold CTA banner ───────────────────────────────────── */}
        <button
          className="w-full rounded-[1.25rem] flex items-center gap-4 px-5 py-4 active:scale-[0.98] transition-transform duration-150"
          style={{
            background: "linear-gradient(135deg, #B8900C 0%, #D4AE20 45%, #C49A15 100%)",
          }}
        >
          {/* Icon */}
          <div
            className="w-11 h-11 rounded-[0.75rem] flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(0,0,0,0.22)" }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="4" width="18" height="16" rx="3" stroke="rgba(0,0,0,0.8)" strokeWidth="1.5" />
              <path d="M7 2v4M15 2v4M2 9h18" stroke="rgba(0,0,0,0.8)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Text */}
          <div className="flex-1 text-left">
            <p className="text-[1.05rem] font-bold leading-tight" style={{ color: "#1A1200" }}>
              Prendre rendez-vous
            </p>
            <p className="text-[0.72rem] mt-0.5 leading-snug" style={{ color: "rgba(26,18,0,0.72)" }}>
              Manucure · extensions · nail art — en 60s
            </p>
          </div>

          {/* Arrow */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M5 11h12M12 6l5 5-5 5" stroke="rgba(26,18,0,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* ── Stats row ─────────────────────────────────────────── */}
        <div className="flex gap-3">
          <StatCard value="12"    label="Commandes" />
          <StatCard value="1 240" label="Points"    />
          <StatCard value="2"     label="Favoris"   />
        </div>

        {/* ── Menu list ─────────────────────────────────────────── */}
        <div
          className="rounded-[1.25rem] overflow-hidden"
          style={{ background: "#1E1812" }}
        >
          <MenuRow
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="3" width="16" height="15" rx="3" stroke="#C9A820" strokeWidth="1.4" />
                <path d="M6 1v4M14 1v4M2 8h16" stroke="#C9A820" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            }
            iconBg="#2E2418"
            title="Mes rendez-vous"
            subtitle="1 à venir"
            subtitleColor="#D4A820"
          />
          <MenuRow
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M5 4h10l1.5 10H3.5L5 4z"
                  stroke="#8A8888"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
                <path d="M8 4V3a2 2 0 014 0v1" stroke="#8A8888" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            }
            iconBg="#252525"
            title="Mes commandes"
            subtitle="3 en cours"
          />
          <MenuRow
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 17.5C10 17.5 2 13 2 7.5a4 4 0 018-1.09A4 4 0 0118 7.5c0 5.5-8 10-8 10z"
                  stroke="#8A8888"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
            }
            iconBg="#252525"
            title="Mes favoris"
            subtitle="2 produits"
          />
          <MenuRow
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2l2 5h5.5l-4.5 3.5 1.5 5-4.5-3-4.5 3 1.5-5L2.5 7H8z" fill="#C9A820" />
              </svg>
            }
            iconBg="#2E2418"
            title="Programme VIP"
            subtitle="Niveau Or · 1 240 pts"
            subtitleColor="#D4A820"
            isLast
          />
        </div>

        {/* Bottom padding */}
        <div className="h-4" />
      </div>
    </AppShell>
  );
}
