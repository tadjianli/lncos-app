"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";

interface FlashSaleHeadProps {
  title?: string;
}

export function FlashSaleHead({ title = "Ventes Flash" }: FlashSaleHeadProps) {
  const [f, setF] = useState({ h: 4, m: 12, s: 38 });

  useEffect(() => {
    const t = setInterval(() => {
      setF((o) => {
        let { h, m, s } = o;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) h = 5;
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flash-head">
      <h3 className="flash-head-title">
        <Icon
          name="flame"
          size={20}
          color="var(--gold)"
          fill="rgba(212,175,55,.25)"
        />
        {title}
      </h3>
      <div className="flash-countdown" aria-label="Compte à rebours vente flash">
        {[f.h, f.m, f.s].map((v, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className="flash-countdown-digit">{pad(v)}</span>
            {i < 2 && (
              <span style={{ color: "var(--ink-mute)", fontWeight: 700 }}>:</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
