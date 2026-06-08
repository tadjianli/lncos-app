import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  variant: string;
  image_url?: string | null;
}

interface OrderBody {
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
}

export async function POST(req: Request) {
  try {
    const body: OrderBody = await req.json();
    const { items, subtotal, shipping_cost, total } = body;

    if (!items?.length || total <= 0) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        subtotal,
        shipping_cost,
        total,
        status: "preparing",
        payment_status: "paid",
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      console.error("Order insert error:", orderErr);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    const orderItems = items.map((it) => ({
      order_id: order.id,
      product_id: it.id,
      name: it.name,
      price: it.price,
      qty: it.qty,
      variant: it.variant || null,
      image_url: it.image_url ?? null,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
    if (itemsErr) {
      console.error("Order items insert error:", itemsErr);
    }

    const ref = "LN-" + order.id.slice(0, 6).toUpperCase();
    return NextResponse.json({ id: order.id, ref });
  } catch (err) {
    console.error("Order creation failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
