import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    const updates: Record<string, string | null> = {};
    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.specialist_topic !== undefined) {
      updates.specialist_topic = body.specialist_topic?.trim() || null;
    }
    if (body.level !== undefined) updates.level = body.level;

    const { data, error } = await supabase
      .from("players")
      .update(updates)
      .eq("id", playerId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update player" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params;
    const supabase = createServiceClient();

    const { error } = await supabase.from("players").delete().eq("id", playerId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete player" },
      { status: 500 }
    );
  }
}
