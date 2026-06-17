/**
 * SEO site-wide — alimenté par config/branding.ts (générique multi-secteur).
 */

import { branding } from "@config/branding";
import { absoluteUrl, getSiteUrl } from "@/lib/site-url";

export const HOME_SEO_TITLE = branding.seo.homeTitle;
export const HOME_SEO_DESCRIPTION = branding.seo.homeDescription;

export const SITE_KEYWORDS = [...branding.seo.keywords, branding.appName];

/** Pages prioritaires pour sitelinks Google Search */
export const SEO_SITELINKS = branding.seo.sitelinks.map((link) => ({ ...link }));

export const ORGANIZATION_ID = `${getSiteUrl()}/#organization`;
export const WEBSITE_ID = `${getSiteUrl()}/#website`;

export function buildOrganizationSchema() {
  const siteUrl = getSiteUrl();
  const { address } = branding;
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: branding.companyName,
    url: siteUrl,
    logo: absoluteUrl(branding.icons.icon512),
    email: branding.supportEmail,
    ...(branding.supportPhone ? { telephone: branding.supportPhone } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      postalCode: address.postalCode,
      addressRegion: address.region,
      addressCountry: address.country,
    },
    areaServed: [
      { "@type": "Country", name: "France" },
      ...(address.region ? [{ "@type": "AdministrativeArea", name: address.region }] : []),
    ],
    sameAs: branding.socialLinks.map((s) => s.url).filter(Boolean),
  };
}

export function buildWebSiteSchema() {
  const siteUrl = getSiteUrl();
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: siteUrl,
    name: branding.appName,
    description: HOME_SEO_DESCRIPTION,
    inLanguage: branding.locale,
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
    name: `Navigation ${branding.appName}`,
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
