import { NextResponse } from "next/server";
import { QUESTIONS_PER_ROUND } from "@/lib/constants";
import { generateQuestions } from "@/lib/generate-questions";
import { createServiceClient } from "@/lib/supabase/server";
import type { Level } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { round_id, replace = true } = body;

    if (!round_id) {
      return NextResponse.json({ error: "round_id is required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: round, error: roundError } = await supabase
      .from("rounds")
      .select("*")
      .eq("id", round_id)
      .single();

    if (roundError || !round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    const { data: existingQuestions } = await supabase
      .from("questions")
      .select("question_text")
      .eq("round_id", round_id);

    const avoid = (existingQuestions ?? []).map((q) => q.question_text);

    const generated = await generateQuestions(
      round.topic,
      round.level as Level,
      QUESTIONS_PER_ROUND,
      replace ? [] : avoid
    );

    if (replace) {
      await supabase.from("questions").delete().eq("round_id", round_id);
    }

    const inserts = generated.map((q, i) => ({
      round_id,
      order_index: i,
      question_text: q.question,
      options: q.options,
      correct_index: q.correctIndex,
      explanation: q.explanation,
      points: 1,
    }));

    const { data, error } = await supabase
      .from("questions")
      .insert(inserts)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(
      (data ?? []).map((q) => ({ ...q, options: q.options as string[] }))
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to store questions" },
      { status: 500 }
    );
  }
}
