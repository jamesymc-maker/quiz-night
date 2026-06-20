import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quiz_id, title, topic, level, timer_seconds } = body;

    if (!quiz_id || !title?.trim() || !topic?.trim()) {
      return NextResponse.json(
        { error: "quiz_id, title and topic are required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: existing } = await supabase
      .from("rounds")
      .select("order_index, type")
      .eq("quiz_id", quiz_id)
      .eq("type", "general")
      .order("order_index", { ascending: false })
      .limit(1);

    const order_index = existing?.[0]?.order_index != null ? existing[0].order_index + 1 : 0;

    const { data, error } = await supabase
      .from("rounds")
      .insert({
        quiz_id,
        title: title.trim(),
        topic: topic.trim(),
        level: level || "adult",
        type: "general",
        order_index,
        timer_seconds: timer_seconds ?? null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create round" },
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
      await supabase.from("rounds").update({ order_index: i }).eq("id", ids[i]);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to reorder rounds" },
      { status: 500 }
    );
  }
}
