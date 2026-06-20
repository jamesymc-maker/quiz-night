import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    const updates: Record<string, string | number | string[]> = {};
    if (body.question_text !== undefined) updates.question_text = body.question_text;
    if (body.options !== undefined) updates.options = body.options;
    if (body.correct_index !== undefined) updates.correct_index = body.correct_index;
    if (body.explanation !== undefined) updates.explanation = body.explanation;

    const { data, error } = await supabase
      .from("questions")
      .update(updates)
      .eq("id", questionId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ...data, options: data.options as string[] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const supabase = createServiceClient();

    const { data: question } = await supabase
      .from("questions")
      .select("round_id, order_index")
      .eq("id", questionId)
      .single();

    const { error } = await supabase.from("questions").delete().eq("id", questionId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (question) {
      const { data: remaining } = await supabase
        .from("questions")
        .select("id, order_index")
        .eq("round_id", question.round_id)
        .order("order_index");

      for (let i = 0; i < (remaining ?? []).length; i++) {
        await supabase
          .from("questions")
          .update({ order_index: i })
          .eq("id", remaining![i].id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete question" },
      { status: 500 }
    );
  }
}
