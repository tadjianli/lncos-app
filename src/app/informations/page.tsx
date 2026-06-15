import { redirect } from "next/navigation";

/** Ancienne page hub — les liens sont désormais dans le menu latéral. */
export default function InformationsRedirectPage() {
  redirect("/");
}
