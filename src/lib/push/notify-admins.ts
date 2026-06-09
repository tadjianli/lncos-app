import webpush from "web-push";
import { createServiceClient } from "@/lib/supabase/server";

interface PushPayload {
  title: string;
  body: string;
  url: string;
  tag: string;
}

export async function notifyAdminsNewOrder(orderId: string, total: number) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    console.warn("[push] VAPID keys missing — skip admin push");
    return;
  }

  webpush.setVapidDetails("mailto:admin@lncos.fr", publicKey, privateKey);

  let supabase;
  try {
    supabase = createServiceClient();
  } catch (err) {
    console.warn("[push] service client unavailable:", err);
    return;
  }

  const ref = orderId.slice(0, 8).toUpperCase();
  const payload: PushPayload = {
    title: "LN COS — Nouvelle commande",
    body: `${total.toFixed(2)} € · Réf. ${ref}`,
    url: "/admin/orders",
    tag: `order-${orderId}`,
  };

  const { data: admins } = await supabase.from("profiles").select("id").eq("is_admin", true);

  if (admins?.length) {
    await supabase.from("notifications").insert(
      admins.map((a) => ({
        user_id: a.id,
        type: "order" as const,
        title: "Nouvelle commande",
        body: `Commande ${ref} — ${total.toFixed(2)} €`,
        meta: { order_id: orderId, total },
      }))
    );
  }

  const { data: subs } = await supabase.from("admin_push_subscriptions").select("*");
  if (!subs?.length) return;

  const body = JSON.stringify(payload);

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          await supabase
            .from("admin_push_subscriptions")
            .delete()
            .eq("id", sub.id);
        }
      }
    })
  );
}
