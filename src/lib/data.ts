/* LN COS — Catalogue & données de démonstration (from handoff data.js) */

import type { ProductCommitment, ProductExtraSection, ProductSectionToggles } from "./product-sections";

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
  imageUrl: string | null;
  position: number;
}

export interface Product {
  id: string;
  name: string;
  cat: string;
  price: number;
  old: number | null;
  ml: string;
  rating: number;
  reviews: number;
  tag: string | null;
  stock: number;
  variants: string[];
  desc: string;
  ingredients: string[];
  /** Conseils d'utilisation — étapes numérotées */
  usageTips?: string[];
  /** Activation des sections accordion fiche produit */
  sectionToggles?: ProductSectionToggles;
  /** Sections éditoriales personnalisées */
  extraSections?: ProductExtraSection[];
  /** Badges engagements (Vegan, Made in France…) */
  commitments?: ProductCommitment[];
  /** Image principale — cartes, listing, panier, favoris (main_image_url) */
  mainImageUrl?: string | null;
  /** Miniatures fiche produit uniquement (gallery_images, max 5) */
  galleryImages?: string[];
  /** Réservé vidéo produit (futur) */
  videoUrl?: string | null;
  /** @deprecated alias legacy — préférer mainImageUrl */
  imageUrl?: string | null;
  /** Variantes riches (prix, stock, SKU, image) */
  productVariants?: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  count: number;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  verified: boolean;
  pinned?: boolean;
  featured?: boolean;
  type: string;
  product?: string;
  service?: string;
  staff?: string;
  photo?: boolean;
  text: string;
}

export interface FeedItem {
  id: string;
  title: string;
  author: string;
  likes: string;
  product: string;
  label: string;
}

export const categories: Category[] = [
  { id: 'visage',      name: 'Soins visage',        count: 48 },
  { id: 'maquillage',  name: 'Maquillage',           count: 72 },
  { id: 'parfums',     name: 'Parfums',              count: 26 },
  { id: 'corps',       name: 'Corps & bain',         count: 34 },
  { id: 'cheveux',     name: 'Cheveux',              count: 29 },
  { id: 'accessoires', name: 'Accessoires',          count: 18 },
  { id: 'coffrets',    name: 'Coffrets & cadeaux',   count: 12 },
];

export const products: Product[] = [
  {
    id: 'serum-eclat', name: 'Sérum Éclat Hyaluronique', cat: 'visage',
    price: 29.90, old: 39.90, ml: '30ml',
    rating: 4.8, reviews: 124, tag: 'Best-seller', stock: 50,
    variants: ['30ml', '50ml', '100ml'],
    desc: "Un sérum ultra-hydratant qui illumine et revitalise la peau en profondeur. Texture légère, fini lumineux, peau repulpée dès la première application.",
    ingredients: ['Acide Hyaluronique', 'Vitamine C', 'Niacinamide', 'Extrait de Rose'],
  },
  {
    id: 'creme-hydra', name: 'Crème Hydratante Soyeuse', cat: 'visage',
    price: 24.90, old: null, ml: '50ml',
    rating: 4.7, reviews: 89, tag: 'Nouveau', stock: 35,
    variants: ['50ml', '100ml'],
    desc: "Crème fondante enrichie en céramides pour une hydratation 24h. Confort immédiat, peau lissée et apaisée.",
    ingredients: ['Céramides', 'Beurre de Karité', 'Aloe Vera'],
  },
  {
    id: 'parfum-noir', name: 'Parfum Élixir Noir', cat: 'parfums',
    price: 49.90, old: 64.90, ml: '100ml',
    rating: 4.9, reviews: 213, tag: 'Édition limitée', stock: 20,
    variants: ['50ml', '100ml'],
    desc: "Une fragrance boisée et ambrée, sensuelle et mystérieuse. Notes de oud, vanille noire et fève tonka.",
    ingredients: ['Oud', 'Vanille noire', 'Fève Tonka', 'Ambre'],
  },
  {
    id: 'rouge-mat', name: 'Rouge à Lèvres Velours', cat: 'maquillage',
    price: 18.90, old: null, ml: 'Teinte',
    rating: 4.6, reviews: 156, tag: 'Best-seller', stock: 60,
    variants: ['Rose Nude', 'Rouge Désir', 'Prune'],
    desc: "Fini mat velouté, tenue longue durée sans dessécher. Couleur intense en un seul geste.",
    ingredients: ['Huile de Jojoba', 'Vitamine E', 'Pigments naturels'],
  },
  {
    id: 'palette-glow', name: 'Palette Glow Doré', cat: 'maquillage',
    price: 34.90, old: 44.90, ml: '12 teintes',
    rating: 4.8, reviews: 98, tag: 'Flash', stock: 25,
    variants: ['Warm', 'Cool'],
    desc: "12 teintes nacrées et mates pour un regard intense. Pigmentation haute définition, longue tenue.",
    ingredients: ['Poudres minérales', 'Mica', 'Huiles végétales'],
  },
  {
    id: 'huile-demaq', name: 'Huile Démaquillante', cat: 'visage',
    price: 19.90, old: null, ml: '150ml',
    rating: 4.5, reviews: 67, tag: null, stock: 40,
    variants: ['150ml'],
    desc: "Dissout maquillage et impuretés sans film gras. Se transforme en lait au contact de l'eau.",
    ingredients: ["Huile de Camélia", "Vitamine E"],
  },
  {
    id: 'masque-purifiant', name: 'Masque Purifiant Argile Rose', cat: 'visage',
    price: 22.90, old: null, ml: '75ml',
    rating: 4.7, reviews: 74, tag: 'Nouveau', stock: 25,
    variants: ['75ml'],
    desc: "Masque à l'argile rose qui purifie et resserre les pores. Peau nette, douce et éclatante.",
    ingredients: ['Argile Rose', 'Eau de Rose', 'Zinc'],
  },
  {
    id: 'brume-corps', name: 'Brume Parfumée Corps', cat: 'corps',
    price: 16.90, old: 21.90, ml: '200ml',
    rating: 4.4, reviews: 52, tag: 'Flash', stock: 45,
    variants: ['200ml'],
    desc: "Voile parfumé fleuri et fruité pour une peau délicatement scintillante.",
    ingredients: ['Pivoine', 'Litchi', 'Musc blanc'],
  },
  {
    id: 'serum-cheveux', name: 'Sérum Brillance Cheveux', cat: 'cheveux',
    price: 21.90, old: null, ml: '50ml',
    rating: 4.6, reviews: 61, tag: null, stock: 30,
    variants: ['50ml'],
    desc: "Discipline et fait briller sans alourdir. Protège de la chaleur jusqu'à 230°C.",
    ingredients: ["Huile d'Argan", 'Kératine', 'Vitamine B5'],
  },
  {
    id: 'coffret-rituel', name: 'Coffret Rituel Éclat', cat: 'coffrets',
    price: 79.90, old: 99.90, ml: '4 produits',
    rating: 4.9, reviews: 41, tag: 'Coffret', stock: 15,
    variants: ['Coffret complet'],
    desc: "Le rituel beauté complet : sérum, crème, masque et brume dans un écrin doré.",
    ingredients: ['Sérum Éclat', 'Crème Soyeuse', 'Masque Rose', 'Brume Corps'],
  },
];

export const reviews: Review[] = [
  { id: 'rv1', name: 'Emma Dubois', rating: 5, date: 'il y a 3 jours', verified: true, pinned: true, type: 'product', product: 'serum-eclat',
    text: "Texture divine, ma peau n'a jamais été aussi lumineuse. Le sérum pénètre instantanément, aucun effet collant. Je rachète les yeux fermés !" },
  { id: 'rv2', name: 'Sarah Lemaire', rating: 5, date: 'il y a 5 jours', verified: true, featured: true, type: 'appointment', service: 'Extension chablon', staff: 'Léa', photo: true,
    text: "Pose absolument parfaite chez Léa. Un vrai moment cocooning, le résultat tient depuis 3 semaines sans aucun accroc. Le salon est sublime." },
  { id: 'rv3', name: 'Inès Marchand', rating: 5, date: 'il y a 1 semaine', verified: true, type: 'product', product: 'parfum-noir',
    text: "L'Élixir Noir est envoûtant, sillage subtil qui dure toute la journée. Le packaging est d'un luxe fou, on dirait un parfum de créateur." },
  { id: 'rv4', name: 'Chloé Martin', rating: 5, date: 'il y a 1 semaine', verified: true, type: 'photo', product: 'palette-glow', photo: true,
    text: "La palette Glow Doré est une tuerie, les pigments sont intenses et ultra lumineux. Regardez ce fini sur ma photo 😍" },
  { id: 'rv5', name: 'Manon Girard', rating: 4, date: 'il y a 2 semaines', verified: true, type: 'appointment', service: 'Gainage', staff: 'Maya',
    text: "Très contente de mon gainage, ongles renforcés et naturels. Maya est à l'écoute et minutieuse. Je reviendrai avec plaisir." },
  { id: 'rv6', name: 'Jade Moreau', rating: 5, date: 'il y a 2 semaines', verified: true, type: 'product', product: 'creme-hydra',
    text: "Cette crème est un câlin pour la peau. Hydratation 24h réelle, mon teint est repulpé dès le matin. Adoptée pour la vie." },
];

export const feed: FeedItem[] = [
  { id: 'v1', title: 'Routine glow du matin ✨', author: '@lncos.beauty', likes: '12.4k', product: 'serum-eclat', label: 'reel · routine glow' },
  { id: 'v2', title: "Le secret d'un teint frais", author: '@maya.skincare', likes: '8.9k', product: 'creme-hydra', label: 'reel · teint frais' },
  { id: 'v3', title: "Élixir Noir, l'unboxing", author: '@lncos.beauty', likes: '21.7k', product: 'parfum-noir', label: 'reel · unboxing' },
];

export function byId(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export const LNDATA = { categories, products, reviews, feed, byId };
