"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { QuestionReview } from "@/components/QuestionReview";
import { Button } from "@/components/ui/Button";
import { LEVELS, LEVEL_LABELS, QUESTIONS_PER_ROUND } from "@/lib/constants";
import type { Level, Player, QuizFull, RoundWithQuestions } from "@/lib/types";

interface QuizBuilderProps {
  quiz: QuizFull;
  initialHasSpecialist: boolean;
}

export function QuizBuilder({
  quiz: initialQuiz,
  initialHasSpecialist,
}: QuizBuilderProps) {
  const [quizName, setQuizName] = useState(initialQuiz.name);
  const [players, setPlayers] = useState(initialQuiz.players);
  const [rounds, setRounds] = useState(initialQuiz.rounds);
  const [hasSpecialist, setHasSpecialist] = useState(initialHasSpecialist);
  const [generatingRoundId, setGeneratingRoundId] = useState<string | null>(null);

  const generalRounds = rounds.filter((r) => r.type === "general");
  const specialistRounds = rounds.filter((r) => r.type === "specialist");

  const canStart =
    rounds.length > 0 &&
    rounds.every((r) => r.questions?.length >= QUESTIONS_PER_ROUND);

  const saveQuizName = useCallback(async () => {
    if (quizName.trim() === initialQuiz.name) return;
    await fetch(`/api/quizzes/${initialQuiz.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: quizName.trim() }),
    });
  }, [quizName, initialQuiz.id, initialQuiz.name]);

  async function addPlayer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = (fd.get("name") as string)?.trim();
    if (!name) return;

    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quiz_id: initialQuiz.id,
        name,
        specialist_topic: (fd.get("specialist_topic") as string)?.trim(),
        level: fd.get("level") as Level,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setPlayers((p) => [...p, data]);
      form.reset();
    }
  }

  async function removePlayer(id: string) {
    await fetch(`/api/players/${id}`, { method: "DELETE" });
    setPlayers((p) => p.filter((x) => x.id !== id));
    if (hasSpecialist) await toggleSpecialist(true);
  }

  async function addRound(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = (fd.get("title") as string)?.trim();
    const topic = (fd.get("topic") as string)?.trim();
    if (!title || !topic) return;

    const timerVal = fd.get("timer_seconds") as string;
    const res = await fetch("/api/rounds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quiz_id: initialQuiz.id,
        title,
        topic,
        level: fd.get("level") as Level,
        timer_seconds: timerVal ? parseInt(timerVal, 10) : null,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setRounds((r) => [...r.filter((x) => x.type === "specialist"), data, ...r.filter((x) => x.type === "specialist")].sort((a, b) => a.order_index - b.order_index));
      form.reset();
    }
  }

  async function removeRound(id: string) {
    await fetch(`/api/rounds/${id}`, { method: "DELETE" });
    setRounds((r) => r.filter((x) => x.id !== id));
  }

  async function toggleSpecialist(enabled?: boolean) {
    const next = enabled ?? !hasSpecialist;
    const res = await fetch("/api/rounds/specialist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quiz_id: initialQuiz.id, enabled: next }),
    });
    if (res.ok) {
      setHasSpecialist(next);
      if (next) {
        const data = await res.json();
        setRounds((prev) => {
          const general = prev.filter((r) => r.type === "general");
          const specialist = (data as RoundWithQuestions[]).map((r) => ({
            ...r,
            questions: [],
          }));
          return [...general, ...specialist].sort(
            (a, b) => a.order_index - b.order_index
          );
        });
      } else {
        setRounds((prev) => prev.filter((r) => r.type !== "specialist"));
      }
    } else {
      const err = await res.json();
      alert(err.error || "Could not toggle specialist round");
    }
  }

  async function generateQuestions(roundId: string) {
    setGeneratingRoundId(roundId);
    try {
      const res = await fetch("/api/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ round_id: roundId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRounds((rs) =>
        rs.map((r) => (r.id === roundId ? { ...r, questions: data } : r))
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGeneratingRoundId(null);
    }
  }

  function onQuestionsUpdated(roundId: string, questions: RoundWithQuestions["questions"]) {
    setRounds((rs) =>
      rs.map((r) => (r.id === roundId ? { ...r, questions } : r))
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <label className="block text-muted text-sm mb-2">Quiz name</label>
        <input
          type="text"
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          onBlur={saveQuizName}
          className="w-full rounded-xl bg-surface border border-muted/30 px-4 py-3 text-cream font-display text-xl focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </section>

      <section className="rounded-2xl bg-surface border border-muted/20 p-6 card-glow">
        <h2 className="font-display text-xl font-bold text-cream mb-4">Players</h2>
        <form onSubmit={addPlayer} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <input
            name="name"
            placeholder="Name"
            required
            className="rounded-lg bg-studio border border-muted/30 px-3 py-2 text-cream focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <input
            name="specialist_topic"
            placeholder="Specialist subject"
            className="rounded-lg bg-studio border border-muted/30 px-3 py-2 text-cream focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <select
            name="level"
            defaultValue="adult"
            className="rounded-lg bg-studio border border-muted/30 px-3 py-2 text-cream focus:outline-none focus:ring-2 focus:ring-gold"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {LEVEL_LABELS[l]}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            Add player
          </Button>
        </form>
        <ul className="space-y-2">
          {players.map((p) => (
            <PlayerRow key={p.id} player={p} onRemove={() => removePlayer(p.id)} />
          ))}
          {players.length === 0 && (
            <p className="text-muted text-sm">Add at least one player for the specialist round.</p>
          )}
        </ul>
      </section>

      <section className="rounded-2xl bg-surface border border-muted/20 p-6 card-glow">
        <h2 className="font-display text-xl font-bold text-cream mb-4">General rounds</h2>
        <form onSubmit={addRound} className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-4">
          <input
            name="title"
            placeholder="Round title"
            required
            className="rounded-lg bg-studio border border-muted/30 px-3 py-2 text-cream focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <input
            name="topic"
            placeholder="Topic"
            required
            className="rounded-lg bg-studio border border-muted/30 px-3 py-2 text-cream focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <select
            name="level"
            defaultValue="adult"
            className="rounded-lg bg-studio border border-muted/30 px-3 py-2 text-cream focus:outline-none focus:ring-2 focus:ring-gold"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {LEVEL_LABELS[l]}
              </option>
            ))}
          </select>
          <input
            name="timer_seconds"
            type="number"
            placeholder="Timer (secs)"
            min={0}
            className="rounded-lg bg-studio border border-muted/30 px-3 py-2 text-cream focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <Button type="submit" variant="secondary">
            Add round
          </Button>
        </form>
        <ul className="space-y-2">
          {generalRounds.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-studio/50 px-4 py-3"
            >
              <div>
                <span className="text-cream font-semibold">{r.title}</span>
                <span className="text-muted text-sm ml-2">
                  {r.topic} · {LEVEL_LABELS[r.level as Level]}
                </span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => removeRound(r.id)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-cyan/5 border border-cyan/30 p-6 card-glow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-cream">Specialist round</h2>
            <p className="text-muted text-sm mt-1">
              Mastermind style: each player gets 10 questions on their own subject.
            </p>
          </div>
          <Button
            variant={hasSpecialist ? "danger" : "secondary"}
            onClick={() => toggleSpecialist()}
          >
            {hasSpecialist ? "Remove specialist round" : "Include specialist round"}
          </Button>
        </div>
        {hasSpecialist && specialistRounds.length > 0 && (
          <ul className="mt-4 space-y-2">
            {specialistRounds.map((r) => {
              const player = players.find((p) => p.id === r.player_id);
              return (
                <li key={r.id} className="text-sm text-cyan">
                  {player?.name ?? "Player"}: {r.topic} ({LEVEL_LABELS[r.level as Level]})
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {rounds.length > 0 && (
        <section className="space-y-8">
          <h2 className="font-display text-2xl font-bold text-gold">Questions</h2>
          <p className="text-muted text-sm -mt-6">
            Generate questions for each round, then review and edit them before play.
          </p>
          {rounds.map((round) => (
            <RoundSection
              key={round.id}
              round={round}
              playerName={
                round.player_id
                  ? players.find((p) => p.id === round.player_id)?.name
                  : undefined
              }
              generating={generatingRoundId === round.id}
              onGenerate={() => generateQuestions(round.id)}
              onQuestionsUpdated={(qs) => onQuestionsUpdated(round.id, qs)}
            />
          ))}
        </section>
      )}

      <div className="flex justify-center pt-4 pb-12">
        {canStart ? (
          <Link href={`/play/${initialQuiz.id}`}>
            <Button size="lg">Start quiz</Button>
          </Link>
        ) : (
          <Button size="lg" disabled title="Generate questions for all rounds first">
            Start quiz
          </Button>
        )}
      </div>
    </div>
  );
}

function PlayerRow({ player, onRemove }: { player: Player; onRemove: () => void }) {
  return (
    <li className="flex items-center justify-between rounded-lg bg-studio/50 px-4 py-3">
      <div>
        <span className="text-cream font-semibold">{player.name}</span>
        {player.specialist_topic && (
          <span className="text-cyan text-sm ml-2">{player.specialist_topic}</span>
        )}
        <span className="text-muted text-sm ml-2">
          {LEVEL_LABELS[player.level as Level]}
        </span>
      </div>
      <Button size="sm" variant="ghost" onClick={onRemove}>
        Remove
      </Button>
    </li>
  );
}

function RoundSection({
  round,
  playerName,
  generating,
  onGenerate,
  onQuestionsUpdated,
}: {
  round: RoundWithQuestions;
  playerName?: string;
  generating: boolean;
  onGenerate: () => void;
  onQuestionsUpdated: (questions: RoundWithQuestions["questions"]) => void;
}) {
  const ready = (round.questions?.length ?? 0) >= QUESTIONS_PER_ROUND;
  const isSpecialist = round.type === "specialist";

  return (
    <div
      className={`rounded-2xl border p-6 card-glow ${
        isSpecialist ? "bg-cyan/5 border-cyan/30" : "bg-surface border-muted/20"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-cream">
            {round.title}
            {isSpecialist && playerName && (
              <span className="text-cyan text-base font-normal ml-2">
                ({playerName})
              </span>
            )}
          </h3>
          <p className="text-muted text-sm">
            {round.topic} · {LEVEL_LABELS[round.level as Level]}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              ready
                ? "bg-mint/20 text-mint"
                : "bg-muted/20 text-muted"
            }`}
          >
            {ready ? "Ready" : "Not generated"}
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={onGenerate}
            disabled={generating}
          >
            {generating
              ? "Generating..."
              : ready
                ? "Regenerate round"
                : "Generate questions"}
          </Button>
        </div>
      </div>

      {round.questions.length > 0 && (
        <QuestionReview
          questions={round.questions}
          onQuestionsUpdated={onQuestionsUpdated}
        />
      )}
    </div>
  );
}
