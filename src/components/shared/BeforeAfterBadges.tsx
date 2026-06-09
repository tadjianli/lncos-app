import { Icon } from "@/components/shared/Icon";

export function BeforeAfterBadges({
  verified,
  compact,
}: {
  verified?: boolean;
  compact?: boolean;
}) {
  const badgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: compact ? 10 : 10.5,
    fontWeight: 700,
    padding: compact ? "2px 7px" : "3px 9px",
    borderRadius: 999,
    background: "rgba(47,158,104,.12)",
    color: "var(--tone-green, #2F9E68)",
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      <span style={badgeStyle}>
        <Icon name="check" size={9} stroke={3} /> Résultat client
      </span>
      <span style={badgeStyle}>
        <Icon name="camera" size={9} stroke={2} /> Photo authentique
      </span>
      {verified && (
        <span style={badgeStyle}>
          <Icon name="check" size={9} stroke={3} /> Achat vérifié
        </span>
      )}
    </div>
  );
}
