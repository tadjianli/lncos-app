/**
 * LN COS — SEO site-wide (accueil, sitelinks, Schema.org)
 */

import { absoluteUrl, getSiteUrl } from "@/lib/site-url";
import { getCategorySeoPath } from "@/lib/seo";

export const HOME_SEO_TITLE =
  "LN COS | Cosmétiques, Ongles, Beauté & Accessoires à La Réunion";

export const HOME_SEO_DESCRIPTION =
  "Découvrez LN COS : vernis semi-permanents, accessoires ongles, maquillage, soins beauté et nouveautés. Livraison rapide à La Réunion et en France.";

export const SITE_KEYWORDS = [
  "LN COS",
  "cosmétiques La Réunion",
  "vernis semi-permanent",
  "accessoires ongles",
  "maquillage",
  "soins beauté",
  "nail art",
  "boutique beauté",
  "livraison La Réunion",
];

/** Pages prioritaires pour sitelinks Google Search */
export const SEO_SITELINKS = [
  {
    name: "Nouveautés",
    path: "/discover",
    description: "Dernières nouveautés beauté et lancements LN COS",
  },
  {
    name: "Meilleures ventes",
    path: "/boutique",
    description: "Best-sellers et produits les plus populaires",
  },
  {
    name: "Vernis semi-permanent",
    path: "/boutique",
    description: "Vernis semi-permanents et couleurs ongles",
  },
  {
    name: "Accessoires ongles",
    path: getCategorySeoPath({ id: "accessoires" }),
    description: "Accessoires pro onglerie et nail art",
  },
  {
    name: "Blog beauté",
    path: "/blog",
    description: "Conseils, tutoriels et tendances beauté",
  },
  {
    name: "Contact",
    path: "/contact",
    description: "Contactez l'équipe LN COS",
  },
] as const;

export const ORGANIZATION_ID = `${getSiteUrl()}/#organization`;
export const WEBSITE_ID = `${getSiteUrl()}/#website`;

export function buildOrganizationSchema() {
  const siteUrl = getSiteUrl();
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "LN COS",
    url: siteUrl,
    logo: absoluteUrl("/assets/icon-512.png"),
    email: "contact@lncos.fr",
    address: {
      "@type": "PostalAddress",
      streetAddress: "4 rue du Mur Cassé",
      addressLocality: "Saint-Louis",
      postalCode: "97450",
      addressRegion: "La Réunion",
      addressCountry: "FR",
    },
    areaServed: [
      { "@type": "Country", name: "France" },
      { "@type": "AdministrativeArea", name: "La Réunion" },
    ],
    sameAs: [absoluteUrl("/social")],
  };
}

export function buildWebSiteSchema() {
  const siteUrl = getSiteUrl();
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: siteUrl,
    name: "LN COS",
    description: HOME_SEO_DESCRIPTION,
    inLanguage: "fr-FR",
    publisher: { "@id": ORGANIZATION_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/boutique?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildHomeBreadcrumbSchema() {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: absoluteUrl("/"),
      },
    ],
  };
}

export function buildSitelinksNavigationSchema() {
  return {
    "@type": "ItemList",
    name: "Navigation LN COS",
    itemListElement: SEO_SITELINKS.map((link, index) => ({
      "@type": "SiteNavigationElement",
      position: index + 1,
      name: link.name,
      description: link.description,
      url: absoluteUrl(link.path),
    })),
  };
}

export function buildHomePageSchemaGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      buildHomeBreadcrumbSchema(),
      buildSitelinksNavigationSchema(),
    ],
  };
}

export function buildGlobalOrganizationGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [buildOrganizationSchema()],
  };
}
