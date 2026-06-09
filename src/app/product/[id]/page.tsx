"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useStore } from "@/lib/store";
import { fetchPublicProductById } from "@/lib/client-supabase";

export default function ProductPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = typeof params.id === "string" ? params.id : "";
  const preview = searchParams.get("preview") === "1";
  const openProduct = useStore((s) => s.openProduct);
  const [status, setStatus] = useState<"loading" | "ok" | "missing">("loading");

  useEffect(() => {
    if (!id) {
      setStatus("missing");
      return;
    }

    let cancelled = false;
    void fetchPublicProductById(id, { preview }).then((product) => {
      if (cancelled) return;
      if (product) {
        openProduct(product);
        setStatus("ok");
      } else {
        setStatus("missing");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [id, preview, openProduct]);

  return (
    <AppShell>
      <div
        style={{
          flex: "1 1 auto",
          display: "grid",
          placeItems: "center",
          padding: 24,
          color: "var(--ink-mute)",
          fontSize: 14,
        }}
      >
        {status === "loading" && "Ouverture de la fiche produit…"}
        {status === "missing" && "Produit introuvable ou non publié."}
      </div>
    </AppShell>
  );
}
