import { NextResponse } from "next/server";
import { generateQuestions } from "@/lib/generate-questions";
import type { Level } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const topic = body.topic?.trim();
    const level = body.level as Level;
    const count = body.count ?? 10;
    const avoid: string[] = body.avoid ?? [];

    if (!topic || !level) {
      return NextResponse.json(
        { error: "topic and level are required" },
        { status: 400 }
      );
    }

    const questions = await generateQuestions(topic, level, count, avoid);
    return NextResponse.json(questions);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to generate questions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
