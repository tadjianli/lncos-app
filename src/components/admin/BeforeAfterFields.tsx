"use client";

import { useRef, useState } from "react";
import {
  RESULT_DURATION_LABELS,
  type BeforeAfterFormValues,
  type ResultDuration,
} from "@/lib/before-after";
import { isImageUrl, uploadBeforeAfterImage } from "@/lib/admin-media";

export function BeforeAfterFields({
  form,
  onChange,
  uploadFolder,
}: {
  form: BeforeAfterFormValues;
  onChange: (patch: Partial<BeforeAfterFormValues>) => void;
  uploadFolder: string;
}) {
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);

  async function upload(file: File, kind: "before" | "after") {
    const setBusy = kind === "before" ? setUploadingBefore : setUploadingAfter;
    setBusy(true);
    const { url, error } = await uploadBeforeAfterImage(file, `${uploadFolder}/${kind}`);
    setBusy(false);
    if (url) {
      onChange(kind === "before" ? { beforeImageUrl: url } : { afterImageUrl: url });
    }
    return error;
  }

  return (
    <div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", marginBottom: 14 }}>
        <input
          type="checkbox"
          checked={form.showBeforeAfter}
          onChange={(e) => onChange({ showBeforeAfter: e.target.checked })}
        />
        Afficher Avant / Après
      </label>

      {form.showBeforeAfter && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div className="ab-field" style={{ margin: 0 }}>
              <label>Photo Avant</label>
              {isImageUrl(form.beforeImageUrl) && (
                <img src={form.beforeImageUrl} alt="" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
              )}
              <button type="button" className="adm-btn sm" disabled={uploadingBefore} onClick={() => beforeRef.current?.click()}>
                {uploadingBefore ? "Upload…" : "Upload"}
              </button>
              <input ref={beforeRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f, "before");
                e.target.value = "";
              }} />
            </div>
            <div className="ab-field" style={{ margin: 0 }}>
              <label>Photo Après</label>
              {isImageUrl(form.afterImageUrl) && (
                <img src={form.afterImageUrl} alt="" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
              )}
              <button type="button" className="adm-btn sm" disabled={uploadingAfter} onClick={() => afterRef.current?.click()}>
                {uploadingAfter ? "Upload…" : "Upload"}
              </button>
              <input ref={afterRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f, "after");
                e.target.value = "";
              }} />
            </div>
          </div>

          <div className="ab-field">
            <label>Description du résultat</label>
            <input
              className="ab-input"
              value={form.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Résultat après 3 semaines d'utilisation"
            />
          </div>

          <div className="ab-field">
            <label>Durée du résultat</label>
            <select
              className="ab-input"
              value={form.resultDuration}
              onChange={(e) => onChange({ resultDuration: e.target.value as ResultDuration })}
            >
              {(Object.keys(RESULT_DURATION_LABELS) as ResultDuration[]).map((k) => (
                <option key={k} value={k}>{RESULT_DURATION_LABELS[k]}</option>
              ))}
            </select>
          </div>

          {form.resultDuration === "custom" && (
            <div className="ab-field">
              <label>Durée personnalisée</label>
              <input
                className="ab-input"
                value={form.resultDurationCustom}
                onChange={(e) => onChange({ resultDurationCustom: e.target.value })}
                placeholder="Ex. 10 jours"
              />
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={form.featured} onChange={(e) => onChange({ featured: e.target.checked })} />
              Mis en avant
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={form.pinned} onChange={(e) => onChange({ pinned: e.target.checked })} />
              Épinglé
            </label>
          </div>
        </>
      )}
    </div>
  );
}
