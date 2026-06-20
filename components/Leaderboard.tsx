"use client";

import type { Player } from "@/lib/types";

interface LeaderboardProps {
  players: Player[];
  scores: Record<string, number>;
}

export function Leaderboard({ players, scores }: LeaderboardProps) {
  const ranked = [...players]
    .map((p) => ({ ...p, score: scores[p.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  const [first, second, third] = ranked;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {ranked.length >= 2 && (
        <div className="flex items-end justify-center gap-4 mb-10">
          {second && (
            <PodiumPlace
              rank={2}
              name={second.name}
              score={second.score}
              height="h-24"
            />
          )}
          {first && (
            <PodiumPlace
              rank={1}
              name={first.name}
              score={first.score}
              height="h-32"
              winner
            />
          )}
          {third && (
            <PodiumPlace
              rank={3}
              name={third.name}
              score={third.score}
              height="h-20"
            />
          )}
        </div>
      )}

      <div className="space-y-2">
        {ranked.map((player, i) => (
          <div
            key={player.id}
            className={`flex items-center justify-between rounded-xl px-5 py-3 card-glow ${
              i === 0 ? "bg-gold/10 border border-gold/40" : "bg-surface border border-muted/20"
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-gold w-6">{i + 1}</span>
              <span className="font-semibold text-cream">{player.name}</span>
            </div>
            <span className="font-mono text-lg text-mint">{player.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PodiumPlace({
  rank,
  name,
  score,
  height,
  winner = false,
}: {
  rank: number;
  name: string;
  score: number;
  height: string;
  winner?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-center">
        <p className={`font-display font-bold ${winner ? "text-gold text-xl" : "text-cream"}`}>
          {name}
        </p>
        <p className="font-mono text-mint">{score}</p>
      </div>
      <div
        className={`${height} w-20 md:w-24 rounded-t-xl flex items-start justify-center pt-2 ${
          winner ? "bg-gold/30 border border-gold/50" : "bg-surface border border-muted/30"
        }`}
      >
        <span className="font-mono text-2xl font-bold text-gold">{rank}</span>
      </div>
    </div>
  );
}
