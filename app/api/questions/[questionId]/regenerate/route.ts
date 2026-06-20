import { NextResponse } from "next/server";
import { generateQuestions } from "@/lib/generate-questions";
import { createServiceClient } from "@/lib/supabase/server";
import type { Level } from "@/lib/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const supabase = createServiceClient();

    const { data: question, error: qError } = await supabase
      .from("questions")
      .select("*")
      .eq("id", questionId)
      .single();

    if (qError || !question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const { data: round } = await supabase
      .from("rounds")
      .select("topic, level")
      .eq("id", question.round_id)
      .single();

    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    const { data: siblings } = await supabase
      .from("questions")
      .select("question_text")
      .eq("round_id", question.round_id);

    const avoid = (siblings ?? [])
      .map((s) => s.question_text)
      .filter((t) => t !== question.question_text);

    const [generated] = await generateQuestions(
      round.topic,
      round.level as Level,
      1,
      avoid
    );

    const { data, error } = await supabase
      .from("questions")
      .update({
        question_text: generated.question,
        options: generated.options,
        correct_index: generated.correctIndex,
        explanation: generated.explanation,
      })
      .eq("id", questionId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ...data, options: data.options as string[] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to regenerate question" },
      { status: 500 }
    );
  }
}
