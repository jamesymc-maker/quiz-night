import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quiz_id, name, specialist_topic, level } = body;

    if (!quiz_id || !name?.trim()) {
      return NextResponse.json({ error: "quiz_id and name are required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: existing } = await supabase
      .from("players")
      .select("order_index")
      .eq("quiz_id", quiz_id)
      .order("order_index", { ascending: false })
      .limit(1);

    const order_index = existing?.[0]?.order_index != null ? existing[0].order_index + 1 : 0;

    const { data, error } = await supabase
      .from("players")
      .insert({
        quiz_id,
        name: name.trim(),
        specialist_topic: specialist_topic?.trim() || null,
        level: level || "adult",
        order_index,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create player" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: "ids array required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    for (let i = 0; i < ids.length; i++) {
      await supabase.from("players").update({ order_index: i }).eq("id", ids[i]);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to reorder players" },
      { status: 500 }
    );
  }
}
