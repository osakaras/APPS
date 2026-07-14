import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const GOALS = [
  "lose_weight", "maintain", "gain_muscle", "high_protein",
  "low_carb", "low_sugar", "heart_health", "gut_health", "custom",
] as const;
type GoalKind = (typeof GOALS)[number];

/**
 * POST /api/taste/goals — toggle a health-goal protocol on or off.
 * Body: { kind, active }. Read-then-write since (user_id, kind) has no unique
 * constraint, so we can't rely on upsert to dedupe.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    kind?: GoalKind;
    active?: boolean;
  };
  if (!body.kind || !GOALS.includes(body.kind)) {
    return NextResponse.json({ error: "invalid kind" }, { status: 400 });
  }
  if (!hasSupabaseEnv()) return NextResponse.json({ ok: true, persisted: false });

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const active = body.active ?? true;

  const { data: existing } = await supabase
    .from("health_goals")
    .select("id")
    .eq("user_id", user.id)
    .eq("kind", body.kind)
    .maybeSingle();

  if (existing) {
    await supabase.from("health_goals").update({ is_active: active }).eq("id", existing.id);
  } else if (active) {
    await supabase.from("health_goals").insert({ user_id: user.id, kind: body.kind, is_active: true });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
