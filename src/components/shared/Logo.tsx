/* LN COS — Logo (exact from handoff ui.jsx) */

interface LogoProps {
  size?: number;
  mono?: boolean;
  color?: string;
}

export function Logo({ size = 30, mono = false, color }: LogoProps) {
  const c = color || "var(--gold)";

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.34 }}>
      <span
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          border: `1.4px solid ${c}`,
          display: "grid",
          placeItems: "center",
          flex: "0 0 auto",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-montserrat, Montserrat, sans-serif)",
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: size * 0.5,
            lineHeight: 1,
            color: c,
            letterSpacing: "-.02em",
            marginTop: -1,
          }}
        >
          L
        </span>
      </span>
      {!mono && (
        <span
          style={{
            fontFamily: "var(--font-montserrat, Montserrat, sans-serif)",
            fontWeight: 500,
            letterSpacing: ".22em",
            fontSize: size * 0.46,
            color: c,
            paddingTop: 2,
            whiteSpace: "nowrap",
          }}
        >
          LN COS
        </span>
      )}
    </span>
  );
}
