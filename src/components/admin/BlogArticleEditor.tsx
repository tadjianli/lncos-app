"use client";

import { useEffect, useMemo, useState } from "react";
import { GooglePreview } from "@/components/admin/GooglePreview";
import { Icon } from "@/components/shared/Icon";
import type { BlogArticle, BlogContentBlock, BlogFaqItem } from "@/lib/contracts/blog";
import { getBlogArticlePath } from "@/lib/contracts/blog";
import { parseBlogBody, estimateReadMinutes } from "@/lib/blog-blocks";
import type { AdminBlogCategory } from "@/lib/content-pages";
import { getSupabase } from "@/lib/supabase";
import { absoluteUrl } from "@/lib/site-url";

type EditorTab = "general" | "content" | "seo" | "faq" | "products";

interface ProductOption {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  stock: number;
  main_image_url: string | null;
  image_url: string | null;
  seo_slug: string | null;
}

interface BlogArticleEditorProps {
  article: BlogArticle;
  categories: AdminBlogCategory[];
  onClose: () => void;
  onSave: (a: BlogArticle) => void;
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

const BODY_HINT = `Format JSON — ex. [{"type":"h2","text":"Titre"},{"type":"p","text":"Paragraphe…"}]`;

export function BlogArticleEditor({
  article,
  categories,
  onClose,
  onSave,
}: BlogArticleEditorProps) {
  const [form, setForm] = useState({ ...article });
  const [tab, setTab] = useState<EditorTab>("general");
  const [bodyText, setBodyText] = useState(JSON.stringify(article.body ?? [], null, 2));
  const [bodyError, setBodyError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);

  useEffect(() => {
    void (async () => {
      const { data } = await getSupabase()
        .from("products")
        .select("id,name,price,rating,reviews,stock,main_image_url,image_url,seo_slug")
        .eq("active", true)
        .order("name");
      setProducts((data as ProductOption[] | null) ?? []);
    })();
  }, []);

  const autoCoverPreview = useMemo(() => {
    if (form.coverUrl?.trim()) return form.coverUrl.trim();
    const firstId = form.relatedProductIds[0];
    const p = products.find((x) => x.id === firstId);
    return p?.main_image_url ?? p?.image_url ?? null;
  }, [form.coverUrl, form.relatedProductIds, products]);

  const selectedProducts = useMemo(
    () => products.filter((p) => form.relatedProductIds.includes(p.id)),
    [products, form.relatedProductIds]
  );

  const googlePreview = useMemo(() => {
    const path = getBlogArticlePath(form.slug || "article-exemple");
    const canonical = form.canonicalUrl?.trim() || absoluteUrl(path);
    return {
      title: form.seoTitle?.trim() || form.title || "Titre SEO de l'article",
      url: canonical,
      description:
        form.metaDescription?.trim() ||
        form.excerpt?.trim() ||
        "Meta description de l'article…",
    };
  }, [form]);

  const syncBody = (text: string): BlogContentBlock[] | null => {
    try {
      const parsed = parseBlogBody(JSON.parse(text));
      setBodyError(null);
      return parsed;
    } catch {
      setBodyError("JSON invalide — vérifiez la syntaxe du contenu.");
      return null;
    }
  };

  const handleSave = () => {
    const body = syncBody(bodyText);
    if (body === null) {
      setTab("content");
      return;
    }
    const readMinutes = estimateReadMinutes(body, form.readMinutes);
    onSave({ ...form, body, readMinutes });
  };

  const updateFaq = (index: number, patch: Partial<BlogFaqItem>) => {
    setForm((prev) => ({
      ...prev,
      faq: prev.faq.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  };

  const addFaq = () => {
    setForm((prev) => ({ ...prev, faq: [...prev.faq, { question: "", answer: "" }] }));
  };

  const removeFaq = (index: number) => {
    setForm((prev) => ({ ...prev, faq: prev.faq.filter((_, i) => i !== index) }));
  };

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

  const tabs: { id: EditorTab; label: string }[] = [
    { id: "general", label: "Général" },
    { id: "content", label: "Contenu" },
    { id: "seo", label: "SEO" },
    { id: "faq", label: "FAQ" },
    { id: "products", label: "Produits liés" },
  ];

  return (
    <div className="pop-editor-modal" onClick={onClose}>
      <div className="pop-editor pop-editor-wide" onClick={(e) => e.stopPropagation()}>
        <div className="pop-editor-head">
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {article.id.startsWith("__new") ? "Nouvel article" : "Modifier article"}
          </div>
          <button type="button" className="adm-iconbtn" onClick={onClose}>
            <Icon name="x" size={17} />
          </button>
        </div>

        <div className="blog-editor-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`blog-editor-tab${tab === t.id ? " blog-editor-tab--active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="pop-editor-form" style={{ padding: 20 }}>
          {tab === "general" && (
            <>
              <FieldRow
                label="Titre"
                value={form.title}
                onChange={(v) =>
                  setForm({
                    ...form,
                    title: v,
                    slug: form.slug || v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80),
                  })
                }
              />
              <FieldRow label="Slug URL" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
              <FieldRow label="Extrait" value={form.excerpt} onChange={(v) => setForm({ ...form, excerpt: v })} multiline />
              <FieldRow label="Auteur" value={form.authorName} onChange={(v) => setForm({ ...form, authorName: v })} />
              <div className="pop-field-row">
                <label className="pop-field-label">Catégorie</label>
                <select
                  className="pop-input pop-select"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  {categories.filter((c) => c.enabled).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <FieldRow label="Date publication" value={form.publishedAt} onChange={(v) => setForm({ ...form, publishedAt: v })} />
              <FieldRow label="Minutes de lecture" value={String(form.readMinutes)} onChange={(v) => setForm({ ...form, readMinutes: Number(v) || 5 })} />
              <FieldRow
                label="Image de couverture personnalisée (facultatif)"
                value={form.coverUrl ?? ""}
                onChange={(v) => setForm({ ...form, coverUrl: v || null })}
                hint="Si vide, l'image principale du premier produit lié sera utilisée automatiquement."
              />
              {autoCoverPreview ? (
                <div className="blog-editor-cover-preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={autoCoverPreview} alt="Aperçu couverture" />
                </div>
              ) : null}
              <div className="pop-toggle-row">
                <span className="pop-toggle-label">Publié</span>
                <input type="checkbox" checked={form.published} onChange={() => setForm({ ...form, published: !form.published })} />
              </div>
              <div className="pop-toggle-row">
                <span className="pop-toggle-label">À la une</span>
                <input type="checkbox" checked={!!form.featured} onChange={() => setForm({ ...form, featured: !form.featured })} />
              </div>
            </>
          )}

          {tab === "content" && (
            <>
              <div className="pop-field-row">
                <label className="pop-field-label">Contenu (blocs JSON)</label>
                <textarea
                  className="pop-input pop-textarea"
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  rows={14}
                  spellCheck={false}
                />
                <p className="pop-field-hint">{BODY_HINT}</p>
              </div>
              {bodyError ? <p style={{ color: "var(--tone-pink)", fontSize: 13 }}>{bodyError}</p> : null}
            </>
          )}

          {tab === "seo" && (
            <>
              <FieldRow label="Meta Title" value={form.seoTitle ?? ""} onChange={(v) => setForm({ ...form, seoTitle: v || null })} />
              <FieldRow label="Meta Description" value={form.metaDescription ?? ""} onChange={(v) => setForm({ ...form, metaDescription: v || null })} multiline />
              <FieldRow label="Mot-clé principal" value={form.seoKeyword ?? ""} onChange={(v) => setForm({ ...form, seoKeyword: v || null })} />
              <FieldRow label="Canonical URL" value={form.canonicalUrl ?? ""} onChange={(v) => setForm({ ...form, canonicalUrl: v || null })} hint="Laisser vide pour l'URL par défaut /blog/slug" />
              <GooglePreview preview={googlePreview} />
            </>
          )}

          {tab === "faq" && (
            <>
              {form.faq.map((item, index) => (
                <div key={`faq-${index}`} className="blog-editor-faq-row">
                  <FieldRow label={`Question ${index + 1}`} value={item.question} onChange={(v) => updateFaq(index, { question: v })} />
                  <FieldRow label="Réponse" value={item.answer} onChange={(v) => updateFaq(index, { answer: v })} multiline />
                  <button type="button" className="adm-btn ghost sm" onClick={() => removeFaq(index)}>
                    Supprimer
                  </button>
                </div>
              ))}
              <button type="button" className="adm-btn ghost sm" onClick={addFaq}>
                <Icon name="plus" size={14} /> Ajouter une question
              </button>
            </>
          )}

          {tab === "products" && (
            <div className="blog-editor-products">
              <p className="pop-field-hint" style={{ marginBottom: 12 }}>
                Sélectionnez un ou plusieurs produits du catalogue LN COS. Les données (prix, image, avis, stock, URL) sont synchronisées automatiquement — aucune URL à saisir.
              </p>
              {products.length === 0 ? (
                <p style={{ color: "var(--adm-ink-mute)", fontSize: 14 }}>Aucun produit actif trouvé.</p>
              ) : (
                products.map((p) => (
                  <label key={p.id} className="blog-editor-product-row">
                    <input
                      type="checkbox"
                      checked={form.relatedProductIds.includes(p.id)}
                      onChange={() => toggleProduct(p.id)}
                    />
                    {(p.main_image_url ?? p.image_url) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.main_image_url ?? p.image_url ?? ""}
                        alt=""
                        className="blog-editor-product-thumb"
                      />
                    ) : null}
                    <span style={{ flex: 1 }}>
                      <strong>{p.name}</strong>
                      <span className="ab-sec-tag" style={{ marginLeft: 8 }}>
                        {p.price.toFixed(2)} € · ★ {p.rating} ({p.reviews}) ·{" "}
                        {p.stock > 0 ? "En stock" : "Rupture"}
                      </span>
                    </span>
                  </label>
                ))
              )}
              {selectedProducts.length > 0 ? (
                <p style={{ marginTop: 12, fontSize: 12, color: "var(--adm-ink-mute)" }}>
                  {selectedProducts.length} produit(s) lié(s) — affichés sous l&apos;article en carousel.
                </p>
              ) : null}
            </div>
          )}
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
