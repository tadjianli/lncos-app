/**
 * LN COS — Appointment contracts
 * Aligns with the Appointment interface in rdv-store.ts (used by LNRdvStore).
 */

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export interface AppointmentContract {
  id: string;
  userId?: string;
  serviceId: string;
  staffId: string;           // "any" = first available
  extrasIds: string[];
  startAt: string;           // ISO — full datetime
  durationMin: number;
  price: number;
  deposit: number;
  paymentStatus: "unpaid" | "deposit" | "paid";
  status: AppointmentStatus;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  notes?: string;
  loyaltyPtsEarned?: number;
  confirmationRef: string;   // "LN-XXXX"
  source: "client" | "admin";
  createdAt: string;         // ISO
  updatedAt?: string;        // ISO
}

/** Countdown helper: days until appointment */
export function daysUntilAppointment(startAt: string, now = new Date()): number {
  const start = new Date(startAt);
  const msPerDay = 86_400_000;
  return Math.max(0, Math.ceil((start.getTime() - now.getTime()) / msPerDay));
}
