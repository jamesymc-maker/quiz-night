import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils";

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("quizzes")
      .select("id, slug, name, created_at")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: rounds } = await supabase.from("rounds").select("quiz_id");
    const roundCounts = (rounds ?? []).reduce<Record<string, number>>((acc, r) => {
      acc[r.quiz_id] = (acc[r.quiz_id] ?? 0) + 1;
      return acc;
    }, {});

    return NextResponse.json(
      (data ?? []).map((q) => ({ ...q, round_count: roundCounts[q.id] ?? 0 }))
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to list quizzes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body.name?.trim() || "Untitled Quiz";
    const supabase = createServiceClient();

    let slug = generateSlug();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from("quizzes")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!existing) break;
      slug = generateSlug();
      attempts++;
    }

    const { data, error } = await supabase
      .from("quizzes")
      .insert({ name, slug })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create quiz" },
      { status: 500 }
    );
  }
}
