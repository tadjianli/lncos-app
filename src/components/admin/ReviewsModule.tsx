"use client";

import { useMemo, useState } from "react";
import { useProductReviewsAdmin, useProducts } from "@/lib/admin-supabase";
import type { ProductReview, ReviewStatus } from "@/lib/reviews";
import {
  REVIEW_STATUS_LABELS,
  formatReviewDate,
  sortReviews,
  reviewDisplayDate,
} from "@/lib/reviews";
import {
  DRAFT_LENGTH_LABELS,
  DRAFT_STYLE_LABELS,
  generateReviewDrafts,
  type DraftLength,
  type DraftStyle,
} from "@/lib/review-drafts";
import { Icon } from "@/components/shared/Icon";
import { AdminToast, type AdminToastVariant } from "@/components/admin/AdminToast";
import { ReviewFormModal, type ReviewFormValues } from "@/components/admin/ReviewFormModal";
import { isImageUrl } from "@/lib/admin-media";

function Stars({ n }: { n: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          name="star"
          size={13}
          color={i < n ? "var(--tone-gold)" : "var(--adm-border)"}
          fill={i < n ? "var(--tone-gold)" : "none"}
        />
      ))}
    </div>
  );
}

function ReviewRow({
  r,
  isLast,
  onEdit,
  onUpdate,
  onDelete,
}: {
  r: ProductReview;
  isLast: boolean;
  onEdit: () => void;
  onUpdate: (patch: Partial<ProductReview>) => void;
  onDelete: () => void;
}) {
  const st = REVIEW_STATUS_LABELS[r.status];
  return (
    <div
      className="rev-preview-row"
      style={{ borderBottom: isLast ? "none" : "1px solid var(--adm-border-2)" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {isImageUrl(r.authorPhotoUrl) ? (
          <img
            src={r.authorPhotoUrl!}
            alt=""
            style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
        ) : (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--adm-gold-bg)",
              display: "grid",
              placeItems: "center",
              color: "var(--adm-gold)",
              fontWeight: 800,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {r.authorName[0]}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: "var(--adm-ink)" }}>{r.authorName}</span>
            <Stars n={r.rating} />
            <span className="adm-badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
            {r.pinned && <span className="adm-badge" style={{ background: "rgba(212,175,55,.12)", color: "var(--adm-gold)" }}>Épinglé</span>}
            {r.featured && <span className="adm-badge" style={{ background: "rgba(194,85,122,.1)", color: "var(--tone-pink)" }}>Vedette</span>}
            {r.homepageFeatured && <span className="adm-badge" style={{ background: "rgba(80,140,220,.1)", color: "#5B9BD5" }}>Accueil</span>}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--adm-ink-mute)", marginBottom: 4 }}>
            {r.productName} · {formatReviewDate(reviewDisplayDate(r))}
          </div>
          {r.title && (
            <div style={{ fontWeight: 600, fontSize: 12.5, color: "var(--adm-ink)", marginBottom: 4 }}>{r.title}</div>
          )}
          <p style={{ fontSize: 13, color: "var(--adm-ink-soft)", margin: "0 0 8px", lineHeight: 1.5 }}>{r.body}</p>
          {r.images.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              {r.images.map((img) => (
                <img
                  key={img.id}
                  src={img.imageUrl}
                  alt=""
                  style={{ width: 48, height: 48, borderRadius: 6, objectFit: "cover" }}
                />
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="adm-btn gold sm" onClick={onEdit}>Modifier</button>
            {r.status !== "published" && (
              <button type="button" className="adm-btn sm" onClick={() => onUpdate({ status: "published" })}>Publier</button>
            )}
            {r.status !== "rejected" && r.status !== "draft" && (
              <button type="button" className="adm-btn sm" onClick={() => onUpdate({ status: "rejected" })}>Rejeter</button>
            )}
            <button type="button" className="adm-btn sm" onClick={() => onUpdate({ pinned: !r.pinned })}>
              {r.pinned ? "Désépingler" : "Épingler"}
            </button>
            <button type="button" className="adm-btn sm" style={{ color: "#FF7070" }} onClick={onDelete}>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DraftGeneratorModal({
  products,
  onClose,
  onGenerate,
}: {
  products: { id: string; name: string }[];
  onClose: () => void;
  onGenerate: (productId: string, productName: string, count: number, style: DraftStyle, length: DraftLength) => Promise<string | null>;
}) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [count, setCount] = useState(5);
  const [style, setStyle] = useState<DraftStyle>("luxe");
  const [length, setLength] = useState<DraftLength>("moyen");
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setGenerating(true);
    const err = await onGenerate(product.id, product.name, count, style, length);
    setGenerating(false);
    if (!err) onClose();
  }

  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div className="ab-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="ab-modal-head">
          <div className="ab-modal-title">Générer des brouillons</div>
          <button className="adm-iconbtn" onClick={onClose} type="button"><Icon name="x" size={17} /></button>
        </div>

        <p style={{ fontSize: 12.5, color: "var(--adm-ink-mute)", margin: "0 0 16px", lineHeight: 1.5 }}>
          Les brouillons sont créés avec le statut « Brouillon » et ne sont jamais publiés automatiquement.
        </p>

        <div className="ab-field">
          <label>Produit</label>
          <select className="ab-input" value={productId} onChange={(e) => setProductId(e.target.value)}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="ab-field">
          <label>Nombre d&apos;avis (1 à 20)</label>
          <input
            className="ab-input"
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={(e) => setCount(Math.min(20, Math.max(1, Number(e.target.value))))}
          />
        </div>

        <div className="ab-field">
          <label>Style</label>
          <select className="ab-input" value={style} onChange={(e) => setStyle(e.target.value as DraftStyle)}>
            {(Object.keys(DRAFT_STYLE_LABELS) as DraftStyle[]).map((k) => (
              <option key={k} value={k}>{DRAFT_STYLE_LABELS[k]}</option>
            ))}
          </select>
        </div>

        <div className="ab-field">
          <label>Longueur</label>
          <select className="ab-input" value={length} onChange={(e) => setLength(e.target.value as DraftLength)}>
            {(Object.keys(DRAFT_LENGTH_LABELS) as DraftLength[]).map((k) => (
              <option key={k} value={k}>{DRAFT_LENGTH_LABELS[k]}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" className="adm-btn" onClick={onClose}>Annuler</button>
          <button type="button" className="adm-btn gold" onClick={() => void handleGenerate()} disabled={generating || !productId}>
            {generating ? "Génération…" : "Créer les brouillons"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReviewsModule() {
  const { products } = useProducts();
  const {
    reviews,
    loading,
    stats,
    updateReview,
    deleteReview,
    createReview,
    setReviewImages,
    createDraftReviews,
  } = useProductReviewsAdmin();

  const [filter, setFilter] = useState<ReviewStatus | "all" | "featured">("all");
  const [editing, setEditing] = useState<ProductReview | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [toast, setToast] = useState<{ msg: string; variant: AdminToastVariant } | null>(null);

  const filtered = useMemo(() => {
    let list = reviews;
    if (filter === "featured") list = reviews.filter((r) => r.featured && r.status === "published");
    else if (filter !== "all") list = reviews.filter((r) => r.status === filter);
    return sortReviews(list, reviewDisplayDate);
  }, [reviews, filter]);

  const featuredReviews = useMemo(
    () => sortReviews(reviews.filter((r) => r.featured && r.status === "published"), reviewDisplayDate).slice(0, 6),
    [reviews]
  );

  function showToast(msg: string, variant: AdminToastVariant = "success") {
    setToast({ msg, variant });
    setTimeout(() => setToast(null), 2800);
  }

  async function handleUpdate(id: string, patch: Partial<ProductReview>) {
    const { error } = await updateReview(id, patch);
    showToast(error ?? "Avis mis à jour", error ? "error" : "success");
  }

  async function saveReview(values: ReviewFormValues, reviewId?: string) {
    const patch: Partial<ProductReview> = {
      authorName: values.authorName,
      authorEmail: values.authorEmail || null,
      authorPhotoUrl: values.authorPhotoUrl,
      productId: values.productId || null,
      productName: values.productName,
      title: values.title,
      rating: values.rating,
      body: values.body,
      status: values.status,
      verified: values.verified,
      featured: values.featured,
      pinned: values.pinned,
      homepageFeatured: values.homepageFeatured,
      reviewDate: values.reviewDate,
    };

    if (reviewId) {
      const { error } = await updateReview(reviewId, patch);
      if (error) {
        showToast(error, "error");
        return error;
      }
      await setReviewImages(reviewId, values.imageUrls);
      showToast("Avis mis à jour");
      return null;
    }

    const { review, error } = await createReview(patch);
    if (error || !review) {
      showToast(error ?? "Erreur", "error");
      return error;
    }
    if (values.imageUrls.length > 0) await setReviewImages(review.id, values.imageUrls);
    showToast("Avis créé");
    return null;
  }

  async function handleGenerateDrafts(
    productId: string,
    productName: string,
    count: number,
    style: DraftStyle,
    length: DraftLength
  ) {
    const drafts = generateReviewDrafts(productName, count, style, length);
    const { count: created, error } = await createDraftReviews(productId, productName, drafts);
    showToast(error ?? `${created} brouillon${created > 1 ? "s" : ""} créé${created > 1 ? "s" : ""}`, error ? "error" : "success");
    return error;
  }

  return (
    <div className="adm-content">
      {toast && <AdminToast msg={toast.msg} variant={toast.variant} />}

      <div className="adm-topbar">
        <div>
          <h1 className="adm-h1">Avis clients</h1>
          <p className="adm-sub">Modération, création et mise en avant des avis</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="adm-btn" onClick={() => setShowDrafts(true)}>
            <Icon name="sparkle" size={15} /> Générer des brouillons
          </button>
          <button type="button" className="adm-btn gold" onClick={() => { setEditing(null); setShowCreate(true); }}>
            <Icon name="plus" size={15} /> Ajouter un avis
          </button>
        </div>
      </div>

      <div className="adm-grid-4">
        {[
          { label: "Avis total", value: String(stats.total), color: "var(--adm-ink)" },
          { label: "Note moyenne", value: stats.published ? stats.avg.toFixed(1) : "—", color: "var(--tone-gold)" },
          { label: "En attente", value: String(stats.pending), color: "var(--tone-orange)" },
          { label: "Brouillons", value: String(stats.drafts), color: "var(--adm-ink-mute)" },
        ].map((s) => (
          <div key={s.label} className="adm-card adm-stat">
            <div className="adm-stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="adm-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {featuredReviews.length > 0 && (
        <div className="adm-card" style={{ marginBottom: 18 }}>
          <div className="adm-card-head">
            <h2 className="adm-card-title">Avis vedettes</h2>
            <span className="adm-badge" style={{ background: "rgba(194,85,122,.1)", color: "var(--tone-pink)" }}>
              {stats.featured} publié{stats.featured !== 1 ? "s" : ""}
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--adm-ink-mute)", margin: "0 0 14px" }}>
            Avis cochés « Mis en avant » — visibles sur l&apos;accueil, les landing pages et certaines fiches produit.
          </p>
          <div className="rev-preview-list">
            {featuredReviews.map((r, i) => (
              <ReviewRow
                key={r.id}
                r={r}
                isLast={i === featuredReviews.length - 1}
                onEdit={() => setEditing(r)}
                onUpdate={(patch) => handleUpdate(r.id, patch)}
                onDelete={() => { if (confirm("Supprimer cet avis ?")) deleteReview(r.id); }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="adm-card">
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {([
            ["all", "Tous"],
            ["pending", "En attente"],
            ["published", "Publiés"],
            ["draft", "Brouillons"],
            ["rejected", "Rejetés"],
            ["featured", "Vedettes"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`adm-btn${filter === id ? " gold" : ""}`}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: "var(--adm-ink-mute)", fontSize: 13 }}>Chargement…</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "var(--adm-ink-mute)", fontSize: 13 }}>Aucun avis dans cette catégorie.</p>
        ) : (
          <div className="rev-preview-list">
            {filtered.map((r, i) => (
              <ReviewRow
                key={r.id}
                r={r}
                isLast={i === filtered.length - 1}
                onEdit={() => setEditing(r)}
                onUpdate={(patch) => handleUpdate(r.id, patch)}
                onDelete={() => { if (confirm("Supprimer cet avis ?")) deleteReview(r.id); }}
              />
            ))}
          </div>
        )}
      </div>

      {(showCreate || editing) && (
        <ReviewFormModal
          review={editing}
          products={products}
          onClose={() => { setShowCreate(false); setEditing(null); }}
          onSave={saveReview}
        />
      )}

      {showDrafts && products.length > 0 && (
        <DraftGeneratorModal
          products={products}
          onClose={() => setShowDrafts(false)}
          onGenerate={handleGenerateDrafts}
        />
      )}
    </div>
  );
}
