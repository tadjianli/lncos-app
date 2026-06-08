import { redirect } from "next/navigation";

/** Ancienne URL — redirige vers /login */
export default function LegacyAdminLoginPage() {
  redirect("/login");
}
