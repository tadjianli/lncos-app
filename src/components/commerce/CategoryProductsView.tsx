"use client";

import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/shared/Icon";
import { GoldBtn } from "@/components/shared/ActionButtons";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { SkeletonProductRow } from "@/components/shared/Skeleton";
import type { Product } from "@/lib/data";

interface CategoryProductsViewProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyMessage?: string;
  variant?: "default" | "category";
  bottomClearance?: boolean;
  priorityCount?: number;
  getCellStyle?: (index: number) => CSSProperties | undefined;
  header?: ReactNode;
}

function EmptyProductsState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 24px 56px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 82,
          height: 82,
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(212,175,55,.1), rgba(212,175,55,.04))",
          border: "1.5px solid rgba(212,175,55,.22)",
          display: "grid",
          placeItems: "center",
          marginBottom: 24,
        }}
      >
        <Icon name="bag" size={34} color="var(--gold)" />
      </div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: ".18em",
          textTransform: "uppercase",
          color: "var(--gold)",
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        Catalogue
      </div>
      <h3 style={{ margin: "0 0 10px", fontSize: 21, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>
        {title}
      </h3>
      <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.55, maxWidth: 260 }}>
        {message}
      </p>
    </div>
  );
}

function ErrorProductsState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 24px 56px",
        textAlign: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 82,
          height: 82,
          borderRadius: "50%",
          background: "rgba(255,90,90,.08)",
          border: "1px solid rgba(255,90,90,.2)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Icon name="alert" size={32} color="#FF7070" />
      </div>
      <div>
        <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>
          Chargement impossible
        </h3>
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.5, maxWidth: 280 }}>
          {message}
        </p>
      </div>
      {onRetry && (
        <GoldBtn onClick={onRetry} style={{ minWidth: 160 }}>
          Réessayer
        </GoldBtn>
      )}
    </div>
  );
}

export function CategoryProductsView({
  products,
  loading = false,
  error = null,
  onRetry,
  emptyTitle = "Aucun produit disponible",
  emptyMessage = "Revenez bientôt — de nouvelles références arrivent très prochainement.",
  variant = "default",
  bottomClearance = true,
  priorityCount = 4,
  getCellStyle,
  header,
}: CategoryProductsViewProps) {
  if (loading && products.length === 0) {
    return (
      <>
        {header}
        <SkeletonProductRow count={4} />
      </>
    );
  }

  if (error && products.length === 0) {
    return (
      <>
        {header}
        <ErrorProductsState message={error} onRetry={onRetry} />
      </>
    );
  }

  if (products.length === 0) {
    return (
      <>
        {header}
        <EmptyProductsState title={emptyTitle} message={emptyMessage} />
      </>
    );
  }

  return (
    <>
      {header}
      <ProductGrid
        products={products}
        variant={variant}
        bottomClearance={bottomClearance}
        priorityCount={priorityCount}
        getCellStyle={getCellStyle}
      />
    </>
  );
}
