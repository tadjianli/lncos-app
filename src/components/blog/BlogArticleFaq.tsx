import type { BlogFaqItem } from "@/lib/contracts/blog";

interface BlogArticleFaqProps {
  items: BlogFaqItem[];
}

export function BlogArticleFaq({ items }: BlogArticleFaqProps) {
  if (items.length === 0) return null;

  return (
    <section className="blog-article-faq" aria-labelledby="blog-faq-title">
      <h2 id="blog-faq-title" className="blog-article-section__title">
        Questions fréquentes
      </h2>
      <div className="blog-article-faq__list">
        {items.map((item, index) => (
          <details key={`${item.question}-${index}`} className="blog-article-faq__item">
            <summary className="blog-article-faq__q">{item.question}</summary>
            <p className="blog-article-faq__a">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
