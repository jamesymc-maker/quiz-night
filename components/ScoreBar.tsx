"use client";

import { cn } from "@/lib/utils";
import type { Player } from "@/lib/types";

interface PlayerChipProps {
  player: Player;
  score: number;
  selected?: boolean;
  disabled?: boolean;
  onTap?: () => void;
  bump?: boolean;
  highlight?: boolean;
}

export function PlayerChip({
  player,
  score,
  selected = false,
  disabled = false,
  onTap,
  bump = false,
  highlight = false,
}: PlayerChipProps) {
  return (
    <button
      type="button"
      onClick={onTap}
      disabled={disabled || !onTap}
      className={cn(
        "flex items-center gap-2 rounded-full px-4 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
        highlight
          ? "bg-cyan/20 border-2 border-cyan text-cream"
          : selected
            ? "bg-mint/30 border-2 border-mint text-cream"
            : "bg-surface border border-muted/30 text-cream hover:border-gold/50",
        onTap && !disabled && "cursor-pointer",
        bump && "animate-chip-bump",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span className="font-semibold">{player.name}</span>
      <span className="font-mono text-sm text-gold">{score}</span>
    </button>
  );
}

interface ScoreBarProps {
  players: Player[];
  scores: Record<string, number>;
  eligiblePlayerIds?: string[];
  onAward?: (playerId: string) => void;
  awardedIds?: string[];
}

export function ScoreBar({
  players,
  scores,
  eligiblePlayerIds,
  onAward,
  awardedIds = [],
}: ScoreBarProps) {
  const eligible = eligiblePlayerIds
    ? players.filter((p) => eligiblePlayerIds.includes(p.id))
    : players;

  return (
    <div className="w-full">
      <p className="text-center text-muted text-sm mb-3">
        Tap who got it right
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {eligible.map((player) => {
          const awarded = awardedIds.includes(player.id);
          return (
            <PlayerChip
              key={player.id}
              player={player}
              score={scores[player.id] ?? 0}
              selected={awarded}
              disabled={awarded}
              onTap={onAward && !awarded ? () => onAward(player.id) : undefined}
              highlight={
                eligiblePlayerIds?.length === 1 &&
                eligiblePlayerIds[0] === player.id
              }
            />
          );
        })}
      </div>
    </div>
  );
}
