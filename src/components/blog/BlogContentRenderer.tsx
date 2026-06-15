import type { BlogContentBlock } from "@/lib/contracts/blog";

interface BlogContentRendererProps {
  blocks: BlogContentBlock[];
  title: string;
}

export function BlogContentRenderer({ blocks, title }: BlogContentRendererProps) {
  if (blocks.length === 0) {
    return (
      <p className="blog-article-prose__empty">
        Le contenu de cet article sera bientôt disponible.
      </p>
    );
  }

  return (
    <div className="blog-article-prose">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "h1") {
          return (
            <h1 key={key} className="blog-article-prose__h1">
              {block.text}
            </h1>
          );
        }
        if (block.type === "h2") {
          return (
            <h2 key={key} className="blog-article-prose__h2">
              {block.text}
            </h2>
          );
        }
        if (block.type === "h3") {
          return (
            <h3 key={key} className="blog-article-prose__h3">
              {block.text}
            </h3>
          );
        }
        if (block.type === "p") {
          return (
            <p key={key} className="blog-article-prose__p">
              {block.text}
            </p>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote key={key} className="blog-article-prose__quote">
              <p>{block.text}</p>
              {block.author ? (
                <cite className="blog-article-prose__quote-author">— {block.author}</cite>
              ) : null}
            </blockquote>
          );
        }
        if (block.type === "ul" || block.type === "ol") {
          const Tag = block.type === "ul" ? "ul" : "ol";
          return (
            <Tag key={key} className="blog-article-prose__list">
              {block.items.map((item, i) => (
                <li key={`${key}-${i}`}>{item}</li>
              ))}
            </Tag>
          );
        }
        if (block.type === "img") {
          return (
            <figure key={key} className="blog-article-prose__figure">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={block.url}
                alt={block.alt ?? title}
                className="blog-article-prose__img"
                loading="lazy"
              />
              {block.caption ? (
                <figcaption className="blog-article-prose__caption">{block.caption}</figcaption>
              ) : null}
            </figure>
          );
        }
        return null;
      })}
    </div>
  );
}
