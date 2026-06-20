import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quiz_id, enabled } = body;

    if (!quiz_id || typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "quiz_id and enabled are required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    if (!enabled) {
      const { error } = await supabase
        .from("rounds")
        .delete()
        .eq("quiz_id", quiz_id)
        .eq("type", "specialist");

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("*")
      .eq("quiz_id", quiz_id)
      .order("order_index");

    if (playersError) {
      return NextResponse.json({ error: playersError.message }, { status: 500 });
    }

    if (!players?.length) {
      return NextResponse.json(
        { error: "Add at least one player before enabling the specialist round" },
        { status: 400 }
      );
    }

    await supabase
      .from("rounds")
      .delete()
      .eq("quiz_id", quiz_id)
      .eq("type", "specialist");

    const { data: allRounds } = await supabase
      .from("rounds")
      .select("order_index")
      .eq("quiz_id", quiz_id)
      .order("order_index", { ascending: false })
      .limit(1);

    let nextIndex = (allRounds?.[0]?.order_index ?? -1) + 1;

    const specialistRounds = players.map((player) => ({
      quiz_id,
      order_index: nextIndex++,
      title: `${player.name}'s Specialist Round`,
      topic: player.specialist_topic || "General knowledge",
      level: player.level,
      type: "specialist" as const,
      player_id: player.id,
      timer_seconds: null,
    }));

    const { data, error } = await supabase
      .from("rounds")
      .insert(specialistRounds)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to toggle specialist round" },
      { status: 500 }
    );
  }
}
