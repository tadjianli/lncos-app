"use client";

import { useMemo, useState } from "react";
import { AdminToast, type AdminToastVariant } from "@/components/admin/AdminToast";
import { BeautyVideoEditor } from "@/components/admin/BeautyVideoEditor";
import { Icon } from "@/components/shared/Icon";
import type { BeautyVideo } from "@/lib/contracts/beauty-videos";
import { emptyBeautyVideo } from "@/lib/contracts/beauty-videos";
import { useAdminBeautyVideos } from "@/lib/beauty-videos-hooks";
import { getBeautyVideoCategoryLabel } from "@/lib/beauty-videos";
import { BEAUTY_VIDEO_TYPE_LABELS } from "@/lib/contracts/beauty-videos";

export function BeautyVideosAdminModule() {
  const { videos, loading, saving, upsertVideo, createVideo, deleteVideo } = useAdminBeautyVideos();
  const [editing, setEditing] = useState<BeautyVideo | null>(null);
  const [toast, setToast] = useState<{ msg: string; variant: AdminToastVariant } | null>(null);

  const sorted = useMemo(
    () => [...videos].sort((a, b) => a.position - b.position || b.publishedAt.localeCompare(a.publishedAt)),
    [videos]
  );

  function showToast(msg: string, variant: AdminToastVariant = "success") {
    setToast({ msg, variant });
  }

  async function handleSave(video: BeautyVideo) {
    const { error } = await upsertVideo(video);
    if (error) showToast(`Erreur : ${error}`, "error");
    else {
      showToast("Vidéo enregistrée");
      setEditing(null);
    }
  }

  async function handleCreate() {
    setEditing(
      emptyBeautyVideo({
        id: "__new",
        slug: "",
        title: "Nouvelle vidéo beauté",
        published: false,
      })
    );
  }

  async function handleCreateSave(video: BeautyVideo) {
    if (video.id === "__new") {
      const { id: _removed, ...rest } = video;
      const { error } = await createVideo(rest);
      if (error) showToast(`Erreur : ${error}`, "error");
      else {
        showToast("Vidéo créée");
        setEditing(null);
      }
      return;
    }
    await handleSave(video);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette vidéo ?")) return;
    const { error } = await deleteVideo(id);
    showToast(error ? `Erreur : ${error}` : "Vidéo supprimée", error ? "error" : "success");
  }

  return (
    <div className="adm-page">
      <div className="adm-page-head">
        <div>
          <h1 className="adm-page-title">Vidéos Beauté</h1>
          <p className="adm-page-sub">
            Hub TikTok / Reels / Shorts — contenu vidéo relié au catalogue produits LN COS.
          </p>
        </div>
        <button type="button" className="adm-btn gold" onClick={handleCreate} disabled={saving}>
          <Icon name="plus" size={16} />
          Ajouter une vidéo
        </button>
      </div>

      {loading ? (
        <p style={{ padding: 20, color: "var(--adm-ink-mute)" }}>Chargement…</p>
      ) : sorted.length === 0 ? (
        <div className="adm-card" style={{ padding: 24, textAlign: "center" }}>
          <p style={{ color: "var(--adm-ink-mute)" }}>Aucune vidéo — créez votre première vidéo beauté.</p>
        </div>
      ) : (
        <div className="adm-card" style={{ overflow: "hidden" }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Type</th>
                <th>Statut</th>
                <th>À la une</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.map((v) => (
                <tr key={v.id}>
                  <td>
                    <strong>{v.title}</strong>
                    <div style={{ fontSize: 11, color: "var(--adm-ink-mute)" }}>/videos/{v.slug}</div>
                  </td>
                  <td>{getBeautyVideoCategoryLabel(v.category)}</td>
                  <td>{BEAUTY_VIDEO_TYPE_LABELS[v.videoType]}</td>
                  <td>{v.published ? "Publié" : "Brouillon"}</td>
                  <td>{v.featured ? "Oui" : "Non"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button
                      type="button"
                      className="adm-btn ghost sm"
                      onClick={() => setEditing(v)}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="adm-btn ghost sm"
                      onClick={() => void handleDelete(v.id)}
                      style={{ marginLeft: 6, color: "#c44" }}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing ? (
        <BeautyVideoEditor
          video={editing}
          onClose={() => setEditing(null)}
          onSave={handleCreateSave}
        />
      ) : null}

      {toast ? <AdminToast msg={toast.msg} variant={toast.variant} /> : null}
    </div>
  );
}
