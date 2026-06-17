import Link from "next/link";
import { SEO_SITELINKS } from "@/lib/seo-site";

/**
 * Navigation crawlable pour sitelinks Google — visible en bas de l'accueil.
 */
export function HomeSitelinksNav() {
  return (
    <nav className="home-sitelinks" aria-label="Explorer LN COS">
      <p className="home-sitelinks__title">Explorer LN COS</p>
      <ul className="home-sitelinks__list">
        {SEO_SITELINKS.map((link) => (
          <li key={link.path + link.name}>
            <Link href={link.path} className="home-sitelinks__link">
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
