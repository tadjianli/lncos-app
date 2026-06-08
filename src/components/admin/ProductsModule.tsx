"use client";

import { useState } from "react";
import { categories } from "@/lib/data";
import type { Product } from "@/lib/data";
import { Icon } from "@/components/shared/Icon";
import { useProducts } from "@/lib/admin-supabase";

/* ── Product edit modal ─────────────────────────────────────────────── */
function ProductEditModal({ product, onClose, onSave }: {
  product: Product;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const [form, setForm] = useState({ ...product });

  function set<K extends keyof Product>(key: K, val: Product[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div className="ab-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ab-modal-head">
          <div className="ab-modal-title">Modifier · {product.name}</div>
          <button className="adm-iconbtn" onClick={onClose}><Icon name="x" size={17} /></button>
        </div>

        {([
          { label: "Nom du produit", key: "name" as const, type: "text" },
          { label: "Prix (€)", key: "price" as const, type: "number" },
          { label: "Prix barré (€)", key: "old" as const, type: "number" },
          { label: "Contenance (ml, g…)", key: "ml" as const, type: "text" },
        ] as const).map(({ label, key, type }) => (
          <div key={key} className="ab-field">
            <label>{label}</label>
            <input
              className="ab-input"
              type={type}
              value={String(form[key] ?? "")}
              onChange={(e) => set(key, (type === "number" ? Number(e.target.value) : e.target.value) as Product[typeof key])}
            />
          </div>
        ))}

        <div className="ab-field">
          <label>Catégorie</label>
          <select className="ab-input" value={form.cat} onChange={(e) => set("cat", e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="ab-field">
          <label>Tag promo</label>
          <select className="ab-input" value={form.tag ?? ""} onChange={(e) => set("tag", e.target.value || null)}>
            <option value="">Aucun</option>
            <option value="Flash">Flash</option>
            <option value="Best-seller">Best-seller</option>
            <option value="Nouveau">Nouveau</option>
            <option value="Édition limitée">Édition limitée</option>
          </select>
        </div>

        <div className="ab-field">
          <label>Stock</label>
          <input className="ab-input" type="number" min={0} value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} />
        </div>

        <div className="ab-field">
          <label>Description</label>
          <textarea className="ab-input textarea" value={form.desc} onChange={(e) => set("desc", e.target.value)} />
        </div>

        <div className="ab-modal-foot">
          <button className="adm-btn ghost" onClick={onClose}>Annuler</button>
          <button className="adm-btn gold" onClick={() => onSave(form)}>
            <Icon name="check" size={15} /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Products module ────────────────────────────────────────────────── */
export function ProductsModule() {
  const { products, loading, updateProduct, deleteProduct } = useProducts();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || p.cat === catFilter;
    return matchSearch && matchCat;
  });

  async function handleSave(updated: Product) {
    await updateProduct(updated.id, updated);
    setEditingProduct(null);
  }

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

  const stockBadge = (stock: number) => {
    if (stock === 0) return { label: "Épuisé",            color: "#C2557A", bg: "rgba(194,85,122,.12)" };
    if (stock < 5)   return { label: `Stock faible (${stock})`, color: "#C77A33", bg: "rgba(199,122,51,.12)" };
    return             { label: `${stock} en stock`,      color: "#2F9E68", bg: "rgba(47,158,104,.12)" };
  };

  return (
    <>
      <div className="adm-content">
        <div className="adm-topbar">
          <div>
            <h1 className="adm-h1">Produits</h1>
            <div className="adm-sub">
              {loading ? "Chargement…" : `${products.length} produits · ${products.filter((p) => p.stock === 0).length} épuisés`}
            </div>
          </div>
          <button className="adm-btn gold">
            <Icon name="plus" size={15} /> Ajouter un produit
          </button>
        </div>

        <div className="adm-card" style={{ padding: 0 }}>
          <div className="adm-table-toolbar">
            <div className="adm-searchbox wide">
              <Icon name="search" size={16} color="var(--adm-ink-mute)" />
              <input
                placeholder="Rechercher un produit…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select className="adm-select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                <option value="all">Toutes catégories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "var(--adm-ink-mute)", fontSize: 14 }}>
              Chargement des produits…
            </div>
          ) : (
            <table className="adm-table rows">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Catégorie</th>
                  <th>Prix</th>
                  <th>Note</th>
                  <th>Stock</th>
                  <th>Tag</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const sb = stockBadge(p.stock);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="adm-prodcell">
                          <div className="prod-thumb" />
                          <div>
                            <div className="adm-prod-name">{p.name}</div>
                            <div className="adm-prod-id">{p.ml}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="adm-cat-pill">{catName(p.cat)}</span></td>
                      <td>
                        <span style={{ fontWeight: 700, color: "var(--adm-ink)" }}>{p.price.toFixed(2)} €</span>
                        {p.old && <span style={{ marginLeft: 6, fontSize: 11.5, color: "var(--adm-ink-mute)", textDecoration: "line-through" }}>{p.old} €</span>}
                      </td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Icon name="star" size={13} color="#B8902B" fill="#B8902B" />
                          <span style={{ fontWeight: 600 }}>{p.rating}</span>
                          <span style={{ color: "var(--adm-ink-mute)", fontSize: 12 }}>({p.reviews})</span>
                        </span>
                      </td>
                      <td><span className="adm-badge" style={{ color: sb.color, background: sb.bg }}>{sb.label}</span></td>
                      <td>
                        {p.tag ? (
                          <span
                            className="adm-badge"
                            style={{ color: "#B8902B", background: "rgba(212,175,55,.12)", cursor: "pointer" }}
                            onClick={() => updateProduct(p.id, { tag: null })}
                          >{p.tag}</span>
                        ) : (
                          <button className="adm-link" style={{ fontSize: 12 }} onClick={() => updateProduct(p.id, { tag: "Best-seller" })}>+ Best</button>
                        )}
                      </td>
                      <td>
                        <div className="adm-rowactions">
                          <button className="adm-act" title="Modifier" onClick={() => setEditingProduct(p)}>
                            <Icon name="edit" size={14} />
                          </button>
                          <button className="adm-act danger" title="Supprimer" onClick={() => deleteProduct(p.id)}>
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "40px 0", color: "var(--adm-ink-mute)" }}>
                      Aucun produit trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editingProduct && (
        <ProductEditModal product={editingProduct} onClose={() => setEditingProduct(null)} onSave={handleSave} />
      )}
    </>
  );
}
