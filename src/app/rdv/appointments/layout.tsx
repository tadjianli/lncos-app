import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes rendez-vous | LN COS",
  robots: { index: false, follow: false },
};

export default function RdvAppointmentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
