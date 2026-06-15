"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { Icon } from "@/components/shared/Icon";
import type { BeautyVideo, BeautyVideoCategory, BeautyVideoType } from "@/lib/contracts/beauty-videos";
import {
  BEAUTY_VIDEO_CATEGORIES,
  BEAUTY_VIDEO_TYPE_LABELS,
} from "@/lib/contracts/beauty-videos";
import { getSupabase } from "@/lib/supabase";
import { slugifyTitle } from "@/lib/content-pages";

interface ProductOption {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  stock: number;
  main_image_url: string | null;
  image_url: string | null;
}

interface BeautyVideoEditorProps {
  video: BeautyVideo;
  onClose: () => void;
  onSave: (v: BeautyVideo) => void;
}

function FieldRow({
  label,
  value,
  onChange,
  multiline,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  hint?: string;
}) {
  return (
    <div className="pop-field-row">
      <label className="pop-field-label">{label}</label>
      {multiline ? (
        <textarea className="pop-input pop-textarea" value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
      ) : (
        <input className="pop-input" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint ? <p className="pop-field-hint">{hint}</p> : null}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <label className="ab-toggle" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <div className="ab-toggle-track" />
      <div className="ab-toggle-thumb" />
    </label>
  );
}

const ADMIN_CATEGORIES = BEAUTY_VIDEO_CATEGORIES.filter((c) => c.id !== "all");

export function BeautyVideoEditor({ video, onClose, onSave }: BeautyVideoEditorProps) {
  const [form, setForm] = useState({ ...video });
  const [products, setProducts] = useState<ProductOption[]>([]);

  useEffect(() => {
    void (async () => {
      const { data } = await getSupabase()
        .from("products")
        .select("id,name,price,rating,reviews,stock,main_image_url,image_url")
        .eq("active", true)
        .order("name");
      setProducts((data as ProductOption[] | null) ?? []);
    })();
  }, []);

  const selectedProducts = useMemo(
    () => products.filter((p) => form.relatedProductIds.includes(p.id)),
    [products, form.relatedProductIds]
  );

  const toggleProduct = (id: string) => {
    setForm((prev) => {
      const has = prev.relatedProductIds.includes(id);
      return {
        ...prev,
        relatedProductIds: has
          ? prev.relatedProductIds.filter((x) => x !== id)
          : [...prev.relatedProductIds, id],
      };
    });
  };

  const handleSave = () => {
    const slug = form.slug.trim() || slugifyTitle(form.title);
    onSave({ ...form, slug });
  };

  return (
    <div className="pop-editor-modal" onClick={onClose}>
      <div className="pop-editor pop-editor-wide" onClick={(e) => e.stopPropagation()}>
        <div className="pop-editor-head">
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {video.id.startsWith("__new") ? "Nouvelle vidéo" : "Modifier vidéo"}
          </div>
          <button type="button" className="adm-iconbtn" onClick={onClose}>
            <Icon name="x" size={17} />
          </button>
        </div>

        <div className="pop-editor-form" style={{ padding: 20 }}>
          <FieldRow
            label="Titre"
            value={form.title}
            onChange={(v) =>
              setForm((prev) => ({
                ...prev,
                title: v,
                slug: prev.slug || slugifyTitle(v),
              }))
            }
          />
          <FieldRow
            label="Slug URL"
            value={form.slug}
            onChange={(v) => setForm((prev) => ({ ...prev, slug: slugifyTitle(v) }))}
            hint="/videos/[slug]"
          />
          <FieldRow
            label="Description"
            value={form.description}
            onChange={(v) => setForm((prev) => ({ ...prev, description: v }))}
            multiline
          />

          <div className="pop-field-row">
            <label className="pop-field-label">Miniature</label>
            <AdminImageUpload
              value={form.thumbnailUrl ?? ""}
              onChange={(url) => setForm((prev) => ({ ...prev, thumbnailUrl: url || null }))}
              folder="beauty-videos"
              helpText="Optionnel — image du 1er produit lié si vide."
            />
          </div>

          <div className="pop-field-row">
            <label className="pop-field-label">Type de vidéo</label>
            <select
              className="pop-input"
              value={form.videoType}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, videoType: e.target.value as BeautyVideoType }))
              }
            >
              {(Object.keys(BEAUTY_VIDEO_TYPE_LABELS) as BeautyVideoType[]).map((type) => (
                <option key={type} value={type}>
                  {BEAUTY_VIDEO_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <FieldRow
            label="URL vidéo"
            value={form.videoUrl}
            onChange={(v) => setForm((prev) => ({ ...prev, videoUrl: v }))}
            hint="MP4/WebM pour hébergée, lien TikTok / Reel / Short pour les intégrations."
          />

          <div className="pop-field-row">
            <label className="pop-field-label">Catégorie</label>
            <select
              className="pop-input"
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, category: e.target.value as BeautyVideoCategory }))
              }
            >
              {ADMIN_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <FieldRow
            label="Date de publication"
            value={form.publishedAt}
            onChange={(v) => setForm((prev) => ({ ...prev, publishedAt: v }))}
          />
          <FieldRow
            label="Position"
            value={String(form.position)}
            onChange={(v) => setForm((prev) => ({ ...prev, position: Number(v) || 0 }))}
          />

          <div className="pop-toggle-row">
            <span className="pop-toggle-label">Publié</span>
            <Toggle
              checked={form.published}
              onChange={() => setForm((prev) => ({ ...prev, published: !prev.published }))}
            />
          </div>
          <div className="pop-toggle-row">
            <span className="pop-toggle-label">Vidéo à la une</span>
            <Toggle
              checked={form.featured}
              onChange={() => setForm((prev) => ({ ...prev, featured: !prev.featured }))}
            />
          </div>

          <div className="pop-field-row" style={{ marginTop: 16 }}>
            <label className="pop-field-label">Produits associés</label>
            <p className="pop-field-hint" style={{ marginBottom: 8 }}>
              Données catalogue synchronisées automatiquement (nom, prix, image, avis, stock).
            </p>
            <div className="blog-editor-products" style={{ maxHeight: 220, overflowY: "auto" }}>
              {products.map((p) => {
                const checked = form.relatedProductIds.includes(p.id);
                return (
                  <label key={p.id} className="blog-editor-product-row">
                    <input type="checkbox" checked={checked} onChange={() => toggleProduct(p.id)} />
                    <span>{p.name}</span>
                    <span style={{ marginLeft: "auto", color: "var(--adm-ink-mute)", fontSize: 12 }}>
                      {p.price.toFixed(2)} €
                    </span>
                  </label>
                );
              })}
            </div>
            {selectedProducts.length > 0 ? (
              <p style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 8 }}>
                {selectedProducts.length} produit(s) sélectionné(s)
              </p>
            ) : null}
          </div>
        </div>

        <div className="pop-editor-foot">
          <button type="button" className="adm-btn ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="adm-btn gold" onClick={handleSave}>
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
