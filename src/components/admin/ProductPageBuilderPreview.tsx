"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/shared/Icon";
import {
  PRODUCT_PAGE_BLOCK_REGISTRY,
  blockVisualMeta,
  type ProductPageBlock,
} from "@/lib/product-page-builder";

const DEMO = {
  name: "Sérum Éclat Intense",
  price: "42,00 €",
  category: "Soins visage · 30 ml",
  rating: "4,9",
  reviews: 128,
};

interface ProductPageBuilderPreviewProps {
  blocks: ProductPageBlock[];
  selectedId: string | null;
  onSelectBlock: (id: string) => void;
}

function PreviewBlockMock({
  block,
  selected,
  onSelect,
}: {
  block: ProductPageBlock;
  selected: boolean;
  onSelect: () => void;
}) {
  const schema = PRODUCT_PAGE_BLOCK_REGISTRY[block.type];
  const meta = blockVisualMeta(block.type);
  const dimmed = !block.enabled;

  const wrap = (content: ReactNode, minH = 0) => (
    <button
      type="button"
      className={`ppb-mock-block${selected ? " is-selected" : ""}${dimmed ? " is-off" : ""}`}
      onClick={onSelect}
      style={{ minHeight: minH || undefined }}
    >
      {selected && <span className="ppb-mock-block-ring" aria-hidden />}
      {content}
      {selected && (
        <span className="ppb-mock-block-label">
          <Icon name={meta.icon} size={10} color={meta.color} />
          {schema.label}
        </span>
      )}
    </button>
  );

  switch (block.type) {
    case "gallery":
      return wrap(
        <div className="ppb-mock-gallery">
          <div className="ppb-mock-gallery-main" />
          <div className="ppb-mock-gallery-dots">
            <span className="on" /><span /><span />
          </div>
        </div>,
        140
      );
    case "product_info":
      return wrap(
        <div className="ppb-mock-info">
          <span className="ppb-mock-badge">Best-seller</span>
          <div className="ppb-mock-title">{DEMO.name}</div>
          <div className="ppb-mock-meta">{DEMO.category}</div>
          <div className="ppb-mock-price">{DEMO.price}</div>
          <div className="ppb-mock-stars">
            {"★★★★★"} <span>{DEMO.rating} · {DEMO.reviews} avis</span>
          </div>
        </div>
      );
    case "variants":
      return wrap(
        <div className="ppb-mock-variants">
          <span className="on">30 ml</span>
          <span>50 ml</span>
        </div>
      );
    case "quantity":
      return wrap(
        <div className="ppb-mock-qty">
          <span>Quantité</span>
          <div><button type="button">−</button><span>1</span><button type="button">+</button></div>
        </div>
      );
    case "live_viewers":
      return wrap(
        <div className="ppb-mock-pill green">
          <Icon name="eye" size={11} /> 12 personnes consultent
        </div>
      );
    case "stock_alert":
      return wrap(
        <div className="ppb-mock-pill orange">
          <Icon name="bell" size={11} /> Plus que 3 en stock
        </div>
      );
    case "reviews_summary":
      return wrap(
        <div className="ppb-mock-reviews-sum">
          <span className="ppb-mock-stars-sm">★★★★★</span>
          <span>4,9 · Voir les avis</span>
        </div>
      );
    case "reference":
      return wrap(<div className="ppb-mock-ref">Réf. LN-SER-001</div>);
    case "benefits":
      return wrap(
        <div className="ppb-mock-list">
          <div className="ppb-mock-list-title">Bénéfices clés</div>
          <ul>
            <li>Éclat immédiat</li>
            <li>Texture légère</li>
          </ul>
        </div>
      );
    case "description":
      return wrap(
        <div className="ppb-mock-accordion">
          <div className="ppb-mock-accordion-head">Description ▾</div>
          <div className="ppb-mock-accordion-body">Formule enrichie en vitamine C…</div>
        </div>
      );
    case "usage_tips":
      return wrap(
        <div className="ppb-mock-steps">
          <div className="ppb-mock-list-title">Conseils d&apos;utilisation</div>
          <div className="ppb-mock-step"><span>1</span> Nettoyer</div>
          <div className="ppb-mock-step"><span>2</span> Appliquer</div>
        </div>
      );
    case "video":
      return wrap(
        <div className="ppb-mock-video">
          <Icon name="play" size={22} color="#fff" />
        </div>,
        90
      );
    case "faq":
      return wrap(
        <div className="ppb-mock-faq">
          <div className="ppb-mock-list-title">FAQ</div>
          <div className="ppb-mock-faq-item">Livraison ? ▾</div>
          <div className="ppb-mock-faq-item">Retours ? ▾</div>
        </div>
      );
    case "custom":
      return wrap(
        <div className="ppb-mock-custom">
          <div className="ppb-mock-list-title">{block.settings.title || "Section perso"}</div>
          <p>{block.settings.body?.slice(0, 60) || "Contenu éditorial libre…"}</p>
        </div>
      );
    case "before_after":
      return wrap(
        <div className="ppb-mock-ba">
          <div /><div />
        </div>,
        70
      );
    case "reviews":
      return wrap(
        <div className="ppb-mock-reviews">
          <div className="ppb-mock-list-title">Avis clients</div>
          <div className="ppb-mock-review-card">★★★★★ · « Résultat visible »</div>
        </div>
      );
    case "routine":
    case "recommendations":
      return wrap(
        <div className="ppb-mock-carousel">
          <div className="ppb-mock-list-title">
            {block.type === "routine" ? "Routine beauté" : "Vous aimerez aussi"}
          </div>
          <div className="ppb-mock-carousel-track">
            <div /><div /><div />
          </div>
        </div>,
        80
      );
    case "sales_counter":
      return wrap(
        <div className="ppb-mock-pill gold sm">
          <Icon name="bolt" size={10} /> 24 vendus cette semaine
        </div>
      );
    case "add_to_cart":
      return wrap(
        <div className="ppb-mock-cta">
          {block.settings.ctaLabel || "Ajouter au panier"} · {DEMO.price}
        </div>
      );
    case "trust_badges":
      return wrap(
        <div className="ppb-mock-trust">
          <span><Icon name="check" size={9} /> Livraison</span>
          <span><Icon name="check" size={9} /> Paiement</span>
          <span><Icon name="check" size={9} /> Retours</span>
        </div>
      );
    default:
      return wrap(
        <div className="ppb-mock-generic">
          <Icon name={meta.icon} size={14} color={meta.color} />
          {schema.label}
        </div>
      );
  }
}

export function ProductPageBuilderPreview({
  blocks,
  selectedId,
  onSelectBlock,
}: ProductPageBuilderPreviewProps) {
  const main = blocks.filter((b) => b.zone === "main").sort((a, b) => a.position - b.position);
  const sticky = blocks.filter((b) => b.zone === "sticky").sort((a, b) => a.position - b.position);
  const enabledMain = main.filter((b) => b.enabled);

  return (
    <div className="ppb-preview-wrap">
      <div className="ppb-preview-head">
        <div className="ppb-preview-live">
          <span className="ppb-preview-dot" />
          Aperçu iPhone
        </div>
        <span className="ppb-preview-hint">Cliquez pour éditer</span>
      </div>

      <div className="ppb-iphone">
        <div className="ppb-iphone-shell">
          <div className="ppb-iphone-btn ppb-iphone-btn--silent" />
          <div className="ppb-iphone-btn ppb-iphone-btn--vol-up" />
          <div className="ppb-iphone-btn ppb-iphone-btn--vol-down" />
          <div className="ppb-iphone-btn ppb-iphone-btn--power" />
          <div className="ppb-iphone-bezel">
            <div className="ppb-iphone-island">
              <span className="ppb-iphone-cam" />
            </div>
            <div className="ppb-iphone-screen">
              <div className="ppb-iphone-status">
                <span>9:41</span>
                <span className="ppb-iphone-status-icons">●●●</span>
              </div>
              <div className="ppb-iphone-scroll">
                {enabledMain.length === 0 ? (
                  <div className="ppb-iphone-empty">
                    Aucune section active
                  </div>
                ) : (
                  enabledMain.map((block) => (
                    <PreviewBlockMock
                      key={block.id}
                      block={block}
                      selected={selectedId === block.id}
                      onSelect={() => onSelectBlock(block.id)}
                    />
                  ))
                )}
              </div>
              {sticky.some((b) => b.enabled) && (
                <div className="ppb-iphone-sticky">
                  {sticky
                    .filter((b) => b.enabled)
                    .map((block) => (
                      <PreviewBlockMock
                        key={block.id}
                        block={block}
                        selected={selectedId === block.id}
                        onSelect={() => onSelectBlock(block.id)}
                      />
                    ))}
                </div>
              )}
              <div className="ppb-iphone-home" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
