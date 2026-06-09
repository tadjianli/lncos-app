"use client";

import type { ProductHomeVisibility } from "@/lib/product-home-visibility";
import {
  HOME_DISPLAY_OPTIONS,
  HOME_UNIVERSE_OPTIONS,
} from "@/lib/product-home-visibility";

interface ProductHomeVisibilityEditorProps {
  value: ProductHomeVisibility;
  onChange: (next: ProductHomeVisibility) => void;
}

function toggle(
  value: ProductHomeVisibility,
  key: string,
  checked: boolean
): ProductHomeVisibility {
  const next = { ...value };
  if (checked) next[key as keyof ProductHomeVisibility] = true;
  else delete next[key as keyof ProductHomeVisibility];
  return next;
}

export function ProductHomeVisibilityEditor({
  value,
  onChange,
}: ProductHomeVisibilityEditorProps) {
  return (
    <div className="adm-home-visibility">
      <div className="adm-home-visibility-group">
        <div className="adm-home-visibility-label">Afficher sur</div>
        <div className="adm-home-visibility-grid">
          {HOME_DISPLAY_OPTIONS.map(({ key, label }) => (
            <label key={key} className="adm-home-visibility-check">
              <input
                type="checkbox"
                checked={value[key] === true}
                onChange={(e) => onChange(toggle(value, key, e.target.checked))}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="adm-home-visibility-group">
        <div className="adm-home-visibility-label">Univers LN COS</div>
        <div className="adm-home-visibility-grid">
          {HOME_UNIVERSE_OPTIONS.map(({ key, label }) => (
            <label key={key} className="adm-home-visibility-check">
              <input
                type="checkbox"
                checked={value[key] === true}
                onChange={(e) => onChange(toggle(value, key, e.target.checked))}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
