import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
  bottomNav?: boolean;
  topBar?: boolean; // kept for backward compat, not used
  transparentTopBar?: boolean; // kept for backward compat, not used
  cartCount?: number;
  className?: string; // kept for backward compat
}

export function AppShell({
  children,
  bottomNav = true,
  cartCount = 0,
}: AppShellProps) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        width: "100%",
        maxWidth: 480,
        marginLeft: "auto",
        marginRight: "auto",
        background: "var(--noir)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <main
        style={{
          flex: "1 1 auto",
          paddingBottom: bottomNav
            ? "calc(5rem + env(safe-area-inset-bottom))"
            : 0,
        }}
      >
        {children}
      </main>
      {bottomNav && <BottomNav cartCount={cartCount} />}
    </div>
  );
}
