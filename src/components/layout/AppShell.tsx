import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  topBar?: boolean;
  bottomNav?: boolean;
  transparentTopBar?: boolean;
  cartCount?: number;
  className?: string;
}

export function AppShell({
  children,
  topBar = true,
  bottomNav = true,
  transparentTopBar = false,
  cartCount = 0,
  className,
}: AppShellProps) {
  return (
    <div className="relative min-h-dvh w-full max-w-[480px] mx-auto">
      {topBar && (
        <TopBar transparent={transparentTopBar} cartCount={cartCount} />
      )}
      <main
        className={cn(
          topBar && "pt-16",
          bottomNav && "pb-nav",
          className
        )}
      >
        {children}
      </main>
      {bottomNav && <BottomNav />}
    </div>
  );
}
