interface InfoProseProps {
  children: React.ReactNode;
  className?: string;
}

export function InfoProse({ children, className = "" }: InfoProseProps) {
  return <div className={`info-prose ${className}`.trim()}>{children}</div>;
}

interface InfoCardProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function InfoCard({ children, icon }: InfoCardProps) {
  return (
    <div className="info-card">
      {icon && <div className="info-card__icon">{icon}</div>}
      <div className="info-card__body">{children}</div>
    </div>
  );
}

interface LegalSectionProps {
  title: string;
  children: React.ReactNode;
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="info-legal-section">
      <h3 className="info-legal-section__title">{title}</h3>
      <div className="info-prose">{children}</div>
    </section>
  );
}

interface InfoDefinitionListProps {
  items: { label: string; value: React.ReactNode }[];
}

export function InfoDefinitionList({ items }: InfoDefinitionListProps) {
  return (
    <dl className="info-dl">
      {items.map((item) => (
        <div key={item.label} className="info-dl__row">
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
