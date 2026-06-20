import Link from "next/link";
import { notFound } from "next/navigation";
import { QuizBuilder } from "@/components/QuizBuilder";
import { getQuizById } from "@/lib/quiz";

export default async function BuildPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  const quiz = await getQuizById(quizId);

  if (!quiz) notFound();

  const hasSpecialist = quiz.rounds.some((r) => r.type === "specialist");

  return (
    <div className="min-h-screen spotlight-bg">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-muted hover:text-cream text-sm">
            Back to home
          </Link>
          <span className="font-mono text-xs text-muted">
            /{quiz.slug}
          </span>
        </div>

        <QuizBuilder
          quiz={quiz}
          initialHasSpecialist={hasSpecialist}
        />
      </div>
    </div>
  );
}
