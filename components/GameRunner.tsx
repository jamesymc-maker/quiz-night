"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { RoundMarquee } from "@/components/RoundMarquee";
import { ScoreBar } from "@/components/ScoreBar";
import { Button } from "@/components/ui/Button";
import type {
  Level,
  Player,
  RoundWithQuestions,
  Session,
  SessionState,
} from "@/lib/types";

interface GameRunnerProps {
  quizId: string;
  quizName: string;
  players: Player[];
  rounds: RoundWithQuestions[];
  initialSession: Session | null;
}

export function GameRunner({
  quizId,
  quizName,
  players,
  rounds,
  initialSession,
}: GameRunnerProps) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(initialSession);
  const [state, setState] = useState<SessionState | null>(
    initialSession?.state ?? null
  );
  const [awardedIds, setAwardedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(!initialSession);

  const currentRound = rounds[state?.currentRoundIndex ?? 0];
  const currentQuestion =
    currentRound?.questions[state?.currentQuestionIndex ?? 0];
  const isSpecialist = currentRound?.type === "specialist";
  const totalRounds = rounds.length;

  const persistState = useCallback(
    async (newState: SessionState, status?: "in_progress" | "finished") => {
      setState(newState);
      if (!session) return;

      const res = await fetch(`/api/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: newState,
          ...(status ? { status } : {}),
        }),
      });
      const data = await res.json();
      if (res.ok) setSession(data);
    },
    [session]
  );

  useEffect(() => {
    if (initialSession) return;

    async function initSession() {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz_id: quizId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSession(data);
        setState(data.state);
      }
      setLoading(false);
    }

    initSession();
  }, [quizId, initialSession]);

  if (loading || !state || !currentRound) {
    return (
      <div className="min-h-screen spotlight-bg flex items-center justify-center">
        <p className="text-muted font-mono">Loading quiz...</p>
      </div>
    );
  }

  const gameState: SessionState = state;
  const activeRound = currentRound;
  const activeQuestion =
    activeRound.questions[gameState.currentQuestionIndex];

  const specialistPlayer = isSpecialist
    ? players.find((p) => p.id === activeRound.player_id)
    : undefined;

  const eligiblePlayerIds = isSpecialist && activeRound.player_id
    ? [activeRound.player_id]
    : players.map((p) => p.id);

  function handleStartRound() {
    persistState({ ...gameState, phase: "question", revealed: false });
    setAwardedIds([]);
  }

  function handleReveal() {
    persistState({ ...gameState, phase: "reveal", revealed: true });
  }

  function handleAward(playerId: string) {
    if (awardedIds.includes(playerId)) return;

    const newScores = {
      ...gameState.scores,
      [playerId]:
        (gameState.scores[playerId] ?? 0) + (activeQuestion?.points ?? 1),
    };
    setAwardedIds([...awardedIds, playerId]);
    persistState({ ...gameState, scores: newScores });
  }

  function handleNext() {
    const qIndex = gameState.currentQuestionIndex;
    const rIndex = gameState.currentRoundIndex;

    if (qIndex + 1 < activeRound.questions.length) {
      persistState({
        ...gameState,
        phase: "question",
        currentQuestionIndex: qIndex + 1,
        revealed: false,
      });
      setAwardedIds([]);
      return;
    }

    if (rIndex + 1 < rounds.length) {
      persistState({
        ...gameState,
        phase: "round_intro",
        currentRoundIndex: rIndex + 1,
        currentQuestionIndex: 0,
        revealed: false,
      });
      setAwardedIds([]);
      return;
    }

    persistState(gameState, "finished");
    router.push(`/play/${quizId}/scoreboard?session=${session?.id}`);
  }

  return (
    <div className="min-h-screen spotlight-bg flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-muted hover:text-cream text-sm">
          {quizName}
        </Link>
        <div className="flex gap-2">
          {players.map((p) => (
            <span
              key={p.id}
              className="font-mono text-sm text-gold"
            >
              {p.name}: {gameState.scores[p.id] ?? 0}
            </span>
          ))}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {gameState.phase === "round_intro" && (
          <div className="text-center space-y-8">
            <RoundMarquee
              roundNumber={gameState.currentRoundIndex + 1}
              totalRounds={totalRounds}
              title={activeRound.title}
              topic={activeRound.topic}
              level={activeRound.level as Level}
              isSpecialist={isSpecialist}
              playerName={specialistPlayer?.name}
            />
            <Button size="lg" onClick={handleStartRound}>
              Start round
            </Button>
          </div>
        )}

        {(gameState.phase === "question" ||
          gameState.phase === "reveal" ||
          gameState.phase === "scoring") &&
          activeQuestion && (
            <div className="w-full max-w-3xl space-y-8">
              <div className="flex justify-center">
                <RoundMarquee
                  roundNumber={gameState.currentRoundIndex + 1}
                  totalRounds={totalRounds}
                  title={activeRound.title}
                  topic={activeRound.topic}
                  level={activeRound.level as Level}
                  isSpecialist={isSpecialist}
                  playerName={specialistPlayer?.name}
                />
              </div>

              <QuestionCard
                questionText={activeQuestion.question_text}
                options={activeQuestion.options}
                correctIndex={activeQuestion.correct_index}
                questionNumber={gameState.currentQuestionIndex + 1}
                totalQuestions={activeRound.questions.length}
                revealed={gameState.revealed}
                explanation={activeQuestion.explanation}
                onReveal={handleReveal}
                accent={isSpecialist ? "cyan" : "gold"}
                showRevealButton={gameState.phase === "question"}
              />

              {gameState.revealed && (
                <>
                  <ScoreBar
                    players={players}
                    scores={gameState.scores}
                    eligiblePlayerIds={eligiblePlayerIds}
                    onAward={handleAward}
                    awardedIds={awardedIds}
                  />
                  <div className="flex justify-center">
                    <Button size="lg" onClick={handleNext}>
                      {gameState.currentQuestionIndex + 1 >=
                        activeRound.questions.length &&
                      gameState.currentRoundIndex + 1 >= rounds.length
                        ? "See final scores"
                        : "Next"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
      </main>
    </div>
  );
}
