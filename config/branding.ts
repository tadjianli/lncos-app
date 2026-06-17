/**
 * Configuration branding — point unique pour cloner une nouvelle boutique.
 * Modifier ce fichier (+ thème actif) pour personnaliser une instance client.
 */

import type { ThemeId } from "./themes/types";

export type BrandingVertical = ThemeId;

export interface BrandingAddress {
  street: string;
  city: string;
  postalCode: string;
  region: string;
  country: string;
}

export interface BrandingSocialLink {
  id: string;
  name: string;
  handle: string;
  url: string;
  accent?: string;
}

export interface BrandingSeoSitelink {
  name: string;
  path: string;
  description: string;
}

export interface BrandingIcons {
  favicon: string;
  icon192: string;
  icon512: string;
  appleTouchIcon: string;
}

export interface BrandingPwaShortcut {
  name: string;
  url: string;
  description: string;
}

/** Configuration globale de l'application (instance client). */
export const branding = {
  /** Nom affiché dans l'UI, emails, PWA */
  appName: "LN COS",
  appShortName: "LN COS",
  appDescription:
    "Cosmétiques premium. Formulés en France. Livraison rapide à La Réunion et en France.",
  companyName: "LN COS",
  tagline: "Beauté & cosmétique",

  /** Thème visuel actif — voir config/themes/ */
  activeThemeId: "beauty" satisfies ThemeId,

  /** Vertical métier — influence attributs produit par défaut (config/product-attributes.ts) */
  vertical: "beauty" satisfies BrandingVertical,

  logo: {
    path: "/assets/logo-lncos.jpg",
    /** Ratio largeur / hauteur */
    aspectRatio: 1600 / 1460,
  },

  icons: {
    favicon: "/favicon.png",
    icon192: "/assets/icon-192.png",
    icon512: "/assets/icon-512.png",
    appleTouchIcon: "/assets/apple-touch-icon.png",
  } satisfies BrandingIcons,

  /** Couleurs de base — surchargées par le thème actif via CSS variables */
  colors: {
    primary: "#D4AF37",
    secondary: "#F7C6D7",
    accent: "#EFA9C0",
    background: "#0A0A0A",
    themeColor: "#0A0A0A",
  },

  supportEmail: "contact@lncos.fr",
  ordersEmail: "commandes@lncos.fr",
  supportPhone: "",

  socialLinks: [
    {
      id: "instagram",
      name: "Instagram",
      handle: "@lncos",
      url: "https://www.instagram.com/lncos/",
      accent: "#E1306C",
    },
    {
      id: "tiktok",
      name: "TikTok",
      handle: "@lncos",
      url: "https://www.tiktok.com/@lncos",
      accent: "#69C9D0",
    },
    {
      id: "facebook",
      name: "Facebook",
      handle: "LN COS",
      url: "https://www.facebook.com/lncos",
      accent: "#1877F2",
    },
    {
      id: "youtube",
      name: "YouTube",
      handle: "@lncos",
      url: "https://www.youtube.com/@lncos",
      accent: "#FF0000",
    },
    {
      id: "pinterest",
      name: "Pinterest",
      handle: "lncos",
      url: "https://www.pinterest.fr/lncos/",
      accent: "#E60023",
    },
  ] satisfies BrandingSocialLink[],

  address: {
    street: "4 rue du Mur Cassé",
    city: "Saint-Louis",
    postalCode: "97450",
    region: "La Réunion",
    country: "FR",
  } satisfies BrandingAddress,

  locale: "fr-FR",
  language: "fr",
  currency: "EUR",
  currencySymbol: "€",

  seo: {
    homeTitle: "LN COS | Cosmétiques, Ongles, Beauté & Accessoires à La Réunion",
    homeDescription:
      "Découvrez LN COS : vernis semi-permanents, accessoires ongles, maquillage, soins beauté et nouveautés. Livraison rapide à La Réunion et en France.",
    titleTemplate: "%s | LN COS",
    keywords: [
      "cosmétiques La Réunion",
      "vernis semi-permanent",
      "accessoires ongles",
      "maquillage",
      "soins beauté",
      "boutique beauté",
      "livraison La Réunion",
    ],
    sitelinks: [
      {
        name: "Nouveautés",
        path: "/discover",
        description: "Dernières nouveautés et lancements",
      },
      {
        name: "Meilleures ventes",
        path: "/boutique",
        description: "Best-sellers et produits les plus populaires",
      },
      {
        name: "Catalogue",
        path: "/boutique",
        description: "Parcourir toute la boutique",
      },
      {
        name: "Blog",
        path: "/blog",
        description: "Conseils, tutoriels et actualités",
      },
      {
        name: "Contact",
        path: "/contact",
        description: "Contacter notre équipe",
      },
    ] satisfies BrandingSeoSitelink[],
    pages: {
      boutique: {
        title: "Boutique — Meilleures ventes & catalogue",
        description:
          "Parcourez le catalogue {{appName}} : meilleures ventes, nouveautés et promotions. Livraison rapide.",
      },
      discover: {
        title: "Nouveautés",
        description: "Découvrez les dernières nouveautés et lancements {{appName}}.",
      },
      blog: {
        title: "Blog",
        description: "Conseils, tutoriels, tendances et actualités — {{appName}}.",
      },
      contact: {
        title: "Contact",
        description: "Contactez l'équipe {{appName}} — réponse sous 24 à 48 h.",
      },
      profile: { title: "Mon profil", description: "Espace client {{appName}}." },
      favorites: { title: "Favoris", description: "Vos produits favoris {{appName}}." },
      rdv: {
        title: "Prendre rendez-vous",
        description: "Réservez votre rendez-vous {{appName}} en quelques clics.",
      },
      rdvAppointments: { title: "Mes rendez-vous", description: "Suivez vos rendez-vous {{appName}}." },
      adminLogin: { title: "Connexion admin", description: "Espace commerçant {{appName}}." },
    },
  },

  pwa: {
    categories: ["shopping", "beauty", "lifestyle"] as string[],
    shortcuts: [
      { name: "Boutique", url: "/boutique", description: "Parcourir le catalogue" },
      { name: "Mon Panier", url: "/bag", description: "Voir mon panier" },
    ] satisfies BrandingPwaShortcut[],
  },

  /** Textes par défaut (pages contenu, emails, UI) — personnalisables au clonage */
  copy: {
    teamAuthor: "Équipe {{appName}}",
    flashBannerTitle: "Ventes Flash {{appName}}",
    flashEmptyEyebrow: "🔥 Ventes Flash {{appName}}",
    blogHeroTitle: "Blog {{appName}}",
    blogHeroSubtitle:
      "Conseils, tutoriels, tendances et nouveautés — par {{appName}}.",
    blogHeroEyebrow: "Magazine",
    socialHeroEyebrow: "Communauté {{appName}}",
    socialHeroSubtitle:
      "Suivez {{appName}} au quotidien — coulisses, actualités et lancements en exclusivité.",
    newsletterEyebrow: "Club {{appName}}",
    quoteAttribution: "— {{companyName}}",
    productMetaFallback: "Découvrez {{productName}} sur {{appName}}.",
    categoryMetaFallback: "Découvrez la catégorie {{categoryName}} — {{appName}}.",
    vipSignup: "Rejoignez le programme VIP {{appName}}",
    accountSignup: "Créez votre compte {{appName}} en quelques secondes",
    adminTitle: "{{appName}} — Espace commerçant",
  },
} as const;

export type Branding = typeof branding;
