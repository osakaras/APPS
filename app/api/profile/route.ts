import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { LOCALES } from "@/lib/i18n/dictionary";

const codes = new Set(LOCALES.map((l) => l.code));
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/**
 * PATCH /api/profile — update metrics and/or language. calculated_bmi
 * (generated column) and bmi_status (trigger) are recomputed server-side, so
 * the response carries the authoritative values back to the UI.
 */
export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    age?: number | null;
    weight_kg?: number | null;
    height_cm?: number | null;
    preferred_language?: string;
  };

  if (!hasSupabaseEnv()) return NextResponse.json({ ok: true, persisted: false });

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const patch: Record<string, unknown> = {};
  if (body.age != null) patch.age = clamp(Math.round(Number(body.age)), 5, 120);
  if (body.weight_kg != null) patch.weight_kg = clamp(Number(body.weight_kg), 20, 400);
  if (body.height_cm != null) patch.height_cm = clamp(Number(body.height_cm), 80, 260);
  if (body.preferred_language && codes.has(body.preferred_language as any)) {
    patch.preferred_language = body.preferred_language;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", user.id)
    .select("age, weight_kg, height_cm, calculated_bmi, bmi_status, preferred_language")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
