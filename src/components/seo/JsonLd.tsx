interface JsonLdProps {
  data: Record<string, unknown>;
}

/** Injecte un bloc JSON-LD Schema.org (server component). */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
