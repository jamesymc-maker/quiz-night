import Link from "next/link";
import { notFound } from "next/navigation";
import { Confetti } from "@/components/Confetti";
import { Leaderboard } from "@/components/Leaderboard";
import { ScoreboardActions } from "@/components/ScoreboardActions";
import { createAnonServerClient } from "@/lib/supabase/server";
import { getQuizById } from "@/lib/quiz";

export default async function ScoreboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ session?: string }>;
}) {
  const { quizId } = await params;
  const { session: sessionId } = await searchParams;

  const quiz = await getQuizById(quizId);
  if (!quiz) notFound();

  const supabase = createAnonServerClient();

  let session = null;
  if (sessionId) {
    const { data } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();
    session = data;
  }

  if (!session) {
    const { data } = await supabase
      .from("sessions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    session = data;
  }

  const scores = (session?.state as { scores?: Record<string, number> })?.scores ?? {};
  const ranked = [...quiz.players]
    .map((p) => ({ ...p, score: scores[p.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);
  const winner = ranked[0];

  return (
    <div className="min-h-screen spotlight-bg relative overflow-hidden">
      <Confetti />
      <div className="mx-auto max-w-3xl px-6 py-12 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-gold mb-2">
          Final scores
        </h1>
        {winner && (
          <p className="text-cream text-lg mb-10">
            Congratulations, <span className="text-gold font-bold">{winner.name}</span>!
          </p>
        )}

        <Leaderboard players={quiz.players} scores={scores} />

        <div className="flex flex-wrap justify-center gap-4 mt-12">
          <ScoreboardActions quizId={quizId} />
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-surface text-cream border border-muted/30 hover:bg-surface/80 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
