/**
 * LN COS — RDV seed data
 * Services, extras, staff, availability — mirrors shared/rdv-realtime.js SEED_*
 */

export interface Service {
  id: string;
  cat: "manucure" | "extensions";
  name: string;
  price: number;
  min: number;
  color: string;
  pop?: boolean;
  active: boolean;
  desc: string;
}

export interface Extra {
  id: string;
  name: string;
  price: number;
  min: number;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  color: string;
  rating: number;
  reviews: number;
  active: boolean;
  specialties: string[];
  services: string[];
}

export interface Availability {
  day: number; // 0 = Sunday … 6 = Saturday
  label: string;
  closed: boolean;
  open: string;   // "HH:MM"
  close: string;
}

export const services: Service[] = [
  { id: "vsp-main",  cat: "manucure",   name: "Vernis semi-permanent · Mains", price: 25, min: 45,  color: "#D4AF37", pop: true,  active: true, desc: "Pose longue tenue, fini brillant jusqu'à 3 semaines." },
  { id: "vsp-pieds", cat: "manucure",   name: "Vernis semi-permanent · Pieds", price: 25, min: 45,  color: "#C99A4B",             active: true, desc: "Soin des pieds et pose semi-permanente impeccable." },
  { id: "formule",   cat: "manucure",   name: "Formule Mains + Pieds",         price: 45, min: 90,  color: "#EFA9C0", pop: true,  active: true, desc: "Le duo complet mains et pieds en une séance." },
  { id: "gainage",   cat: "manucure",   name: "Gainage sur ongle naturel",     price: 40, min: 75,  color: "#B98AC9",             active: true, desc: "Renforce et protège l'ongle naturel." },
  { id: "chablon",   cat: "extensions", name: "Extension chablon",             price: 45, min: 120, color: "#6FA8C9", pop: true,  active: true, desc: "Allongement sur mesure au chablon." },
  { id: "capsule",   cat: "extensions", name: "Capsule américaine",            price: 35, min: 105, color: "#6FC9A0",             active: true, desc: "Longueur instantanée et résistante." },
];

export const extras: Extra[] = [
  { id: "remplissage", name: "Remplissage",                price: 25, min: 60 },
  { id: "depose-gel",  name: "Dépose gel",                 price: 20, min: 30 },
  { id: "depose-sp",   name: "Dépose semi-permanent",      price: 10, min: 20 },
  { id: "baby-french", name: "Baby boomer / French",       price:  5, min: 15 },
  { id: "nailart",     name: "Nail art déco",              price:  5, min: 15 },
];

export const staff: Staff[] = [
  {
    id: "lea", name: "Léa", role: "Fondatrice · Nail artist",
    color: "#D4AF37", rating: 4.9, reviews: 218, active: true,
    specialties: ["Nail art", "Extension chablon"],
    services: ["chablon", "capsule", "gainage", "vsp-main"],
  },
  {
    id: "ines", name: "Inès", role: "Spécialiste semi-permanent",
    color: "#EFA9C0", rating: 4.8, reviews: 156, active: true,
    specialties: ["Semi-permanent", "French"],
    services: ["vsp-main", "vsp-pieds", "formule", "gainage"],
  },
  {
    id: "maya", name: "Maya", role: "Experte extensions",
    color: "#6FA8C9", rating: 4.9, reviews: 174, active: true,
    specialties: ["Capsules", "Gainage"],
    services: ["capsule", "chablon", "gainage", "vsp-pieds"],
  },
];

export const availability: Availability[] = [
  { day: 0, label: "Dimanche", closed: true,  open: "10:00", close: "19:00" },
  { day: 1, label: "Lundi",    closed: true,  open: "10:00", close: "19:00" },
  { day: 2, label: "Mardi",    closed: false, open: "10:00", close: "19:00" },
  { day: 3, label: "Mercredi", closed: false, open: "10:00", close: "19:00" },
  { day: 4, label: "Jeudi",    closed: false, open: "10:00", close: "19:00" },
  { day: 5, label: "Vendredi", closed: false, open: "10:00", close: "19:30" },
  { day: 6, label: "Samedi",   closed: false, open: "09:30", close: "18:00" },
];

/* ─── Helpers ─────────────────────────────────────────────────────────── */

export function byService(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}
export function byStaff(id: string): Staff | undefined {
  return staff.find((s) => s.id === id);
}
export function byExtra(id: string): Extra | undefined {
  return extras.find((e) => e.id === id);
}

export function svcMin(serviceId: string, extraIds: string[] = []): number {
  const s = byService(serviceId);
  if (!s) return 60;
  return s.min + extraIds.reduce((t, id) => t + (byExtra(id)?.min ?? 0), 0);
}
export function svcPrice(serviceId: string, extraIds: string[] = []): number {
  const s = byService(serviceId);
  if (!s) return 0;
  return s.price + extraIds.reduce((t, id) => t + (byExtra(id)?.price ?? 0), 0);
}

/** ISO string for a date + "HH:MM" time */
export function isoFrom(date: Date, hhmm: string): string {
  const d = new Date(date);
  const [h, m] = hhmm.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

/** Default upcoming appointment (used as demo seed) */
export function upcomingDefault() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  d.setHours(14, 0, 0, 0);
  return {
    serviceId: "chablon",
    artistId: "lea",
    extras: [] as string[],
    iso: d.toISOString(),
    deposit: 20,
  };
}

export const LNRDV = { services, extras, staff, availability, byService, byStaff, byExtra, svcMin, svcPrice, isoFrom, upcomingDefault };
