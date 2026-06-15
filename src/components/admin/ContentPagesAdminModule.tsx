"use client";

import { useState } from "react";
import { AppBuilder } from "@/components/admin/AppBuilder";
import { AdminToast, type AdminToastVariant } from "@/components/admin/AdminToast";
import { Icon } from "@/components/shared/Icon";
import type { BlogArticle } from "@/lib/contracts/blog";
import {
  useAdminBlogContent,
  useAdminFlashSalesSettings,
  useAdminSocialContent,
} from "@/lib/content-pages-hooks";
import { slugifyTitle, type AdminBlogCategory, type AdminSocialLink } from "@/lib/content-pages";

type Tab = "flash" | "blog" | "social";

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
        <textarea
          className="pop-input"
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input className="pop-input" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <p style={{ fontSize: 11, color: "var(--adm-ink-mute)", margin: "4px 0 0" }}>{hint}</p>}
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

/* ── Flash tab ─────────────────────────────────────────────────────────────── */

function FlashTab({ showToast }: { showToast: (msg: string, v?: AdminToastVariant) => void }) {
  const { settings, loading, saving, setSettings, save } = useAdminFlashSalesSettings();

  async function handleSave() {
    const { error } = await save(settings);
    showToast(error ? `Erreur : ${error}` : "Paramètres ventes flash enregistrés", error ? "error" : "success");
  }

  if (loading) return <p style={{ padding: 20, color: "var(--adm-ink-mute)" }}>Chargement…</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="adm-card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Textes de la page</h3>
        <div className="pop-toggle-row" style={{ marginBottom: 12 }}>
          <span className="pop-toggle-label">Page activée</span>
          <Toggle checked={settings.pageEnabled} onChange={() => setSettings({ ...settings, pageEnabled: !settings.pageEnabled })} />
        </div>
        <FieldRow label="Eyebrow bannière" value={settings.bannerEyebrow} onChange={(v) => setSettings({ ...settings, bannerEyebrow: v })} />
        <FieldRow label="Titre bannière" value={settings.bannerTitle} onChange={(v) => setSettings({ ...settings, bannerTitle: v })} />
        <FieldRow
          label="Sous-titre bannière"
          value={settings.bannerSubtitleTemplate}
          onChange={(v) => setSettings({ ...settings, bannerSubtitleTemplate: v })}
          hint="Utilisez {{count}} pour le nombre de promotions."
        />
        <FieldRow label="Label countdown" value={settings.countdownLabel} onChange={(v) => setSettings({ ...settings, countdownLabel: v })} />
        <FieldRow label="Eyebrow état vide" value={settings.emptyEyebrow} onChange={(v) => setSettings({ ...settings, emptyEyebrow: v })} />
        <FieldRow label="Titre état vide" value={settings.emptyTitle} onChange={(v) => setSettings({ ...settings, emptyTitle: v })} />
        <FieldRow label="Texte état vide" value={settings.emptyBody} onChange={(v) => setSettings({ ...settings, emptyBody: v })} multiline />
        <FieldRow label="Bouton CTA (label)" value={settings.emptyCtaLabel} onChange={(v) => setSettings({ ...settings, emptyCtaLabel: v })} />
        <FieldRow label="Bouton CTA (lien)" value={settings.emptyCtaHref} onChange={(v) => setSettings({ ...settings, emptyCtaHref: v })} />
        <p style={{ fontSize: 12, color: "var(--adm-ink-mute)", marginTop: 12 }}>
          Les produits affichés viennent du catalogue — cochez « Vente flash » sur chaque fiche produit (admin Produits).
        </p>
        <button type="button" className="adm-btn gold" style={{ marginTop: 16 }} onClick={handleSave} disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
      <div className="adm-card" style={{ padding: 20 }}>
        <AppBuilder pageSlug="flash-sales" embedded />
      </div>
    </div>
  );
}

/* ── Blog tab ──────────────────────────────────────────────────────────────── */

function CategoryEditor({
  cat,
  onClose,
  onSave,
}: {
  cat: AdminBlogCategory;
  onClose: () => void;
  onSave: (c: AdminBlogCategory) => void;
}) {
  const [form, setForm] = useState({ ...cat });
  return (
    <div className="pop-editor-modal" onClick={onClose}>
      <div className="pop-editor" onClick={(e) => e.stopPropagation()}>
        <div className="pop-editor-head">
          <div style={{ fontSize: 18, fontWeight: 700 }}>{cat.id ? "Modifier catégorie" : "Nouvelle catégorie"}</div>
          <button className="adm-iconbtn" onClick={onClose}><Icon name="x" size={17} /></button>
        </div>
        <div className="pop-editor-form" style={{ padding: 20 }}>
          <FieldRow label="ID (slug)" value={form.id} onChange={(v) => setForm({ ...form, id: v })} />
          <FieldRow label="Label" value={form.label} onChange={(v) => setForm({ ...form, label: v })} />
          <FieldRow label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline />
          <FieldRow label="Icône" value={form.icon} onChange={(v) => setForm({ ...form, icon: v })} hint="sparkle, play, heart, flame, star…" />
          <FieldRow label="Position" value={String(form.position)} onChange={(v) => setForm({ ...form, position: Number(v) || 0 })} />
          <div className="pop-toggle-row">
            <span className="pop-toggle-label">Activée</span>
            <Toggle checked={form.enabled} onChange={() => setForm({ ...form, enabled: !form.enabled })} />
          </div>
        </div>
        <div className="pop-editor-foot">
          <button className="adm-btn ghost" onClick={onClose}>Annuler</button>
          <button className="adm-btn gold" onClick={() => onSave(form)}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

function ArticleEditor({
  article,
  categories,
  onClose,
  onSave,
}: {
  article: BlogArticle;
  categories: AdminBlogCategory[];
  onClose: () => void;
  onSave: (a: BlogArticle) => void;
}) {
  const [form, setForm] = useState({ ...article });
  return (
    <div className="pop-editor-modal" onClick={onClose}>
      <div className="pop-editor pop-editor-wide" onClick={(e) => e.stopPropagation()}>
        <div className="pop-editor-head">
          <div style={{ fontSize: 18, fontWeight: 700 }}>{article.id.startsWith("__new") ? "Nouvel article" : "Modifier article"}</div>
          <button className="adm-iconbtn" onClick={onClose}><Icon name="x" size={17} /></button>
        </div>
        <div className="pop-editor-form" style={{ padding: 20 }}>
          <FieldRow label="Titre" value={form.title} onChange={(v) => setForm({ ...form, title: v, slug: form.slug || slugifyTitle(v) })} />
          <FieldRow label="Slug URL" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
          <FieldRow label="Extrait" value={form.excerpt} onChange={(v) => setForm({ ...form, excerpt: v })} multiline />
          <div className="pop-field-row">
            <label className="pop-field-label">Catégorie</label>
            <select className="pop-input pop-select" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              {categories.filter((c) => c.enabled).map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <FieldRow label="Date publication" value={form.publishedAt} onChange={(v) => setForm({ ...form, publishedAt: v })} />
          <FieldRow label="Minutes de lecture" value={String(form.readMinutes)} onChange={(v) => setForm({ ...form, readMinutes: Number(v) || 5 })} />
          <FieldRow label="Image cover (URL)" value={form.coverUrl ?? ""} onChange={(v) => setForm({ ...form, coverUrl: v || null })} />
          <div className="pop-toggle-row">
            <span className="pop-toggle-label">Publié</span>
            <Toggle checked={form.published} onChange={() => setForm({ ...form, published: !form.published })} />
          </div>
          <div className="pop-toggle-row">
            <span className="pop-toggle-label">À la une</span>
            <Toggle checked={!!form.featured} onChange={() => setForm({ ...form, featured: !form.featured })} />
          </div>
        </div>
        <div className="pop-editor-foot">
          <button className="adm-btn ghost" onClick={onClose}>Annuler</button>
          <button className="adm-btn gold" onClick={() => onSave(form)}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

function BlogTab({ showToast }: { showToast: (msg: string, v?: AdminToastVariant) => void }) {
  const {
    pageSettings,
    categories,
    articles,
    loading,
    saving,
    setPageSettings,
    savePageSettings,
    upsertCategory,
    deleteCategory,
    upsertArticle,
    deleteArticle,
  } = useAdminBlogContent();
  const [editCat, setEditCat] = useState<AdminBlogCategory | null>(null);
  const [editArt, setEditArt] = useState<BlogArticle | null>(null);

  if (loading) return <p style={{ padding: 20, color: "var(--adm-ink-mute)" }}>Chargement…</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="adm-card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>En-tête blog</h3>
        <FieldRow label="Eyebrow" value={pageSettings.heroEyebrow} onChange={(v) => setPageSettings({ ...pageSettings, heroEyebrow: v })} />
        <FieldRow label="Titre" value={pageSettings.heroTitle} onChange={(v) => setPageSettings({ ...pageSettings, heroTitle: v })} />
        <FieldRow label="Sous-titre" value={pageSettings.heroSubtitle} onChange={(v) => setPageSettings({ ...pageSettings, heroSubtitle: v })} multiline />
        <FieldRow label="Titre section articles" value={pageSettings.articlesSectionTitle} onChange={(v) => setPageSettings({ ...pageSettings, articlesSectionTitle: v })} />
        <FieldRow label="Hint section articles" value={pageSettings.articlesSectionHint} onChange={(v) => setPageSettings({ ...pageSettings, articlesSectionHint: v })} />
        <button
          type="button"
          className="adm-btn gold"
          style={{ marginTop: 16 }}
          disabled={saving}
          onClick={async () => {
            const { error } = await savePageSettings(pageSettings);
            showToast(error ? `Erreur : ${error}` : "En-tête blog enregistré", error ? "error" : "success");
          }}
        >
          Enregistrer l&apos;en-tête
        </button>
      </div>

      <div className="adm-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Catégories ({categories.length})</h3>
          <button
            type="button"
            className="adm-btn ghost sm"
            onClick={() => setEditCat({ id: `cat-${Date.now()}`, label: "", description: "", icon: "sparkle", position: categories.length, enabled: true })}
          >
            <Icon name="plus" size={14} /> Ajouter
          </button>
        </div>
        {categories.map((cat) => (
          <div key={cat.id} className="ab-row" style={{ marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <div className="ab-sec-name">{cat.label}</div>
              <div className="ab-sec-meta"><span className="ab-sec-tag">{cat.id}</span></div>
            </div>
            <Toggle checked={cat.enabled} onChange={async () => {
              const { error } = await upsertCategory({ ...cat, enabled: !cat.enabled });
              showToast(error ? error : cat.enabled ? "Catégorie masquée" : "Catégorie activée", error ? "error" : "success");
            }} />
            <button className="adm-iconbtn sm" onClick={() => setEditCat(cat)}><Icon name="edit" size={14} /></button>
            <button
              className="adm-iconbtn sm"
              style={{ color: "var(--tone-pink)" }}
              onClick={async () => {
                if (!confirm(`Supprimer « ${cat.label} » ?`)) return;
                const { error } = await deleteCategory(cat.id);
                showToast(error ? error : "Catégorie supprimée", error ? "error" : "success");
              }}
            >
              <Icon name="trash" size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="adm-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Articles ({articles.length})</h3>
          <button
            type="button"
            className="adm-btn ghost sm"
            onClick={() =>
              setEditArt({
                id: `__new-${Date.now()}`,
                slug: "",
                title: "",
                excerpt: "",
                categoryId: categories.find((c) => c.enabled)?.id ?? "conseils",
                publishedAt: new Date().toISOString().slice(0, 10),
                readMinutes: 5,
                published: false,
                featured: false,
              })
            }
          >
            <Icon name="plus" size={14} /> Ajouter
          </button>
        </div>
        {articles.map((art) => (
          <div key={art.id} className="ab-row" style={{ marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <div className="ab-sec-name">{art.title}</div>
              <div className="ab-sec-meta">
                <span className="ab-sec-tag">{art.categoryId}</span>
                {!art.published && <span className="ab-sec-tag" style={{ color: "var(--tone-pink)" }}>brouillon</span>}
              </div>
            </div>
            <Toggle
              checked={art.published}
              onChange={async () => {
                const { error } = await upsertArticle({ ...art, published: !art.published });
                showToast(error ? error : art.published ? "Article dépublié" : "Article publié", error ? "error" : "success");
              }}
            />
            <button className="adm-iconbtn sm" onClick={() => setEditArt(art)}><Icon name="edit" size={14} /></button>
            <button
              className="adm-iconbtn sm"
              style={{ color: "var(--tone-pink)" }}
              onClick={async () => {
                if (!confirm(`Supprimer « ${art.title} » ?`)) return;
                const { error } = await deleteArticle(art.id);
                showToast(error ? error : "Article supprimé", error ? "error" : "success");
              }}
            >
              <Icon name="trash" size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="adm-card" style={{ padding: 20 }}>
        <AppBuilder pageSlug="blog" embedded />
      </div>

      {editCat && (
        <CategoryEditor
          cat={editCat}
          onClose={() => setEditCat(null)}
          onSave={async (c) => {
            const { error } = await upsertCategory(c);
            showToast(error ? error : "Catégorie enregistrée", error ? "error" : "success");
            if (!error) setEditCat(null);
          }}
        />
      )}
      {editArt && (
        <ArticleEditor
          article={editArt}
          categories={categories}
          onClose={() => setEditArt(null)}
          onSave={async (a) => {
            const payload = a.id.startsWith("__new")
              ? { ...a, id: `blog-${Date.now()}`, slug: a.slug || slugifyTitle(a.title) }
              : a;
            const { error } = await upsertArticle(payload);
            showToast(error ? error : "Article enregistré", error ? "error" : "success");
            if (!error) setEditArt(null);
          }}
        />
      )}
    </div>
  );
}

/* ── Social tab ────────────────────────────────────────────────────────────── */

function SocialLinkEditor({
  link,
  onClose,
  onSave,
}: {
  link: AdminSocialLink;
  onClose: () => void;
  onSave: (l: AdminSocialLink) => void;
}) {
  const [form, setForm] = useState({ ...link });
  return (
    <div className="pop-editor-modal" onClick={onClose}>
      <div className="pop-editor" onClick={(e) => e.stopPropagation()}>
        <div className="pop-editor-head">
          <div style={{ fontSize: 18, fontWeight: 700 }}>{link.id ? "Modifier réseau" : "Nouveau réseau"}</div>
          <button className="adm-iconbtn" onClick={onClose}><Icon name="x" size={17} /></button>
        </div>
        <div className="pop-editor-form" style={{ padding: 20 }}>
          <FieldRow label="ID" value={form.id} onChange={(v) => setForm({ ...form, id: v })} />
          <FieldRow label="Nom" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <FieldRow label="Handle" value={form.handle} onChange={(v) => setForm({ ...form, handle: v })} />
          <FieldRow label="URL" value={form.url} onChange={(v) => setForm({ ...form, url: v })} />
          <FieldRow label="Couleur accent" value={form.accent} onChange={(v) => setForm({ ...form, accent: v })} />
          <FieldRow label="Abonnés" value={form.followers != null ? String(form.followers) : ""} onChange={(v) => setForm({ ...form, followers: v ? Number(v) : null })} />
          <FieldRow label="Dernière publication" value={form.latestPost ?? ""} onChange={(v) => setForm({ ...form, latestPost: v || null })} />
          <FieldRow label="Dernière vidéo" value={form.latestVideo ?? ""} onChange={(v) => setForm({ ...form, latestVideo: v || null })} />
          <FieldRow label="Position" value={String(form.position)} onChange={(v) => setForm({ ...form, position: Number(v) || 0 })} />
          <div className="pop-toggle-row">
            <span className="pop-toggle-label">Activé</span>
            <Toggle checked={form.enabled} onChange={() => setForm({ ...form, enabled: !form.enabled })} />
          </div>
        </div>
        <div className="pop-editor-foot">
          <button className="adm-btn ghost" onClick={onClose}>Annuler</button>
          <button className="adm-btn gold" onClick={() => onSave(form)}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

function SocialTab({ showToast }: { showToast: (msg: string, v?: AdminToastVariant) => void }) {
  const { pageSettings, links, loading, saving, setPageSettings, savePageSettings, upsertLink, deleteLink } = useAdminSocialContent();
  const [editLink, setEditLink] = useState<AdminSocialLink | null>(null);

  if (loading) return <p style={{ padding: 20, color: "var(--adm-ink-mute)" }}>Chargement…</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="adm-card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>En-tête réseaux sociaux</h3>
        <FieldRow label="Eyebrow" value={pageSettings.heroEyebrow} onChange={(v) => setPageSettings({ ...pageSettings, heroEyebrow: v })} />
        <FieldRow label="Titre" value={pageSettings.heroTitle} onChange={(v) => setPageSettings({ ...pageSettings, heroTitle: v })} />
        <FieldRow label="Sous-titre" value={pageSettings.heroSubtitle} onChange={(v) => setPageSettings({ ...pageSettings, heroSubtitle: v })} multiline />
        <FieldRow label="Note de bas de page" value={pageSettings.footnote} onChange={(v) => setPageSettings({ ...pageSettings, footnote: v })} multiline />
        <button
          type="button"
          className="adm-btn gold"
          style={{ marginTop: 16 }}
          disabled={saving}
          onClick={async () => {
            const { error } = await savePageSettings(pageSettings);
            showToast(error ? `Erreur : ${error}` : "En-tête réseaux enregistré", error ? "error" : "success");
          }}
        >
          Enregistrer l&apos;en-tête
        </button>
      </div>

      <div className="adm-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Réseaux ({links.length})</h3>
          <button
            type="button"
            className="adm-btn ghost sm"
            onClick={() =>
              setEditLink({
                id: `network-${Date.now()}`,
                name: "",
                handle: "",
                url: "https://",
                accent: "#D4AF37",
                followers: null,
                latestPost: null,
                latestVideo: null,
                position: links.length,
                enabled: true,
              })
            }
          >
            <Icon name="plus" size={14} /> Ajouter
          </button>
        </div>
        {links.map((link) => (
          <div key={link.id} className="ab-row" style={{ marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <div className="ab-sec-name">{link.name}</div>
              <div className="ab-sec-meta"><span className="ab-sec-tag">{link.handle}</span></div>
            </div>
            <Toggle
              checked={link.enabled}
              onChange={async () => {
                const { error } = await upsertLink({ ...link, enabled: !link.enabled });
                showToast(error ? error : link.enabled ? "Réseau masqué" : "Réseau activé", error ? "error" : "success");
              }}
            />
            <button className="adm-iconbtn sm" onClick={() => setEditLink(link)}><Icon name="edit" size={14} /></button>
            <button
              className="adm-iconbtn sm"
              style={{ color: "var(--tone-pink)" }}
              onClick={async () => {
                if (!confirm(`Supprimer « ${link.name} » ?`)) return;
                const { error } = await deleteLink(link.id);
                showToast(error ? error : "Réseau supprimé", error ? "error" : "success");
              }}
            >
              <Icon name="trash" size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="adm-card" style={{ padding: 20 }}>
        <AppBuilder pageSlug="social" embedded />
      </div>

      {editLink && (
        <SocialLinkEditor
          link={editLink}
          onClose={() => setEditLink(null)}
          onSave={async (l) => {
            const { error } = await upsertLink(l);
            showToast(error ? error : "Réseau enregistré", error ? "error" : "success");
            if (!error) setEditLink(null);
          }}
        />
      )}
    </div>
  );
}

/* ── Main module ───────────────────────────────────────────────────────────── */

export function ContentPagesAdminModule() {
  const [tab, setTab] = useState<Tab>("flash");
  const [toast, setToast] = useState<{ msg: string; variant: AdminToastVariant } | null>(null);

  function showToast(msg: string, variant: AdminToastVariant = "success") {
    setToast({ msg, variant });
    setTimeout(() => setToast(null), 2800);
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "flash", label: "Ventes Flash", icon: "flame" },
    { id: "blog", label: "Blog LN COS", icon: "edit" },
    { id: "social", label: "Réseaux sociaux", icon: "share" },
  ];

  return (
    <div className="adm-content">
      <div className="adm-topbar">
        <div>
          <div className="adm-page-eyebrow"><span className="dot" />CONTENU · STOREFRONT</div>
          <h1 className="adm-h1">Pages contenu</h1>
        </div>
      </div>

      <div className="adm-tabs" style={{ marginBottom: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`adm-btn${tab === t.id ? " gold" : " ghost"}`}
            onClick={() => setTab(t.id)}
          >
            <Icon name={t.icon} size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "flash" && <FlashTab showToast={showToast} />}
      {tab === "blog" && <BlogTab showToast={showToast} />}
      {tab === "social" && <SocialTab showToast={showToast} />}

      {toast && <AdminToast msg={toast.msg} variant={toast.variant} />}
    </div>
  );
}
