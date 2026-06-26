import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BmiTierKey } from "@/lib/i18n/dictionary";

interface Payload {
  preferred_language?: string;
  age?: number | null;
  weight_kg?: number | null;
  height_cm?: number | null;
  bmi_status?: BmiTierKey | null;
}

/**
 * POST /api/onboarding — persist language + metrics for the signed-in user.
 * calculated_bmi and bmi_status are also derived server-side by the schema
 * trigger, so the client value is just an optimistic mirror.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await request.json()) as Payload;

  const { error } = await supabase
    .from("profiles")
    .update({
      preferred_language: body.preferred_language ?? "en",
      age: body.age ?? null,
      weight_kg: body.weight_kg ?? null,
      height_cm: body.height_cm ?? null,
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
