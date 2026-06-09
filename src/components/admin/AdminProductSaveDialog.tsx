"use client";

import { Icon } from "@/components/shared/Icon";
import type { Product } from "@/lib/data";
import {
  getProductViewActionLabel,
  openProductInStorefront,
} from "@/lib/product-catalog";

interface AdminProductSaveDialogProps {
  mode: "create" | "edit";
  product: Product;
  onContinue: () => void;
  onBackToList: () => void;
}

export function AdminProductSaveDialog({
  mode,
  product,
  onContinue,
  onBackToList,
}: AdminProductSaveDialogProps) {
  const viewLabel = getProductViewActionLabel(product);
  const title =
    mode === "create"
      ? "Produit créé avec succès"
      : "Modifications enregistrées";

  return (
    <div className="adm-save-dialog-overlay" role="dialog" aria-modal="true">
      <div className="adm-save-dialog">
        <div className="adm-save-dialog-icon" aria-hidden>
          <Icon name="check" size={22} color="#2F9E68" />
        </div>
        <h3 className="adm-save-dialog-title">{title}</h3>
        <p className="adm-save-dialog-sub">
          <strong>{product.name}</strong> est prêt côté boutique.
        </p>
        <div className="adm-save-dialog-actions">
          <button
            type="button"
            className="adm-btn gold"
            onClick={() => openProductInStorefront(product)}
          >
            <Icon name="eye" size={15} />
            {viewLabel === "Prévisualiser" ? "Prévisualiser le produit" : "Voir le produit"}
          </button>
          <button type="button" className="adm-btn" onClick={onContinue}>
            Continuer l&apos;édition
          </button>
          <button type="button" className="adm-btn ghost" onClick={onBackToList}>
            Retour à la liste
          </button>
        </div>
      </div>
    </div>
  );
}
