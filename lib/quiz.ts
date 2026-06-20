import { createAnonServerClient } from "@/lib/supabase/server";
import type { QuizFull, QuizWithMeta, SessionState } from "@/lib/types";

export async function listQuizzes(): Promise<QuizWithMeta[]> {
  const supabase = createAnonServerClient();

  const { data: quizzes, error } = await supabase
    .from("quizzes")
    .select("id, slug, name, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!quizzes?.length) return [];

  const { data: rounds } = await supabase
    .from("rounds")
    .select("quiz_id");

  const roundCounts = (rounds ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.quiz_id] = (acc[r.quiz_id] ?? 0) + 1;
    return acc;
  }, {});

  return quizzes.map((q) => ({
    ...q,
    round_count: roundCounts[q.id] ?? 0,
  }));
}

export async function getQuizById(quizId: string): Promise<QuizFull | null> {
  const supabase = createAnonServerClient();

  const { data: quiz, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();

  if (error || !quiz) return null;

  const { data: players } = await supabase
    .from("players")
    .select("*")
    .eq("quiz_id", quizId)
    .order("order_index");

  const { data: rounds } = await supabase
    .from("rounds")
    .select("*")
    .eq("quiz_id", quizId)
    .order("order_index");

  const roundIds = (rounds ?? []).map((r) => r.id);
  let questions: QuizFull["rounds"][0]["questions"] = [];

  if (roundIds.length > 0) {
    const { data: qData } = await supabase
      .from("questions")
      .select("*")
      .in("round_id", roundIds)
      .order("order_index");

    questions = (qData ?? []).map((q) => ({
      ...q,
      options: q.options as string[],
    }));
  }

  const roundsWithQuestions = (rounds ?? []).map((round) => ({
    ...round,
    questions: questions.filter((q) => q.round_id === round.id),
  }));

  return {
    ...quiz,
    players: players ?? [],
    rounds: roundsWithQuestions,
  };
}

export async function getQuizBySlug(slug: string): Promise<QuizFull | null> {
  const supabase = createAnonServerClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!quiz) return null;
  return getQuizById(quiz.id);
}

export function createInitialSessionState(
  playerIds: string[]
): SessionState {
  const scores: Record<string, number> = {};
  for (const id of playerIds) {
    scores[id] = 0;
  }
  return {
    phase: "round_intro",
    currentRoundIndex: 0,
    currentQuestionIndex: 0,
    revealed: false,
    scores,
  };
}
