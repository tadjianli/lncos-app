"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@/components/shared/Icon";
import { getSupabase } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
  count: number;
  cover_url: string | null;
  position: number;
}

const CAT_ICONS: Record<string, string> = {
  visage: "sparkle",
  maquillage: "star",
  parfums: "flame",
  corps: "heart",
  cheveux: "sparkle",
  accessoires: "bag",
  coffrets: "gift",
};

const CAT_ACCENT: Record<string, string> = {
  visage: "#F7C6D7",
  maquillage: "#E2A8C0",
  parfums: "#D4AF37",
  corps: "#A8C9A0",
  cheveux: "#A8B4F7",
  accessoires: "#D4AF37",
  coffrets: "#E2A8C0",
};

export function CategoriesModule() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await getSupabase()
      .from("categories")
      .select("id,name,count,cover_url,position")
      .order("position");
    setCategories((data ?? []) as Category[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    await getSupabase()
      .from("categories")
      .update({ name: editing.name, count: editing.count })
      .eq("id", editing.id);
    setCategories((prev) => prev.map((c) => c.id === editing.id ? { ...c, ...editing } : c));
    setSaving(false);
    setEditing(null);
  };

  const totalProducts = categories.reduce((t, c) => t + c.count, 0);

  return (
    <div className="adm-content">
      {/* Header */}
      <div className="adm-topbar">
        <div>
          <h1 className="adm-h1">Catégories</h1>
          <p className="adm-sub">{categories.length} catégorie{categories.length !== 1 ? "s" : ""} · {totalProducts} produit{totalProducts !== 1 ? "s" : ""} au total</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--adm-ink-mute)" }}>
          Chargement…
        </div>
      ) : categories.length === 0 ? (
        <div className="adm-card" style={{ padding: "56px 20px", textAlign: "center" }}>
          <Icon name="grid" size={40} color="var(--adm-ink-mute)" />
          <p style={{ marginTop: 12, color: "var(--adm-ink-mute)", fontSize: 14 }}>
            Aucune catégorie trouvée
          </p>
          <p style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 4 }}>
            Les catégories sont créées via la migration de base de données.
          </p>
        </div>
      ) : (
        <div className="adm-grid-3">
          {categories.map((cat) => {
            const icon = CAT_ICONS[cat.id] ?? "sparkle";
            const accent = CAT_ACCENT[cat.id] ?? "var(--adm-gold)";
            return (
              <div key={cat.id} className="adm-card adm-cat-card" style={{ padding: 0, overflow: "hidden" }}>
                {/* Cover strip */}
                <div style={{
                  height: 80,
                  background: `linear-gradient(135deg, ${accent}18, ${accent}08)`,
                  borderBottom: "1px solid var(--adm-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `${accent}28`,
                    border: `1.5px solid ${accent}40`,
                    display: "grid",
                    placeItems: "center",
                  }}>
                    <Icon name={icon as "sparkle"} size={24} color={accent} />
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--adm-ink)", marginBottom: 4 }}>
                    {cat.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className="adm-cat-pill">{cat.count} produit{cat.count !== 1 ? "s" : ""}</span>
                    <button
                      className="adm-iconbtn sm"
                      onClick={() => setEditing({ ...cat })}
                      title="Modifier"
                    >
                      <Icon name="sliders" size={14} />
                    </button>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 11, color: "var(--adm-ink-mute)", marginBottom: 4 }}>Position</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        background: "var(--adm-surface-2)",
                        overflow: "hidden",
                      }}>
                        <div style={{
                          width: `${Math.min(100, (cat.count / Math.max(totalProducts, 1)) * 100)}%`,
                          height: "100%",
                          borderRadius: 2,
                          background: accent,
                          opacity: 0.7,
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: "var(--adm-ink-mute)", minWidth: 28, textAlign: "right" }}>
                        #{cat.position}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="ab-modal-overlay" onClick={() => setEditing(null)}>
          <div className="ab-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ab-modal-head">
              <div className="ab-modal-title">Modifier · {editing.name}</div>
              <button className="adm-iconbtn" onClick={() => setEditing(null)}>
                <Icon name="x" size={17} />
              </button>
            </div>
            <div className="ab-field">
              <label>Nom de la catégorie</label>
              <input
                className="ab-input"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>
            <div className="ab-field">
              <label>Nombre de produits</label>
              <input
                className="ab-input"
                type="number"
                min={0}
                value={editing.count}
                onChange={(e) => setEditing({ ...editing, count: Number(e.target.value) })}
              />
            </div>
            <div className="ab-modal-foot">
              <button className="adm-btn ghost" onClick={() => setEditing(null)}>Annuler</button>
              <button className="adm-btn gold" onClick={saveEdit} disabled={saving}>
                {saving ? "Enregistrement…" : <><Icon name="check" size={15} /> Enregistrer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
