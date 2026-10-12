import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { calcDeposit, dbToRdvSettings } from "@/lib/rdv-settings";
import {
  extras,
  services as seedServices,
  staff,
  svcMin,
  svcPrice,
  type Service,
} from "@/lib/rdv-data";
interface BookBody {
  service_id: string;
  extras_ids?: string[];
  staff_id: string;
  start_at: string;
  client_name: string;
  client_phone?: string | null;
  notes?: string | null;
}

type DbServiceRow = {
  id: string;
  cat: string;
  category_id: string | null;
  name: string;
  price: number;
  duration?: number;
  min?: number;
  color: string;
  popular?: boolean;
  pop?: boolean;
  active: boolean;
  description?: string;
  desc?: string;
};

function mapDbService(row: DbServiceRow): Service {
  return {
    id: row.id,
    categoryId: row.category_id ?? row.cat,
    name: row.name,
    price: Number(row.price),
    min: row.duration ?? row.min ?? 60,
    color: row.color || "#D4AF37",
    pop: row.popular ?? row.pop ?? false,
    active: row.active !== false,
    desc: row.description ?? row.desc ?? "",
  };
}

async function loadActiveServices(
  supabase: ReturnType<typeof createServiceClient>,
): Promise<Service[]> {
  const { data } = await supabase.from("services").select("*").eq("active", true);
  if (data?.length) {
    return (data as DbServiceRow[]).map(mapDbService);
  }
  return seedServices.filter((s) => s.active);
}

function resolveStaffId(serviceId: string, staffId: string): string {
  if (staffId !== "any") return staffId;
  const match = staff.find((s) => s.services.includes(serviceId));
  return match?.id ?? staff[0]?.id ?? "lea";
}

function confirmationRef(serviceId: string, startAt: string): string {
  const day = new Date(startAt).getDate();
  return `LN-${String(1000 + Math.abs(serviceId.charCodeAt(0) * 37 + day * 13) % 9000)}`;
}

/**
 * POST /api/rdv/book — création RDV côté serveur (contourne RLS SELECT invité après INSERT).
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as BookBody;
    const serviceId = body.service_id?.trim();
    const clientName = body.client_name?.trim();
    const startAt = body.start_at?.trim();
    const extrasIds = Array.isArray(body.extras_ids) ? body.extras_ids : [];

    if (!serviceId || !clientName || !startAt || !body.staff_id) {
      return NextResponse.json({ error: "Informations de réservation incomplètes" }, { status: 400 });
    }

    if (Number.isNaN(Date.parse(startAt))) {
      return NextResponse.json({ error: "Date de rendez-vous invalide" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const catalog = await loadActiveServices(supabase);
    const svc = catalog.find((s) => s.id === serviceId);
    if (!svc) {
      return NextResponse.json({ error: "Prestation introuvable" }, { status: 404 });
    }

    for (const id of extrasIds) {
      if (!extras.some((e) => e.id === id)) {
        return NextResponse.json({ error: "Option invalide" }, { status: 400 });
      }
    }

    const staffId = resolveStaffId(serviceId, body.staff_id);
    if (!staff.some((s) => s.id === staffId)) {
      return NextResponse.json({ error: "Artiste invalide" }, { status: 400 });
    }

    const total = svcPrice(serviceId, extrasIds, catalog);
    const durationMin = svcMin(serviceId, extrasIds, catalog);

    const { data: settingsRow } = await supabase
      .from("rdv_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();
    const settings = dbToRdvSettings(settingsRow);
    const deposit = calcDeposit(total, settings);

    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    const { data: appt, error } = await supabase
      .from("appointments")
      .insert({
        user_id: user?.id ?? null,
        service_id: serviceId,
        staff_id: staffId,
        extras_ids: extrasIds,
        start_at: startAt,
        duration_min: durationMin,
        price: total,
        deposit,
        payment_status: "unpaid",
        status: deposit > 0 ? "pending" : "confirmed",
        client_name: clientName,
        client_phone: body.client_phone?.trim() || null,
        client_email: user?.email ?? null,
        notes: body.notes?.trim() || null,
        loyalty_pts_earned: 0,
        confirmation_ref: confirmationRef(serviceId, startAt),
        source: "client",
      })
      .select("id, deposit, price")
      .single();

    if (error || !appt) {
      console.error("[rdv/book] insert:", error);
      return NextResponse.json(
        { error: error?.message ?? "Impossible d'enregistrer le rendez-vous" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      appointment_id: appt.id,
      deposit: Number(appt.deposit),
      price: Number(appt.price),
      service_name: svc.name,
      needs_payment: deposit > 0,
    });
  } catch (err) {
    console.error("[rdv/book]", err);
    return NextResponse.json({ error: "Erreur serveur lors de la réservation" }, { status: 500 });
  }
}
