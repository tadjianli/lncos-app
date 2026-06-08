import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";

export default function BagPage() {
  return (
    <AppShell topBar={false} cartCount={0}>
      <PageHeader title="Mon panier" />

      {/* Empty state — vertically centered */}
      <div className="flex flex-col items-center justify-center px-8 text-center" style={{ minHeight: "65dvh" }}>
        {/* Icon circle */}
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center mb-8"
          style={{ background: "#1A1A1A" }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path
              d="M8 12h28l-3.5 20H11.5L8 12z"
              stroke="#5A5A5A"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M16 12V10a6 6 0 0112 0v2"
              stroke="#5A5A5A"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Title */}
        <p className="text-[1.5rem] font-bold text-white mb-3 leading-tight">
          Votre panier est vide
        </p>

        {/* Subtitle */}
        <p className="text-[0.9rem] text-[--cream-muted] leading-relaxed mb-10 max-w-[26ch]">
          Découvrez nos best-sellers et offrez-vous un moment de beauté.
        </p>

        {/* Pink CTA */}
        <button
          className="w-full h-[3.25rem] rounded-full font-bold text-[1rem] active:scale-[0.97] transition-transform duration-100"
          style={{
            background: "#CC96AE",
            color: "#1A0A12",
            boxShadow: "0 4px 20px rgba(204,150,174,0.35), 0 0 0 1px rgba(204,150,174,0.15)",
          }}
        >
          Découvrir la boutique
        </button>
      </div>
    </AppShell>
  );
}
