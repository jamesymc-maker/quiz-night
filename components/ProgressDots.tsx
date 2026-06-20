interface ProgressDotsProps {
  total: number;
  current: number;
  accent?: "gold" | "cyan";
}

export function ProgressDots({
  total,
  current,
  accent = "gold",
}: ProgressDotsProps) {
  const activeClass = accent === "cyan" ? "bg-cyan" : "bg-gold";
  const doneClass = accent === "cyan" ? "bg-cyan/50" : "bg-gold/50";

  return (
    <div className="flex items-center gap-2" aria-label={`Question ${current} of ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const index = i + 1;
        const isCurrent = index === current;
        const isDone = index < current;

        return (
          <div
            key={i}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              isCurrent
                ? `${activeClass} ring-2 ring-offset-1 ring-offset-studio ${accent === "cyan" ? "ring-cyan/50" : "ring-gold/50"}`
                : isDone
                  ? doneClass
                  : "bg-muted/30"
            }`}
          />
        );
      })}
    </div>
  );
}
