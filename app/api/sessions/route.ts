import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createInitialSessionState } from "@/lib/quiz";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quiz_id, fresh = false } = body;

    if (!quiz_id) {
      return NextResponse.json({ error: "quiz_id is required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    if (!fresh) {
      const { data: existing } = await supabase
        .from("sessions")
        .select("*")
        .eq("quiz_id", quiz_id)
        .eq("status", "in_progress")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(existing);
      }
    }

    const { data: players } = await supabase
      .from("players")
      .select("id")
      .eq("quiz_id", quiz_id);

    const state = createInitialSessionState((players ?? []).map((p) => p.id));

    const { data, error } = await supabase
      .from("sessions")
      .insert({ quiz_id, state, status: "in_progress" })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create session" },
      { status: 500 }
    );
  }
}
