import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";

const CATEGORIES = [
  {
    id: "soins",
    label: "Soins visage",
    count: 48,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3C8 6 5 9 5 13a7 7 0 0014 0c0-4-3-7-7-10z"
          stroke="#C07090"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M9 13a3 3 0 006 0" stroke="#C07090" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 7v2M10 9l1.5 1.5M14 9l-1.5 1.5" stroke="#C07090" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "maquillage",
    label: "Maquillage",
    count: 72,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3l2 5.5h5.5l-4.5 3.5 1.5 5L12 14l-4.5 3 1.5-5L4.5 8.5H10z"
          stroke="#C07090"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "parfums",
    label: "Parfums",
    count: 26,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C9 4.5 6 7 6 11a6 6 0 0012 0c0-4-3-6.5-6-9z"
          stroke="#C07090"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "corps",
    label: "Corps & bain",
    count: 34,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21C12 21 4 16 4 10a4.5 4.5 0 019-0.6A4.5 4.5 0 0120 10c0 6-8 11-8 11z"
          stroke="#C07090"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

function CategoryRow({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.1rem] active:scale-[0.98] transition-transform duration-100"
      style={{ background: "#1A1A1A" }}
    >
      {/* Pink icon container */}
      <div
        className="w-12 h-12 rounded-[0.875rem] flex items-center justify-center flex-shrink-0"
        style={{ background: "#F5CED8" }}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 text-left">
        <p className="text-[1rem] font-bold text-white leading-tight">{label}</p>
        <p className="text-[0.78rem] text-[--cream-muted] mt-0.5">{count} produits</p>
      </div>

      {/* Chevron */}
      <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
        <path d="M1 1l6 6-6 6" stroke="#4A4A4A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default function DiscoverPage() {
  const searchIcon = (
    <button className="w-10 h-10 flex items-center justify-center active:scale-90 transition-transform duration-100">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="9.5" cy="9.5" r="6.5" stroke="white" strokeWidth="1.8" />
        <path d="M14 14l4.5 4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  );

  return (
    <AppShell topBar={false} cartCount={0}>
      <PageHeader title="Catégories" rightAction={searchIcon} />

      <div className="px-4 flex flex-col gap-3 mt-2">
        {CATEGORIES.map((cat) => (
          <CategoryRow key={cat.id} icon={cat.icon} label={cat.label} count={cat.count} />
        ))}
      </div>
    </AppShell>
  );
}
