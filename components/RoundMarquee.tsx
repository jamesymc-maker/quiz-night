import { cn } from "@/lib/utils";
import { LEVEL_LABELS } from "@/lib/constants";
import type { Level } from "@/lib/types";

interface RoundMarqueeProps {
  roundNumber: number;
  totalRounds: number;
  title: string;
  topic: string;
  level: Level;
  isSpecialist?: boolean;
  playerName?: string;
}

export function RoundMarquee({
  roundNumber,
  totalRounds,
  title,
  topic,
  level,
  isSpecialist = false,
  playerName,
}: RoundMarqueeProps) {
  return (
    <div
      className={cn(
        "inline-flex flex-col items-center gap-1 rounded-2xl px-6 py-4 card-glow",
        isSpecialist
          ? "bg-cyan/10 border border-cyan/40"
          : "bg-surface border border-gold/30"
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "font-mono text-sm tracking-wider uppercase",
            isSpecialist ? "text-cyan" : "text-gold"
          )}
        >
          Round {roundNumber} of {totalRounds}
        </span>
        {isSpecialist && (
          <span className="rounded-full bg-cyan/20 px-2 py-0.5 text-xs font-semibold text-cyan uppercase tracking-wide">
            Specialist
          </span>
        )}
      </div>
      <h2 className="font-display text-2xl md:text-3xl font-bold text-cream text-center">
        {title}
      </h2>
      <p className="text-muted text-sm md:text-base text-center">
        {isSpecialist && playerName
          ? `${playerName}'s specialist subject: ${topic}`
          : topic}
        {" · "}
        {LEVEL_LABELS[level]}
      </p>
    </div>
  );
}
