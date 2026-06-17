import { getSupabase } from "@/lib/supabase";
import type { CheckoutAddress } from "@/lib/checkout-address";

type ShippingJson = {
  firstName?: string;
  lastName?: string;
  address?: string;
  zip?: string;
  city?: string;
  phone?: string;
};

/** Préremplit l'étape adresse depuis le profil et la dernière commande. */
export async function loadCheckoutPrefill(userId: string): Promise<Partial<CheckoutAddress>> {
  const supabase = getSupabase();

  const [{ data: profile }, { data: authData }, { data: lastOrder }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone, email").eq("id", userId).maybeSingle(),
    supabase.auth.getUser(),
    supabase
      .from("orders")
      .select("shipping_address")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const user = authData.user;
  const email = profile?.email ?? user?.email ?? "";
  const fullName = profile?.full_name ?? (user?.user_metadata?.full_name as string | undefined) ?? "";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  const ship = (lastOrder?.shipping_address ?? null) as ShippingJson | null;

  return {
    email,
    firstName: ship?.firstName ?? parts[0] ?? "",
    lastName: ship?.lastName ?? parts.slice(1).join(" ") ?? "",
    address: ship?.address ?? "",
    zip: ship?.zip ?? "",
    city: ship?.city ?? "",
    phone: ship?.phone ?? profile?.phone ?? "",
  };
}
