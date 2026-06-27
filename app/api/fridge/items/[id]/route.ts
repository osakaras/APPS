import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { MeasureUnit } from "@/lib/types";

const UNITS: MeasureUnit[] = ["g", "kg", "ml", "l", "pcs", "tbsp", "tsp", "cup", "pinch"];

/**
 * PATCH /api/fridge/items/:id — adjust quantity and/or unit. The update bumps
 * Bio-Link sync (editing inventory is feeding the telemetry core). RLS scopes
 * the write to the owner.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = (await request.json().catch(() => ({}))) as {
    quantity?: number | null;
    unit?: string;
  };

  if (!hasSupabaseEnv()) return NextResponse.json({ ok: true, persisted: false });

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const patch: Record<string, unknown> = {};
  if (body.quantity !== undefined) patch.quantity = body.quantity == null ? null : Number(body.quantity);
  if (body.unit && (UNITS as string[]).includes(body.unit)) patch.unit = body.unit;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const { error } = await supabase
    .from("fridge_items")
    .update(patch)
    .eq("id", params.id)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** DELETE /api/fridge/items/:id — remove an inventory item. */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!hasSupabaseEnv()) return NextResponse.json({ ok: true, persisted: false });

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("fridge_items")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
