import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { listQuizzes } from "@/lib/quiz";
import { HomeActions } from "./HomeActions";

export default async function Home() {
  let quizzes: Awaited<ReturnType<typeof listQuizzes>> = [];
  let error: string | null = null;

  try {
    quizzes = await listQuizzes();
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load quizzes";
  }

  return (
    <div className="min-h-screen spotlight-bg">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gold mb-2">
            Quiz Night
          </h1>
          <p className="text-muted">
            Family quiz games for the shared screen
          </p>
        </header>

        <div className="flex justify-center mb-10">
          <HomeActions />
        </div>

        {error && (
          <div className="rounded-xl bg-coral/10 border border-coral/30 p-4 mb-8 text-center">
            <p className="text-coral text-sm">{error}</p>
            <p className="text-muted text-xs mt-2">
              Check your Supabase environment variables and run the schema SQL.
            </p>
          </div>
        )}

        {!error && quizzes.length === 0 && (
          <div className="rounded-2xl bg-surface border border-muted/20 p-10 text-center card-glow">
            <p className="font-display text-xl text-cream mb-2">
              No quizzes yet
            </p>
            <p className="text-muted mb-6">
              Create your first family quiz and get the questions ready for quiz night.
            </p>
          </div>
        )}

        {quizzes.length > 0 && (
          <ul className="space-y-3">
            {quizzes.map((quiz) => (
              <li
                key={quiz.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-surface border border-muted/20 p-5 card-glow"
              >
                <div>
                  <h2 className="font-display text-lg font-semibold text-cream">
                    {quiz.name}
                  </h2>
                  <p className="text-muted text-sm font-mono">
                    {quiz.round_count} round{quiz.round_count !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/play/${quiz.id}`}>
                    <Button size="sm">Play</Button>
                  </Link>
                  <Link href={`/build/${quiz.id}`}>
                    <Button size="sm" variant="secondary">
                      Edit
                    </Button>
                  </Link>
                  <HomeActions quizId={quiz.id} deleteOnly />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
