"use client";

import { Icon } from "@/components/shared/Icon";
import { SocialBrandIcon } from "./SocialBrandIcon";
import {
  formatFollowerCount,
  type SocialNetworkLink,
} from "@/lib/social-links";

interface SocialNetworkCardProps {
  network: SocialNetworkLink;
  index?: number;
}

export function SocialNetworkCard({ network, index = 0 }: SocialNetworkCardProps) {
  const hasStats =
    network.followers != null ||
    Boolean(network.latestPost) ||
    Boolean(network.latestVideo);

  return (
    <a
      href={network.url}
      target="_blank"
      rel="noopener noreferrer"
      className="social-card"
      style={{ animationDelay: `${0.06 + index * 0.05}s` }}
      aria-label={`${network.name} — ${network.handle} (nouvelle fenêtre)`}
    >
      <div
        className="social-card__glow"
        style={{ background: `radial-gradient(circle, ${network.accent}33, transparent 70%)` }}
        aria-hidden
      />
      <div className="social-card__icon" style={{ borderColor: `${network.accent}44` }}>
        <SocialBrandIcon network={network.id} size={26} color={network.accent} />
      </div>
      <div className="social-card__body">
        <div className="social-card__name">{network.name}</div>
        <div className="social-card__handle">{network.handle}</div>
        {hasStats && (
          <div className="social-card__stats">
            {network.followers != null && (
              <span>{formatFollowerCount(network.followers)} abonnés</span>
            )}
            {network.latestPost && (
              <span>Dernière publication · {network.latestPost}</span>
            )}
            {network.latestVideo && (
              <span>Dernière vidéo · {network.latestVideo}</span>
            )}
          </div>
        )}
      </div>
      <Icon name="arrowR" size={18} color="var(--gold)" stroke={2} />
    </a>
  );
}
