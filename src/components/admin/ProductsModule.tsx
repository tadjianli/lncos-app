"use client";

import { useState, useEffect } from "react";
import type { Category, Product } from "@/lib/data";
import { Icon } from "@/components/shared/Icon";
import { AdminToast } from "@/components/admin/AdminToast";
import { useAdminCategories, useProducts } from "@/lib/admin-supabase";
import { ProductImageGalleryEditor } from "@/components/admin/ProductImageGalleryEditor";
import { ProductMainImageEditor } from "@/components/admin/ProductMainImageEditor";
import { ProductVariantsEditor } from "@/components/admin/ProductVariantsEditor";
import { ProductContentSectionsEditor } from "@/components/admin/ProductContentSectionsEditor";
import { ProductCommitmentsEditor } from "@/components/admin/ProductCommitmentsEditor";
import { DEFAULT_COMMITMENTS, DEFAULT_SECTION_TOGGLES } from "@/lib/product-sections";
import { ProductHomeVisibilityEditor } from "@/components/admin/ProductHomeVisibilityEditor";
import { DEFAULT_HOME_VISIBILITY } from "@/lib/product-home-visibility";
import { resolveProductImage, slugifyProductId } from "@/lib/product-catalog";
import type { ProductVariant } from "@/lib/product-catalog";

/* ── Product edit modal ─────────────────────────────────────────────── */
function ProductEditModal({ product, categories, onClose, onSave, isNew }: {
  product: Product;
  categories: Category[];
  onClose: () => void;
  onSave: (p: Product, variants: ProductVariant[]) => Promise<void>;
  isNew?: boolean;
}) {
  const [form, setForm] = useState({ ...product });
  const [variants, setVariants] = useState<ProductVariant[]>(product.productVariants ?? []);
  const [productId, setProductId] = useState(isNew ? slugifyProductId(product.name || "nouveau-produit") : product.id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew && form.name) {
      setProductId(slugifyProductId(form.name));
    }
  }, [form.name, isNew]);

  useEffect(() => {
    if (categories.length === 0) return;
    if (!categories.some((c) => c.id === form.cat)) {
      setForm((p) => ({ ...p, cat: categories[0].id }));
    }
  }, [categories, form.cat]);

  function set<K extends keyof Product>(key: K, val: Product[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  async function handleSubmit() {
    setSaving(true);
    const payload: Product = {
      ...form,
      id: productId,
      mainImageUrl: form.mainImageUrl ?? null,
      galleryImages: form.galleryImages ?? [],
      homeVisibility: form.homeVisibility ?? {},
      productVariants: variants,
    };
    await onSave(payload, variants.map((v) => ({ ...v, productId })));
    setSaving(false);
  }

  return (
    <div className="ab-modal-overlay" onClick={onClose}>
      <div className="ab-modal ab-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="ab-modal-head">
          <div className="ab-modal-title">{isNew ? "Nouveau produit" : `Modifier · ${product.name}`}</div>
          <button className="adm-iconbtn" onClick={onClose}><Icon name="x" size={17} /></button>
        </div>

        <div className="ab-modal-scroll">
          <div className="adm-form-section-title">Informations</div>

          {isNew && (
            <div className="ab-field">
              <label>Identifiant produit (URL / stockage)</label>
              <input className="ab-input" value={productId} onChange={(e) => setProductId(slugifyProductId(e.target.value))} />
            </div>
          )}

          {([
            { label: "Nom du produit", key: "name" as const, type: "text" },
            { label: "Prix de base (€)", key: "price" as const, type: "number" },
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
            <select
              className="ab-input"
              value={form.cat}
              onChange={(e) => set("cat", e.target.value)}
              disabled={categories.length === 0}
            >
              {categories.length === 0 && (
                <option value="">Aucune catégorie — créez-en une dans Catégories</option>
              )}
              {!categories.some((c) => c.id === form.cat) && form.cat && (
                <option value={form.cat}>{form.cat}</option>
              )}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
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
            <label>Stock global</label>
            <input className="ab-input" type="number" min={0} value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} />
          </div>

          <div className="adm-form-section-title">Contenu fiche produit</div>
          <ProductContentSectionsEditor
            desc={form.desc}
            onDescChange={(v) => set("desc", v)}
            usageTips={form.usageTips ?? []}
            onUsageTipsChange={(tips) => set("usageTips", tips)}
            ingredients={form.ingredients}
            onIngredientsChange={(items) => set("ingredients", items)}
            toggles={form.sectionToggles ?? DEFAULT_SECTION_TOGGLES}
            onTogglesChange={(t) => set("sectionToggles", t)}
            extraSections={form.extraSections ?? []}
            onExtraSectionsChange={(sections) => set("extraSections", sections)}
          />

          <ProductCommitmentsEditor
            commitments={form.commitments ?? DEFAULT_COMMITMENTS}
            onCommitmentsChange={(items) => set("commitments", items)}
            toggles={form.sectionToggles ?? DEFAULT_SECTION_TOGGLES}
            onTogglesChange={(t) => set("sectionToggles", t)}
          />

          <div className="adm-form-section-title">Image principale</div>
          <p className="adm-form-section-desc">
            Cartes produit, best-sellers, flash sales, panier, favoris et catégories — 1 seule image.
          </p>
          <ProductMainImageEditor
            productId={productId}
            imageUrl={form.mainImageUrl ?? null}
            onChange={(url) => set("mainImageUrl", url)}
          />

          <div className="adm-form-section-title">Miniatures du produit</div>
          <p className="adm-form-section-desc">
            Galerie de la fiche produit uniquement (max. 5 images). N&apos;utilise pas l&apos;image principale.
          </p>
          <ProductImageGalleryEditor
            productId={productId}
            images={form.galleryImages ?? []}
            onChange={(urls) => set("galleryImages", urls)}
          />

          <div className="adm-form-section-title">Visibilité du produit</div>
          <p className="adm-form-section-desc">
            Cochez les sections de l&apos;accueil où ce produit doit apparaître.
          </p>
          <ProductHomeVisibilityEditor
            value={form.homeVisibility ?? DEFAULT_HOME_VISIBILITY}
            onChange={(vis) => set("homeVisibility", vis)}
          />

          <div className="adm-form-section-title">Variantes</div>
          <ProductVariantsEditor
            productId={productId}
            variants={variants}
            onChange={setVariants}
          />
        </div>

        <div className="ab-modal-foot">
          <button className="adm-btn ghost" onClick={onClose} disabled={saving}>Annuler</button>
          <button className="adm-btn gold" onClick={() => void handleSubmit()} disabled={saving || !form.name.trim()}>
            <Icon name="check" size={15} /> {saving ? "Enregistrement…" : isNew ? "Créer" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

const BLANK_PRODUCT: Product = {
  id: "__new__",
  name: "",
  cat: "visage",
  price: 0,
  old: null,
  ml: "",
  rating: 5,
  reviews: 0,
  tag: null,
  stock: 0,
  variants: [],
  desc: "",
  ingredients: [],
  usageTips: [],
  sectionToggles: { ...DEFAULT_SECTION_TOGGLES },
  extraSections: [],
  commitments: DEFAULT_COMMITMENTS.map((c) => ({ ...c })),
  mainImageUrl: null,
  galleryImages: [],
  homeVisibility: {},
  productVariants: [],
};

/* ── Products module ────────────────────────────────────────────────── */
export function ProductsModule() {
  const { products, loading, saveProductFull, insertProductFull, deleteProduct } = useProducts();
  const { categories, reload: reloadCategories } = useAdminCategories();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  useEffect(() => {
    if (editingProduct || creatingProduct) {
      void reloadCategories();
    }
  }, [editingProduct, creatingProduct, reloadCategories]);

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || p.cat === catFilter;
    return matchSearch && matchCat;
  });

  async function handleSave(updated: Product, variants: ProductVariant[]) {
    const { error } = await saveProductFull(updated, variants);
    if (error) {
      showToast(`Erreur : ${error}`);
      return;
    }
    setEditingProduct(null);
    showToast("Produit enregistré");
  }

  async function handleCreate(p: Product, variants: ProductVariant[]) {
    const { error } = await insertProductFull(p, variants);
    if (error) {
      showToast(`Erreur : ${error}`);
      return;
    }
    setCreatingProduct(false);
    showToast("Produit créé");
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce produit ? Cette action est irréversible.")) return;
    await deleteProduct(id);
    showToast("Produit supprimé");
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
          <button className="adm-btn gold" onClick={() => setCreatingProduct(true)}>
            <Icon name="plus" size={15} /> Ajouter un produit
          </button>
        </div>

        <div className="adm-card adm-card-scroll">
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
                  const thumb = resolveProductImage(p);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="adm-prodcell">
                          <div className="prod-thumb" style={thumb ? { backgroundImage: `url(${thumb})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined} />
                          <div>
                            <div className="adm-prod-name">{p.name}</div>
                            <div className="adm-prod-id">{p.ml}{(p.productVariants?.length ?? 0) > 0 ? ` · ${p.productVariants!.length} variantes` : ""}</div>
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
                          <span className="adm-badge" style={{ color: "#B8902B", background: "rgba(212,175,55,.12)" }}>{p.tag}</span>
                        ) : (
                          <span style={{ color: "var(--adm-ink-mute)", fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td>
                        <div className="adm-rowactions">
                          <button className="adm-act" title="Modifier" onClick={() => setEditingProduct(p)}>
                            <Icon name="edit" size={14} />
                          </button>
                          <button className="adm-act danger" title="Supprimer" onClick={() => handleDelete(p.id)}>
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
        <ProductEditModal
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onSave={handleSave}
        />
      )}
      {creatingProduct && (
        <ProductEditModal
          product={{ ...BLANK_PRODUCT, cat: categories[0]?.id ?? BLANK_PRODUCT.cat }}
          categories={categories}
          onClose={() => setCreatingProduct(false)}
          onSave={handleCreate}
          isNew
        />
      )}
      {toast && <AdminToast msg={toast} />}
    </>
  );
}
