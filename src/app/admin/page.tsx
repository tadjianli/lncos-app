import { redirect } from "next/navigation";

/** /admin → dashboard principal */
export default function AdminPage() {
  redirect("/admin/dashboard");
}
