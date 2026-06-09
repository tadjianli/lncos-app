"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import type { ProductVariant } from "@/lib/product-catalog";
import { newVariantDraft, slugifyProductId } from "@/lib/product-catalog";
import { uploadProductImage, isImageUrl } from "@/lib/admin-media";

interface ProductVariantsEditorProps {
  productId: string;
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

export function ProductVariantsEditor({ productId, variants, onChange }: ProductVariantsEditorProps) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  function updateVariant(id: string, patch: Partial<ProductVariant>) {
    onChange(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  function addVariant() {
    onChange([...variants, newVariantDraft(productId, variants.length)]);
  }

  function removeVariant(id: string) {
    onChange(variants.filter((v) => v.id !== id));
  }

  async function uploadVariantImage(variantId: string, file: File) {
    if (!productId || productId === "__new__") return;
    setUploadingId(variantId);
    const variant = variants.find((v) => v.id === variantId);
    const slug = variant?.name ? slugifyProductId(variant.name) : `variant-${variantId.slice(0, 8)}`;
    const { url, error } = await uploadProductImage(file, productId, slug);
    setUploadingId(null);
    if (url) updateVariant(variantId, { imageUrl: url });
    else if (error) alert(error);
  }

  return (
    <div className="adm-variants-editor">
      {variants.length === 0 && (
        <p className="adm-variants-empty">Aucune variante — le prix et stock du produit principal s&apos;appliquent.</p>
      )}

      {variants.map((v, index) => (
        <VariantRow
          key={v.id}
          variant={v}
          index={index}
          uploading={uploadingId === v.id}
          canUpload={productId !== "__new__"}
          onChange={(patch) => updateVariant(v.id, patch)}
          onRemove={() => removeVariant(v.id)}
          onUpload={(file) => void uploadVariantImage(v.id, file)}
        />
      ))}

      <button type="button" className="adm-btn ghost sm adm-variants-add" onClick={addVariant}>
        <Icon name="plus" size={15} /> Ajouter une variante
      </button>
    </div>
  );
}

function VariantRow({
  variant,
  index,
  uploading,
  canUpload,
  onChange,
  onRemove,
  onUpload,
}: {
  variant: ProductVariant;
  index: number;
  uploading: boolean;
  canUpload: boolean;
  onChange: (patch: Partial<ProductVariant>) => void;
  onRemove: () => void;
  onUpload: (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="adm-variant-card">
      <div className="adm-variant-card-head">
        <span className="adm-variant-index">Variante {index + 1}</span>
        <button type="button" className="adm-iconbtn sm" onClick={onRemove} title="Supprimer">
          <Icon name="trash" size={14} color="var(--tone-pink)" />
        </button>
      </div>

      <div className="adm-variant-grid">
        <label className="adm-variant-field">
          <span>Nom</span>
          <input className="ab-input" value={variant.name} placeholder="Rose, Nude, 50ml…" onChange={(e) => onChange({ name: e.target.value })} />
        </label>
        <label className="adm-variant-field">
          <span>Prix (€)</span>
          <input className="ab-input" type="number" min={0} step={0.01} value={variant.price || ""} onChange={(e) => onChange({ price: Number(e.target.value) })} />
        </label>
        <label className="adm-variant-field">
          <span>Stock</span>
          <input className="ab-input" type="number" min={0} value={variant.stock} onChange={(e) => onChange({ stock: Number(e.target.value) })} />
        </label>
        <label className="adm-variant-field">
          <span>SKU</span>
          <input className="ab-input" value={variant.sku} placeholder="COS-001-R" onChange={(e) => onChange({ sku: e.target.value })} />
        </label>
      </div>

      <div className="adm-variant-image-row">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="adm-image-input"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          className="adm-btn ghost sm"
          disabled={!canUpload || uploading}
          onClick={() => fileRef.current?.click()}
        >
          <Icon name="plus" size={14} />
          {uploading ? "Envoi…" : "Image variante"}
        </button>
        {variant.imageUrl && isImageUrl(variant.imageUrl) && (
          <div className="adm-variant-thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={variant.imageUrl} alt={variant.name} />
            <button type="button" className="adm-variant-thumb-clear" onClick={() => onChange({ imageUrl: null })}>
              <Icon name="x" size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
