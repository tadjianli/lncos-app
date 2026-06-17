import type { Metadata } from "next";
import { pageSeo } from "@/lib/branding";

export const metadata: Metadata = {
  title: pageSeo("rdvAppointments").title,
};

export default function RdvAppointmentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
