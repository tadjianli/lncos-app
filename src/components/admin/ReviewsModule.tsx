"use client";

import { useState } from "react";
import { useProductReviewsAdmin } from "@/lib/admin-supabase";
import type { ProductReview, ReviewStatus } from "@/lib/reviews";
import { formatReviewDate } from "@/lib/reviews";
import { Icon } from "@/components/shared/Icon";
import { AdminToast, type AdminToastVariant } from "@/components/admin/AdminToast";

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

const STATUS_LABELS: Record<ReviewStatus, { label: string; bg: string; color: string }> = {
  pending:   { label: "En attente", bg: "rgba(199,122,51,.1)",  color: "var(--tone-orange)" },
  published: { label: "Publié",     bg: "rgba(47,158,104,.12)", color: "var(--tone-green)" },
  rejected:  { label: "Rejeté",     bg: "rgba(255,90,90,.1)",   color: "#FF7070" },
};

function ReviewEditor({ review, onClose, onSave }: {
  review: ProductReview;
  onClose: () => void;
  onSave: (patch: Partial<ProductReview>) => Promise<void>;
}) {
  const [form, setForm] = useState({ ...review });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({
      authorName: form.authorName,
      productName: form.productName,
      rating: form.rating,
      body: form.body,
      status: form.status,
      verified: form.verified,
      featured: form.featured,
      pinned: form.pinned,
    });
    setSaving(false);
    onClose();
  }

  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div className="ab-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="ab-modal-head">
          <div className="ab-modal-title">Modifier l&apos;avis</div>
          <button className="adm-iconbtn" onClick={onClose} type="button">
            <Icon name="x" size={17} />
          </button>
        </div>

        {[
          { label: "Auteur", key: "authorName" as const, type: "text" },
          { label: "Produit", key: "productName" as const, type: "text" },
        ].map(({ label, key, type }) => (
          <div key={key} className="ab-field">
            <label>{label}</label>
            <input
              className="ab-input"
              type={type}
              value={form[key]}
              onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
            />
          </div>
        ))}

        <div className="ab-field">
          <label>Note</label>
          <select
            className="ab-input"
            value={form.rating}
            onChange={(e) => setForm((p) => ({ ...p, rating: Number(e.target.value) }))}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} étoile{n > 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>

        <div className="ab-field">
          <label>Statut</label>
          <select
            className="ab-input"
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ReviewStatus }))}
          >
            <option value="pending">En attente</option>
            <option value="published">Publié</option>
            <option value="rejected">Rejeté</option>
          </select>
        </div>

        <div className="ab-field">
          <label>Texte de l&apos;avis</label>
          <textarea
            className="ab-input textarea"
            rows={4}
            value={form.body}
            onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
          {([
            ["verified", "Achat vérifié"],
            ["featured", "Mis en avant"],
            ["pinned", "Épinglé"],
          ] as const).map(([key, label]) => (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))}
              />
              {label}
            </label>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" className="adm-btn" onClick={onClose}>Annuler</button>
          <button type="button" className="adm-btn gold" onClick={handleSave} disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReviewsModule() {
  const { reviews, loading, stats, updateReview, deleteReview } = useProductReviewsAdmin();
  const [filter, setFilter] = useState<ReviewStatus | "all">("all");
  const [editing, setEditing] = useState<ProductReview | null>(null);
  const [toast, setToast] = useState<{ msg: string; variant: AdminToastVariant } | null>(null);

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  function showToast(msg: string, variant: AdminToastVariant = "success") {
    setToast({ msg, variant });
    setTimeout(() => setToast(null), 2800);
  }

  async function handleUpdate(id: string, patch: Partial<ProductReview>) {
    const { error } = await updateReview(id, patch);
    showToast(error ?? "Avis mis à jour", error ? "error" : "success");
  }

  return (
    <div className="adm-content">
      {toast && <AdminToast msg={toast.msg} variant={toast.variant} />}

      <div className="adm-topbar">
        <div>
          <h1 className="adm-h1">Avis clients</h1>
          <p className="adm-sub">Modération et modification des avis affichés sur le site</p>
        </div>
      </div>

      <div className="adm-grid-4">
        {[
          { label: "Avis total", value: String(stats.total), color: "var(--adm-ink)" },
          { label: "Note moyenne", value: stats.published ? stats.avg.toFixed(1) : "—", color: "var(--tone-gold)" },
          { label: "En attente", value: String(stats.pending), color: "var(--tone-orange)" },
          { label: "Publiés", value: String(stats.published), color: "var(--tone-green)" },
        ].map((s) => (
          <div key={s.label} className="adm-card adm-stat">
            <div className="adm-stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="adm-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="adm-card">
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {([
            ["all", "Tous"],
            ["pending", "En attente"],
            ["published", "Publiés"],
            ["rejected", "Rejetés"],
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
            {filtered.map((r, i) => {
              const st = STATUS_LABELS[r.status];
              return (
                <div
                  key={r.id}
                  className="rev-preview-row"
                  style={{
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--adm-border-2)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
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
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "var(--adm-ink)" }}>{r.authorName}</span>
                        <Stars n={r.rating} />
                        <span className="adm-badge" style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                        {r.pinned && <span className="adm-badge" style={{ background: "rgba(212,175,55,.12)", color: "var(--adm-gold)" }}>Épinglé</span>}
                        {r.featured && <span className="adm-badge" style={{ background: "rgba(194,85,122,.1)", color: "var(--tone-pink)" }}>Vedette</span>}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--adm-ink-mute)", marginBottom: 6 }}>
                        {r.productName} · {formatReviewDate(r.createdAt)}
                      </div>
                      <p style={{ fontSize: 13, color: "var(--adm-ink-soft)", margin: "0 0 12px", lineHeight: 1.5 }}>{r.body}</p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button type="button" className="adm-btn gold sm" onClick={() => setEditing(r)}>
                          Modifier
                        </button>
                        {r.status !== "published" && (
                          <button type="button" className="adm-btn sm" onClick={() => handleUpdate(r.id, { status: "published" })}>
                            Publier
                          </button>
                        )}
                        {r.status !== "rejected" && (
                          <button type="button" className="adm-btn sm" onClick={() => handleUpdate(r.id, { status: "rejected" })}>
                            Rejeter
                          </button>
                        )}
                        <button
                          type="button"
                          className="adm-btn sm"
                          style={{ color: "#FF7070" }}
                          onClick={() => {
                            if (confirm("Supprimer cet avis ?")) deleteReview(r.id);
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editing && (
        <ReviewEditor
          review={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => handleUpdate(editing.id, patch)}
        />
      )}
    </div>
  );
}
