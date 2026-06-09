"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@/components/shared/Icon";
import { AdminToast } from "@/components/admin/AdminToast";
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
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

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
    showToast("Catégorie enregistrée");
  };

  const addCategory = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const maxPos = Math.max(0, ...categories.map((c) => c.position));
    const newId = newName.trim().toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const { data } = await getSupabase()
      .from("categories")
      .insert({ id: newId, name: newName.trim(), count: 0, position: maxPos + 1 })
      .select()
      .single();
    if (data) setCategories((prev) => [...prev, data as Category]);
    setSaving(false);
    setAdding(false);
    setNewName("");
    showToast("Catégorie créée");
  };

  const deleteCategory = async (id: string) => {
    await getSupabase().from("categories").delete().eq("id", id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setConfirmDeleteId(null);
    showToast("Catégorie supprimée");
  };

  const moveCategory = async (catId: string, dir: "up" | "down") => {
    const sorted = [...categories].sort((a, b) => a.position - b.position);
    const idx = sorted.findIndex((c) => c.id === catId);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    await Promise.all([
      getSupabase().from("categories").update({ position: b.position }).eq("id", a.id),
      getSupabase().from("categories").update({ position: a.position }).eq("id", b.id),
    ]);
    setCategories((prev) => prev.map((c) => {
      if (c.id === a.id) return { ...c, position: b.position };
      if (c.id === b.id) return { ...c, position: a.position };
      return c;
    }));
  };

  const sorted = [...categories].sort((a, b) => a.position - b.position);
  const totalProducts = categories.reduce((t, c) => t + c.count, 0);

  return (
    <>
      <div className="adm-content">
        {/* Header */}
        <div className="adm-topbar">
          <div>
            <h1 className="adm-h1">Catégories</h1>
            <p className="adm-sub">{categories.length} catégorie{categories.length !== 1 ? "s" : ""} · {totalProducts} produit{totalProducts !== 1 ? "s" : ""} au total</p>
          </div>
          <button className="adm-btn gold" onClick={() => setAdding(true)}>
            <Icon name="plus" size={15} /> Ajouter une catégorie
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--adm-ink-mute)" }}>
            Chargement…
          </div>
        ) : sorted.length === 0 ? (
          <div className="adm-card" style={{ padding: "56px 20px", textAlign: "center" }}>
            <Icon name="grid" size={40} color="var(--adm-ink-mute)" />
            <p style={{ marginTop: 12, color: "var(--adm-ink-mute)", fontSize: 14 }}>
              Aucune catégorie trouvée
            </p>
            <button className="adm-btn gold" style={{ marginTop: 16 }} onClick={() => setAdding(true)}>
              <Icon name="plus" size={15} /> Créer la première catégorie
            </button>
          </div>
        ) : (
          <div className="adm-grid-3">
            {sorted.map((cat, idx) => {
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
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--adm-ink)", marginBottom: 8 }}>
                      {cat.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <span className="adm-cat-pill">{cat.count} produit{cat.count !== 1 ? "s" : ""}</span>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="adm-iconbtn sm" onClick={() => moveCategory(cat.id, "up")} disabled={idx === 0} title="Monter" style={{ opacity: idx === 0 ? 0.3 : 1 }}>
                          <Icon name="chevR" size={12} style={{ transform: "rotate(-90deg)" }} />
                        </button>
                        <button className="adm-iconbtn sm" onClick={() => moveCategory(cat.id, "down")} disabled={idx === sorted.length - 1} title="Descendre" style={{ opacity: idx === sorted.length - 1 ? 0.3 : 1 }}>
                          <Icon name="chevR" size={12} style={{ transform: "rotate(90deg)" }} />
                        </button>
                        <button className="adm-iconbtn sm" onClick={() => setEditing({ ...cat })} title="Modifier">
                          <Icon name="sliders" size={14} />
                        </button>
                        {confirmDeleteId === cat.id ? (
                          <button
                            className="adm-iconbtn sm"
                            onClick={() => deleteCategory(cat.id)}
                            style={{ color: "var(--tone-pink)", fontWeight: 700, fontSize: 10, width: "auto", padding: "0 6px" }}
                            title="Confirmer"
                          >
                            Confirmer
                          </button>
                        ) : (
                          <button className="adm-iconbtn sm" onClick={() => setConfirmDeleteId(cat.id)} title="Supprimer" style={{ color: "var(--tone-pink)" }}>
                            <Icon name="trash" size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--adm-ink-mute)", marginBottom: 4 }}>Position #{cat.position}</div>
                    <div style={{ height: 4, borderRadius: 2, background: "var(--adm-surface-2)", overflow: "hidden" }}>
                      <div style={{
                        width: `${Math.min(100, (cat.count / Math.max(totalProducts, 1)) * 100)}%`,
                        height: "100%",
                        borderRadius: 2,
                        background: accent,
                        opacity: 0.7,
                      }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add modal */}
      {adding && (
        <div className="ab-modal-overlay" onClick={() => { setAdding(false); setNewName(""); }}>
          <div className="ab-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ab-modal-head">
              <div className="ab-modal-title">Ajouter une catégorie</div>
              <button className="adm-iconbtn" onClick={() => { setAdding(false); setNewName(""); }}><Icon name="x" size={17} /></button>
            </div>
            <div className="ab-field">
              <label>Nom de la catégorie</label>
              <input
                className="ab-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                placeholder="ex : Soins corps"
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
              />
            </div>
            <div className="ab-modal-foot">
              <button className="adm-btn ghost" onClick={() => { setAdding(false); setNewName(""); }}>Annuler</button>
              <button className="adm-btn gold" onClick={addCategory} disabled={!newName.trim() || saving}>
                {saving ? "Création…" : <><Icon name="check" size={15} /> Créer</>}
              </button>
            </div>
          </div>
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
              <label>Nombre de produits (affiché)</label>
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

      {toast && <AdminToast msg={toast} />}
    </>
  );
}
