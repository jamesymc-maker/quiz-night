import { notFound } from "next/navigation";
import { GameRunner } from "@/components/GameRunner";
import { createAnonServerClient } from "@/lib/supabase/server";
import { getQuizById } from "@/lib/quiz";
import { QUESTIONS_PER_ROUND } from "@/lib/constants";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  const quiz = await getQuizById(quizId);

  if (!quiz) notFound();

  const ready =
    quiz.rounds.length > 0 &&
    quiz.rounds.every((r) => r.questions.length >= QUESTIONS_PER_ROUND);

  if (!ready) {
    return (
      <div className="min-h-screen spotlight-bg flex flex-col items-center justify-center px-6">
        <p className="font-display text-xl text-cream mb-4">
          This quiz is not ready to play
        </p>
        <p className="text-muted text-sm mb-6">
          Generate and review questions for all rounds first.
        </p>
        <a
          href={`/build/${quizId}`}
          className="text-gold hover:underline"
        >
          Go to builder
        </a>
      </div>
    );
  }

  const supabase = createAnonServerClient();
  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("quiz_id", quizId)
    .eq("status", "in_progress")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <GameRunner
      quizId={quizId}
      quizName={quiz.name}
      players={quiz.players}
      rounds={quiz.rounds}
      initialSession={session}
    />
  );
}
