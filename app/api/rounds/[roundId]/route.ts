import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ roundId: string }> }
) {
  try {
    const { roundId } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    const updates: Record<string, string | number | null> = {};
    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.topic !== undefined) updates.topic = body.topic.trim();
    if (body.level !== undefined) updates.level = body.level;
    if (body.timer_seconds !== undefined) updates.timer_seconds = body.timer_seconds;

    const { data, error } = await supabase
      .from("rounds")
      .update(updates)
      .eq("id", roundId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update round" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ roundId: string }> }
) {
  try {
    const { roundId } = await params;
    const supabase = createServiceClient();

    const { error } = await supabase.from("rounds").delete().eq("id", roundId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete round" },
      { status: 500 }
    );
  }
}
