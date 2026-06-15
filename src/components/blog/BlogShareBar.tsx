"use client";

import { useCallback, useState } from "react";
import { Icon } from "@/components/shared/Icon";

interface BlogShareBarProps {
  title: string;
  url: string;
}

export function BlogShareBar({ title, url }: BlogShareBarProps) {
  const [copied, setCopied] = useState(false);

  const shareText = encodeURIComponent(`${title} — LN COS`);
  const shareUrl = encodeURIComponent(url);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [url]);

  return (
    <div className="blog-share" aria-label="Partager l'article">
      <span className="blog-share__label">Partager</span>
      <div className="blog-share__actions">
        <a
          href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="blog-share__btn"
          aria-label="Partager sur WhatsApp"
        >
          <Icon name="phone" size={16} />
          WhatsApp
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="blog-share__btn"
          aria-label="Partager sur Facebook"
        >
          <Icon name="share" size={16} />
          Facebook
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="blog-share__btn"
          aria-label="Partager sur X"
        >
          <Icon name="x" size={16} />
          X
        </a>
        <button type="button" className="blog-share__btn" onClick={handleCopy}>
          <Icon name="share" size={16} />
          {copied ? "Copié !" : "Copier le lien"}
        </button>
      </div>
    </div>
  );
}
